// ProductDetail.jsx — 상품 상세 모달
//
// Market 카드 / AiMatch 추천 카드 둘 다에서 같은 모양으로 띄운다.
// 데모용: "구매" 버튼은 alert 한 번 띄우고 닫힘 (결제/장바구니 X).

import { useEffect } from "react";
import {
  X,
  MapPin,
  Star,
  ShoppingBag,
  Sprout,
  Truck,
  Award,
} from "lucide-react";
import "./ProductDetail.css";

function ProductDetail({ item, onClose }) {
  // ESC 키로 닫기
  useEffect(function () {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  if (!item) return null;
  const p = item.payload || {};
  const isClimateRisk = Boolean(p.kosisTag);

  function handleBuy() {
    alert(
      "데모용 화면입니다.\n\n실서비스에서는 결제 → 농가에 즉시 주문이 전달되고,\n탄소 절감량과 농가 응원 누적이 자동 집계됩니다."
    );
    onClose();
  }

  return (
    <div className="pd-backdrop" onClick={onClose}>
      <div className="pd-sheet" onClick={function (e) { e.stopPropagation(); }}>
        <button className="pd-close" onClick={onClose} aria-label="닫기">
          <X size={18} />
        </button>

        {/* 상품 헤더 */}
        <div className="pd-head">
          {isClimateRisk && <div className="pd-risk-tag">{p.kosisTag}</div>}
          <h2 className="pd-title">{item.title}</h2>
          {p.farm && <div className="pd-farm">{p.farm}</div>}
          {p.region && (
            <div className="pd-region">
              <MapPin size={11} /> {p.region}
            </div>
          )}
        </div>

        {/* 가격 박스 */}
        <div className="pd-price-box">
          <div className="pd-price-row">
            {p.discountPct && (
              <span className="pd-disc">{p.discountPct}%</span>
            )}
            <span className="pd-price">
              {(p.price || 0).toLocaleString()}
            </span>
            <span className="pd-price-won">원</span>
            {p.unit && <span className="pd-unit"> / {p.unit}</span>}
          </div>
          {p.origPrice && (
            <div className="pd-orig">
              정가 {p.origPrice.toLocaleString()}원
            </div>
          )}
        </div>

        {/* 평점·후기 */}
        {p.rating && (
          <div className="pd-rating-row">
            <Star size={13} color="#f5a623" fill="#f5a623" />
            <strong>{p.rating}</strong>
            {p.reviews && <span className="pd-reviews">({p.reviews}개 후기)</span>}
            {p.urgent && <span className="pd-urgent">긴급 매물</span>}
          </div>
        )}

        {/* 농가 강점 */}
        <div className="pd-info-grid">
          <div className="pd-info">
            <div className="pd-info-ic"><Sprout size={14} /></div>
            <div className="pd-info-body">
              <div className="pd-info-h">산지 직거래</div>
              <div className="pd-info-p">중간유통 0단계 · 농가 수익 80%</div>
            </div>
          </div>
          <div className="pd-info">
            <div className="pd-info-ic"><Truck size={14} /></div>
            <div className="pd-info-body">
              <div className="pd-info-h">산지 직배송</div>
              <div className="pd-info-p">수확 다음날 출고</div>
            </div>
          </div>
          {isClimateRisk && (
            <div className="pd-info">
              <div className="pd-info-ic"><Award size={14} /></div>
              <div className="pd-info-body">
                <div className="pd-info-h">기후 위험 작물 응원</div>
                <div className="pd-info-p">KOSIS 감소 품목 · 농가 직접 지원</div>
              </div>
            </div>
          )}
        </div>

        {/* 태그 */}
        {Array.isArray(p.tags) && p.tags.length > 0 && (
          <div className="pd-tags">
            {p.tags.map(function (t) {
              return <span key={t} className="pd-tag">{t}</span>;
            })}
          </div>
        )}

        {/* CTA */}
        <button className="pd-buy" onClick={handleBuy}>
          <ShoppingBag size={15} />
          {(p.price || 0).toLocaleString()}원 구매하기
        </button>
        <div className="pd-demo-note">데모용 화면입니다 — 실제 결제는 진행되지 않습니다</div>
      </div>
    </div>
  );
}

export default ProductDetail;
