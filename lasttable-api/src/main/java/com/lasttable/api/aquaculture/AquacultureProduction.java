package com.lasttable.api.aquaculture;

/**
 * 시도별 "양식 총생산량" 응답 DTO.
 *
 * KOSIS 통계표 DT_1EZ0007 의 "생산량(M/T):계" (ITM_ID=T02) 한 행을
 * 화면에서 보기 좋은 모양으로 다시 포장한 것.
 *
 * 예시
 *   { regionCode:"36", regionName:"전라남도", year:2025, productionTon:55000.0 }
 *
 * 단위는 M/T (메트릭톤 = 1톤).
 */
public class AquacultureProduction {

    private final String regionCode;
    private final String regionName;
    private final int year;
    private final double productionTon;

    public AquacultureProduction(String regionCode, String regionName, int year, double productionTon) {
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.year = year;
        this.productionTon = productionTon;
    }

    public String getRegionCode()    { return regionCode; }
    public String getRegionName()    { return regionName; }
    public int    getYear()          { return year; }
    public double getProductionTon() { return productionTon; }
}
