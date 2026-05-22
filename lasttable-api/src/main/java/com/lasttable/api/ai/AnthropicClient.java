package com.lasttable.api.ai;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Anthropic Claude API 호출 래퍼.
 *
 * <p>호출은 단순 동기 (block) — 챗봇 요청 한 번에 한 번만 LLM 한 번 부른다.
 * 향후 스트리밍 필요해지면 reactive 로 바꾼다.
 */
@Component
public class AnthropicClient {

    private static final Logger log = LoggerFactory.getLogger(AnthropicClient.class);
    private static final String API_VERSION = "2023-06-01";

    private final WebClient web;
    private final String apiKey;
    private final String model;
    private final int maxTokens;

    public AnthropicClient(
            @Value("${anthropic.base-url}") String baseUrl,
            @Value("${anthropic.api-key}") String apiKey,
            @Value("${anthropic.model}") String model,
            @Value("${anthropic.max-tokens}") int maxTokens,
            @Value("${anthropic.timeout-ms}") int timeoutMs
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.maxTokens = maxTokens;
        this.web = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("anthropic-version", API_VERSION)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .build();

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("ANTHROPIC_API_KEY 가 비어있음 — /api/ai/* 호출 시 503 반환");
        } else {
            log.info("Anthropic 클라이언트 준비됨 (model={}, key prefix={}...)",
                    model, apiKey.substring(0, Math.min(8, apiKey.length())));
        }
    }

    public boolean hasKey() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** 현재 사용 중인 모델 이름 (응답 표기용). */
    public String modelName() { return model; }

    /**
     * 시스템 프롬프트 + 사용자 메시지 한 쌍으로 Messages API 호출.
     * @return Claude 의 첫 텍스트 블록
     */
    public String createMessage(String systemPrompt, String userMessage) {
        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "system", systemPrompt,
                "messages", List.of(
                        Map.of("role", "user", "content", userMessage)
                )
        );

        // Anthropic 은 일시 과부하(529) 가 자주 난다.
        // 최대 2회까지 짧은 백오프(1.2s, 2.4s) 로 재시도한다.
        RuntimeException lastError = null;
        long backoffMs = 1200;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> resp = web.post()
                        .uri("/v1/messages")
                        .header("x-api-key", apiKey)
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block(Duration.ofSeconds(30));
                return extractFirstText(resp);
            } catch (RuntimeException e) {
                lastError = e;
                String msg = e.getMessage() == null ? "" : e.getMessage();
                // 529(과부하) / 503 일 때만 재시도. 4xx 는 즉시 중단.
                boolean retryable = msg.contains("529") || msg.contains("503") || msg.contains("502");
                if (!retryable || attempt == 3) break;
                log.warn("Anthropic {} 차 호출 실패({}). {}ms 후 재시도", attempt, msg, backoffMs);
                try { Thread.sleep(backoffMs); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); break; }
                backoffMs *= 2;
            }
        }
        throw lastError != null ? lastError : new RuntimeException("Anthropic 호출 실패 (원인 미상)");
    }

    /**
     * Anthropic 응답 포맷:
     *   { "content": [ { "type":"text", "text":"..." }, ... ], ... }
     * 첫 번째 text 블록만 꺼낸다.
     */
    @SuppressWarnings("unchecked")
    private String extractFirstText(Map<String, Object> resp) {
        if (resp == null) return "";
        Object content = resp.get("content");
        if (!(content instanceof List)) return "";
        for (Object item : (List<Object>) content) {
            if (!(item instanceof Map)) continue;
            Map<String, Object> block = (Map<String, Object>) item;
            if ("text".equals(block.get("type"))) {
                Object text = block.get("text");
                if (text instanceof String) return (String) text;
            }
        }
        return "";
    }
}
