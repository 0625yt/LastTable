package com.lasttable.api.fruit;

/**
 * 우리 서비스(Last Table)에서 사용하는 "과실 생산량" DTO.
 *
 * KOSIS가 내려준 원본(KosisRawItem)을 그대로 쓰면 필드 이름이 어렵기 때문에,
 * 화면에 보여주기 좋은 형태로 다시 포장해서 내려준다.
 *
 * 예시
 *   { fruit:"사과", regionCode:"11", regionName:"서울특별시", year:2024, valueTon:0.15 }
 */
public class FruitProduction {

    /** 작물 이름 (한글). 예: "사과", "감귤" */
    private final String fruit;

    /** 시도 코드. 예: "00"=전국, "11"=서울, "21"=부산 */
    private final String regionCode;

    /** 시도 이름. 예: "서울특별시" */
    private final String regionName;

    /** 연도. 예: 2024 */
    private final int year;

    /** 생산량 (단위: 톤) */
    private final double valueTon;

    public FruitProduction(String fruit, String regionCode, String regionName, int year, double valueTon) {
        this.fruit = fruit;
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.year = year;
        this.valueTon = valueTon;
    }

    // JSON 직렬화 시 Jackson이 호출하는 getter들
    public String getFruit()      { return fruit; }
    public String getRegionCode() { return regionCode; }
    public String getRegionName() { return regionName; }
    public int    getYear()       { return year; }
    public double getValueTon()   { return valueTon; }
}
