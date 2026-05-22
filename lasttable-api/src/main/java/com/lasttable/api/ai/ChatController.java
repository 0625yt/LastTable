package com.lasttable.api.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI 챗봇 엔드포인트.
 *
 *   POST /api/ai/match
 *   { "userMessage": "주말에 2명 저녁 메뉴 추천해줘" }
 *
 * 응답:
 *   { "reply": "...", "model": "claude-haiku-4-5-..." }
 *
 * 시스템 프롬프트는 컨트롤러 내부에 고정. LastTable 컨텍스트(못난이·기후 위험·농가)
 * 를 미리 박아 두고, 사용자가 자연어로 식탁 추천을 묻게 한다.
 */
@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private static final String SYSTEM_PROMPT = """
        너는 LastTable 의 AI 매칭 에이전트다.
        LastTable 은 기후변화로 사라지는 국내 작물의 못난이 농산물을 농부와 소비자에게 직접 연결하는 서비스다.

        답변 규칙:
        - 한국어로, 친근하고 간결하게 (3~6문장).
        - 가능하면 구체적인 작물명·농가·지역·가격대를 1~2가지 제시한다.
        - 추천 근거에 "기후 위험 작물(예: 사과·배·감귤·매실)" 또는 "못난이 농산물 30~40% 할인" 같은 LastTable 의 강점을 자연스럽게 녹인다.
        - 금액·통계 수치는 모르면 모른다고 말하고, 만들어내지 않는다.
        - 마크다운 헤딩(#)·표는 쓰지 않는다. 간단한 줄바꿈·이모지(1~2개)만 허용.
        """;

    private final AnthropicClient anthropic;

    public ChatController(AnthropicClient anthropic) {
        this.anthropic = anthropic;
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

        try {
            String reply = anthropic.createMessage(SYSTEM_PROMPT, req.getUserMessage());
            return ResponseEntity.ok(new ChatResponse(reply, anthropic.modelName()));
        } catch (Exception e) {
            log.error("Anthropic 호출 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("AI 호출 실패: " + e.getMessage());
        }
    }
}
