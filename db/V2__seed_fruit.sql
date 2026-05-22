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
