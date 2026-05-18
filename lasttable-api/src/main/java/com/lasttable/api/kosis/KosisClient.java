package com.lasttable.api.kosis;

import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * KOSIS Open API 를 호출하는 클래스.
 *
 * 우리가 쓰는 엔드포인트는 한 종류뿐이다:
 *   GET https://kosis.kr/openapi/Param/statisticsParameterData.do
 *
 * 이 엔드포인트는 통계표 ID(tblId)와 조건들(itmId, objL1, prdSe ...)을
 * 쿼리스트링으로 받아서 JSON 배열을 돌려준다.
 *
 * 사용 예
 *   client.fetchParamData("101", "DT_1ET0292", "T10", "ALL", "Y", 3);
 *   → 사과 생산량(시도별, 최근 3년) JSON
 */
@Component
public class KosisClient {

    // KOSIS API의 경로. 호스트는 KosisProperties.baseUrl 에서 가져옴.
    private static final String PARAM_PATH = "/openapi/Param/statisticsParameterData.do";

    // 콘솔에 로그를 찍기 위한 객체.
    private static final Logger log = LoggerFactory.getLogger(KosisClient.class);

    private final WebClient http;          // 실제 HTTP를 보내는 객체
    private final KosisProperties props;   // 설정값(키, URL, 타임아웃)
    private final ObjectMapper objectMapper; // JSON ↔ 자바 객체 변환기

    // Spring이 자동으로 KosisProperties / ObjectMapper를 넣어준다.
    public KosisClient(KosisProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        this.http = WebClient.builder()
                .baseUrl(props.getBaseUrl())
                .build();

        // 서버 부팅 시 KOSIS 키 상태를 큰 글씨로 알려준다.
        // 키가 비어있으면 어차피 호출이 다 실패하므로 미리 경고한다.
        String apiKey = props.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.error("============================================================");
            log.error(" KOSIS_API_KEY 환경변수가 비어 있습니다.");
            log.error(" 모든 KOSIS 호출이 실패하게 됩니다.");
            log.error("");
            log.error(" 해결 방법:");
            log.error("  - IntelliJ: Run > Edit Configurations > Environment variables");
            log.error("    에 KOSIS_API_KEY=발급받은_키 추가 후 재시작");
            log.error("  - 터미널 실행: export KOSIS_API_KEY=발급받은_키 후 ./gradlew bootRun");
            log.error("============================================================");
        } else {
            // 키 전체를 찍으면 위험하므로 앞 6글자만 노출
            String preview = apiKey.length() > 6 ? apiKey.substring(0, 6) + "..." : "***";
            log.info("KOSIS_API_KEY loaded (prefix: {})", preview);
        }
    }

    /**
     * KOSIS에서 통계 데이터를 가져온다.
     *
     * @param orgId         기관 ID (통계청은 보통 "101")
     * @param tblId         통계표 ID (예: "DT_1ET0292" = 과실생산량)
     * @param itmId         항목 코드 (예: "T10" = 사과 생산량)
     * @param objL1         분류1 코드. "ALL"이면 모든 시도
     * @param prdSe         시점 구분. "Y"=연도별
     * @param newEstPrdCnt  최근 N개 시점(연도)만 가져오기
     * @return KOSIS 응답을 KosisRawItem 리스트로 변환한 결과
     */
    public List<KosisRawItem> fetchParamData(
            String orgId,
            String tblId,
            String itmId,
            String objL1,
            String prdSe,
            int newEstPrdCnt
    ) {
        // 1) URL 만들기 — 쿼리스트링을 안전하게 조립한다.
        String uri = UriComponentsBuilder.fromPath(PARAM_PATH)
                .queryParam("method", "getList")
                .queryParam("apiKey", props.getApiKey())
                .queryParam("orgId", orgId)
                .queryParam("tblId", tblId)
                .queryParam("itmId", itmId)
                .queryParam("objL1", objL1)
                .queryParam("prdSe", prdSe)
                .queryParam("newEstPrdCnt", newEstPrdCnt)
                .queryParam("format", "json")
                .queryParam("jsonVD", "Y")
                .build(false)
                .toUriString();

        // 2) 실제 HTTP GET 요청. block() = 결과가 올 때까지 기다림(동기 호출).
        String body = http.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(props.getTimeoutMs()))
                .block();

        // 3) 응답이 비어 있으면 빈 리스트.
        if (body == null || body.isBlank()) {
            return List.of();
        }

        // 4) KOSIS는 성공이면 [ ... ] 배열, 실패면 { "err": "...", "errMsg": "..." } 객체로 응답.
        //    첫 글자가 '{'이면 에러 응답이므로 예외로 던진다.
        if (body.startsWith("{")) {
            // 자주 보는 에러 코드는 친절한 한국어 안내로 바꿔서 던진다.
            if (body.contains("\"err\":\"10\"")) {
                throw new KosisApiException(
                        "KOSIS 인증 KEY가 비어있거나 잘못되었습니다. " +
                        "환경변수 KOSIS_API_KEY 가 잘 들어갔는지 확인하세요. " +
                        "(원본 응답: " + body + ")");
            }
            throw new KosisApiException("KOSIS error response: " + body);
        }

        // 5) JSON 배열 → List<KosisRawItem> 변환.
        try {
            return objectMapper.readValue(body, new TypeReference<List<KosisRawItem>>() {});
        } catch (Exception e) {
            throw new KosisApiException("Failed to parse KOSIS response", e);
        }
    }
}
