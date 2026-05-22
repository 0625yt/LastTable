package com.lasttable.api.supabase;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Supabase REST API (PostgREST) 래퍼.
 *
 * <p>예) 테이블 demo_catalog 에서 kind=market 인 행을 sort_order 순으로 가져오기
 *   GET {url}/rest/v1/demo_catalog?kind=eq.market&order=sort_order.asc
 *   Headers:
 *     apikey: <anon key>
 *     Authorization: Bearer <anon key>
 *
 * <p>응답은 JSON 배열. WebClient.bodyToMono(List.class) 로 받아 그대로 Map 리스트로 반환.
 */
@Component
public class SupabaseClient {

    private static final Logger log = LoggerFactory.getLogger(SupabaseClient.class);

    private final WebClient web;
    private final String apiKey;
    private final boolean ready;

    public SupabaseClient(
            @Value("${supabase.url}") String url,
            @Value("${supabase.key}") String apiKey,
            @Value("${supabase.timeout-ms}") int timeoutMs
    ) {
        this.apiKey = apiKey;
        this.ready = url != null && !url.isBlank() && apiKey != null && !apiKey.isBlank();
        this.web = ready
                ? WebClient.builder().baseUrl(url).build()
                : WebClient.builder().build();

        if (!ready) {
            log.warn("Supabase 자격 증명이 없음 — DB 기반 엔드포인트는 빈 결과 반환");
        } else {
            log.info("Supabase 클라이언트 준비됨 (url={}..., key prefix={}...)",
                    url.substring(0, Math.min(40, url.length())),
                    apiKey.substring(0, Math.min(10, apiKey.length())));
        }
    }

    public boolean isReady() { return ready; }

    /**
     * 테이블에서 행 조회. PostgREST 쿼리스트링을 그대로 받는다.
     *
     * @param table     예: "demo_catalog"
     * @param query     예: "kind=eq.market&order=sort_order.asc"
     * @return Map 리스트 (행마다 컬럼 → 값)
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> select(String table, String query) {
        if (!ready) return List.of();
        String uri = "/rest/v1/" + table + (query == null || query.isBlank() ? "" : "?" + query);
        try {
            List<?> raw = web.get()
                    .uri(uri)
                    .header("apikey", apiKey)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(List.class)
                    .block(Duration.ofSeconds(10));
            if (raw == null) return List.of();
            return (List<Map<String, Object>>) (List<?>) raw;
        } catch (RuntimeException e) {
            log.error("Supabase 조회 실패 ({} {}) — {}", table, query, e.getMessage());
            return List.of();
        }
    }
}
