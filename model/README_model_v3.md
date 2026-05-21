# Fruit Production Prediction v3

`v3`는 더미 기상 데이터를 만들지 않고 실제 CSV/API 데이터만 사용합니다.

## 입력 데이터

표준 입력 파일은 `model/data/`에 둡니다.

### 필수: 과거 ASOS 기상

`model/data/kma_past_weather.csv`

```csv
year,region,avg_temp,precipitation
2020,경상북도,13.2,1120.5
```

### 필수: 미래 SSP 기상

`model/data/ssp_future_weather.csv`

```csv
year,region,fruit_slug,avg_temp,precipitation
2030,경상북도,apple,15.1,1180.2
```

`fruit_slug`는 `apple`, `pear`, `peach`, `grape`, `mandarin` 중 하나입니다.

### 선택: 농진청 농업기상

`model/data/rda_agri_weather_past.csv`

```csv
year,region,humidity,sunshine_hours,solar_radiation,wind_speed
2020,경상북도,65.1,2180.3,14.2,2.1
```

### 선택: 농진청 미래 재배적지/미래지도

`model/data/rda_future_fruit_suitability.csv`

```csv
year,region,fruit_slug,suitability_score,suitability_class
2030,경상북도,apple,0.82,적합
```

이 파일은 예측 결과에 붙이는 보조 데이터입니다.

## 데이터 출처

- 기상청 ASOS 일자료 API: https://www.data.go.kr/data/15059093/openapi.do
- 농진청 농업기상 기본 관측데이터 API: https://www.data.go.kr/data/15078057/openapi.do
- 농진청 농업기상 관측지점 상세정보 API: https://www.data.go.kr/data/15073274/openapi.do
- 농업날씨365 SSP 기후변화 시나리오 다운로드: https://weather.rda.go.kr/appMap/climateDown.do
- 기상청 기후정보포털 SSP 시나리오 다운로드 안내: https://www.climate.go.kr/home/CCS/contents_2021/info/download.html
- 농진청 6대 과일 미래지도 설명: https://www.rda.go.kr/middlePopOpenPopNongsaroDBView.do?no=1768
- 과수생육품질관리시스템 재배적지 지도: https://fruit.nihhs.go.kr/main/onestop/ostpProductCenterImg.do?keyId=332

## 실행 방법

공공데이터포털 서비스키를 환경변수에 넣습니다.

```bash
export DATA_GO_KR_SERVICE_KEY="발급받은_일반_인증키"
```

기상자료개방포털(data.kma.go.kr)에서 받은 키를 쓸 경우에는 아래처럼 넣고 `--kma-provider data-kma` 옵션을 사용합니다.

```bash
export KMA_DATA_API_KEY="기상자료개방포털_OPEN_API_인증키"
python model/collect_real_weather_data.py --kma-provider data-kma --start-year 2006 --end-year 2024 --skip-ssp
```

농업날씨365 또는 기후정보포털에서 받은 미래 SSP CSV/XLSX 파일은 `model/raw/ssp/`에 넣습니다.

전체 파이프라인:

```bash
python model/run_full_pipeline.py --start-year 2004 --end-year 2024
```

이미 `model/data/kma_past_weather.csv`, `model/data/ssp_future_weather.csv`가 준비되어 있으면 모델만 실행합니다.

```bash
python model/run_full_pipeline.py --skip-collect
```

최종 결과는 여기에 저장됩니다.

```text
model/output/future_fruit_production_predictions_v3.csv
```

## 참고

ASOS는 관측소 단위 데이터라서 `collect_real_weather_data.py`에서 대표 관측소를 시도에 매핑해 연간 평균기온과 연간 강수량으로 집계합니다. 팀 기준에 맞춰 한 시도에 관측소를 더 추가하면 더 안정적인 지역 평균을 만들 수 있습니다.
