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

이 저장소에는 **백엔드 API 서버 (`lasttable-api/`)** 만 들어 있습니다.
KOSIS(통계청) 공공데이터에서 작물 생산량 정보를 가져와 시각화 화면에 제공합니다.

- 언어/프레임워크: **Java 21 + Spring Boot 3.5**
- 빌드: **Gradle (wrapper 포함)**

## 디렉터리 구조

```
LastTable/
├─ .env.example                # 환경변수 템플릿
├─ .gitignore
└─ lasttable-api/              # Spring Boot 서버
   └─ src/main/
      ├─ resources/application.yml
      └─ java/com/lasttable/api/
         ├─ LasttableApiApplication.java  # 시작점
         ├─ kosis/                        # KOSIS API 호출 계층
         │  ├─ KosisProperties.java
         │  ├─ KosisClient.java
         │  ├─ KosisRawItem.java
         │  └─ KosisApiException.java
         └─ fruit/                        # 과실 생산량 도메인
            ├─ FruitItem.java
            ├─ FruitProduction.java
            ├─ FruitProductionService.java
            └─ FruitProductionController.java
```

## 실행 방법

### 1. KOSIS API 키 발급 (1회, 무료)

1. https://kosis.kr/openapi/index/index.jsp 접속
2. 회원가입 후 로그인
3. **활용신청** → 즉시 발급 (보통 즉시 활성화)
4. 마이페이지에서 키 복사

### 2. 환경변수 설정

`.env.example` 을 복사해서 `.env` 파일을 만들고 키 붙여넣기.

```bash
cp .env.example .env
# 에디터로 .env 열어서 KOSIS_API_KEY 채우기
```

또는 셸에서 직접 export:

```bash
export KOSIS_API_KEY="발급받은_키"
```

IntelliJ에서 실행할 경우: **Run Configuration → Environment variables** 에
`KOSIS_API_KEY=...` 추가.

### 3. 서버 실행

```bash
cd lasttable-api
./gradlew bootRun
```

성공 로그:
```
Started LasttableApiApplication in 0.7 seconds
Tomcat started on port 8080
```

## 제공 API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/kosis/fruits` | 지원하는 과일 목록 |
| GET | `/api/kosis/fruits/{fruit}/production?years=5&region=서울특별시` | 시도별 생산량 (region 생략 시 전국 시도 전체) |

지원 과일 슬러그:
`apple, pear, peach, grape, mandarin, persimmon, sweet-persimmon, astringent-persimmon, plum, japanese-apricot`

### 호출 예시

```bash
curl http://localhost:8080/api/kosis/fruits

curl "http://localhost:8080/api/kosis/fruits/apple/production?years=3"

curl "http://localhost:8080/api/kosis/fruits/mandarin/production?years=5&region=제주특별자치도"
```

응답 예시:

```json
[
  { "fruit":"사과","regionCode":"00","regionName":"계","year":2025,"valueTon":447952.5984 },
  { "fruit":"사과","regionCode":"11","regionName":"서울특별시","year":2025,"valueTon":0.1424 }
]
```

## 데이터 출처

- **현재 시점 생산량**: KOSIS 통계청 통계표 `DT_1ET0292` (과실생산량(성과수+미과수))
- **미래 예측(예정)**: 농촌진흥청 SSP 기후변화 시나리오 자료

## 보안 메모

- KOSIS API 키는 **절대 커밋하지 마세요**. `.env` 는 `.gitignore`에 등록되어 있습니다.
- 노출된 키는 즉시 KOSIS 마이페이지에서 폐기·재발급 가능합니다.
