// Market.jsx — 못난이 마켓 화면
//
// 백엔드 GET /api/demo/market (Supabase demo_catalog 에서 kind=market) 호출.
// 응답 형식 (Supabase row):
//   {
//     kind: "market", slug: "apple-uiseong",
//     title: "못난이 사과 (경북 의성)",
//     subtitle: "✓ 의성 사과 농장 · 📍 경상북도 의성군",
//     payload: { emoji, farm, region, origPrice, discountPct, price, unit, rating, reviews, tags, kosisTag, urgent }
//   }

import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Star,
  AlertTriangle,
} from "lucide-react";
import "./Market.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const CATEGORIES = ["전체", "과일", "채소", "수산", "못난이"];

function Market() {
  const [activeCat, setActiveCat] = useState("전체");
  const [state, setState] = useState({ loading: true, items: [], error: null });

  useEffect(function () {
    fetch(API_BASE + "/api/demo/market")
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        setState({ loading: false, items: rows, error: null });
      })
      .catch(function (err) {
        setState({ loading: false, items: [], error: err.message });
      });
  }, []);

  return (
    <div className="market-screen">
      <div className="m-hdr">
        <h1>마켓</h1>
        <button className="bell-btn" aria-label="메뉴">
          <Menu size={15} />
        </button>
      </div>

      <div className="m-search">
        <Search size={13} color="var(--ink-3)" />
        농가, 품목, 지역 검색
      </div>

      <div className="m-ai">
        <div className="m-ai-left">
          <div className="m-ai-ic">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="m-ai-title">AI 농가 매칭</div>
            <div className="m-ai-sub">원하는 식재료·예산 말하면 바로 연결</div>
          </div>
        </div>
        <ChevronRight size={15} color="var(--green)" />
      </div>

      <div className="m-cats">
        {CATEGORIES.map(function (cat) {
          return (
            <button
              key={cat}
              className={"m-cat" + (activeCat === cat ? " active" : "")}
              onClick={function () { setActiveCat(cat); }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="m-urgent">
        <AlertTriangle size={11} />
        지금 못난이 특가 · 재고 한정 — 빨리 담으세요!
      </div>

      {state.loading && (
        <div className="m-empty">상품을 불러오는 중…</div>
      )}

      {!state.loading && state.error && (
        <div className="m-empty error">데이터를 불러오지 못했어요 ({state.error})</div>
      )}

      {!state.loading && !state.error && state.items.length === 0 && (
        <div className="m-empty">표시할 상품이 없어요. DB 시드(V3) 적용을 확인해주세요.</div>
      )}

      {!state.loading && !state.error && state.items.map(function (item) {
        const p = item.payload || {};
        const tags = Array.isArray(p.tags) ? p.tags : [];
        return (
          <div
            key={item.slug}
            className={"m-card" + (p.urgent ? " urgent" : "")}
          >
            <div className="m-top">
              <div className="m-emoji">{p.emoji || "🍎"}</div>
              <div style={{ flex: 1 }}>
                <div className="m-name">
                  {item.title}
                  {p.urgent && <span className="m-utag">한정</span>}
                </div>
                {p.farm && <div className="m-farm">✓ {p.farm}</div>}
                {p.region && <div className="m-region">📍 {p.region}</div>}
                {p.kosisTag && <div className="m-kosis">🌿 {p.kosisTag}</div>}
              </div>
            </div>

            {tags.length > 0 && (
              <div className="m-tags">
                {tags.map(function (t) {
                  return <span key={t} className="m-tag">{t}</span>;
                })}
              </div>
            )}

            <div className="m-bottom">
              <div>
                {p.origPrice && <div className="m-orig">{p.origPrice.toLocaleString()}원</div>}
                <div className="m-price-row">
                  {p.discountPct && <span className="m-disc">{p.discountPct}%</span>}
                  <span className="m-price">{(p.price || 0).toLocaleString()}원</span>
                  {p.unit && <span className="m-unit2"> / {p.unit}</span>}
                </div>
                {p.rating && (
                  <div className="m-rating">
                    <Star size={11} color="var(--yellow)" fill="var(--yellow)" />
                    <span style={{ color: "var(--ink-2)" }}>{p.rating}</span>
                    {p.reviews && <span style={{ color: "var(--ink-3)" }}>({p.reviews})</span>}
                  </div>
                )}
              </div>
              <button className="m-btn">
                <ShoppingBag size={12} />
                담기
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Market;
