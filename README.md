# Last Table

> 버려지는 못난이 식재료를 구하고,
> 기후로 바뀌는 식탁을 보여주며,
> 농부와 음식점을 AI로 연결하는 서비스.

## 프로젝트 개요

| 탭 | 역할 |
|----|------|
| ① 홈 (시각화) | 한국 지도 위 작물 분포를 2025 → 2090 슬라이더로 시각화 |
| ② 연결 (마켓) | 농부·식재료 카드 + LLM 매칭 챗봇, 못난이 마켓 |
| ③ 촬영 (카메라 AI) | 식재료 촬영 → 작물 인식 + 위험도/대체작물 안내 |
| ④ MY (리포트) | 응원 농가 수, 환경 기부 누계 |

## 현재 저장소 범위

이 저장소에는 두 개의 프로젝트가 들어 있습니다.

| 폴더 | 역할 | 스택 |
|------|------|------|
| `lasttable-api/` | 백엔드 API 서버 + JSON 뷰어 정적 페이지 | Java 21 + Spring Boot 3.5 (Gradle wrapper 포함) |
| `lasttable-web/` | 모바일 홈 화면 (그린테이블) | Node 22 + Vite + React |

KOSIS(통계청) 공공데이터에서 작물·수산 양식 생산량 정보를 가져와
프론트엔드 화면에 제공합니다.

## 디렉터리 구조

```
LastTable/
├─ .gitignore
├─ render.yaml                          # Render(백엔드) Blueprint
├─ lasttable-api/                       # Spring Boot 백엔드 (Java 21)
│  ├─ Dockerfile                        # Render용 컨테이너 빌드
│  └─ src/main/
│     ├─ resources/
│     │  └─ application.yml             # 설정 (KOSIS 키 포함, 데모용)
│     └─ java/com/lasttable/api/
│        ├─ LasttableApiApplication.java
│        ├─ config/WebConfig.java       # CORS 설정
│        ├─ kosis/                      # KOSIS API 호출 계층
│        │  ├─ KosisProperties.java
│        │  ├─ KosisClient.java
│        │  ├─ KosisRawItem.java
│        │  └─ KosisApiException.java
│        ├─ fruit/                      # 과실 생산량 도메인
│        │  ├─ FruitItem.java
│        │  ├─ FruitProduction.java
│        │  ├─ FruitProductionService.java
│        │  └─ FruitProductionController.java
│        └─ aquaculture/                # 수산 양식 생산량 도메인
│           ├─ AquacultureProduction.java
│           ├─ AquacultureService.java
│           └─ AquacultureController.java
└─ lasttable-web/                       # Vite + React 프론트엔드
   ├─ vercel.json
   └─ src/
      ├─ App.jsx / App.css              # 홈 화면
      └─ DetailDisappearing.jsx / .css  # "사라지는 식재료" 상세
```

## 개발 환경

| 도구 | 버전 | 설치 |
|------|------|------|
| JDK | **21 이상** | [Adoptium Temurin](https://adoptium.net/temurin/releases/?version=21) 또는 `brew install --cask temurin@21` |
| Node.js | **20 이상** (22 권장) | [nodejs.org](https://nodejs.org/) 또는 `brew install node` |
| Git | 최신 | [git-scm.com](https://git-scm.com/) 또는 `brew install git` |
| IDE (선택) | IntelliJ IDEA Community / VS Code (Extension Pack for Java) | — |

Gradle은 따로 설치할 필요 없습니다. 프로젝트에 wrapper (`./gradlew`)가 포함되어 있어 자동으로 알맞은 버전을 받아 씁니다.

### 환경 확인

```bash
java -version    # openjdk 21.x.x 이상
node --version   # v20.x 이상
git --version    # 아무 버전이나
```

### 프로젝트 받기

```bash
git clone https://github.com/0625yt/LastTable.git
cd LastTable
```

## 실행 방법

백엔드와 프론트엔드를 각각 띄워야 합니다. 터미널 두 개 사용.

### 1) 백엔드 (Spring Boot, 포트 8080)

`application.yml` 에 KOSIS API 키가 박혀 있어 별도 설정 없이 바로 실행됩니다.

```bash
cd lasttable-api
./gradlew bootRun
```

또는 IntelliJ에서 `LasttableApiApplication` 의 ▶ 버튼 클릭.

성공 로그:
```
KOSIS_API_KEY loaded (prefix: OWUyNDE...)
Started LasttableApiApplication in 0.7 seconds
Tomcat started on port 8080
```

> ⚠️ 이 키는 데모용으로 노출돼 있습니다. 본인 프로젝트로 활용한다면
> https://kosis.kr/openapi 에서 본인 키를 새로 발급받아 교체하세요.

### 2) 프론트엔드 (Vite + React, 포트 5173)

```bash
cd lasttable-web
npm install        # 최초 1회
npm run dev
```

접속: **http://localhost:5173/**

홈 화면이 뜨고, "🥕 생산량 감소 식재료" 카드가 백엔드에서 데이터를 받아
실제 증감률을 표시합니다(나머지 카드는 더미 UI).

### 본인 키로 교체하려면

`lasttable-api/src/main/resources/application.yml` 의 `api-key:` 값을 바꾸면 됩니다.

```yaml
kosis:
  api-key: 여기에_본인_KOSIS_키_붙여넣기
```

또는 환경변수로 주입하고 싶다면 yml을 다음 형태로:
```yaml
kosis:
  api-key: ${KOSIS_API_KEY}
```
실행 전 `export KOSIS_API_KEY=...` 또는 IntelliJ Run Configuration의
Environment variables에 등록.

## 사용 방법

### 1. JSON 뷰어 페이지

서버 실행 후 브라우저에서 접속:

> **http://localhost:8080/**

- 과일 / 연도 / 시도 드롭다운에서 고른 뒤 [조회] 버튼
- 호출 URL, 응답 행 수, 원본 JSON 이 한 화면에 표시됨

### 2. REST API 직접 호출

#### 과실 생산량

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/kosis/fruits` | 지원하는 과일 목록 |
| GET | `/api/kosis/fruits/{fruit}/production?years=5&region=서울특별시` | 과일·시도별 생산량 (region 생략 시 전국 시도 전체) |

지원 과일 슬러그:
`apple, pear, peach, grape, mandarin, persimmon, sweet-persimmon, astringent-persimmon, plum, japanese-apricot`

```bash
curl http://localhost:8080/api/kosis/fruits
curl "http://localhost:8080/api/kosis/fruits/apple/production?years=3"
curl "http://localhost:8080/api/kosis/fruits/mandarin/production?years=5&region=제주도"
```

```json
[
  { "fruit":"사과","regionCode":"00","regionName":"계","year":2025,"valueTon":447952.5984 },
  { "fruit":"사과","regionCode":"11","regionName":"서울특별시","year":2025,"valueTon":0.1424 }
]
```

#### 수산 양식 생산량

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/kosis/aquaculture/production?years=5&region=전라남도` | 시도별 양식 총생산량(M/T) |

데이터는 어종 합산이며, 통계표 `DT_1EZ0007` (시도·시군구별 양식현황 총괄)에서 가져옵니다.

```bash
curl "http://localhost:8080/api/kosis/aquaculture/production?years=3"
curl "http://localhost:8080/api/kosis/aquaculture/production?years=5&region=전라남도"
```

```json
[
  { "regionCode":"00","regionName":"전국","year":2025,"productionTon":82807.0 },
  { "regionCode":"36","regionName":"전라남도","year":2025,"productionTon":27325.0 }
]
```

#### 사용 가능한 region 이름

KOSIS가 내려주는 시도 이름을 그대로 써야 합니다.

```
계, 서울특별시, 부산광역시, 대구광역시, 인천광역시, 광주광역시,
대전광역시, 울산광역시, 세종특별자치시, 경기도, 강원도, 충청북도,
충청남도, 전라북도, 전라남도, 경상북도, 경상남도, 제주도
```

## 데이터 출처

- **과실 생산량**: KOSIS `DT_1ET0292` (과실생산량(성과수+미과수))
  - https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1ET0292
- **수산 양식 생산량**: KOSIS `DT_1EZ0007` (시도·시군구별 양식현황 총괄)
  - https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1EZ0007
- **미래 예측(예정)**: 농촌진흥청 SSP 기후변화 시나리오 자료

## 트러블슈팅

- **`KOSIS_API_KEY 환경변수가 비어 있습니다`** 경고가 뜬다면
  → IntelliJ Run Configuration의 Environment variables에 빈 `KOSIS_API_KEY=` 가
  등록돼 있을 수 있음. 삭제 후 재시작.
- **`인증 KEY값이 누락되었습니다`** 응답
  → yml의 api-key 가 비어있거나, 잘못된 키. 위 "본인 키로 교체" 참조.
- **포트 8080 충돌**
  → `lsof -ti tcp:8080 | xargs kill -9` 후 다시 실행.
