-- ============================================================
-- V4 — RLS (Row Level Security) 정책
-- ============================================================
-- Supabase 는 신규 테이블에 RLS 가 꺼져있어도 PostgREST 가 anon 요청을
-- 거부한다. 명시적으로 "공개 읽기" 정책을 만들어야 anon key 로 SELECT 가능.
--
-- ⚠️ 데모 범위에서만 anon 읽기 허용.
--    쓰기(INSERT/UPDATE/DELETE) 는 service_role 키만 가능.

-- ── demo_catalog (마켓·기부·농가 데이터) ─────────────────────
ALTER TABLE public.demo_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "demo_catalog public read" ON public.demo_catalog;
CREATE POLICY "demo_catalog public read"
    ON public.demo_catalog
    FOR SELECT
    TO anon
    USING (true);

-- ── fruit (과실 마스터) ──────────────────────────────────────
ALTER TABLE public.fruit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fruit public read" ON public.fruit;
CREATE POLICY "fruit public read"
    ON public.fruit
    FOR SELECT
    TO anon
    USING (true);

-- ── production_actual / production_forecast 는 아직 비어있고 향후
--    화면이 안 쓰므로 정책 생성 보류. 필요해지면 같은 패턴으로 추가.
