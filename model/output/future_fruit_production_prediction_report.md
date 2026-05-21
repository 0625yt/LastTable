# 미래 과일 생산량 예측 모델 결과 정리

생성일: 2026-05-21 15:55 KST

## 한 줄 요약

이번 결과는 **과거 과일 생산량과 과거 기온·강수량의 관계를 학습한 뒤, SSP 미래 기온·강수량을 입력해 미래 과일 생산량을 예측한 baseline 모델 결과**입니다.

최종 산출물:

```text
model/output/future_fruit_production_predictions_v3.csv
```

## 사용한 데이터

### 1. KOSIS 과실 생산량

역할: **모델이 맞혀야 하는 정답 데이터**

의미:

```text
특정 연도, 특정 지역, 특정 과일이 실제로 몇 톤 생산되었는가
```

예시 컬럼:

```csv
year,region,fruit_slug,production_ton
2006,경상북도,apple,407621.0
```

수집 방식:

```text
Spring Boot API
/api/kosis/fruits/{fruit}/production?years=20
```

사용 과일:

```text
apple, pear, peach, grape, mandarin
```

### 2. 기상청 ASOS 과거 기상

역할: **과거 학습용 입력 데이터**

ASOS는 기상청 종관기상관측 자료입니다. 기상청 공식 관측소에서 기록한 과거 날씨 데이터이며, 이번 모델에서는 일자료를 연도·시도 단위로 집계했습니다.

이번 모델에서 사용한 컬럼:

```csv
year,region,avg_temp,precipitation
2006,경상북도,12.1397,1098.1
```

의미:

```text
avg_temp      = 해당 연도·지역의 평균기온
precipitation = 해당 연도·지역의 총강수량
```

저장 위치:

```text
model/data/kma_past_weather.csv
```

### 3. SSP 미래 기상

역할: **미래 예측용 입력 데이터**

SSP는 미래 사회·경제 경로를 가정한 기후변화 시나리오입니다. 이번에는 농업날씨365의 ENS 자료를 사용했습니다.

ENS 의미:

```text
18개 기후모형 기반 앙상블 평균 시나리오
```

이번 모델에서 다운로드한 SSP 원본은 변수별·시나리오별·연도별 파일로 구성되어 있었습니다.

예시:

```text
SQM_ENS_prcp_ssp245_2030.csv
SQM_ENS_tmax_ssp245_2030.csv
SQM_ENS_tmin_ssp245_2030.csv
SQM_ENS_rhum_ssp245_2030.csv
SQM_ENS_rsds_ssp245_2030.csv
SQM_ENS_wspd_ssp245_2030.csv
```

이번 변환에서는 `ssp245` 자료를 사용했습니다.

```text
ssp245 = SSP2-4.5, 중간 수준의 기후변화 시나리오
```

변환 후 저장 위치:

```text
model/data/ssp_future_weather.csv
```

변환 후 컬럼:

```csv
year,region,avg_temp,precipitation,humidity,solar_radiation,wind_speed,fruit_slug
```

## 데이터가 모델에 쓰인 방식

### 학습 단계

모델은 아래 데이터를 `year`, `region` 기준으로 합쳤습니다.

```text
KOSIS 과실 생산량
+ ASOS 과거 기상
```

학습 데이터 구조:

```text
연도 + 지역 + 과일 + 평균기온 + 강수량 → 실제 생산량
```

예시:

```text
2006년 경상북도 apple
평균기온 12.13도
강수량 1098.1mm
→ 실제 생산량
```

### 예측 단계

학습된 모델에 SSP 미래 기상 데이터를 넣어 예측했습니다.

예측 데이터 구조:

```text
미래 연도 + 지역 + 과일 + 미래 평균기온 + 미래 강수량 → 예측 생산량
```

예시:

```text
2030년 경상북도 apple
SSP245 평균기온
SSP245 강수량
→ 예측 생산량
```

## 실제 모델 조건

사용 모델:

```text
XGBoost Regressor
```

학습에 실제 사용된 numeric 피처:

```text
avg_temp
precipitation
```

중요:

SSP 미래 CSV에는 아래 컬럼도 포함되어 있습니다.

```text
humidity
solar_radiation
wind_speed
```

하지만 과거 ASOS 학습 데이터에는 해당 컬럼이 없기 때문에 이번 학습 피처에서는 제외되었습니다. 따라서 이번 결과는 **기온·강수량 기반 미래 생산량 예측**입니다.

## 실행 결과

수집된 과실 생산량:

```text
apple    351행
pear     350행
peach    332행
grape    332행
mandarin 322행
```

학습 데이터:

```text
1540행
```

미래 예측 데이터:

```text
7650행
```

검증 결과:

```text
R2 Score = 0.9811
RMSE     = 9853.23 톤
```

주의:

R2가 높게 나온 것은 모델이 좋은 신호일 수 있지만, 현재 데이터는 지역·과일 구분 효과가 크고 랜덤 분리 검증을 사용했기 때문에 실제 미래 예측 성능을 그대로 보장하지는 않습니다. 발표에서는 “기후 시나리오 기반 baseline 예측 모델”로 표현하는 것이 안전합니다.

## 결과 CSV 컬럼 설명

최종 파일:

```text
model/output/future_fruit_production_predictions_v3.csv
```

컬럼:

```text
year
region
avg_temp
precipitation
humidity
solar_radiation
wind_speed
fruit_slug
predicted_production_ton
```

의미:

```text
year                     = 예측 연도
region                   = 시도
avg_temp                 = SSP245 미래 평균기온
precipitation            = SSP245 미래 강수량
humidity                 = SSP245 미래 상대습도
solar_radiation          = SSP245 미래 일사량
wind_speed               = SSP245 미래 풍속
fruit_slug               = 과일 종류
predicted_production_ton = 예측 생산량
```

단, 현재 모델 예측에 직접 사용된 기상 피처는 `avg_temp`, `precipitation`입니다.

## 현재 모델의 의미

이번 모델은 아래 질문에 답하기 위한 초기 모델입니다.

```text
기후변화 시나리오상 미래 기온과 강수량이 달라지면,
지역별 과일 생산량은 어떻게 변할 가능성이 있는가?
```

서비스 관점에서는 홈 화면 지도나 슬라이더에서 다음과 같은 정보를 보여주는 데 사용할 수 있습니다.

```text
연도별 예상 생산량
지역별 예상 생산량
과일별 생산량 변화
기후변화에 따른 위험 지역
```

## 한계

현재 모델의 주요 한계:

```text
1. 연평균 기온과 연강수량만 사용해 과일 생육 시기별 영향을 반영하지 못함
2. 농진청 농업기상 피처가 아직 학습에 포함되지 않음
3. 재배면적, 품종, 병해충, 가격, 정책, 재해 피해 등 비기상 요인이 빠져 있음
4. 랜덤 검증 방식이라 시계열 미래 예측 성능 평가로는 부족함
5. SSP 미래 기후가 과거 관측 범위를 벗어나면 트리 기반 모델의 외삽 한계가 있음
```

## 다음 개선 방향

우선순위 높은 개선:

```text
1. 농진청 농업기상 과거 데이터를 추가해 습도, 일사량, 풍속까지 학습 피처로 사용
2. 연평균 대신 월별·계절별 피처 생성
3. 봄 개화기 저온, 여름 고온, 장마철 강수, 수확기 기온 같은 과일 생육 피처 추가
4. 랜덤 분리 대신 과거 연도로 학습하고 최근 연도로 검증하는 방식 적용
5. SSP126, SSP245, SSP370, SSP585 시나리오별 결과를 따로 생성
6. 예측 생산량뿐 아니라 기준연도 대비 증감률과 위험도 등급 생성
```

## 발표/문서에서 추천하는 표현

권장 표현:

```text
기후 시나리오 기반 과일 생산량 변화 추정 모델
기온·강수량 기반 baseline 예측 모델
SSP2-4.5 시나리오를 활용한 지역별 과일 생산량 예측
```

피해야 할 표현:

```text
정확한 미래 생산량 예측
실제 생산량을 보장하는 모델
기후만으로 생산량을 완전히 예측하는 모델
```
