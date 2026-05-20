// App.jsx
//
// Last Table 홈 화면.
// 디자인은 받아온 그대로 유지하고,
// "🥕 생산량 감소 식재료" 카드 한 장만 백엔드 API와 실제로 연결한다.

import { useEffect, useState } from "react";
import "./App.css";

// 백엔드 서버 주소. 나중에 배포되면 환경변수로 빼면 된다.
const API_BASE = "http://localhost:8080";

// 우리가 추적할 과일 5종 — 화면에서는 상위 3개만 보여줄 것.
const TRACKED_FRUITS = [
  { slug: "apple",    name: "사과" },
  { slug: "pear",     name: "배" },
  { slug: "peach",    name: "복숭아" },
  { slug: "grape",    name: "포도" },
  { slug: "mandarin", name: "감귤" },
];

function App() {
  // 백엔드에서 가져올 "감소 식재료" 카드용 상태
  const [decreasing, setDecreasing] = useState({
    loading: true,
    items: [],   // [{ name: "사과", changePercent: -12.3 }, ...]
    error: null,
  });

  // 컴포넌트가 처음 화면에 그려질 때 한 번 실행 (백엔드 호출)
  useEffect(function () {
    loadDecreasingFruits();
  }, []);

  // 각 과일별로 "전국 합계 최근 2년" 데이터를 받아서 증감률 계산.
  function loadDecreasingFruits() {
    // 동시에 5개 요청 보내기
    const requests = TRACKED_FRUITS.map(function (f) {
      const url = API_BASE
        + "/api/kosis/fruits/" + encodeURIComponent(f.slug)
        + "/production?years=2&region=" + encodeURIComponent("계");
      return fetch(url).then(function (r) { return r.json(); });
    });

    Promise.all(requests)
      .then(function (results) {
        const items = [];
        for (let i = 0; i < results.length; i++) {
          const rows = results[i];          // [{ year, valueTon, ... }, ...]
          const meta = TRACKED_FRUITS[i];
          if (!Array.isArray(rows) || rows.length < 2) continue;

          // 연도 오름차순 정렬 후 (작년 → 올해) 비교
          rows.sort(function (a, b) { return a.year - b.year; });
          const prev = rows[rows.length - 2].valueTon;
          const curr = rows[rows.length - 1].valueTon;
          if (prev === 0) continue;
          const changePercent = ((curr - prev) / prev) * 100;

          items.push({ name: meta.name, changePercent: changePercent });
        }

        // 가장 많이 줄어든 순서로 정렬 (음수가 클수록 앞)
        items.sort(function (a, b) { return a.changePercent - b.changePercent; });

        setDecreasing({ loading: false, items: items, error: null });
      })
      .catch(function (err) {
        setDecreasing({ loading: false, items: [], error: err.message });
      });
  }

  // 상위 3개 + 평균 감소율 — 카드에 표시할 값
  const topThree = decreasing.items.slice(0, 3);
  const topThreeNames = topThree.map(function (x) { return x.name; }).join(", ");
  const avgChange = topThree.length === 0
    ? 0
    : topThree.reduce(function (s, x) { return s + x.changePercent; }, 0) / topThree.length;


  // ─────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────
  return (
    <div className="app">
      <header>
        <div className="logo">🌱 그린테이블</div>
        <div className="bell">🔔</div>
      </header>

      <section className="hero">
        <h1>안녕하세요, 그린님!</h1>
        <p>오늘도 지구를 위한 선택을 함께해요 🌱</p>
        <div className="weather">☀️ 22°C<br />서울시 강남구</div>
      </section>

      <section className="carbon-card">
        <div>
          <h3>오늘 절약한 탄소량</h3>
          <strong>1.85 <span>kg CO₂</span></strong>
          <p>나무 2.1그루를 심은 효과예요!</p>
          <div className="bar">
            <div></div>
          </div>
        </div>
        <div className="earth">🌍</div>
      </section>

      <section className="insight">
        <div className="title">
          <h2>오늘의 인사이트</h2>
          <span>더보기 ›</span>
        </div>

        <div className="grid">

          {/* ★ 백엔드 연결된 유일한 카드 ★ */}
          <div className="card green">
            <h3>🥕 생산량 감소 식재료</h3>

            {decreasing.loading && <p>불러오는 중...</p>}

            {decreasing.error && <p>에러: {decreasing.error}</p>}

            {!decreasing.loading && !decreasing.error && topThree.length > 0 && (
              <>
                <p>
                  {topThreeNames} 등<br />
                  {topThree.length}종 주의 필요
                </p>
                <strong className={avgChange < 0 ? "down" : ""}>
                  {avgChange > 0 ? "↑ " : "↓ "}
                  {Math.abs(avgChange).toFixed(1)}%
                </strong>
              </>
            )}

            {!decreasing.loading && !decreasing.error && topThree.length === 0 && (
              <p>데이터 없음</p>
            )}
          </div>

          <div className="card yellow">
            <h3>🌱 새로 재배되는 작물</h3>
            <p>기후 변화에 강한<br />작물 5종 확인하기</p>
          </div>

          <div className="card purple">
            <h3>📷 AI 식재료 분석</h3>
            <p>사진 한 장으로 식재료 정보,<br />미래 생산량, 대체작물까지!</p>
          </div>

          <div className="card mint">
            <h3>🛒 지역 식재료 추천</h3>
            <p>내 주변 신선한<br />로컬푸드를 찾아보세요</p>
          </div>
        </div>
      </section>

      <section className="future">
        <div className="title">
          <h2>함께 만드는 지속 가능한 미래</h2>
          <span>더보기 ›</span>
        </div>

        <div className="mini-list">
          <div>🌿<b>탄소 절감</b><p>절감량 확인</p></div>
          <div>🥕<b>못난이 식재료 마켓</b><p>합리적인 가격</p></div>
          <div>💚<b>환경 기부</b><p>따뜻한 기부</p></div>
          <div>🏆<b>이벤트</b><p>챌린지 참여</p></div>
        </div>
      </section>

      <nav>
        <div className="active">🏠 <span>홈<br />시각화</span></div>
        <div>🛒<span>연결 마켓<br />마켓</span></div>
        <div className="camera">📷</div>
        <div>👤<span>MY<br />리포트</span></div>
      </nav>
    </div>
  );
}

export default App;
