// App.jsx — Last Table 홈
//
// 재디자인 포인트
//  - 이모지 제거, lucide-react 라인 아이콘만 사용
//  - 시각 위계: 알람 메인 카드 1장 (풀폭) + 보조 3장 + 탄소 1줄 + 미니 4
//  - 색 시스템: 그린(브랜드) + 알람 레드. 그 외 화이트/그레이.
//  - 백엔드 연결: 메인 카드의 "감소율" 숫자 (KOSIS 사과/배/복숭아/포도/감귤 평균)

import { useEffect, useState } from "react";
import {
  Bell,
  Leaf,
  ArrowDownRight,
  ChevronRight,
  Sprout,
  ShoppingBag,
  Heart,
  Home as HomeIcon,
  Store,
  User,
  CloudSun,
  Sparkles,
} from "lucide-react";
import "./App.css";
import DetailDisappearing from "./DetailDisappearing";
import Rising from "./Rising";
import Market from "./Market";
import AiMatch from "./AiMatch";
import Wish from "./Wish";
import My from "./My";

// 배포 환경에 따라 백엔드 주소가 달라진다.
// - 로컬: Vite 가 .env.development 또는 기본값 사용
// - Vercel: 프로젝트 환경변수 VITE_API_BASE 에서 읽음
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const TRACKED_FRUITS = [
  { slug: "apple",    name: "사과" },
  { slug: "pear",     name: "배" },
  { slug: "peach",    name: "복숭아" },
  { slug: "grape",    name: "포도" },
  { slug: "mandarin", name: "감귤" },
];

function App() {
  // 현재 어떤 화면을 보고 있는지 추적
  // "home"        — 홈
  // "disappearing"— "올해 사라지고 있는 식재료" 상세
  const [view, setView] = useState("home");

  const [decreasing, setDecreasing] = useState({
    loading: true,
    items: [],
    error: null,
  });

  useEffect(function () {
    loadDecreasingFruits();
  }, []);

  function loadDecreasingFruits() {
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
          const rows = results[i];
          const meta = TRACKED_FRUITS[i];
          if (!Array.isArray(rows) || rows.length < 2) continue;
          rows.sort(function (a, b) { return a.year - b.year; });
          const prev = rows[rows.length - 2].valueTon;
          const curr = rows[rows.length - 1].valueTon;
          if (prev === 0) continue;
          items.push({
            name: meta.name,
            changePercent: ((curr - prev) / prev) * 100,
          });
        }
        items.sort(function (a, b) { return a.changePercent - b.changePercent; });
        setDecreasing({ loading: false, items: items, error: null });
      })
      .catch(function (err) {
        setDecreasing({ loading: false, items: [], error: err.message });
      });
  }

  // 가장 많이 줄어든 상위 3개
  const topThree = decreasing.items.slice(0, 3);
  const topThreeNames = topThree.map(function (x) { return x.name; }).join(", ");
  const avgChange = topThree.length === 0
    ? 0
    : topThree.reduce(function (s, x) { return s + x.changePercent; }, 0) / topThree.length;
  const dropAbs = Math.abs(avgChange).toFixed(1);


  // 상세 화면이면 그것만 렌더
  if (view === "disappearing") {
    return (
      <DetailDisappearing
        onBack={function () { setView("home"); }}
        onNavigate={setView}
      />
    );
  }
  if (view === "rising") {
    return <Rising onBack={function () { setView("home"); }} />;
  }
  if (view === "market") {
    return (
      <>
        <Market onNavigate={setView} />
        <BottomTabs current="market" onChange={setView} />
      </>
    );
  }
  if (view === "ai") {
    return (
      <>
        <AiMatch onNavigate={setView} />
        <BottomTabs current="ai" onChange={setView} />
      </>
    );
  }
  if (view === "wish") {
    return (
      <>
        <Wish onNavigate={setView} />
        <BottomTabs current="wish" onChange={setView} />
      </>
    );
  }
  if (view === "my") {
    return (
      <>
        <My onNavigate={setView} />
        <BottomTabs current="my" onChange={setView} />
      </>
    );
  }

  return (
    <div className="app">

      {/* 헤더 */}
      <div className="header">
        <div className="logo-wrap">
          <div className="logo-mark">
            <Leaf size={16} strokeWidth={2.5} />
          </div>
          <div className="logo-text">Last Table</div>
        </div>
        <button className="icon-btn" aria-label="알림">
          <Bell size={18} />
        </button>
      </div>

      {/* 인사말 */}
      <div className="hero">
        <h1>안녕하세요, 그린님</h1>
        <p className="hero-sub">오늘의 식탁이 어떻게 바뀌고 있는지 살펴봐요</p>
      </div>

      {/* 메인 알람 카드 — 진짜 데이터. 클릭하면 상세 화면으로 이동. */}
      <div
        className="main-card"
        onClick={function () { setView("disappearing"); }}
        style={{ cursor: "pointer" }}
        role="button"
      >
        <div className="row">
          <span className="tag">
            <ArrowDownRight size={12} strokeWidth={2.5} />
            CLIMATE ALERT
          </span>
          <div className="arrow-circle">
            <ChevronRight size={18} />
          </div>
        </div>

        <h2>올해 사라지고 있는 식재료</h2>

        {decreasing.loading && (
          <>
            <p className="sub">KOSIS에서 최신 통계를 불러오는 중…</p>
            <div className="big">
              <div className="skeleton" style={{ width: 120, height: 44 }} />
            </div>
          </>
        )}

        {!decreasing.loading && decreasing.error && (
          <p className="sub" style={{ color: "var(--red)" }}>
            데이터를 불러오지 못했어요 ({decreasing.error})
          </p>
        )}

        {!decreasing.loading && !decreasing.error && topThree.length > 0 && (
          <>
            <p className="sub">
              {topThreeNames} 등 {topThree.length}종의 작년 대비 평균 생산량
            </p>
            <div className="big">
              <span className="big-num">−{dropAbs}</span>
              <span className="big-unit">%</span>
            </div>
          </>
        )}

        {!decreasing.loading && !decreasing.error && topThree.length === 0 && (
          <p className="sub">집계 가능한 데이터가 없습니다.</p>
        )}
      </div>

      {/* 보조 카드 3장 */}
      <div className="section-title">
        <h3>오늘의 인사이트</h3>
        <span className="more">더보기 <ChevronRight size={12} /></span>
      </div>

      <div className="sub-cards two">
        <div
          className="sub-card"
          onClick={function () { setView("rising"); }}
          style={{ cursor: "pointer" }}
          role="button"
        >
          <div className="ic"><Sprout size={16} /></div>
          <div>
            <div className="label">새로 자라는 작물</div>
            <div className="hint">ML 예측 보기 ›</div>
          </div>
        </div>

        <div
          className="sub-card"
          onClick={function () { setView("ai"); }}
          style={{ cursor: "pointer" }}
          role="button"
        >
          <div className="ic"><Sparkles size={16} /></div>
          <div>
            <div className="label">AI 매칭</div>
            <div className="hint">자연어로 물어보기 ›</div>
          </div>
        </div>
      </div>

      {/* 탄소 카드 — 한 줄 요약 */}
      <div className="carbon">
        <div className="left">
          <div className="ic"><CloudSun size={18} /></div>
          <div>
            <p className="ttl">오늘 절약한 탄소</p>
            <div className="val"><em>1.85</em>kg CO₂ · 나무 2.1그루</div>
          </div>
        </div>
        <ChevronRight size={18} color="var(--ink-3)" />
      </div>

      {/* 미니 액션 4개 */}
      <div className="section-title">
        <h3>지속 가능한 행동</h3>
        <span className="more">더보기 <ChevronRight size={12} /></span>
      </div>

      <div className="mini-grid two">
        <div className="mini">
          <div className="ic"><ShoppingBag size={16} /></div>
          <span className="nm">못난이 마켓</span>
          <span className="desc">합리 가격</span>
        </div>
        <div className="mini">
          <div className="ic"><Heart size={16} /></div>
          <span className="nm">환경 기부</span>
          <span className="desc">한 끼 후원</span>
        </div>
      </div>

      <BottomTabs current="home" onChange={setView} />
    </div>
  );
}

// 모든 메인 화면에서 재사용하는 하단 탭바.
// current 와 일치하는 탭에 active 클래스가 붙는다.
function BottomTabs({ current, onChange }) {
  function tab(key, label, icon, extra) {
    return (
      <div
        className={"tab" + (current === key ? " active" : "")}
        onClick={function () { onChange(key); }}
        style={{ cursor: "pointer" }}
      >
        {extra}
        {icon}
        <span>{label}</span>
      </div>
    );
  }
  return (
    <nav className="tabbar five">
      {tab("home",   "홈",   <HomeIcon size={20} />)}
      {tab("market", "마켓", <Store size={20} />)}
      {tab("ai",     "AI",   <Sparkles size={20} />, <span className="ai-dot" />)}
      {tab("wish",   "찜",   <Heart size={20} />)}
      {tab("my",     "MY",   <User size={20} />)}
    </nav>
  );
}

export default App;
