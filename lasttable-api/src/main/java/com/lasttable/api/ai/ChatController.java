package com.lasttable.api.ai;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lasttable.api.supabase.SupabaseClient;

/**
 * AI 챗봇 엔드포인트.
 *
 *   POST /api/ai/match
 *   { "userMessage": "주말에 2명 저녁 메뉴 추천해줘" }
 *
 * 응답:
 *   { "reply":"...", "model":"...", "recommendations":[{slug,title,...}, ...] }
 *
 * 동작:
 *  1) 마켓 카탈로그(Supabase demo_catalog kind=market)를 시스템 프롬프트에 주입
 *  2) Claude 가 답변 마지막에 [[recommend: slug1, slug2]] 마커를 붙이도록 지시
 *  3) 백엔드가 마커를 파싱해 reply 에선 제거하고 recommendations 배열로 분리
 */
@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private static final Pattern RECOMMEND_MARKER =
            Pattern.compile("\\[\\[recommend:\\s*([^\\]]+)\\]\\]");

    private static final String SYSTEM_PROMPT_BASE = """
        너는 Green Table 의 AI 매칭 에이전트다.
        Green Table 은 기후변화로 사라지는 국내 작물의 못난이 농산물을 농부와 소비자에게 직접 연결하는 서비스다.

        답변 규칙:
        - 한국어로, 친근하고 간결하게 (3~6문장).
        - 가능하면 구체적인 작물명·농가·지역·가격대를 1~2가지 제시한다.
        - 추천 근거에 "기후 위험 작물(예: 사과·배·감귤·매실)" 또는 "못난이 농산물 30~40% 할인" 같은 Green Table 의 강점을 자연스럽게 녹인다.
        - 금액·통계 수치는 모르면 모른다고 말하고, 만들어내지 않는다.
        - 마크다운 헤딩(#)·표는 쓰지 않는다. 간단한 줄바꿈·이모지(1~2개)만 허용.

        상품 추천 규칙 (중요):
        - 아래 "현재 마켓 재고"에 있는 상품이 사용자 요청과 관련 있다면, 답변의 가장 마지막 줄에 반드시 다음 형식의 마커를 붙여라:
            [[recommend: slug1, slug2, slug3]]
        - slug 는 마켓 재고에 표기된 slug 만 사용. 최대 3개. 관련 상품이 없으면 마커를 붙이지 마라.
        - 마커 외에는 절대 [[ ]] 기호를 쓰지 마라. 마커는 본문이 아니라 별도 줄에 둔다.
        """;

    private final AnthropicClient anthropic;
    private final SupabaseClient supabase;

    public ChatController(AnthropicClient anthropic, SupabaseClient supabase) {
        this.anthropic = anthropic;
        this.supabase = supabase;
    }

    @PostMapping("/match")
    public ResponseEntity<?> match(@RequestBody ChatRequest req) {
        if (req == null || req.getUserMessage() == null || req.getUserMessage().isBlank()) {
            return ResponseEntity.badRequest().body("userMessage 가 비어있어요");
        }
        if (!anthropic.hasKey()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("AI 키가 설정되지 않았습니다 (.env 의 ANTHROPIC_API_KEY 확인)");
        }

        List<Map<String, Object>> catalog = supabase.select(
                "demo_catalog",
                "kind=eq.market&visible=eq.true&order=sort_order.asc"
        );

        String systemPrompt = SYSTEM_PROMPT_BASE + "\n\n현재 마켓 재고:\n" + renderCatalog(catalog);

        try {
            String raw = anthropic.createMessage(systemPrompt, req.getUserMessage());
            List<String> slugs = extractSlugs(raw);
            String reply = stripMarker(raw).trim();
            List<Map<String, Object>> recommendations = filterBySlug(catalog, slugs);
            return ResponseEntity.ok(new ChatResponse(reply, anthropic.modelName(), recommendations));
        } catch (Exception e) {
            log.error("Anthropic 호출 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("AI 호출 실패: " + e.getMessage());
        }
    }

    /** 카탈로그를 LLM 이 읽기 쉬운 한 줄 요약으로 직렬화. */
    @SuppressWarnings("unchecked")
    private String renderCatalog(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) return "(현재 재고 없음)";
        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> r : rows) {
            String slug = String.valueOf(r.get("slug"));
            String title = String.valueOf(r.get("title"));
            Map<String, Object> p = r.get("payload") instanceof Map
                    ? (Map<String, Object>) r.get("payload") : Map.of();
            Object price = p.get("price");
            Object region = p.get("region");
            Object discount = p.get("discountPct");
            Object kosis = p.get("kosisTag");
            sb.append("- slug=").append(slug)
              .append(" | ").append(title);
            if (price != null) sb.append(" | ").append(price).append("원");
            if (discount != null) sb.append(" | ").append(discount).append("% 할인");
            if (region != null) sb.append(" | ").append(region);
            if (kosis != null) sb.append(" | ").append(kosis);
            sb.append('\n');
        }
        return sb.toString();
    }

    /** 답변에서 [[recommend: a, b, c]] 안의 slug 들을 추출. */
    static List<String> extractSlugs(String text) {
        if (text == null) return List.of();
        Matcher m = RECOMMEND_MARKER.matcher(text);
        if (!m.find()) return List.of();
        String[] parts = m.group(1).split(",");
        List<String> out = new ArrayList<>();
        for (String p : parts) {
            String s = p.trim();
            if (!s.isEmpty()) out.add(s);
        }
        return out;
    }

    /** 답변에서 마커 토큰을 제거하고 본문만 남김. */
    static String stripMarker(String text) {
        if (text == null) return "";
        return RECOMMEND_MARKER.matcher(text).replaceAll("").trim();
    }

    /** 카탈로그에서 slug 순서대로 행을 골라 반환 (없으면 무시). */
    private List<Map<String, Object>> filterBySlug(List<Map<String, Object>> catalog, List<String> slugs) {
        if (slugs.isEmpty() || catalog == null) return List.of();
        Map<String, Map<String, Object>> bySlug = new LinkedHashMap<>();
        for (Map<String, Object> r : catalog) {
            bySlug.put(String.valueOf(r.get("slug")), r);
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (String s : slugs) {
            Map<String, Object> hit = bySlug.get(s);
            if (hit != null) out.add(hit);
        }
        return out;
    }
}
