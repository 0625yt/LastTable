// Wish.jsx — 찜 (응원 농가 / 찜한 상품)
//
// 데이터: GET /api/demo/farmer (Supabase demo_catalog kind=farmer)
// 응답 예:
//   {
//     title: "김철수 농부 · 40년 경력",
//     subtitle: "의성 사과 농장",
//     body: "'올해는 폭염 때문에...'",
//     payload: { region, cheers, fruitSlug, ... }
//   }

import { useEffect, useState } from "react";
import { Heart, MapPin, ShoppingBag, Sprout, ChevronRight } from "lucide-react";
import "./Wish.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const FALLBACK = [
  { slug: "uiseong-apple",     title: "김철수 농부 · 40년 경력",  subtitle: "의성 사과 농장",
    body: "올해는 폭염 때문에 외관이 못나도, 당도는 더 올라갔어요.",
    payload: { region: "경상북도 의성군", cheers: 312, fruitSlug: "apple" } },
  { slug: "naju-pear",         title: "박영희 농부 · 3대 가업",  subtitle: "나주 배 농원",
    body: "못난이도 맛은 최고예요.",
    payload: { region: "전라남도 나주시", cheers: 214, fruitSlug: "pear" } },
  { slug: "yeongcheon-grape",  title: "이순희 농부 · 30년 경력",  subtitle: "영천 포도 농원",
    body: "기후가 바뀌어도 이 자리를 지키려 합니다.",
    payload: { region: "경상북도 영천시", cheers: 187, fruitSlug: "grape" } },
];

function Wish({ onNavigate }) {
  const [tab, setTab] = useState("farmers");
  const [state, setState] = useState({ loading: true, items: [] });

  useEffect(function () {
    fetch(API_BASE + "/api/demo/farmer")
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        const items = Array.isArray(rows) && rows.length > 0 ? rows : FALLBACK;
        setState({ loading: false, items: items });
      })
      .catch(function () {
        setState({ loading: false, items: FALLBACK });
      });
  }, []);

  return (
    <div className="ws">
      <div className="ws-hdr">
        <h1>찜</h1>
        <span className="ws-count">{state.items.length}곳</span>
      </div>

      <div className="ws-tabs">
        <button
          className={"ws-tab" + (tab === "farmers" ? " active" : "")}
          onClick={function () { setTab("farmers"); }}
        >
          응원 농가 {state.items.length}
        </button>
        <button
          className={"ws-tab" + (tab === "products" ? " active" : "")}
          onClick={function () { setTab("products"); }}
        >
          찜한 상품 0
        </button>
      </div>

      {tab === "farmers" && state.loading && (
        <div className="ws-empty">불러오는 중…</div>
      )}

      {tab === "farmers" && !state.loading && state.items.map(function (f) {
        const p = f.payload || {};
        return (
          <div key={f.slug} className="ws-card">
            <div className="ws-card-row">
              <div className="ws-card-left">
                <div className="ws-card-name">
                  {f.subtitle || f.title}
                  <span className="ws-verified" aria-label="인증">✓</span>
                </div>
                <div className="ws-card-owner">{f.title}</div>
                {p.region && (
                  <div className="ws-card-region">
                    <MapPin size={10} /> {p.region}
                  </div>
                )}
              </div>
              <button className="ws-heart" aria-label="찜 해제">
                <Heart size={16} fill="var(--red)" color="var(--red)" />
              </button>
            </div>

            {f.body && <p className="ws-quote">"{f.body.replace(/^"|"$/g, "")}"</p>}

            <div className="ws-stats">
              <span className="ws-stat">
                <Sprout size={11} color="var(--green)" />
                KOSIS 감소 작물 농가
              </span>
              {p.cheers != null && (
                <span className="ws-stat">
                  <Heart size={11} color="var(--red)" />
                  응원 {p.cheers}
                </span>
              )}
            </div>

            <div className="ws-acts">
              <button
                className="ws-btn"
                onClick={function () { onNavigate && onNavigate("market"); }}
              >
                <ShoppingBag size={12} /> 직거래 보기
              </button>
              <button className="ws-btn primary">
                응원하기 <ChevronRight size={12} />
              </button>
            </div>
          </div>
        );
      })}

      {tab === "products" && (
        <div className="ws-empty">
          찜한 상품은 <strong>마켓</strong> 화면에서 추가할 수 있어요
        </div>
      )}
    </div>
  );
}

export default Wish;
