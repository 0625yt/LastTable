package com.lasttable.api.ai;

/**
 * 프론트에서 보내는 챗봇 요청.
 * 예: { "userMessage": "주말에 2명 저녁 추천해줘" }
 */
public class ChatRequest {
    private String userMessage;

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }
}
