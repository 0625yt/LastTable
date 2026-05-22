// Market.jsx — 못난이 마켓
//
// 홈 화면 톤에 맞춰 정돈한 버전:
//  - 이모지 제거, lucide 라인 아이콘만
//  - 카드 헤더에 컬러 좌측 막대(기후 위험 작물 표시)
//  - 큰 가격 + 작은 원가, 정보 위계 명확
//
// 데이터: GET /api/demo/market (Supabase demo_catalog)

import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Star,
  MapPin,
  Leaf,
} from "lucide-react";
import "./Market.css";
import ProductDetail from "./ProductDetail";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const CATEGORIES = ["전체", "과일", "채소", "수산"];

// DB 가 비어있거나 백엔드가 응답 못 줄 때의 안전 데이터.
// V3 시드(db/V3__seed_demo.sql)와 동일한 3종.
const FALLBACK_ITEMS = [
  {
    slug: "apple-uiseong",
    title: "못난이 사과 (경북 의성)",
    payload: {
      farm: "의성 사과 농장", region: "경상북도 의성군",
      origPrice: 28000, discountPct: 40, price: 16800, unit: "5kg",
      rating: 4.8, reviews: 128, kosisTag: "KOSIS −8.4% 감소 품목",
    },
  },
  {
    slug: "grape-sangju",
    title: "샤인머스캣 (경북 상주)",
    payload: {
      farm: "상주 포도 농원", region: "경상북도 상주시",
      origPrice: 42000, discountPct: 24, price: 32000, unit: "2kg",
      rating: 4.9, reviews: 214,
    },
  },
  {
    slug: "pear-naju",
    title: "못난이 배 (전남 나주)",
    payload: {
      farm: "나주 배 농원", region: "전라남도 나주시",
      origPrice: 35000, discountPct: 44, price: 19600, unit: "7.5kg",
      rating: 4.7, reviews: 89, kosisTag: "KOSIS −5.3% 감소 품목",
    },
  },
];

function Market({ onNavigate }) {
  const [activeCat, setActiveCat] = useState("전체");
  const [state, setState] = useState({ loading: true, items: [], error: null });
  const [selected, setSelected] = useState(null);

  useEffect(function () {
    fetch(API_BASE + "/api/demo/market")
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length > 0) {
          setState({ loading: false, items: rows, error: null });
        } else {
          // 백엔드 정상이지만 비어 있음 — 데모 안전을 위해 fallback 표시
          console.warn("[market] /api/demo/market returned empty — falling back");
          setState({ loading: false, items: FALLBACK_ITEMS, error: null });
        }
      })
      .catch(function (err) {
        // 백엔드 자체가 안 닿을 때 fallback
        console.warn("[market] backend unreachable — fallback:", err.message);
        setState({ loading: false, items: FALLBACK_ITEMS, error: null });
      });
  }, []);

  return (
    <div className="mk">
      {/* 헤더 — 홈과 동일 패턴 */}
      <div className="mk-hdr">
        <h1>마켓</h1>
        <button className="mk-bell" aria-label="알림">
          <Bell size={18} />
        </button>
      </div>

      {/* 검색 */}
      <div className="mk-search">
        <Search size={14} color="var(--ink-3)" />
        <span>농가, 품목, 지역 검색</span>
      </div>

      {/* 약속 띠 — 모든 구매에 적용되는 환경 기여 */}
      <div className="mk-pledge">
        <Leaf size={11} strokeWidth={2.5} />
        모든 구매의 <strong>5%</strong>가 환경보호 활동에 사용됩니다
      </div>

      {/* AI 매칭 풀폭 카드 — 클릭 시 AI 탭으로 */}
      <div
        className="mk-ai"
        role="button"
        onClick={function () { onNavigate && onNavigate("ai"); }}
      >
        <div className="mk-ai-row">
          <span className="mk-ai-tag">
            <Sparkles size={11} strokeWidth={2.5} />
            AI 매칭
          </span>
          <ChevronRight size={16} color="var(--green)" />
        </div>
        <h2 className="mk-ai-h">예산·식단 말하면 농가까지 연결</h2>
        <p className="mk-ai-p">기후 위험 작물 우선, 자연어로 한 줄</p>
      </div>

      {/* 카테고리 */}
      <div className="mk-cats">
        {CATEGORIES.map(function (cat) {
          return (
            <button
              key={cat}
              className={"mk-cat" + (activeCat === cat ? " active" : "")}
              onClick={function () { setActiveCat(cat); }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 상품 리스트 */}
      {state.loading && <div className="mk-empty">상품을 불러오는 중…</div>}

      {!state.loading && state.error && (
        <div className="mk-empty error">데이터를 불러오지 못했어요 ({state.error})</div>
      )}

      {!state.loading && !state.error && state.items.length === 0 && (
        <div className="mk-empty">표시할 상품이 없어요</div>
      )}

      {!state.loading && !state.error && state.items.map(function (item) {
        const p = item.payload || {};
        const isClimateRisk = Boolean(p.kosisTag);
        return (
          <div
            key={item.slug}
            className={"mk-card" + (isClimateRisk ? " risk" : "")}
            onClick={function () { setSelected(item); }}
            role="button"
            style={{ cursor: "pointer" }}
          >
            <div className="mk-card-body">
              <div className="mk-card-head">
                <div className="mk-card-name">{item.title}</div>
                {p.farm && <div className="mk-card-farm">{p.farm}</div>}
                {p.region && (
                  <div className="mk-card-region">
                    <MapPin size={10} /> {p.region}
                  </div>
                )}
              </div>

              {isClimateRisk && (
                <div className="mk-risk-caption">{p.kosisTag}</div>
              )}

              <div className="mk-card-foot">
                <div className="mk-price-wrap">
                  {p.origPrice && (
                    <span className="mk-orig">{p.origPrice.toLocaleString()}원</span>
                  )}
                  <div className="mk-price-line">
                    {p.discountPct && (
                      <span className="mk-disc">{p.discountPct}%</span>
                    )}
                    <span className="mk-price">
                      {(p.price || 0).toLocaleString()}
                    </span>
                    <span className="mk-price-won">원</span>
                    {p.unit && <span className="mk-unit"> / {p.unit}</span>}
                  </div>
                  {p.rating && (
                    <div className="mk-rating">
                      <Star size={11} color="#f5a623" fill="#f5a623" />
                      {p.rating}
                      {p.reviews && <span className="mk-reviews">({p.reviews})</span>}
                    </div>
                  )}
                </div>
                <button
                  className="mk-btn"
                  aria-label="담기"
                  onClick={function (e) {
                    e.stopPropagation();
                    setSelected(item);
                  }}
                >
                  <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {selected && (
        <ProductDetail item={selected} onClose={function () { setSelected(null); }} />
      )}
    </div>
  );
}

export default Market;
