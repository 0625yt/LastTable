package com.lasttable.api.aquaculture;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.lasttable.api.kosis.KosisClient;
import com.lasttable.api.kosis.KosisRawItem;

/**
 * 수산 양식 통계를 다루는 서비스.
 *
 * 사용 통계표: DT_1EZ0007 "시도·시군구별 양식현황 총괄"
 * 우리는 그 중 ITM_ID = T02 (생산량 M/T : 계) 만 사용한다.
 *
 * 출처: https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1EZ0007
 */
@Service
public class AquacultureService {

    private static final String ORG_ID = "101";
    private static final String TBL_ID = "DT_1EZ0007";

    // "생산량(M/T):계" — 양식 총 생산량(어종 합산)
    private static final String ITM_ID_PRODUCTION_TON = "T02";

    private final KosisClient kosis;

    public AquacultureService(KosisClient kosis) {
        this.kosis = kosis;
    }

    /**
     * 최근 N년치 시도별 양식 총 생산량을 가져온다.
     *
     * KOSIS는 행정구역을 "시도(2자리)" 와 "시군구(5자리)" 양쪽으로 같이 내려준다.
     * 우리 화면은 시도 단위만 쓰므로, 5자리(시군구) 행은 걸러낸다.
     */
    public List<AquacultureProduction> getProduction(int recentYears) {

        List<KosisRawItem> rawList = kosis.fetchParamData(
                ORG_ID,
                TBL_ID,
                ITM_ID_PRODUCTION_TON,
                "ALL",   // 행정구역 전체
                "Y",     // 연도
                recentYears
        );

        List<AquacultureProduction> result = new ArrayList<>();
        for (KosisRawItem raw : rawList) {

            // 1) 값이 없는 칸 건너뛰기
            String dt = raw.getDt();
            if (dt == null || dt.isBlank() || "-".equals(dt)) {
                continue;
            }

            // 2) 시도 단위만 남긴다 (코드가 2자리거나 "00"=전국)
            String code = raw.getC1();
            if (code == null) continue;
            boolean isProvinceLevel = code.length() == 2;
            if (!isProvinceLevel) continue;

            // 3) 연도와 값 변환
            int year = Integer.parseInt(raw.getPrdDe());
            double productionTon = Double.parseDouble(dt);

            result.add(new AquacultureProduction(
                    code,
                    raw.getC1Nm(),
                    year,
                    productionTon
            ));
        }
        return result;
    }
}
