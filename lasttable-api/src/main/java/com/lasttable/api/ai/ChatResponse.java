package com.lasttable.api.ai;

/**
 * 백엔드 → 프론트 응답.
 * reply 에 LLM 답변(평문 또는 마크다운) 한 덩어리.
 */
public class ChatResponse {
    private final String reply;
    private final String model;

    public ChatResponse(String reply, String model) {
        this.reply = reply;
        this.model = model;
    }

    public String getReply() { return reply; }
    public String getModel() { return model; }
}
