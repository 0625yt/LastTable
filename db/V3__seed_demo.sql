-- ============================================================
-- V3 — 데모 카탈로그 시드 (못난이 마켓 · 환경 기부 · 시연 농가)
-- ============================================================
-- HTML 데모(lasttable-preview.html)·React 마켓·찜 탭에 그대로
-- 박혀있던 하드코딩들을 한 곳에 모았다. payload(JSONB)는 화면이 자유롭게 해석.

-- ── 못난이 마켓 (mini market) ────────────────────────────────
INSERT INTO demo_catalog (kind, slug, title, subtitle, payload, sort_order) VALUES
('market', 'apple-uiseong',
    '못난이 사과 (경북 의성)',
    '✓ 의성 사과 농장 · 📍 경상북도 의성군',
    jsonb_build_object(
        'emoji',      '🍎',
        'farm',       '의성 사과 농장',
        'farmer',     '김철수',
        'region',     '경상북도 의성군',
        'origPrice',  28000,
        'discountPct', 40,
        'price',      16800,
        'unit',       '5kg',
        'rating',     4.8,
        'reviews',    128,
        'tags',       ARRAY['못난이','직거래'],
        'kosisTag',   'KOSIS −8.4% 감소 품목',
        'urgent',     TRUE
    ),
    1),

('market', 'grape-sangju',
    '샤인머스캣 (경북 상주)',
    '✓ 상주 포도 농원 · 📍 경상북도 상주시',
    jsonb_build_object(
        'emoji',      '🍇',
        'farm',       '상주 포도 농원',
        'region',     '경상북도 상주시',
        'origPrice',  42000,
        'discountPct', 24,
        'price',      32000,
        'unit',       '2kg',
        'rating',     4.9,
        'reviews',    214,
        'tags',       ARRAY['당일수확','GAP인증'],
        'urgent',     FALSE
    ),
    2),

('market', 'pear-naju',
    '못난이 배 (전남 나주)',
    '✓ 나주 배 농원 · 📍 전라남도 나주시',
    jsonb_build_object(
        'emoji',      '🍐',
        'farm',       '나주 배 농원',
        'farmer',     '박영희',
        'region',     '전라남도 나주시',
        'origPrice',  35000,
        'discountPct', 44,
        'price',      19600,
        'unit',       '7.5kg',
        'rating',     4.7,
        'reviews',    89,
        'tags',       ARRAY['못난이','직거래'],
        'kosisTag',   'KOSIS −5.3% 감소 품목',
        'urgent',     TRUE
    ),
    3)
ON CONFLICT (kind, slug) DO UPDATE
SET title    = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    payload  = EXCLUDED.payload;

-- ── 환경 기부 단체 (donation) ────────────────────────────────
INSERT INTO demo_catalog (kind, slug, title, subtitle, payload, sort_order) VALUES
('donation', 'green-korea',
    '녹색연합',
    '국내 등록 환경운동 단체',
    jsonb_build_object('amount', 3000, 'icon', '🌳'),
    1),
('donation', 'wwf-korea',
    '세계자연기금 한국지부',
    '멸종위기 종 보호',
    jsonb_build_object('amount', 5000, 'icon', '🐼'),
    2),
('donation', 'forest-for-future',
    '미래를 위한 숲',
    '국내 나무 심기 캠페인',
    jsonb_build_object('amount', 10000, 'icon', '🌲'),
    3)
ON CONFLICT (kind, slug) DO UPDATE
SET title    = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    payload  = EXCLUDED.payload;

-- ── 시연용 농가 (farmer) ─────────────────────────────────────
-- 챗봇 응답에서 인용하거나 찜 탭에 표시.
INSERT INTO demo_catalog (kind, slug, title, subtitle, body, payload, sort_order) VALUES
('farmer', 'uiseong-apple',
    '김철수 농부 · 40년 경력',
    '의성 사과 농장',
    '"올해는 폭염 때문에 외관이 못나도, 당도는 더 올라갔어요."',
    jsonb_build_object('emoji', '👨‍🌾', 'region', '경상북도 의성군', 'cheers', 312, 'fruitSlug', 'apple'),
    1),
('farmer', 'naju-pear',
    '박영희 농부 · 3대 가업',
    '나주 배 농원',
    '"못난이도 맛은 최고예요."',
    jsonb_build_object('emoji', '👩‍🌾', 'region', '전라남도 나주시', 'cheers', 214, 'fruitSlug', 'pear'),
    2),
('farmer', 'yeongcheon-grape',
    '이순희 농부 · 30년 경력',
    '영천 포도 농원',
    '"기후가 바뀌어도 이 자리를 지키려 합니다."',
    jsonb_build_object('emoji', '👩‍🌾', 'region', '경상북도 영천시', 'cheers', 187, 'fruitSlug', 'grape'),
    3)
ON CONFLICT (kind, slug) DO UPDATE
SET title    = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    body     = EXCLUDED.body,
    payload  = EXCLUDED.payload;
