// My.jsx — 프로필 / 통계 / 뱃지 / 메뉴 (홈 톤)
//
// 데모용 단일 사용자(그린님). 회원/로그인은 발표 후 v2.

import {
  User,
  Sprout,
  Recycle,
  Trees,
  Package,
  Heart,
  Award,
  ChevronRight,
} from "lucide-react";
import "./My.css";

const STATS = [
  { ic: <Sprout size={14} />,  num: "12",  label: "응원 농가" },
  { ic: <Recycle size={14} />, num: "9.3", unit: "kg", label: "CO₂ 절감" },
  { ic: <Trees size={14} />,   num: "14",  label: "나무 환산" },
];

const MONTHLY = [
  { m: "1월", v: 0.8, pct: 23 },
  { m: "2월", v: 1.2, pct: 35 },
  { m: "3월", v: 2.1, pct: 62 },
  { m: "4월", v: 1.7, pct: 50 },
  { m: "5월", v: 3.4, pct: 100 },
];

const CONTRIBS = [
  { num: "7",      label: "건 직거래" },
  { num: "23kg",   label: "못난이 폐기 절감" },
  { num: "3,200",  label: "원 기부 누적" },
];

const BADGES = [
  { nm: "첫 직거래",        locked: false },
  { nm: "못난이 구원자",    locked: false },
  { nm: "탄소 절감 10kg",   locked: false },
  { nm: "농가 응원 10곳",   locked: true },
  { nm: "기후 챔피언",      locked: true },
  { nm: "리뷰 마스터",       locked: true },
];

function My({ onNavigate }) {
  return (
    <div className="my">
      {/* 프로필 헤더 */}
      <div className="my-profile">
        <div className="my-avatar">
          <User size={22} color="#fff" />
        </div>
        <div className="my-profile-info">
          <div className="my-name">그린님</div>
          <div className="my-meta">green@lasttable.com · 가입 2025.03</div>
        </div>
        <button className="my-edit">편집</button>
      </div>

      {/* 통계 3개 */}
      <div className="my-stats">
        {STATS.map(function (s, i) {
          return (
            <div className="my-stat" key={i}>
              <div className="my-stat-ic">{s.ic}</div>
              <div className="my-stat-num">
                {s.num}
                {s.unit && <small>{s.unit}</small>}
              </div>
              <div className="my-stat-lbl">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* 월별 탄소 절감 차트 */}
      <div className="my-chart">
        <div className="my-chart-h">월별 탄소 절감</div>
        <div className="my-bars">
          {MONTHLY.map(function (m) {
            return (
              <div className="my-bar-col" key={m.m}>
                <div className="my-bar-val">{m.v}</div>
                <div className="my-bar-bg">
                  <div className="my-bar-fill" style={{ height: m.pct + "%" }} />
                </div>
                <div className="my-bar-lbl">{m.m}</div>
              </div>
            );
          })}
        </div>
        <div className="my-chart-unit">kg CO₂</div>
      </div>

      {/* 환경 기여 */}
      <div className="my-contrib">
        <div className="my-contrib-h">나의 환경 기여</div>
        <div className="my-contrib-row">
          {CONTRIBS.map(function (c, i) {
            return (
              <div className="my-contrib-item" key={i}>
                <div className="my-contrib-num">{c.num}</div>
                <div className="my-contrib-lbl">{c.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 뱃지 */}
      <div className="my-section-h">나의 뱃지 <span>3 / 6</span></div>
      <div className="my-badges">
        {BADGES.map(function (b) {
          return (
            <div key={b.nm} className={"my-badge" + (b.locked ? " locked" : "")}>
              <Award size={18} color={b.locked ? "var(--ink-3)" : "var(--green)"} />
              <div className="my-badge-nm">{b.nm}</div>
            </div>
          );
        })}
      </div>

      {/* 메뉴 */}
      <div className="my-menu">
        <button
          className="my-menu-item"
          onClick={function () { onNavigate && onNavigate("market"); }}
        >
          <Package size={14} color="var(--ink-2)" />
          <span className="my-menu-lbl">주문 내역</span>
          <span className="my-menu-sub">총 7건</span>
          <ChevronRight size={14} color="var(--ink-3)" />
        </button>
        <button
          className="my-menu-item"
          onClick={function () { onNavigate && onNavigate("wish"); }}
        >
          <Heart size={14} color="var(--ink-2)" />
          <span className="my-menu-lbl">찜 목록</span>
          <span className="my-menu-sub">3개</span>
          <ChevronRight size={14} color="var(--ink-3)" />
        </button>
        <button className="my-menu-item">
          <Award size={14} color="var(--ink-2)" />
          <span className="my-menu-lbl">나의 뱃지</span>
          <span className="my-menu-sub">3/6 획득</span>
          <ChevronRight size={14} color="var(--ink-3)" />
        </button>
      </div>
    </div>
  );
}

export default My;
