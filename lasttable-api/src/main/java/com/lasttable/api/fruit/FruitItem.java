package com.lasttable.api.fruit;

/**
 * 우리 서비스가 지원하는 과일 목록 + KOSIS 항목코드 매핑.
 *
 * KOSIS 통계표 "DT_1ET0292(과실생산량)" 안에는
 * 면적/단위면적당생산량/총생산량 등 여러 항목이 있고,
 * 각각의 "항목코드(itmId)"가 다르다.
 *
 * 예) T10 = 사과:생산량, T16 = 배:생산량, T22 = 복숭아:생산량 …
 *
 * enum 으로 묶어두면
 *  - URL의 ?fruit=apple 같은 슬러그를
 *  - 한글 이름("사과")과 KOSIS 코드("T10") 양쪽으로 쉽게 변환할 수 있다.
 */
public enum FruitItem {

    //         URL 슬러그              한글이름     KOSIS 생산량 항목코드
    APPLE              ("apple",               "사과",     "T10"),
    PEAR               ("pear",                "배",       "T16"),
    PEACH              ("peach",               "복숭아",   "T22"),
    GRAPE              ("grape",               "포도",     "T28"),
    MANDARIN           ("mandarin",            "감귤",     "T34"),
    PERSIMMON          ("persimmon",           "감",       "T40"),
    SWEET_PERSIMMON    ("sweet-persimmon",     "단감",     "T46"),
    ASTRINGENT_PERSIMMON("astringent-persimmon","떫은감",  "T52"),
    PLUM               ("plum",                "자두",     "T58"),
    JAPANESE_APRICOT   ("japanese-apricot",    "매실",     "T70");

    /** URL에서 쓰는 영어 슬러그 (예: "apple") */
    private final String slug;

    /** 화면에 보여줄 한글 이름 (예: "사과") */
    private final String koreanName;

    /** KOSIS의 생산량 항목코드 (예: "T10") */
    private final String itmIdProduction;

    FruitItem(String slug, String koreanName, String itmIdProduction) {
        this.slug = slug;
        this.koreanName = koreanName;
        this.itmIdProduction = itmIdProduction;
    }

    public String getSlug()            { return slug; }
    public String getKoreanName()      { return koreanName; }
    public String getItmIdProduction() { return itmIdProduction; }

    /**
     * URL 슬러그로 enum을 찾는다.
     * 예: fromSlug("apple") → FruitItem.APPLE
     *     fromSlug("zzz")   → null
     */
    public static FruitItem fromSlug(String slug) {
        if (slug == null) return null;
        for (FruitItem f : values()) {
            if (f.slug.equalsIgnoreCase(slug)) {
                return f;
            }
        }
        return null;
    }
}
