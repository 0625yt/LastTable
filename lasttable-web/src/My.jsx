// My.jsx — 사용자 프로필 / 통계 / 뱃지 / 메뉴
//
// 데모용 단일 사용자(그린님). 회원/로그인은 발표 후 v2 예정.

import { User, Sprout, Recycle, Trees, Package, Heart, Award, ChevronRight } from "lucide-react";
import "./My.css";

const STATS = [
  { ic: <Sprout size={14} />,  num: "12",            label: "응원 농가",  color: "g" },
  { ic: <Recycle size={14} />, num: "9.3",  unit: "kg", label: "CO₂ 절감",  color: "r" },
  { ic: <Trees size={14} />,   num: "14",            label: "나무 환산",  color: "a" },
];

const MONTHLY = [
  { m: "1월", v: 0.8, pct: 23 },
  { m: "2월", v: 1.2, pct: 35 },
  { m: "3월", v: 2.1, pct: 62 },
  { m: "4월", v: 1.7, pct: 50 },
  { m: "5월", v: 3.4, pct: 100 },
];

const CONTRIBS = [
  { num: "7",       label: "건 직거래로\n탄소 절감" },
  { num: "23",      label: "kg 못난이\n폐기 막음" },
  { num: "₩3,200",  label: "환경 단체\n누적 기부" },
];

const BADGES = [
  { em: "🌱", nm: "첫 직거래",      locked: false },
  { em: "🌿", nm: "못난이 구원자",  locked: false },
  { em: "🌳", nm: "탄소 절감 10kg", locked: false },
  { em: "🏆", nm: "농가 응원 10곳", locked: true },
  { em: "🦋", nm: "기후 챔피언",    locked: true },
  { em: "⭐", nm: "리뷰 마스터",     locked: true },
];

const MENU = [
  { ic: <Package size={12} />, lbl: "주문 내역", sub: "총 7건" },
  { ic: <Heart size={12} />,   lbl: "찜 목록",   sub: "3개" },
  { ic: <Award size={12} />,   lbl: "나의 뱃지", sub: "3/6 획득" },
];

function My() {
  return (
    <div className="my-screen">
      <div className="my-profile">
        <div className="my-avatar">
          <User size={22} color="#fff" />
        </div>
        <div>
          <div className="my-name">그린님</div>
          <div className="my-email">green@lasttable.com</div>
          <div className="my-joined">2025년 3월부터 함께해요</div>
        </div>
        <div className="my-edit">편집</div>
      </div>

      <div className="my-stats">
        {STATS.map(function (s, i) {
          return (
            <div className="my-stat" key={i}>
              <div className={"my-stat-ic " + s.color}>{s.ic}</div>
              <div className="my-stat-num">
                {s.num}
                {s.unit && <small>{s.unit}</small>}
              </div>
              <div className="my-stat-lbl">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="my-chart-card">
        <div className="my-chart-title">월별 탄소 절감</div>
        <div className="my-chart">
          {MONTHLY.map(function (m) {
            return (
              <div className="my-bar-wrap" key={m.m}>
                <div className="my-bar-val">{m.v}</div>
                <div className="my-bar-bg" style={{ height: 64 }}>
                  <div className="my-bar-fill" style={{ height: m.pct + "%" }} />
                </div>
                <div className="my-bar-lbl">{m.m}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 9.5, color: "var(--ink-3)", textAlign: "right" }}>
          단위: kg CO₂
        </div>
      </div>

      <div className="my-contrib">
        <div className="my-contrib-hdr">🌿 나의 환경 기여</div>
        <div className="my-contrib-items">
          {CONTRIBS.map(function (c, i) {
            return (
              <div className="my-contrib-row" key={i}>
                {i > 0 && <div className="my-contrib-div" />}
                <div className="my-contrib-item">
                  <span className="my-contrib-num">{c.num}</span>
                  <span className="my-contrib-lbl" style={{ whiteSpace: "pre-line" }}>{c.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>나의 뱃지</div>
      <div className="my-badges">
        {BADGES.map(function (b, i) {
          return (
            <div key={i} className={"my-badge" + (b.locked ? " locked" : "")}>
              <div className="my-badge-em">{b.em}</div>
              <div className="my-badge-nm">{b.nm}</div>
            </div>
          );
        })}
      </div>

      <div className="my-menu">
        {MENU.map(function (m, i) {
          return (
            <div className="my-menu-item" key={i}>
              <div className="my-menu-ic">{m.ic}</div>
              <div className="my-menu-lbl">{m.lbl}</div>
              <div className="my-menu-sub">{m.sub}</div>
              <ChevronRight size={13} color="var(--ink-3)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default My;
