# Green Table

> **사라지는 식재료를 알리고, AI가 농가와 소비자를 연결하고, 소비가 곧 환경 행동이 되는 서비스.**

기후변화로 점점 줄어드는 국내 작물을 KOSIS 실시간 데이터로 보여주고, ML 회귀모델로 25년 뒤 재배 지형의 변화를 예측하며, Claude AI 챗봇이 사용자의 식탁 고민을 못난이 농가 직거래까지 한 번에 연결합니다.

🌐 **배포 URL**: <https://green-table.vercel.app>
📦 **GitHub**: <https://github.com/0625yt/LastTable>

---

## 🏆 두유톤 2026 해커톤 출품작

| 항목 | 내용 |
|---|---|
| 주제 | AI를 활용한 지속 가능한 환경 및 생활 문제 해결 서비스 |
| 분야 | 환경 · 농업 · 기후데이터 · 커머스 |
| AI 활용 | Anthropic Claude (실시간 자연어 매칭) + ML 회귀 예측 + 가격 탄력성 분석 |
| 차별점 | 기후데이터 + 농가 직거래 + LLM 챗봇을 통합한 시장 최초 조합 |

### 기존 서비스와의 차별점

| 기존 서비스 | Green Table 차별점 |
|---|---|
| 어글리어스 | 못난이만 → Green Table은 **못난이 + 농부 + 기후데이터** 통합 |
| 마켓컬리 | 농산물 커머스만 → **LLM 매칭 챗봇으로 자연어 직거래** 추가 |
| 농촌진흥청 시스템 | 데이터 제공만 → **시각화 + 커머스 + AI** 통합 |

---

## 🌱 사회적 가치

Green Table 은 단순한 농산물 커머스가 아닌, **데이터로 환경 위기를 알리고 행동으로 잇는 플랫폼**을 지향합니다.

| 가치 영역 | 만드는 변화 |
|---|---|
| **농가 경제** | 못난이 농산물의 폐기 대신 직거래 판로 확보 → 농가 수익 평균 80% 회수 (중간유통 0단계) |
| **음식물 폐기 절감** | 규격 외 농산물 1kg 당 약 0.7kg CO₂ 절감 효과 — 구매마다 자동 환산·기록 |
| **환경보호 기금** | 결제 금액의 **5% 가 숲 조성·기후 캠페인에 자동 사용** (검증된 환경 단체 분기 정산) |
| **기후 데이터 대중화** | KOSIS·기상청·IPCC SSP 데이터를 일반 소비자가 한눈에 이해할 수 있는 시각화로 변환 |
| **소비자 인식 전환** | "사라지는 식재료"·"새로 자라는 작물" 콘텐츠로 기후 위기를 식탁 단위로 체감 |

### 측정 가능한 임팩트 지표

- 누적 못난이 거래량 (kg) → CO₂ 절감량 (kg) 환산
- 농가별 직거래 응원 건수 · 후기
- 환경 단체별 분기 후원 정산액
- MAU 중 "사라지는 식재료" 상세 화면 진입율 (인식 변화 KPI)

---

## 🚀 확장 로드맵

| 단계 | 범위 | 주요 항목 |
|---|---|---|
| **1단계 (즉시 ~ 3개월)** | 데이터·콘텐츠 확장 | KOSIS 수산물·축산물 통합 · 시군구 단위 세분화 · 작물별 미래 적지 지도 시각화 |
| **2단계 (3 ~ 6개월)** | 사용자 참여 | 농가 직접 입점·재고 관리 백오피스 · 사용자 리뷰·인증 농부 시스템 · 정기 구독 박스(못난이 정기배송) |
| **3단계 (6개월 ~ 1년)** | B2B / 공공 | 식당·급식·호텔 대량 매칭 · 지자체 농정과 데이터 파트너십 · 학교 환경 교육 콘텐츠 제공 |
| **4단계 (1년 이상)** | 글로벌·AI 고도화 | 동아시아 기후 협력국(일본·대만·베트남) 확장 · Vision 모델 기반 작물 진단 · 농가-소비자 맞춤 RAG 챗봇 |

### 추가 활용 가능한 데이터·기술
- **농진청 SSP 미래 적지 시나리오** — 작물별 2050/2100 재배 가능 지역 지도화
- **농가 운영 데이터** — 출하 일정·재고 잔량 실시간 연동으로 "오늘 사야 사라지지 않을 작물" 알람
- **Claude Vision** — 사용자가 시장에서 본 농산물 사진 인식 → 등급·산지·기후 영향 즉시 안내
- **공공 탄소 크레딧 API** — 누적 CO₂ 절감량을 검증된 크레딧으로 환산해 인증서 발급

---

## 🎯 핵심 기능 (Win-Critical)

### 1. 사라지는 식재료 (KOSIS 실시간)
- 통계청 KOSIS Open API에서 10종 작물의 최근 3년치 생산량을 실시간 수집
- 전년 대비 감소량 TOP 3 자동 산출 → 메인 카드 + 상세 화면
- 회귀 추세선으로 "약 N년 뒤 국내 생산 한계 도달" 자동 계산
- 가격 탄력성 분석으로 "내년 평균 가격 +Y% (XXX원 → YYY원)" 예측

### 2. 새로 자라는 작물 (ML 회귀 예측)
- KOSIS 과실생산량(2011-2024) × 기상청 ASOS(기온·강수·일사) 학습 데이터 7,650행
- SSP5-8.5 시나리오 기반 2025 → 2050 재배량 회귀 예측
- 망고·바나나·올리브 등 아열대 신규 작물 등장 시뮬레이션 (정직성 주석 표기)

### 3. AI 매칭 챗봇 (실제 Claude API)
- Anthropic Claude Sonnet 4.5 실연동 (시나리오 하드코딩 아님)
- 시스템 프롬프트에 마켓 재고 자동 주입 → 응답 마커 파싱 → 상품 카드 자동 첨부
- 자연어 한 줄 → 기후 위험 작물 + 농가 직거래 + 가격대 매칭 한 번에

### 4. 못난이 마켓 + 환경보호 기부
- Supabase 기반 데모 농산물·농가·기부 카탈로그
- 상품 상세 모달: 가격 자동 환산으로 "X kg CO₂ 절감 + Y원 환경보호 기부"
- 결제 금액의 5%가 숲 조성·기후 캠페인에 사용된다는 약속 일관 표시

---

## 🛠 기술 스택

### Frontend (`lasttable-web/`)
| 항목 | 사용 기술 |
|---|---|
| 언어/런타임 | JavaScript (ES2022) · Node 22 |
| 프레임워크 | React 19 + Vite 7 |
| UI 라이브러리 | lucide-react (아이콘) · chart.js + react-chartjs-2 (그래프) |
| 스타일 | Vanilla CSS (390px 모바일 고정폭, 디자인 시스템 변수 기반) |
| 배포 | Vercel (자동 빌드 + Production Promotion) |

### Backend (`lasttable-api/`)
| 항목 | 사용 기술 |
|---|---|
| 언어/런타임 | Java 21 (Temurin) |
| 프레임워크 | Spring Boot 3.5 (WebFlux WebClient · Web MVC) |
| 빌드 | Gradle 8 (wrapper 포함) |
| 외부 연동 | KOSIS Open API · Anthropic Claude API · Supabase REST (PostgREST) |
| 환경변수 | spring-dotenv (.env 자동 주입) |
| 배포 | Render (Docker, 무료 티어) |

### Data & Infra
| 항목 | 사용 기술 |
|---|---|
| 데이터베이스 | Supabase (PostgreSQL 15 + Row Level Security) |
| 외부 데이터 | KOSIS DT_1ET0292 (과실생산량) · DT_1EZ0007 (수산 양식) |
| 미래 예측 | 기상청 ASOS 학습 + SSP5-8.5 시나리오 |
| 자연어 AI | Anthropic Claude Sonnet 4.5 (1024 tokens, 시스템 프롬프트 + 마커 파싱) |
| 버전관리 | Git · GitHub |

### 개발 도구
- VS Code · IntelliJ IDEA · Claude Code (AI pair-programming)
- Playwright MCP (자동 E2E 스모크 테스트)

---

## 📱 화면 및 기능 (상세)

전체 5탭 모바일 SPA (390px 고정폭). 모든 데이터 흐름은 백엔드 → 프론트엔드로 일관.

### 홈 — 기후 위기 한눈에
- **메인 카드**: KOSIS 실시간 TOP3 평균 감소율 (예: −4.0%) → 클릭 시 상세
- **오늘의 인사이트**: 새로 자라는 작물 / AI 매칭 빠른 진입
- **오늘 절약한 탄소**: 누적 환경 기여 요약
- **지속 가능한 행동**: 못난이 마켓 · 환경 기부 카드

### 사라지는 식재료 (상세) — `DetailDisappearing.jsx`
1. **KOSIS 응답 도착 전**: shimmer 스켈레톤 (하드코딩 깜빡임 방지)
2. **TOP3 카드**: 작물명 · 원인 한 줄 · 작년→올해 톤수 · 감소율 막대
3. **생산량 vs 가격 차트**: chart.js로 5년 시계열 이중 축, TOP3 작물 탭으로 동적 전환
4. **차트 요약**: 회귀 + 탄력성 자동 산출
   - "약 N년 뒤 국내 생산 한계 도달"
   - "내년 평균 가격 약 Y% 오른 ZZZ원/kg"
5. **지역별 생산량**: 선택 작물의 시·도별 분포 + ↑ 표시 (북상·신규 산지)
6. **배경**: 연평균기온 변화 · 재배면적 변동 · SSP5-8.5 장기 전망
7. **다음 행동**: 못난이 마켓 / 새로 자라는 작물 / 환경 기여 보기 연결

### 새로 자라는 작물 — `Rising.jsx`
- ML 회귀 모델 (`ForecastService`) 기준 2025 → 2050 재배량 변화 TOP 8
- 망고·바나나·올리브에 **NEW** 뱃지로 신규 작물 강조
- "기상청 ASOS·KOSIS 학습 + SSP5-8.5 시나리오 기반 회귀 예측" 출처 명시
- 정직성 주석: "망고·바나나·올리브 수치는 SSP5-8.5 기온 상승 추정에 따른 시뮬레이션값 (실측치 아님)"

### 마켓 — `Market.jsx`
- Supabase `demo_catalog` (kind=market) 실시간 조회 + 백엔드 다운 시 자동 fallback
- 상단 약속 띠: "모든 구매의 5%가 환경보호 활동에 사용됩니다"
- AI 매칭 풀폭 카드 → AI 챗봇으로 이동
- 상품 카드: 기후 위험 작물(KOSIS 감소 품목)에 빨간 좌측 바 + 태그 표시
- 카드 클릭 → 상품 상세 모달

### 상품 상세 모달 — `ProductDetail.jsx`
- 마켓 / AI 챗봇 추천 양쪽에서 동일 모달 재사용
- 환경 임팩트 박스 (자동 산출):
  - 단위×0.7kg → **N kg CO₂ 절감**
  - 가격×5% → **Y 원 환경보호 기부**
- 산지 직거래 · 산지 직배송 · 기후 위험 작물 응원 강점
- 데모용 구매 CTA (`alert` 안내 + 모달 자동 닫힘)

### AI 매칭 챗봇 — `AiMatch.jsx`
- `POST /api/ai/match` → Anthropic Claude Sonnet 4.5 실시간 호출
- 4개 추천 질문 칩 (사과 사고 싶은데 / 4인 식단 / 주말 2인 / 사라지는 작물)
- 응답 본문 + 추천 상품 카드 자동 첨부 (시스템 프롬프트 마커 파싱)
- 추천 카드 클릭 → 같은 상품 상세 모달
- "마켓에서 더 보기" → 마켓 탭

### 찜 — `Wish.jsx`
- Supabase `demo_catalog` (kind=farmer) 응원 농가 목록
- 농부 인용문 + 인증 마크 + 응원 누적
- 직거래 보기 → 마켓 / 응원하기 (데모)

### MY — `My.jsx`
- 그린 풀폭 프로필 카드
- 통계 3개: 응원 농가 · CO₂ 절감 · 나무 환산
- 월별 탄소 절감 차트 (5개월 막대)
- 환경 기여: 직거래 건수 · 못난이 폐기 절감 · 기부 누적
- 뱃지 6종 (3 획득 · 3 잠금) · 주문 내역 · 찜 목록 · 나의 뱃지 메뉴

### 환경 기부 — `Donation.jsx`
- 홈 "지속 가능한 행동 > 환경 기부" 카드에서 진입
- Supabase `demo_catalog` (kind=donation) 단체 목록
- 그린 풀폭 약속 카드 + 단체별 후원 카드(분야 태그 · 누적 후원자)
- "한 끼 후원 3,000원" 데모 CTA

---

## 🏗 디렉터리 구조

```
green-table/
├─ README.md                     # 이 파일
├─ render.yaml                   # Render Blueprint (백엔드 배포)
├─ db/                           # Supabase 마이그레이션
│  ├─ V1__init.sql               # 테이블: fruit · production_actual · production_forecast · demo_catalog
│  ├─ V2__seed_fruit.sql         # 10종 작물 마스터
│  ├─ V3__seed_demo.sql          # 마켓 3 + 농가 3 + 기부 3 = 9 행
│  ├─ V4__rls_policy.sql         # anon SELECT 정책
│  └─ ALL_INIT.sql               # 한 번에 실행용 합본
│
├─ lasttable-api/                # Spring Boot 백엔드 (Java 21)
│  ├─ Dockerfile                 # Render 컨테이너 빌드
│  ├─ build.gradle.kts
│  └─ src/main/
│     ├─ resources/
│     │  ├─ application.yml      # KOSIS · Anthropic · Supabase 설정
│     │  └─ data/
│     │     └─ future_fruit_production_predictions_v3.csv   # ML 학습 7,650 행
│     └─ java/com/lasttable/api/
│        ├─ LasttableApiApplication.java
│        ├─ config/WebConfig.java                  # CORS
│        ├─ kosis/                                 # KOSIS Open API 클라이언트
│        │  ├─ KosisClient.java
│        │  ├─ KosisProperties.java
│        │  ├─ KosisRawItem.java
│        │  └─ KosisApiException.java
│        ├─ fruit/                                 # 과실 생산량 도메인
│        │  ├─ FruitItem.java                      # 10종 enum + KOSIS 항목코드
│        │  ├─ FruitProduction.java
│        │  ├─ FruitProductionService.java
│        │  └─ FruitProductionController.java      # /api/kosis/fruits
│        ├─ aquaculture/                           # 수산 양식 생산량
│        │  ├─ AquacultureProduction.java
│        │  ├─ AquacultureService.java
│        │  └─ AquacultureController.java          # /api/kosis/aquaculture
│        ├─ forecast/                              # ML 회귀 예측 서비스
│        │  ├─ ForecastService.java                # CSV 로드 + risingCrops()
│        │  ├─ ForecastRow.java
│        │  └─ ForecastController.java             # /api/fruits/rising
│        ├─ supabase/
│        │  └─ SupabaseClient.java                 # PostgREST WebClient 래퍼
│        ├─ demo/
│        │  └─ DemoCatalogController.java          # /api/demo/{kind}
│        └─ ai/                                    # Anthropic Claude 연동
│           ├─ AnthropicClient.java                # 529 재시도 백오프 포함
│           ├─ ChatController.java                 # /api/ai/match (마켓 카탈로그 자동 주입 + 마커 파싱)
│           ├─ ChatRequest.java
│           └─ ChatResponse.java                   # {reply, model, recommendations}
│
└─ lasttable-web/                                  # Vite + React 프론트엔드
   ├─ vercel.json
   ├─ package.json
   └─ src/
      ├─ main.jsx · App.jsx · App.css              # 홈 + 5탭 라우팅
      ├─ DetailDisappearing.jsx / .css             # 사라지는 식재료 상세
      ├─ Rising.jsx / .css                         # 새로 자라는 작물
      ├─ Market.jsx / .css                         # 못난이 마켓
      ├─ AiMatch.jsx / .css                        # AI 매칭 챗봇
      ├─ Wish.jsx / .css                           # 응원 농가
      ├─ My.jsx / .css                             # 프로필·리포트
      ├─ Donation.jsx / .css                       # 환경 기부 데모
      └─ ProductDetail.jsx / .css                  # 공통 상품 상세 모달
```

---

## 🚀 실행 방법

### 사전 요구

| 도구 | 권장 버전 | 설치 |
|---|---|---|
| JDK | 21 이상 | `brew install --cask temurin@21` |
| Node.js | 22 권장 | `brew install node` |
| Git | 최신 | `brew install git` |

### 환경변수 (`.env`)

`lasttable-api/.env` (gitignored)
```env
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=sb_publishable_...
```

`lasttable-web/.env.development`
```env
VITE_API_BASE=http://localhost:8080
```

### 1) Supabase 초기화 (최초 1회)
1. <https://supabase.com> 무료 프로젝트 생성
2. SQL Editor 에서 `db/ALL_INIT.sql` 실행 → 4개 테이블 + 시드 9 행 + RLS 정책

### 2) 백엔드 (Spring Boot, 포트 8080)
```bash
cd lasttable-api
./gradlew bootRun
```
성공 로그
```
KOSIS_API_KEY loaded (prefix: OWUyNDE...)
Anthropic 클라이언트 준비됨 (model=claude-sonnet-4-5, ...)
Supabase 클라이언트 준비됨 (url=https://xxx...)
forecast csv loaded: 7681 rows
Tomcat started on port 8080
```

### 3) 프론트엔드 (Vite + React, 포트 5173)
```bash
cd lasttable-web
npm install
npm run dev
```
접속: <http://localhost:5173>

---

## 🔌 REST API

### KOSIS 실시간
| Method | URL | 설명 |
|---|---|---|
| GET | `/api/kosis/fruits` | 지원 작물 10종 목록 |
| GET | `/api/kosis/fruits/{slug}/production?years=3&region=계` | 작물별 생산량 시계열 |
| GET | `/api/kosis/aquaculture/production?years=5&region=전라남도` | 시도별 양식 총생산량 |

지원 작물: `apple, pear, peach, grape, mandarin, persimmon, sweet-persimmon, astringent-persimmon, plum, japanese-apricot`

### ML 예측
| Method | URL | 설명 |
|---|---|---|
| GET | `/api/fruits/rising?base=2025&target=2050&limit=8` | 미래 재배량 증가 TOP N (망고·바나나·올리브 포함) |

### 데모 카탈로그 (Supabase)
| Method | URL | 설명 |
|---|---|---|
| GET | `/api/demo/market` | 마켓 상품 |
| GET | `/api/demo/farmer` | 응원 농가 |
| GET | `/api/demo/donation` | 환경 기부 단체 |

### AI 챗봇 (Anthropic Claude)
| Method | URL | 설명 |
|---|---|---|
| POST | `/api/ai/match` | `{ "userMessage": "..." }` → `{ "reply", "model", "recommendations" }` |

---

## 📊 데이터 출처

- **과실 생산량**: KOSIS `DT_1ET0292` (과실생산량 성과수+미과수)
- **수산 양식**: KOSIS `DT_1EZ0007` (시도·시군구별 양식현황 총괄)
- **기상 학습 데이터**: 기상청 ASOS 종관기상관측
- **미래 기후 시나리오**: SSP5-8.5 (IPCC AR6, 농촌진흥청 SSP 자료 참고)
- **자연어 AI**: Anthropic Claude Sonnet 4.5

---

## 📝 라이선스 · 크레딧

- **데이터**: 통계청 KOSIS Open API · 기상청 기상자료개방포털 · 농촌진흥청 SSP 자료
- **AI 모델**: Anthropic Claude API
- **아이콘**: lucide-react
- **차트**: chart.js
- **데이터베이스**: Supabase

> 이 프로젝트는 두유톤 2026 해커톤 출품작이며, 시연용 데모 화면을 포함합니다.
> 망고·바나나·올리브 미래 예측값은 SSP5-8.5 시나리오 기반 시뮬레이션 추정치입니다.
