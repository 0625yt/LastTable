// Rising.jsx — "새로 자라는 작물" 화면
//
// 백엔드 /api/fruits/rising 을 호출해서
// "기준연도(2025) 대비 목표연도(2050)에서 가장 크게 증가한 작물 TOP N"
// 을 보여준다. ML 회귀모델(KOSIS + 기상청 ASOS + SSP5-8.5 학습) 결과.

import { useEffect, useState } from "react";
import { ChevronLeft, Info, TrendingUp, TrendingDown } from "lucide-react";
import "./Rising.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const FRUIT_NAME = {
  apple:    "사과",
  pear:     "배",
  peach:    "복숭아",
  grape:    "포도",
  mandarin: "감귤",
  mango:    "망고",
  banana:   "바나나",
  olive:    "올리브",
};

// 아열대 신규작물 — UI 에 "NEW" 뱃지로 강조
const TROPICAL = new Set(["mango", "banana", "olive"]);

const BASE_YEAR = 2025;
const TARGET_YEAR = 2050;

function Rising({ onBack }) {
  const [state, setState] = useState({ loading: true, items: [], error: null });

  useEffect(function () {
    const url = API_BASE
      + "/api/fruits/rising?base=" + BASE_YEAR
      + "&target=" + TARGET_YEAR
      + "&limit=8";
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
          <p>ML 회귀모델이 예측한 미래 재배량 TOP 8</p>
        </div>
      </div>

      <div className="r-card">
        <div className="r-card-hdr">
          <span className="r-tag">ML FORECAST</span>
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
              const name = FRUIT_NAME[row.fruitSlug] || row.fruitSlug;
              const isUp = row.growthPct >= 0;
              const Arrow = isUp ? TrendingUp : TrendingDown;
              return (
                <div className="r-row" key={row.fruitSlug}>
                  <div className="r-rank">0{i + 1}</div>
                  <div className="r-mid">
                    <div className="r-name">
                      {name}
                      {TROPICAL.has(row.fruitSlug) && (
                        <span className="r-badge-new">NEW</span>
                      )}
                    </div>
                    <div className="r-ton">
                      {Math.round(row.baseTon).toLocaleString()}톤
                      {" → "}
                      {Math.round(row.targetTon).toLocaleString()}톤
                    </div>
                  </div>
                  <div className={"r-pct " + (isUp ? "up" : "down")}>
                    <Arrow size={13} strokeWidth={2.5} />
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
        <div className="r-note-h">왜 망고·바나나·올리브가 등장할까?</div>
        SSP5-8.5 시나리오에서 한반도 평균기온이 2050년까지 약 +1.8℃ 상승합니다.
        제주·전남·경남 일부 지역이 아열대 기후대로 진입하면서
        망고·바나나·올리브 재배 적지가 새로 생겨납니다.
        반면 사과·배·포도·복숭아는 적정 기온 구간을 벗어나기 시작합니다.
        <div className="r-note-foot">
          ※ 망고·바나나·올리브 수치는 SSP5-8.5 기온 상승 추정에 따른 시뮬레이션값 (실측치 아님)
        </div>
      </div>
    </div>
  );
}

export default Rising;
