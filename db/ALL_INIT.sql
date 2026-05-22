-- ============================================================
-- LastTable — V1 초기 스키마
-- ============================================================
-- 데모 + KOSIS/예측 데이터를 모두 담을 수 있는 최소 테이블 4개.
-- PostgreSQL 기준 (Supabase, Neon, RDS 모두 동일).
--
-- 적용 방법
--   psql -h <host> -U <user> -d <db> -f V1__init.sql
--
-- 또는 Flyway/Liquibase 마이그레이션으로 자동 적용.

-- ── 1. 과실 마스터 ───────────────────────────────────────────
-- FruitItem.java 의 enum 을 그대로 옮긴 마스터 테이블.
-- 다른 테이블이 fruit_slug 를 FK 로 참조한다.
CREATE TABLE IF NOT EXISTS fruit (
    slug         VARCHAR(40)  PRIMARY KEY,         -- 예: 'apple', 'mandarin'
    korean_name  VARCHAR(40)  NOT NULL,            -- 예: '사과'
    kosis_item   VARCHAR(20),                      -- 예: 'T10' (KOSIS itmId)
    emoji        VARCHAR(8),                       -- 화면 표시용
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 2. KOSIS 실측 생산량 (캐시) ──────────────────────────────
-- KOSIS API 응답을 그대로 적재. (year, region, fruit_slug) 유일.
-- 화면이 매번 KOSIS 를 때리지 않고 이 테이블만 읽는다.
CREATE TABLE IF NOT EXISTS production_actual (
    id           BIGSERIAL    PRIMARY KEY,
    year         INTEGER      NOT NULL,
    region       VARCHAR(60)  NOT NULL,            -- 시도명 또는 '계' (전국)
    fruit_slug   VARCHAR(40)  NOT NULL REFERENCES fruit(slug),
    value_ton    NUMERIC(14,3) NOT NULL,
    fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (year, region, fruit_slug)
);
CREATE INDEX IF NOT EXISTS idx_actual_fruit_year ON production_actual (fruit_slug, year DESC);

-- ── 3. ML 미래 예측 ──────────────────────────────────────────
-- model/output/future_fruit_production_predictions_v3.csv 를 그대로 적재.
-- (year, region, fruit_slug) 유일.
CREATE TABLE IF NOT EXISTS production_forecast (
    id                       BIGSERIAL    PRIMARY KEY,
    year                     INTEGER      NOT NULL,
    region                   VARCHAR(60)  NOT NULL,
    fruit_slug               VARCHAR(40)  NOT NULL REFERENCES fruit(slug),
    predicted_production_ton NUMERIC(14,3) NOT NULL,
    avg_temp                 NUMERIC(7,3),
    precipitation            NUMERIC(8,3),
    humidity                 NUMERIC(7,5),
    solar_radiation          NUMERIC(7,3),
    wind_speed               NUMERIC(6,3),
    model_version            VARCHAR(20)  NOT NULL DEFAULT 'v3',
    loaded_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (year, region, fruit_slug, model_version)
);
CREATE INDEX IF NOT EXISTS idx_forecast_fruit_year ON production_forecast (fruit_slug, year);
CREATE INDEX IF NOT EXISTS idx_forecast_year       ON production_forecast (year);

-- ── 4. 데모 카탈로그 (못난이 마켓·환경 기부 등 화면용 데이터) ──
-- "데모용 하드코딩" 들을 한 테이블에 모아 넣는다.
-- 종류는 kind 로 구분 (market | donation | farmer | challenge ...).
CREATE TABLE IF NOT EXISTS demo_catalog (
    id           BIGSERIAL    PRIMARY KEY,
    kind         VARCHAR(20)  NOT NULL,            -- 'market' | 'donation' | 'farmer' ...
    slug         VARCHAR(60)  NOT NULL,            -- 안에서 고유한 키
    title        VARCHAR(200) NOT NULL,
    subtitle     VARCHAR(300),
    body         TEXT,                              -- 길거나 자유 포맷이면 여기에
    payload      JSONB,                             -- 가격/이미지/태그 등 자유 구조
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    visible      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (kind, slug)
);
CREATE INDEX IF NOT EXISTS idx_demo_kind ON demo_catalog (kind, sort_order);
-- ============================================================
-- V2 — 과실 마스터 시드
-- ============================================================
-- FruitItem.java 의 enum 과 1:1 매칭. enum 이 바뀌면 같이 바꿔야 함.

INSERT INTO fruit (slug, korean_name, kosis_item, emoji) VALUES
    ('apple',                '사과',     'T10', '🍎'),
    ('pear',                 '배',       'T16', '🍐'),
    ('peach',                '복숭아',   'T22', '🍑'),
    ('grape',                '포도',     'T28', '🍇'),
    ('mandarin',             '감귤',     'T34', '🍊'),
    ('persimmon',            '감',       'T40', '🟧'),
    ('sweet-persimmon',      '단감',     'T46', '🟧'),
    ('astringent-persimmon', '떫은감',   'T52', '🟧'),
    ('plum',                 '자두',     'T58', '🟪'),
    ('japanese-apricot',     '매실',     'T70', '🟢')
ON CONFLICT (slug) DO UPDATE
SET korean_name = EXCLUDED.korean_name,
    kosis_item  = EXCLUDED.kosis_item,
    emoji       = EXCLUDED.emoji;
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
