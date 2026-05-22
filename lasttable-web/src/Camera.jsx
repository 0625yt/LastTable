// Camera.jsx — AI 식재료 분석 화면
//
// 진짜 사진 인식은 데모 범위 밖.
// 화면은 "업로드 UI + AI 분석 결과 예시(사과)" 를 보여준다.

import { Camera as CameraIcon, Info, AlertTriangle } from "lucide-react";
import "./Camera.css";

const QUICK_CHIPS = ["🍎 사과", "🍇 포도", "🥬 배추", "🐟 고등어", "🍐 배"];

const ALTERNATIVES = [
  { emoji: "🫐", name: "블루베리", reason: "온난화에 강하고 고지대 재배 가능" },
  { emoji: "🥭", name: "망고",     reason: "제주·남해안 일대 재배 확대 중" },
];

function Camera() {
  return (
    <div className="camera-screen">
      <div className="c-hdr"><h1>AI 식재료 분석</h1></div>
      <p className="c-desc">
        식재료를 촬영하거나 사진을 업로드하면<br />
        AI가 기후 위험도와 대체 작물을 알려드려요
      </p>

      <div className="c-upload">
        <div className="c-upload-ic">
          <CameraIcon size={28} color="var(--green)" />
        </div>
        <div className="c-upload-lbl">사진 촬영 또는 업로드</div>
        <div className="c-upload-sub">JPG, PNG · 최대 10MB</div>
      </div>

      <div className="c-chips">
        {QUICK_CHIPS.map(function (chip) {
          return <div key={chip} className="c-chip">{chip}</div>;
        })}
      </div>

      <div className="c-info">
        <div className="c-info-ic"><Info size={13} /></div>
        <div>
          <div className="c-info-title">KOSIS + AI 분석</div>
          <div className="c-info-desc">통계청 공공데이터와 기후변화 시나리오를 기반으로 분석합니다</div>
        </div>
      </div>

      <div className="c-demo-label">— AI 분석 결과 예시 —</div>

      <div className="c-result-hero">
        <div className="c-res-emoji">🍎</div>
        <div style={{ flex: 1 }}>
          <div className="c-res-name">사과</div>
          <div className="c-res-conf">✓ 인식 신뢰도 96%</div>
          <div className="c-res-region">주산지: 경상북도</div>
        </div>
        <div className="c-risk-badge">위험</div>
      </div>

      <div className="c-risk-card">
        <div className="c-risk-title">
          <AlertTriangle size={12} style={{ display: "inline", marginRight: 3 }} />
          기후 위험도: 위험
        </div>
        <div className="c-risk-desc">
          사과는 연평균 8~12℃에서 가장 잘 자라지만, 기온 상승으로
          2050년까지 재배 적지가 73% 감소할 것으로 예측됩니다.
        </div>
      </div>

      <div className="c-alt-title">추천 대체 작물</div>
      {ALTERNATIVES.map(function (alt) {
        return (
          <div key={alt.name} className="c-alt-card">
            <div className="c-alt-emoji">{alt.emoji}</div>
            <div>
              <div className="c-alt-name">{alt.name}</div>
              <div className="c-alt-reason">{alt.reason}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Camera;
