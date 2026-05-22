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
