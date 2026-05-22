// Rising.jsx — "새로 자라는 작물" 화면
//
// 백엔드 /api/fruits/rising 을 호출해서
// "기준연도(2025) 대비 목표연도(2050)에서 가장 크게 증가한 작물 TOP N"
// 을 보여준다. ML 회귀모델(KOSIS + 기상청 ASOS + SSP5-8.5 학습) 결과.

import { useEffect, useState } from "react";
import { ChevronLeft, Info } from "lucide-react";
import "./Rising.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// 슬러그 → 한글/이모지 매핑 (FruitItem.java 와 동일)
const FRUIT_META = {
  apple:    { name: "사과",    emoji: "🍎" },
  pear:     { name: "배",      emoji: "🍐" },
  peach:    { name: "복숭아",  emoji: "🍑" },
  grape:    { name: "포도",    emoji: "🍇" },
  mandarin: { name: "감귤",    emoji: "🍊" },
};

const BASE_YEAR = 2025;
const TARGET_YEAR = 2050;

function Rising({ onBack }) {
  const [state, setState] = useState({ loading: true, items: [], error: null });

  useEffect(function () {
    const url = API_BASE
      + "/api/fruits/rising?base=" + BASE_YEAR
      + "&target=" + TARGET_YEAR
      + "&limit=5";
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        setState({ loading: false, items: rows, error: null });
      })
      .catch(function (err) {
        setState({ loading: false, items: [], error: err.message });
      });
  }, []);

  return (
    <div className="rising">
      <div className="r-hdr">
        <button className="r-back" onClick={onBack} aria-label="뒤로">
          <ChevronLeft size={20} />
        </button>
        <div className="r-title-wrap">
          <h1>새로 자라는 작물</h1>
          <p>ML 회귀모델이 예측한 미래 재배량 TOP 5</p>
        </div>
      </div>

      <div className="r-card">
        <div className="r-card-hdr">
          <span className="r-tag">🤖 ML FORECAST</span>
          <span className="r-period">{BASE_YEAR} → {TARGET_YEAR}</span>
        </div>
        <div className="r-card-title">25년 뒤, 어떤 과일이 늘어날까?</div>
        <div className="r-card-sub">
          기상청 ASOS·KOSIS 학습 + SSP5-8.5 시나리오 기반 회귀 예측
        </div>

        {state.loading && (
          <div className="r-skeleton">예측 데이터를 불러오는 중…</div>
        )}

        {!state.loading && state.error && (
          <div className="r-error">데이터를 불러오지 못했어요 ({state.error})</div>
        )}

        {!state.loading && !state.error && (
          <div className="r-list">
            {state.items.map(function (row, i) {
              const meta = FRUIT_META[row.fruitSlug] || { name: row.fruitSlug, emoji: "🌱" };
              const isUp = row.growthPct >= 0;
              return (
                <div className="r-row" key={row.fruitSlug}>
                  <div className="r-rank">0{i + 1}</div>
                  <div className="r-em">{meta.emoji}</div>
                  <div className="r-mid">
                    <div className="r-name">{meta.name}</div>
                    <div className="r-ton">
                      {Math.round(row.baseTon).toLocaleString()}톤
                      {" → "}
                      {Math.round(row.targetTon).toLocaleString()}톤
                    </div>
                  </div>
                  <div className={"r-pct " + (isUp ? "up" : "down")}>
                    {isUp ? "+" : "−"}{Math.abs(row.growthPct).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="r-foot">
          <Info size={11} />
          <strong>LastTable 백엔드 · /api/fruits/rising</strong>
          {" · 학습 데이터 17개 시도 × 5작물 × 90년치"}
        </div>
      </div>

      <div className="r-note">
        <div className="r-note-h">왜 감귤만 늘어날까?</div>
        SSP5-8.5 시나리오에서 한반도 평균기온이 2050년까지 약 +1.8℃ 상승합니다.
        감귤은 아열대 작물이라 적정 재배지가 북상하며 면적이 늘어나고,
        사과·배·포도·복숭아는 적정 기온 구간을 벗어나기 시작합니다.
      </div>
    </div>
  );
}

export default Rising;
