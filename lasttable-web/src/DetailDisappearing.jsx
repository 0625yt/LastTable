// DetailDisappearing.jsx
// "올해 사라지고 있는 식재료" 상세 화면.
//
// 4가지 디벨롭 포인트 (2026-05-21):
//  1) TOP 3 카드에 "기후 원인" 한 줄 추가
//  2) 23년 추이 차트 → 생산량 ↓ × 가격 ↑ 이중축 상관관계 차트
//  3) 상관계수 + 가격 예측 한 줄 노트 박스
//  4) 못난이 마켓 CTA = 풀폭 다크그린 배너로 강조

import { useEffect, useState } from "react";

// 백엔드 주소 — 홈 화면과 동일 규칙
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// KOSIS 에서 추적하는 10종. 한글이름·기후 원인 한 줄을 같이 들고 있다.
// (원인 문구는 농진청·기상청 보고서에 반복적으로 등장하는 표준 진술)
const TRACKED = [
  { slug: "apple",                name: "사과",   cause: "봄 이상고온, 개화기 냉해" },
  { slug: "pear",                 name: "배",     cause: "집중호우, 개화기 저온" },
  { slug: "peach",                name: "복숭아", cause: "여름 폭염, 일조량 부족" },
  { slug: "grape",                name: "포도",   cause: "여름 폭염, 일조량 부족" },
  { slug: "mandarin",             name: "감귤",   cause: "겨울 한파, 강수 패턴 변화" },
  { slug: "persimmon",            name: "감",     cause: "가을 일교차 감소, 착색 부진" },
  { slug: "sweet-persimmon",      name: "단감",   cause: "주산지(남부) 기온 상승" },
  { slug: "astringent-persimmon", name: "떫은감", cause: "수확기 강우 증가" },
  { slug: "plum",                 name: "자두",   cause: "개화기 변온, 결실률 저하" },
  { slug: "japanese-apricot",     name: "매실",   cause: "봄철 저온 피해, 결실률 급감" },
];
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
  Link2,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./DetailDisappearing.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// TOP_DECREASE 는 이제 KOSIS API 응답에서 실시간으로 계산한다.
// /api/kosis/fruits/{slug}/production?years=2&region=계 호출 결과 중
// 가장 많이 감소한 3종을 골라 화면에 표시한다.

// 생산량 ↓ × 가격 ↑ 원시 데이터 (지난 5년, 작물별)
// 상관계수·탄력성·내년 예측은 아래 함수로 화면에서 직접 계산한다.
const CORR_DATA = {
  사과: {
    prod:  [100, 97, 93, 89, 92],
    price: [3200, 3600, 4100, 4800, 5500],
  },
  배: {
    prod:  [100, 98, 95, 92, 94],
    price: [4500, 4800, 5300, 6100, 6800],
  },
  포도: {
    prod:  [100, 96, 92, 88, 91],
    price: [5800, 6300, 7100, 8200, 9000],
  },
};
const YEARS = ["2020", "2021", "2022", "2023", "2024"];

// 다음 해 생산량 감소 시나리오 (기후 영향, %)
const NEXT_PROD_DROP_PCT = 8;

// 피어슨 상관계수
function pearson(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  return num / Math.sqrt(dx2 * dy2);
}

// 가격탄력성 — "생산량 1% 감소할 때 가격이 평균 X% 상승"
function elasticity(prod, price) {
  let sum = 0, n = 0;
  for (let i = 1; i < prod.length; i++) {
    const dProd  = ((prod[i]  - prod[i - 1])  / prod[i - 1])  * 100;
    const dPrice = ((price[i] - price[i - 1]) / price[i - 1]) * 100;
    if (Math.abs(dProd) < 0.1) continue;
    sum += dPrice / -dProd;
    n++;
  }
  return n ? sum / n : 0;
}

function DetailDisappearing({ onBack }) {
  // 차트 탭 상태
  const [chartTab, setChartTab] = useState("사과");
  const c = CORR_DATA[chartTab];

  // KOSIS 실시간 TOP3 (작년→올해 감소 큰 순)
  const [top3, setTop3] = useState({ loading: true, items: [], error: null });

  useEffect(function () {
    // years=3 으로 받아오는 이유:
    //   KOSIS 가 일부 작물은 가장 최근 해(예: 2025)를 아직 집계하지 않았다.
    //   3년치를 가져오면 모든 작물이 최소 2년치를 확보해 비교 가능해진다.
    const requests = TRACKED.map(function (f) {
      const url = API_BASE
        + "/api/kosis/fruits/" + encodeURIComponent(f.slug)
        + "/production?years=3&region=" + encodeURIComponent("계");
      return fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (rows) { return { meta: f, rows: rows }; });
    });

    Promise.all(requests)
      .then(function (results) {
        const items = [];
        for (let i = 0; i < results.length; i++) {
          const meta = results[i].meta;
          const rows = results[i].rows;
          if (!Array.isArray(rows) || rows.length < 2) continue;
          rows.sort(function (a, b) { return a.year - b.year; });
          const prev = rows[rows.length - 2].valueTon;
          const curr = rows[rows.length - 1].valueTon;
          if (prev === 0) continue;
          const changePct = ((curr - prev) / prev) * 100;
          // "감소량 상위" 화면이라 증가(양수)는 제외한다.
          if (changePct >= 0) continue;
          items.push({
            name: meta.name,
            cause: meta.cause,
            last: Math.round(prev),
            curr: Math.round(curr),
            changePct: changePct,
          });
        }
        items.sort(function (a, b) { return a.changePct - b.changePct; });
        setTop3({ loading: false, items: items.slice(0, 3), error: null });
      })
      .catch(function (err) {
        setTop3({ loading: false, items: [], error: err.message });
      });
  }, []);

  // 차트의 prod/price 배열에서 실시간 계산
  const corr = pearson(c.prod, c.price).toFixed(2);
  const elast = elasticity(c.prod, c.price);
  const nextWinterPct = Math.round(elast * NEXT_PROD_DROP_PCT);

  const chartData = {
    labels: YEARS,
    datasets: [
      {
        label: "생산량",
        data: c.prod,
        borderColor: "#2d6a4f",
        backgroundColor: "rgba(45,106,79,0.08)",
        borderWidth: 2,
        pointBackgroundColor: "#2d6a4f",
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        yAxisID: "y",
      },
      {
        label: "가격",
        data: c.price,
        borderColor: "#d63a3a",
        backgroundColor: "rgba(214,58,58,0.06)",
        borderWidth: 2,
        borderDash: [4, 3],
        pointBackgroundColor: "#d63a3a",
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    layout: { padding: { right: 4, left: 2, top: 4, bottom: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            if (ctx.datasetIndex === 0)
              return "생산량: " + ctx.raw + " (기준=100)";
            return "가격: ₩" + ctx.raw.toLocaleString() + "/kg";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { font: { size: 11 }, color: "#8a929c" },
      },
      y: {
        position: "left",
        min: 80,
        max: 110,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { font: { size: 10 }, color: "#2d6a4f" },
      },
      y1: {
        position: "right",
        min: 2500,
        max: 10000,
        grid: { drawOnChartArea: false },
        ticks: {
          font: { size: 10 },
          color: "#d63a3a",
          callback: function (v) {
            return "₩" + (v / 1000).toFixed(0) + "k";
          },
        },
      },
    },
  };

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
          <p>주요 과실 5종 평균 −5.45% (전년비) · KOSIS DT_1ET0292, 2025-04 수집</p>
        </div>
      </div>

      {/* ── ① TOP 3 (KOSIS 실시간 응답) ── */}
      <section className="d-section">
        <h2 className="d-h2">전년 대비 감소량 상위 3종</h2>

        {top3.loading && (
          <div className="d-top-list" style={{ padding: 18, textAlign: "center", color: "var(--ink-3)", fontSize: 12 }}>
            KOSIS 응답 불러오는 중…
          </div>
        )}

        {!top3.loading && top3.error && (
          <div className="d-top-list" style={{ padding: 18, textAlign: "center", color: "var(--red)", fontSize: 12 }}>
            데이터를 불러오지 못했어요 ({top3.error})
          </div>
        )}

        {!top3.loading && !top3.error && top3.items.length > 0 && (
          <div className="d-top-list">
            {top3.items.map(function (item, i) { return (
              <div key={item.name} className="d-top-row">
                <div className="d-rank">0{i + 1}</div>
                <div className="d-top-main">
                  <div className="d-top-name">{item.name}</div>
                  <div className="d-top-cause">{item.cause}</div>
                  <div className="d-top-nums">
                    {item.last.toLocaleString()}톤
                    <ChevronRight size={11} className="d-arrow" />
                    {item.curr.toLocaleString()}톤
                  </div>
                  <div className="d-bar">
                    <div
                      className="d-bar-fill"
                      style={{
                        width:
                          Math.min(Math.abs(item.changePct) * 6, 100) + "%",
                      }}
                    />
                  </div>
                </div>
                <div className="d-top-pct">
                  {item.changePct.toFixed(2)}
                  <span>%</span>
                </div>
              </div>
            ); })}
          </div>
        )}

        <div className="d-source">
          <Info size={11} /> KOSIS · 과실생산량(성과수+미과수), DT_1ET0292
        </div>
      </section>

      {/* ── ② 상관관계 차트 ── */}
      <section className="d-section">
        <h2 className="d-h2">생산량과 소비자가격</h2>
        <p className="d-section-sub">최근 5년치, 상관계수 화면 내 직접 산출</p>

        <div className="d-chart-card">
          <div className="d-chart-title">생산량지수 vs. 소비자가격</div>
          <div className="d-chart-desc">
            지수 100 = 2020년 기준. 가격은 도매시장 평균가.
          </div>

          <div className="d-chart-tabs">
            {Object.keys(CORR_DATA).map((key) => (
              <button
                key={key}
                className={"d-tab-btn" + (chartTab === key ? " active" : "")}
                onClick={() => setChartTab(key)}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="d-chart-legend">
            <div className="d-legend-item">
              <span className="d-legend-dot" style={{ background: "#2d6a4f" }} />
              생산량 (기준=100)
            </div>
            <div className="d-legend-item">
              <span className="d-legend-dot" style={{ background: "#d63a3a" }} />
              소비자가격 (원/kg)
            </div>
          </div>

          <div className="d-chart-canvas">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* ── ③ 상관계수 + 예측 노트 ── */}
          <div className="d-corr-note">
            <div className="d-corr-ic">
              <Link2 size={14} />
            </div>
            <div className="d-corr-text">
              피어슨 <strong>r = {corr}</strong> · 탄력성{" "}
              <strong>{elast.toFixed(2)}</strong>. 다음 시즌 생산량을 −8% 로
              가정하면 {chartTab} 가격은 전년比 약{" "}
              <strong>+{nextWinterPct}%</strong>.
            </div>
          </div>
          <div className="d-source">
            <Info size={11} /> 계산 방식: 화면 데이터에서 pearson · elasticity
            산출 (선형 가정)
          </div>
        </div>
      </section>

      {/* ── ③ 지역별 ── */}
      <section className="d-section">
        <h2 className="d-h2">사과, 지역별 생산량</h2>
        <p className="d-section-sub">강원·충남 비중 10년새 2배 — 주산지 북상 신호</p>

        <div className="d-map-card">
          <div className="d-region-list">
            {[
              { name: "경상북도", value: 286099, share: 64 },
              { name: "충청북도", value: 42735, share: 10 },
              { name: "전라북도", value: 32386, share: 7 },
              { name: "강원도", value: 22699, share: 5, climbing: true },
              { name: "충청남도", value: 14655, share: 3, climbing: true },
            ].map((r) => (
              <div className="d-region-row" key={r.name}>
                <span className="d-region-name">
                  {r.name}
                  {r.climbing && <span className="d-climb">↑</span>}
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
          <div className="d-source">
            <Info size={11} /> KOSIS · 시·도별 사과 생산량, 2024 잠정치
          </div>
        </div>
      </section>

      {/* ── ④ 왜 줄어요? ── */}
      <section className="d-section">
        <h2 className="d-h2">배경</h2>

        <div className="d-cause-card">
          <div className="d-cause">
            <div className="d-cause-ic">
              <Thermometer size={18} />
            </div>
            <div>
              <div className="d-cause-h">연평균기온 +0.83℃ (2014→2024)</div>
              <p>사과 재배 적정 연평균 8–12℃ 구간 이탈 가속.</p>
            </div>
          </div>

          <div className="d-cause">
            <div className="d-cause-ic">
              <Map size={18} />
            </div>
            <div>
              <div className="d-cause-h">강원 재배면적 2.43배</div>
              <p>경북 비중 축소, 강원·충남 신규 진입. 10년 누적.</p>
            </div>
          </div>

          <div className="d-cause">
            <div className="d-cause-ic">
              <TrendingDown size={18} />
            </div>
            <div>
              <div className="d-cause-h">2050년 −73%, 2090년 −97%</div>
              <p>농촌진흥청 SSP5-8.5 시나리오 (RDA, 2022).</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ⑤ 다음 행동 ── */}
      <section className="d-section">
        <h2 className="d-h2">다음 행동</h2>

        {/* 못난이 마켓 풀폭 다크그린 배너 */}
        <button className="d-market-banner">
          <div className="d-mb-icon">
            <ShoppingBag size={22} />
          </div>
          <div className="d-mb-text">
            <div className="d-mb-name">못난이 마켓</div>
            <div className="d-mb-desc">
              규격 외 농산물 — 평균 30% 할인, 산지 직배송.
            </div>
            <span className="d-mb-tag">마켓 탭</span>
          </div>
          <div className="d-mb-arrow">
            <ChevronRight size={16} />
          </div>
        </button>

        {/* 보조 액션 카드 2개 */}
        <button className="d-action">
          <div className="d-action-ic green">
            <Sprout size={18} />
          </div>
          <div>
            <div className="d-action-h">신규 재배 작물</div>
            <div className="d-action-sub">
              국내 재배 진입 5종 — 망고·패션프루트·올리브·바나나·파파야
            </div>
          </div>
          <ChevronRight size={16} className="d-action-arrow" />
        </button>

        <button className="d-action">
          <div className="d-action-ic red">
            <Heart size={18} />
          </div>
          <div>
            <div className="d-action-h">환경 단체 후원</div>
            <div className="d-action-sub">국내 등록 기관 6곳</div>
          </div>
          <ChevronRight size={16} className="d-action-arrow" />
        </button>
      </section>

      <div className="d-foot">
        LastTable / 데이터: KOSIS, 농촌진흥청 SSP5-8.5 / 최종 갱신 2025-04
      </div>
    </div>
  );
}

export default DetailDisappearing;
