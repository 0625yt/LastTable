package com.lasttable.api.kosis;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * KOSIS(통계청) Open API 연동에 필요한 설정값을 담는 클래스.
 *
 * application.yml 의 "kosis:" 아래 항목들이 자동으로 이 클래스에 채워집니다.
 *
 * 예시 (application.yml)
 *   kosis:
 *     base-url:  https://kosis.kr
 *     api-key:   {{발급받은 키}}
 *     timeout-ms: 10000
 */
@ConfigurationProperties(prefix = "kosis")
public class KosisProperties {

    /** KOSIS API 호스트 주소. 보통 https://kosis.kr */
    private String baseUrl;

    /** KOSIS에서 발급받은 API 키 */
    private String apiKey;

    /** HTTP 요청 타임아웃 (밀리초). 응답이 늦으면 실패시킨다. */
    private int timeoutMs;

    // ---- getter / setter ----
    // Spring Boot가 yml 값을 채울 때 setter를 사용합니다.
    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public int getTimeoutMs() { return timeoutMs; }
    public void setTimeoutMs(int timeoutMs) { this.timeoutMs = timeoutMs; }
}
