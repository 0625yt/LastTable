// Donation.jsx — 환경 기부 데모 화면
//
// 데이터: GET /api/demo/donation (Supabase demo_catalog kind=donation)
// 응답 예: { title, subtitle, body, payload: { focus, donors, ... } }
//
// 버튼은 데모용 — alert 만 띄움.

import { useEffect, useState } from "react";
import { ChevronLeft, Heart, Trees, Info } from "lucide-react";
import "./Donation.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const FALLBACK = [
  { slug: "green-korea", title: "녹색연합", subtitle: "산림 보전 · 멸종위기종",
    body: "한국 산림과 생태계 보전을 위해 활동합니다.",
    payload: { focus: "산림 · 생태", donors: 12830 } },
  { slug: "wwf-kr", title: "세계자연기금 한국지부", subtitle: "기후 위기 대응",
    body: "전 세계 100여개국에서 기후 캠페인을 이끕니다.",
    payload: { focus: "기후 · 해양", donors: 28140 } },
  { slug: "future-forest", title: "미래를 위한 숲", subtitle: "도시 숲 조성",
    body: "도시 가로수와 학교 숲을 조성합니다.",
    payload: { focus: "도시 숲", donors: 7290 } },
];

function Donation({ onBack }) {
  const [state, setState] = useState({ loading: true, items: [] });

  useEffect(function () {
    fetch(API_BASE + "/api/demo/donation")
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        const items = Array.isArray(rows) && rows.length > 0 ? rows : FALLBACK;
        setState({ loading: false, items: items });
      })
      .catch(function () {
        setState({ loading: false, items: FALLBACK });
      });
  }, []);

  function donate(name) {
    alert(name + " 에 후원이 전달되었습니다.\n\n데모용 화면 — 실제 결제는 진행되지 않습니다.");
  }

  return (
    <div className="dn">
      <div className="dn-hdr">
        <button className="dn-back" onClick={onBack} aria-label="뒤로">
          <ChevronLeft size={20} />
        </button>
        <div className="dn-title-wrap">
          <h1>환경 기부</h1>
          <p>구매와 별개로 직접 후원할 수 있어요</p>
        </div>
      </div>

      {/* 상단 약속 카드 */}
      <div className="dn-pledge">
        <div className="dn-pledge-ic"><Trees size={18} /></div>
        <div>
          <div className="dn-pledge-h">한 끼 후원 = 나무 1그루</div>
          <p>모인 후원금은 단체 검증 후 숲 조성·기후 캠페인에 전액 전달됩니다.</p>
        </div>
      </div>

      {/* 단체 목록 */}
      {state.loading && <div className="dn-empty">불러오는 중…</div>}

      {!state.loading && state.items.map(function (it) {
        const p = it.payload || {};
        return (
          <div key={it.slug} className="dn-card">
            <div className="dn-card-head">
              <div>
                <div className="dn-card-name">{it.title}</div>
                {it.subtitle && <div className="dn-card-sub">{it.subtitle}</div>}
              </div>
              {p.focus && <span className="dn-tag">{p.focus}</span>}
            </div>
            {it.body && <p className="dn-card-body">{it.body}</p>}
            {p.donors && (
              <div className="dn-card-meta">
                <Heart size={11} color="var(--red)" />
                누적 후원자 {p.donors.toLocaleString()}명
              </div>
            )}
            <button
              className="dn-btn"
              onClick={function () { donate(it.title); }}
            >
              한 끼 후원하기 · 3,000원
            </button>
          </div>
        );
      })}

      <div className="dn-foot">
        <Info size={11} />
        Green Table 의 환경보호 기금은 단체별로 분기마다 정산됩니다.
      </div>
    </div>
  );
}

export default Donation;
