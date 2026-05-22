// AiMatch.jsx — LastTable AI 매칭 챗봇 화면
//
// 자연어 입력 → POST /api/ai/match → Claude 응답 출력.
// 데이터 흐름:
//   사용자 입력 → 화면에 user 메시지 추가 → fetch → 응답을 bot 메시지로 추가
// 사용자가 빨리 클릭하는 동선을 위해 추천 질문 칩 4개도 제공.

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import "./AiMatch.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const SUGGESTIONS = [
  "주말 2인 저녁 추천",
  "2만원으로 일주일 장보기",
  "사라지는 작물 응원하기",
  "우리 동네 농가",
];

const GREETING = {
  role: "bot",
  text:
    "안녕하세요 👋\n오늘은 어떤 식탁을 차리실 건가요?\n\n자연어로 물어보시면 기후 위험 작물·농가 재고·못난이 매물을 한 번에 추천해드려요.",
};

function AiMatch() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);

  // 새 메시지가 들어올 때마다 자동 스크롤
  useEffect(function () {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, busy]);

  function ask(text) {
    const userText = (text || "").trim();
    if (!userText || busy) return;

    setMessages(function (m) { return m.concat([{ role: "user", text: userText }]); });
    setInput("");
    setBusy(true);

    fetch(API_BASE + "/api/ai/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: userText }),
    })
      .then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) { throw new Error(t || "HTTP " + r.status); });
        }
        return r.json();
      })
      .then(function (data) {
        setMessages(function (m) { return m.concat([{ role: "bot", text: data.reply || "(빈 응답)" }]); });
      })
      .catch(function (err) {
        setMessages(function (m) {
          return m.concat([{
            role: "bot",
            text: "⚠️ AI 호출 실패: " + err.message + "\n잠시 후 다시 시도해주세요.",
            error: true,
          }]);
        });
      })
      .finally(function () { setBusy(false); });
  }

  return (
    <div className="ai-screen">
      <div className="ai-hdr">
        <div className="ai-hdr-ic">
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ai-hdr-name">LastTable AI</div>
          <div className="ai-hdr-sub">기후 데이터 · 농가 재고 · 못난이 매칭</div>
        </div>
        <div className="ai-hdr-tag">BETA</div>
      </div>

      <div className="ai-body" ref={bodyRef}>
        {messages.map(function (m, i) {
          return (
            <div
              key={i}
              className={"ai-msg " + m.role + (m.error ? " err" : "")}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {m.text}
            </div>
          );
        })}

        {busy && (
          <div className="ai-typing">
            <span className="ai-dot" />
            <span className="ai-dot" />
            <span className="ai-dot" />
          </div>
        )}
      </div>

      <div className="ai-suggest">
        <div className="ai-suggest-row">
          {SUGGESTIONS.map(function (s) {
            return (
              <button
                key={s}
                className="ai-chip"
                disabled={busy}
                onClick={function () { ask(s); }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ai-input">
        <input
          type="text"
          className="ai-input-box"
          placeholder="자연어로 물어보세요 — 예) 오늘 저녁 뭐 살까?"
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          onKeyDown={function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
          disabled={busy}
        />
        <button
          className="ai-send"
          onClick={function () { ask(input); }}
          disabled={busy || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default AiMatch;
