package com.lasttable.api.ai;

import java.util.List;
import java.util.Map;

public class ChatResponse {
    private final String reply;
    private final String model;
    private final List<Map<String, Object>> recommendations;

    public ChatResponse(String reply, String model, List<Map<String, Object>> recommendations) {
        this.reply = reply;
        this.model = model;
        this.recommendations = recommendations;
    }

    public String getReply() { return reply; }
    public String getModel() { return model; }
    public List<Map<String, Object>> getRecommendations() { return recommendations; }
}
