package com.lasttable.api.kosis;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * KOSIS API에서 내려주는 JSON 한 줄(=한 행)을 자바 객체로 받는 클래스.
 *
 * KOSIS 응답 예시
 * [
 *   {
 *     "TBL_ID": "DT_1ET0292",
 *     "ITM_ID": "T10",
 *     "ITM_NM": "사과:생산량",
 *     "C1":     "11",
 *     "C1_NM":  "서울특별시",
 *     "PRD_DE": "2024",
 *     "DT":     "0.1536",
 *     "UNIT_NM":"톤",
 *     ...
 *   }
 * ]
 *
 * 각 필드를 어떻게 매핑하는지는 @JsonProperty 로 표시한다.
 * 모르는 필드는 무시(@JsonIgnoreProperties) — KOSIS가 가끔 새 필드를 추가해도 에러 안 나게.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class KosisRawItem {

    /** 통계표 ID. 예: DT_1ET0292 (과실생산량) */
    @JsonProperty("TBL_ID")
    private String tblId;

    /** 통계표 이름. 예: "과실생산량(성과수+미과수)" */
    @JsonProperty("TBL_NM")
    private String tblNm;

    /** 항목 ID. 예: T10(사과 생산량), T16(배 생산량) */
    @JsonProperty("ITM_ID")
    private String itmId;

    /** 항목 이름. 예: "사과:생산량" */
    @JsonProperty("ITM_NM")
    private String itmNm;

    /** 분류1(시도) 코드. 예: 00=전국 합계, 11=서울, 21=부산 */
    @JsonProperty("C1")
    private String c1;

    /** 분류1(시도) 이름. 예: "서울특별시" */
    @JsonProperty("C1_NM")
    private String c1Nm;

    /** 분류1의 카테고리 이름. 예: "시도별" */
    @JsonProperty("C1_OBJ_NM")
    private String c1ObjNm;

    /** 시점(년월일). prdSe=Y(연도)일 때는 "2024" 같은 4자리 연도 문자열 */
    @JsonProperty("PRD_DE")
    private String prdDe;

    /** 시점 구분. Y=연, Q=분기, M=월 */
    @JsonProperty("PRD_SE")
    private String prdSe;

    /** 실제 값(문자열). 숫자지만 String으로 옴. "-"는 데이터 없음을 의미. */
    @JsonProperty("DT")
    private String dt;

    /** 단위 이름. 예: "톤", "ha" */
    @JsonProperty("UNIT_NM")
    private String unitNm;

    // ---- getter ----
    // Jackson이 역직렬화할 때는 필드를 직접 채우고,
    // 우리 코드에서는 getter로 읽는다.
    public String getTblId()    { return tblId; }
    public String getTblNm()    { return tblNm; }
    public String getItmId()    { return itmId; }
    public String getItmNm()    { return itmNm; }
    public String getC1()       { return c1; }
    public String getC1Nm()     { return c1Nm; }
    public String getC1ObjNm()  { return c1ObjNm; }
    public String getPrdDe()    { return prdDe; }
    public String getPrdSe()    { return prdSe; }
    public String getDt()       { return dt; }
    public String getUnitNm()   { return unitNm; }
}
