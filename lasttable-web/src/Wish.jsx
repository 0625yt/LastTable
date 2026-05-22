// Wish.jsx — 찜 (응원 농가 / 찜한 상품)
//
// 데이터는 일단 컴포넌트 상수. 다음 단계에서 GET /api/wish/farmers 로 교체.

import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import "./Wish.css";

const FARMERS = [
  {
    slug: "uiseong-apple",
    emoji: "🍎",
    name: "의성 사과 농장",
    farmer: "김철수 농부",
    region: "📍 경상북도 의성군",
    badge: "🌿 KOSIS 감소 작물 농가",
    intro: "40년 경력의 사과 명인. 기후변화에도 전통 방식을 고집합니다.",
    rating: 4.8,
    cheers: 312,
    wishedAt: "2025.05.01 찜",
  },
  {
    slug: "naju-pear",
    emoji: "🍐",
    name: "나주 배 농원",
    farmer: "박영희 농부",
    region: "📍 전라남도 나주시",
    badge: "🌿 KOSIS 감소 작물 농가",
    intro: "3대째 이어온 나주 배 농원. 못난이도 맛은 최고예요.",
    rating: 4.7,
    cheers: 214,
    wishedAt: "2025.04.18 찜",
  },
];

function Wish() {
  const [tab, setTab] = useState("farmers");

  return (
    <div className="wish-screen">
      <div className="w-hdr">
        <h1>찜</h1>
        <span>3개</span>
      </div>

      <div className="w-tabs">
        <button
          className={"w-tab" + (tab === "farmers" ? " active" : "")}
          onClick={function () { setTab("farmers"); }}
        >
          🌱 응원 농가 3
        </button>
        <button
          className={"w-tab" + (tab === "products" ? " active" : "")}
          onClick={function () { setTab("products"); }}
        >
          🛍 찜한 상품 3
        </button>
      </div>

      {tab === "farmers" && FARMERS.map(function (f) {
        return (
          <div key={f.slug} className="w-farm-card">
            <div className="w-farm-top">
              <div className="w-farm-emoji">{f.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="w-farm-name">{f.name} ✓</div>
                <div className="w-farm-owner">{f.farmer}</div>
                <div className="w-farm-region">{f.region}</div>
                <div className="w-farm-badge">{f.badge}</div>
              </div>
              <Heart size={17} fill="var(--red)" color="var(--red)" />
            </div>

            <div className="w-farm-intro">{f.intro}</div>

            <div className="w-farm-stats">
              <span>
                <Star size={11} fill="var(--yellow)" color="var(--yellow)" /> {f.rating}
              </span>
              <span>❤ 응원 {f.cheers}명</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-3)" }}>
                {f.wishedAt}
              </span>
            </div>

            <div className="w-farm-acts">
              <button className="w-act-btn">
                <ShoppingBag size={11} /> 직거래 보기
              </button>
              <button className="w-act-btn primary">응원하기 ›</button>
            </div>
          </div>
        );
      })}

      {tab === "products" && (
        <div className="w-empty">
          찜한 상품은 마켓 화면에서 ♡ 를 눌러 추가할 수 있어요.
        </div>
      )}
    </div>
  );
}

export default Wish;
