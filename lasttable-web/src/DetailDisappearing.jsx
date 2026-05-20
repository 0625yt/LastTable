// DetailDisappearing.jsx
// "올해 사라지고 있는 식재료" 상세 화면.
// 데모용으로 대부분 하드코딩, TOP 3 만 실제 KOSIS 평균값 받음.

import {
  ArrowLeft,
  ArrowDownRight,
  Info,
  Thermometer,
  Map,
  TrendingDown,
  ShoppingBag,
  Sprout,
  Heart,
  ChevronRight,
} from "lucide-react";
import "./DetailDisappearing.css";

// 데모 하드코딩 TOP 3 (실제로는 백엔드에서 받지만 데모 목적으로 고정)
const TOP_DECREASE = [
  {
    rank: 1,
    name: "포도",
    emoji: "🍇",
    last:  216470,
    curr:  198320,
    changePct: -8.4,
    region: "경상북도",
  },
  {
    rank: 2,
    name: "배",
    emoji: "🍐",
    last:  179800,
    curr:  170240,
    changePct: -5.3,
    region: "전라남도",
  },
  {
    rank: 3,
    name: "사과",
    emoji: "🍎",
    last:  460088,
    curr:  447952,
    changePct: -2.6,
    region: "경상북도",
  },
];

// 시계열 차트용 23년치 데이터 (사과, 가공)
// 실제 KOSIS 응답 흐름을 시뮬레이션 — 우상향 후 정체/감소
const APPLE_TIMELINE = [
  { year: 2003, value: 372 },
  { year: 2005, value: 368 },
  { year: 2007, value: 408 },
  { year: 2009, value: 494 },
  { year: 2011, value: 379 },
  { year: 2013, value: 494 },
  { year: 2015, value: 583 },
  { year: 2017, value: 545 },
  { year: 2019, value: 533 },
  { year: 2021, value: 491 },
  { year: 2023, value: 394 },
  { year: 2024, value: 460 },
  { year: 2025, value: 448 },
];

function DetailDisappearing({ onBack }) {
  // ── 차트 SVG 좌표 계산 ──
  const W = 320;
  const H = 140;
  const padL = 28, padR = 12, padT = 14, padB = 22;
  const xs = APPLE_TIMELINE.map(p => p.year);
  const ys = APPLE_TIMELINE.map(p => p.value);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.floor(Math.min(...ys) / 50) * 50;
  const yMax = Math.ceil(Math.max(...ys) / 50) * 50;

  function xPx(x) {
    return padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  }
  function yPx(y) {
    return padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);
  }

  const linePath = APPLE_TIMELINE
    .map((p, i) => (i === 0 ? "M" : "L") + xPx(p.year) + " " + yPx(p.value))
    .join(" ");

  const areaPath = linePath
    + " L " + xPx(xMax) + " " + yPx(yMin)
    + " L " + xPx(xMin) + " " + yPx(yMin) + " Z";

  return (
    <div className="detail">

      {/* ── 헤더 ── */}
      <div className="d-header">
        <button className="d-back" onClick={onBack} aria-label="뒤로">
          <ArrowLeft size={20} />
        </button>
        <div className="d-title-wrap">
          <span className="d-eyebrow">
            <ArrowDownRight size={11} strokeWidth={2.5} />
            CLIMATE ALERT
          </span>
          <h1>올해 사라지고 있는 식재료</h1>
          <p>5종 평균 작년 대비 −5.4% · KOSIS DT_1ET0292 (2025)</p>
        </div>
      </div>

      {/* ── ① TOP 3 ── */}
      <section className="d-section">
        <h2 className="d-h2">가장 많이 줄어든 TOP 3</h2>

        <div className="d-top-list">
          {TOP_DECREASE.map(item => (
            <div key={item.rank} className="d-top-row">
              <div className="d-rank">{item.rank}</div>
              <div className="d-top-main">
                <div className="d-top-name">
                  <span className="d-top-emoji">{item.emoji}</span>
                  <span>{item.name}</span>
                  <span className="d-top-region">· 주산지 {item.region}</span>
                </div>
                <div className="d-top-nums">
                  {item.last.toLocaleString()}톤
                  <ChevronRight size={11} className="d-arrow" />
                  {item.curr.toLocaleString()}톤
                </div>
                <div className="d-bar">
                  <div
                    className="d-bar-fill"
                    style={{ width: Math.min(Math.abs(item.changePct) * 6, 100) + "%" }}
                  />
                </div>
              </div>
              <div className="d-top-pct">
                {item.changePct.toFixed(1)}<span>%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="d-source">
          <Info size={11} /> 출처: 통계청 KOSIS 과실생산량(성과수+미과수)
        </div>
      </section>

      {/* ── ② 23년 추이 ── */}
      <section className="d-section">
        <h2 className="d-h2">사과, 지난 23년 추이</h2>
        <p className="d-section-sub">2015년 정점 → 2025년 −23% (단위: 천 톤)</p>

        <div className="d-chart-card">
          <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
            {/* 그리드 */}
            {[yMin, yMin + (yMax - yMin) / 2, yMax].map((g, i) => (
              <g key={i}>
                <line
                  x1={padL} x2={W - padR}
                  y1={yPx(g)} y2={yPx(g)}
                  stroke="#eee" strokeWidth="1"
                />
                <text
                  x={padL - 6} y={yPx(g) + 3}
                  fontSize="9" fill="#8a929c" textAnchor="end"
                >
                  {g}
                </text>
              </g>
            ))}

            {/* 영역 */}
            <path d={areaPath} fill="rgba(214,58,58,0.08)" />
            {/* 선 */}
            <path d={linePath} fill="none" stroke="#d63a3a" strokeWidth="2" />
            {/* 마지막 점 */}
            <circle
              cx={xPx(APPLE_TIMELINE[APPLE_TIMELINE.length - 1].year)}
              cy={yPx(APPLE_TIMELINE[APPLE_TIMELINE.length - 1].value)}
              r="3.5" fill="#d63a3a"
            />

            {/* x축 라벨 */}
            <text x={xPx(xMin)} y={H - 6} fontSize="9" fill="#8a929c">{xMin}</text>
            <text x={xPx(xMax) - 14} y={H - 6} fontSize="9" fill="#8a929c">{xMax}</text>
          </svg>
        </div>
      </section>

      {/* ── ③ 지역별 (간이) ── */}
      <section className="d-section">
        <h2 className="d-h2">사과 주산지 지도</h2>
        <p className="d-section-sub">진할수록 생산량 많음 · 점차 북쪽으로 이동 중</p>

        <div className="d-map-card">
          <div className="d-region-list">
            {[
              { name: "경상북도", value: 286099, share: 64 },
              { name: "충청북도", value:  42735, share: 10 },
              { name: "전라북도", value:  32386, share:  7 },
              { name: "강원도",   value:  22699, share:  5, climbing: true },
              { name: "충청남도", value:  14655, share:  3, climbing: true },
            ].map(r => (
              <div className="d-region-row" key={r.name}>
                <span className="d-region-name">
                  {r.name}
                  {r.climbing && <span className="d-climb">↑ 북상</span>}
                </span>
                <div className="d-region-bar">
                  <div
                    className="d-region-bar-fill"
                    style={{ width: r.share * 1.4 + "%" }}
                  />
                </div>
                <span className="d-region-val">{r.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ④ 왜 줄어요? ── */}
      <section className="d-section">
        <h2 className="d-h2">왜 줄어들고 있어요?</h2>

        <div className="d-cause-card">
          <div className="d-cause">
            <div className="d-cause-ic"><Thermometer size={18} /></div>
            <div>
              <div className="d-cause-h">평균기온 +0.8℃ (10년새)</div>
              <p>사과는 연평균 8~12℃에서 가장 잘 자라요.</p>
            </div>
          </div>

          <div className="d-cause">
            <div className="d-cause-ic"><Map size={18} /></div>
            <div>
              <div className="d-cause-h">주산지 북상</div>
              <p>경상북도 → 강원도. 강원도 사과는 10년새 2.4배.</p>
            </div>
          </div>

          <div className="d-cause">
            <div className="d-cause-ic"><TrendingDown size={18} /></div>
            <div>
              <div className="d-cause-h">2050년 −73%, 2090년 −97%</div>
              <p>농촌진흥청 SSP5-8.5 시나리오 예측.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ⑤ 액션 ── */}
      <section className="d-section">
        <h2 className="d-h2">지금 할 수 있는 일</h2>

        <div className="d-actions">
          <button className="d-action">
            <div className="d-action-ic"><ShoppingBag size={18} /></div>
            <div>
              <div className="d-action-h">못난이 사과 사기</div>
              <div className="d-action-sub">시장가 −40%, 농가 직거래</div>
            </div>
            <ChevronRight size={16} className="d-action-arrow" />
          </button>

          <button className="d-action">
            <div className="d-action-ic green"><Sprout size={18} /></div>
            <div>
              <div className="d-action-h">적응 작물 농가 응원</div>
              <div className="d-action-sub">강원도 사과 농가 8곳</div>
            </div>
            <ChevronRight size={16} className="d-action-arrow" />
          </button>

          <button className="d-action">
            <div className="d-action-ic red"><Heart size={18} /></div>
            <div>
              <div className="d-action-h">환경 단체에 기부</div>
              <div className="d-action-sub">한 끼 후원 = 나무 한 그루</div>
            </div>
            <ChevronRight size={16} className="d-action-arrow" />
          </button>
        </div>
      </section>

      <div className="d-foot">
        Last Table · KOSIS + 농촌진흥청 SSP 시나리오 기반
      </div>
    </div>
  );
}

export default DetailDisappearing;
