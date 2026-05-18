package com.lasttable.api.fruit;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.lasttable.api.kosis.KosisClient;
import com.lasttable.api.kosis.KosisRawItem;

/**
 * "과실 생산량"에 관련된 비즈니스 로직을 담당하는 서비스.
 *
 * 역할
 *   1. KosisClient 를 이용해 KOSIS 원본 데이터를 가져온다.
 *   2. 우리가 쓰기 좋은 형태(FruitProduction)로 가공해서 돌려준다.
 *
 * "왜 컨트롤러에서 바로 KosisClient를 안 부르고 Service를 따로 두나?" 라고 묻는다면,
 * 보통 Controller는 "들어온 요청을 받고 결과를 내보내는" 일만 하고,
 * 실제 데이터 가공/규칙은 Service에 모아두는 것이 관례다. (책임 분리)
 */
@Service
public class FruitProductionService {

    // KOSIS 통계청 기관 ID. 통계청 통계표는 거의 다 "101".
    private static final String ORG_ID = "101";

    // 우리가 사용할 통계표: 과실생산량(성과수+미과수)
    // 출처: https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1ET0292
    private static final String TBL_ID = "DT_1ET0292";

    private final KosisClient kosis;

    public FruitProductionService(KosisClient kosis) {
        this.kosis = kosis;
    }

    /**
     * 특정 과일의 최근 N년치 시도별 생산량을 가져온다.
     *
     * @param fruit        가져올 과일 (예: FruitItem.APPLE)
     * @param recentYears  최근 몇 년치 데이터를 가져올지
     * @return 시도 × 연도 조합으로 펼쳐진 생산량 리스트
     */
    public List<FruitProduction> getProduction(FruitItem fruit, int recentYears) {

        // 1) KOSIS에 요청해서 원본 데이터를 받는다.
        List<KosisRawItem> rawList = kosis.fetchParamData(
                ORG_ID,
                TBL_ID,
                fruit.getItmIdProduction(), // 예: "T10" (사과 생산량)
                "ALL",                       // 시도 전체
                "Y",                         // 연도 단위
                recentYears                  // 최근 N년
        );

        // 2) 우리 서비스에서 쓰는 모양(FruitProduction)으로 하나씩 변환한다.
        List<FruitProduction> result = new ArrayList<>();
        for (KosisRawItem raw : rawList) {

            // KOSIS는 데이터가 없는 칸을 "-" 문자열로 보내준다.
            // null/빈문자열/"-" 셋 중 하나면 건너뛴다 — 숫자로 못 바꾸기 때문.
            String dt = raw.getDt();
            if (dt == null || dt.isBlank() || "-".equals(dt)) {
                continue;
            }

            // PRD_DE("2024") → int 2024
            int year = Integer.parseInt(raw.getPrdDe());

            // DT("447952.5984") → double
            double valueTon = Double.parseDouble(dt);

            result.add(new FruitProduction(
                    fruit.getKoreanName(), // "사과"
                    raw.getC1(),           // "11"
                    raw.getC1Nm(),         // "서울특별시"
                    year,
                    valueTon
            ));
        }
        return result;
    }
}
