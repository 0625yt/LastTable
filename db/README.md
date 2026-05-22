# LastTable DB

데모용 PostgreSQL 스키마 + 시드 SQL.

## 적용 순서

1. https://supabase.com 로그인 → New Project (Free)
2. 프로젝트 생성 후 **SQL Editor** 메뉴
3. 아래 순서대로 붙여넣고 Run

   ```
   V1__init.sql       → 테이블 4개 생성
   V2__seed_fruit.sql → 과실 마스터 (사과/배/...)
   V3__seed_demo.sql  → 데모 카탈로그 (마켓/기부/농가)
   ```

4. Table Editor 에서 `fruit`, `demo_catalog` 등에 데이터 들어왔는지 확인

## 테이블 구조

| 테이블 | 용도 |
|---|---|
| `fruit` | 과실 마스터. `FruitItem.java` enum 과 1:1 |
| `production_actual` | KOSIS 실측 캐시 (year, region, fruit_slug 유일) |
| `production_forecast` | ML 예측 (v3 회귀모델 결과) |
| `demo_catalog` | 못난이 마켓·환경 기부·시연 농가 등 화면용 |

## 발표용 한 줄

> "사용자·주문·찜 데이터는 PostgreSQL(Supabase) 스키마로 설계되어 있고,
> 데모에는 시드 데이터만 적재해 빠른 시연이 가능하도록 구성했습니다."

## 백엔드 코드는 아직 DB 안 씀

지금은 SQL 만 둬서 **"스키마 설계 완료 + 시드 적재"** 상태. Spring Data JPA 연결은
발표 후 v2 에서 진행 예정. 데모 화면은 기존 KOSIS API + ML CSV 그대로 사용.
