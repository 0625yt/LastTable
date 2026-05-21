import argparse
import os
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

try:
    from xgboost import XGBRegressor
except ModuleNotFoundError:
    XGBRegressor = None


##################################
# 0. 공통 설정
##################################

PROJECT_DIR = Path(__file__).resolve().parent
DATA_DIR = PROJECT_DIR / "data"
OUTPUT_DIR = PROJECT_DIR / "output"

FRUIT_SLUGS = ["apple", "pear", "peach", "grape", "mandarin"]

# 필수 입력 파일
KMA_PAST_WEATHER_FILE = DATA_DIR / "kma_past_weather.csv"
SSP_FUTURE_WEATHER_FILE = DATA_DIR / "ssp_future_weather.csv"

# 선택 입력 파일
RDA_AGRI_WEATHER_PAST_FILE = DATA_DIR / "rda_agri_weather_past.csv"
RDA_FUTURE_FRUIT_SUITABILITY_FILE = DATA_DIR / "rda_future_fruit_suitability.csv"

# 데이터 다운로드 참고 링크
# - 기상청 ASOS 일자료 API:
#   https://www.data.go.kr/data/15059093/openapi.do
# - 농진청 농업기상 기본 관측데이터 API:
#   https://www.data.go.kr/data/15078057/openapi.do
# - 농진청 농업기상 관측지점 상세정보 API:
#   https://www.data.go.kr/data/15073274/openapi.do
# - 농업날씨365 SSP 기후변화 시나리오 다운로드:
#   https://weather.rda.go.kr/appMap/climateDown.do
# - 기상청 기후정보포털 SSP 시나리오 다운로드 안내:
#   https://www.climate.go.kr/home/CCS/contents_2021/info/download.html
# - 과수생육품질관리시스템 재배적지 지도:
#   https://fruit.nihhs.go.kr/main/onestop/ostpProductCenterImg.do?keyId=332


##################################
# 1. 유틸 함수
##################################

def require_file(path: Path, description: str) -> None:
    if not path.exists():
        raise FileNotFoundError(
            f"{description} 파일이 없습니다: {path}\n"
            "v3에서는 더미 데이터를 생성하지 않습니다. 실제 데이터를 CSV로 준비해주세요."
        )


def require_columns(df: pd.DataFrame, required_columns: list[str], name: str) -> None:
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise KeyError(
            f"{name}에 필요한 컬럼이 없습니다: {missing_columns}\n"
            f"현재 컬럼: {df.columns.tolist()}"
        )


def normalize_region(value: object) -> str:
    if pd.isna(value):
        return ""

    region = str(value).strip()

    return {
        "강원도": "강원특별자치도",
        "전라북도": "전북특별자치도",
        "제주도": "제주특별자치도",
    }.get(region, region)


def to_number(df: pd.DataFrame, columns: list[str], name: str) -> pd.DataFrame:
    df = df.copy()

    for column in columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    null_counts = df[columns].isna().sum()
    bad_columns = null_counts[null_counts > 0]

    if not bad_columns.empty:
        print(f"\n{name} 숫자 변환 후 결측 개수:")
        print(bad_columns)

    return df


def load_optional_csv(path: Path, description: str) -> pd.DataFrame:
    if not path.exists():
        print(f"\n선택 파일 없음: {description} ({path})")
        return pd.DataFrame()

    df = pd.read_csv(path)
    print(f"\n선택 파일 로드 완료: {description} ({len(df)}행)")
    print(df.head(3))
    return df


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="실제 과거 기상/미래 SSP CSV로 과일 생산량을 예측합니다."
    )
    parser.add_argument(
        "--base-url",
        default=os.getenv("DUYUTHON_API_BASE_URL", "http://localhost:8080"),
        help="과실 생산량 API 서버 주소",
    )
    parser.add_argument(
        "--data-dir",
        default=str(DATA_DIR),
        help="표준 입력 CSV가 들어있는 디렉터리",
    )
    parser.add_argument(
        "--output",
        default=str(OUTPUT_DIR / "future_fruit_production_predictions_v3.csv"),
        help="최종 예측 CSV 저장 경로",
    )
    return parser.parse_args()


args = parse_args()
BASE_URL = args.base_url.rstrip("/")
DATA_DIR = Path(args.data_dir)
OUTPUT_FILE = Path(args.output)
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

KMA_PAST_WEATHER_FILE = DATA_DIR / "kma_past_weather.csv"
SSP_FUTURE_WEATHER_FILE = DATA_DIR / "ssp_future_weather.csv"
RDA_AGRI_WEATHER_PAST_FILE = DATA_DIR / "rda_agri_weather_past.csv"
RDA_FUTURE_FRUIT_SUITABILITY_FILE = DATA_DIR / "rda_future_fruit_suitability.csv"


##################################
# 2. 과거 과일 생산량 데이터 API 수집
##################################

df_list = []

for fruit in FRUIT_SLUGS:
    url = f"{BASE_URL}/api/kosis/fruits/{fruit}/production?years=20"

    try:
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            print(f"{fruit} 데이터 가져오기 실패 ({response.status_code})")
            print(response.text[:300])
            continue

        df_temp = pd.DataFrame(response.json())

        if df_temp.empty:
            print(f"{fruit} 데이터가 비어 있습니다.")
            continue

        df_temp["fruit_slug"] = fruit
        df_list.append(df_temp)
        print(f"{fruit} production loaded ({len(df_temp)}행)")

    except Exception as e:
        print(f"{fruit} API 요청 중 에러 발생: {e}")


if not df_list:
    raise ValueError("과일 생산량 데이터가 로드되지 않았습니다. Spring Boot API 서버를 확인하세요.")


df_fruit_production = pd.concat(df_list, ignore_index=True)

print("\n--- API 원본 과일 생산량 데이터 컬럼 구조 ---")
print(df_fruit_production.head(2))
print(df_fruit_production.columns.tolist())


##################################
# 3. 과일 생산량 컬럼명 표준화
##################################
# Spring Boot API 예상 응답:
# fruit, regionCode, regionName, year, valueTon, fruit_slug
#
# 모델 표준 컬럼:
# year, region, production_ton, fruit_slug

df_fruit_production = df_fruit_production.rename(
    columns={
        "regionName": "region",
        "valueTon": "production_ton",
        "value": "production_ton",
    }
)

require_columns(
    df_fruit_production,
    ["year", "region", "production_ton", "fruit_slug"],
    "과일 생산량 API 응답",
)

df_fruit_production["region"] = df_fruit_production["region"].map(normalize_region)
df_fruit_production = df_fruit_production[df_fruit_production["region"] != "계"].copy()
df_fruit_production = to_number(df_fruit_production, ["year", "production_ton"], "과일 생산량")
df_fruit_production = df_fruit_production.dropna(
    subset=["year", "region", "production_ton", "fruit_slug"]
).copy()
df_fruit_production["year"] = df_fruit_production["year"].astype(int)

print("\n--- 표준화 후 과일 생산량 데이터 ---")
print(df_fruit_production.head(5))
print(f"과일 생산량 데이터 행 수: {len(df_fruit_production)}")


#########################################
# 4. 과거 / 미래 기후 데이터 로드
#########################################
# kma_past_weather.csv 필수 컬럼:
# year, region, avg_temp, precipitation
#
# ssp_future_weather.csv 필수 컬럼:
# year, region, fruit_slug, avg_temp, precipitation
#
# rda_agri_weather_past.csv 선택 컬럼 예시:
# year, region, humidity, sunshine_hours, solar_radiation, avg_wind_speed
#
# rda_future_fruit_suitability.csv 선택 컬럼 예시:
# year, region, fruit_slug, suitability_score, suitability_class

require_file(KMA_PAST_WEATHER_FILE, "기상청 ASOS 과거 기온/강수")
require_file(SSP_FUTURE_WEATHER_FILE, "SSP 미래 기후")

df_weather_past = pd.read_csv(KMA_PAST_WEATHER_FILE)
df_weather_future = pd.read_csv(SSP_FUTURE_WEATHER_FILE)
df_rda_weather_past = load_optional_csv(RDA_AGRI_WEATHER_PAST_FILE, "농진청 농업기상 과거 관측")
df_future_suitability = load_optional_csv(
    RDA_FUTURE_FRUIT_SUITABILITY_FILE,
    "농진청 6대 과일 미래지도/재배적지",
)

require_columns(
    df_weather_past,
    ["year", "region", "avg_temp", "precipitation"],
    "kma_past_weather.csv",
)

require_columns(
    df_weather_future,
    ["year", "region", "fruit_slug", "avg_temp", "precipitation"],
    "ssp_future_weather.csv",
)

df_weather_past["region"] = df_weather_past["region"].map(normalize_region)
df_weather_future["region"] = df_weather_future["region"].map(normalize_region)

df_weather_past = to_number(
    df_weather_past,
    ["year", "avg_temp", "precipitation"],
    "kma_past_weather.csv",
)
df_weather_future = to_number(
    df_weather_future,
    ["year", "avg_temp", "precipitation"],
    "ssp_future_weather.csv",
)

df_weather_past = df_weather_past.dropna(
    subset=["year", "region", "avg_temp", "precipitation"]
).copy()
df_weather_future = df_weather_future.dropna(
    subset=["year", "region", "fruit_slug", "avg_temp", "precipitation"]
).copy()

df_weather_past["year"] = df_weather_past["year"].astype(int)
df_weather_future["year"] = df_weather_future["year"].astype(int)


#########################################
# 5. 농진청 농업기상 과거 데이터 결합
#########################################

if not df_rda_weather_past.empty:
    require_columns(df_rda_weather_past, ["year", "region"], "rda_agri_weather_past.csv")

    df_rda_weather_past["region"] = df_rda_weather_past["region"].map(normalize_region)
    numeric_rda_columns = [
        col
        for col in df_rda_weather_past.columns
        if col not in ["year", "region"] and pd.api.types.is_numeric_dtype(df_rda_weather_past[col])
    ]

    if not numeric_rda_columns:
        candidate_columns = [col for col in df_rda_weather_past.columns if col not in ["year", "region"]]
        df_rda_weather_past = to_number(
            df_rda_weather_past,
            ["year", *candidate_columns],
            "rda_agri_weather_past.csv",
        )
        numeric_rda_columns = [
            col
            for col in candidate_columns
            if pd.api.types.is_numeric_dtype(df_rda_weather_past[col])
        ]
    else:
        df_rda_weather_past = to_number(
            df_rda_weather_past,
            ["year", *numeric_rda_columns],
            "rda_agri_weather_past.csv",
        )

    df_rda_weather_past["year"] = df_rda_weather_past["year"].astype("Int64")
    df_rda_weather_past = df_rda_weather_past.dropna(subset=["year", "region"]).copy()
    df_rda_weather_past["year"] = df_rda_weather_past["year"].astype(int)

    df_weather_past = pd.merge(
        df_weather_past,
        df_rda_weather_past[["year", "region", *numeric_rda_columns]],
        on=["year", "region"],
        how="left",
    )

    print("\n--- 농진청 농업기상 결합 완료 ---")
    print(f"추가 후보 피처: {numeric_rda_columns}")


#########################################
# 6. 학습 데이터 결합
#########################################

df_train_raw = pd.merge(
    df_fruit_production,
    df_weather_past,
    on=["year", "region"],
    how="inner",
)

print("\n--- 생산량 + 과거 기후 병합 결과 ---")
print(df_train_raw.head(5))
print(f"병합 후 학습 데이터 행 수: {len(df_train_raw)}")

if df_train_raw.empty:
    print("\n생산량 데이터 지역명 예시:")
    print(sorted(df_fruit_production["region"].unique())[:20])
    print("기후 데이터 지역명 예시:")
    print(sorted(df_weather_past["region"].unique())[:20])

    raise ValueError(
        "생산량 데이터와 기후 데이터가 year, region 기준으로 매칭되지 않았습니다. "
        "region 이름과 연도 범위를 확인하세요."
    )


#########################################
# 7. 모델 입력 데이터 생성
#########################################

base_feature_columns = ["avg_temp", "precipitation"]
extra_numeric_columns = [
    col
    for col in df_train_raw.columns
    if col not in [
        "year",
        "region",
        "fruit",
        "fruit_slug",
        "regionCode",
        "production_ton",
    ]
    and pd.api.types.is_numeric_dtype(df_train_raw[col])
]

numeric_feature_columns = []
for column in [*base_feature_columns, *extra_numeric_columns]:
    if column not in numeric_feature_columns and column in df_weather_future.columns:
        numeric_feature_columns.append(column)

if base_feature_columns != numeric_feature_columns[:2]:
    raise ValueError(
        "미래 예측 파일에는 최소 avg_temp, precipitation 컬럼이 필요합니다."
    )

if len(numeric_feature_columns) < len(set([*base_feature_columns, *extra_numeric_columns])):
    skipped = sorted(set([*base_feature_columns, *extra_numeric_columns]) - set(numeric_feature_columns))
    print(f"\n미래 데이터에 없어 모델 피처에서 제외한 과거 피처: {skipped}")

df_train_model = df_train_raw.dropna(
    subset=["region", "fruit_slug", "production_ton", *numeric_feature_columns]
).copy()
df_future_model = df_weather_future.dropna(
    subset=["region", "fruit_slug", *numeric_feature_columns]
).copy()

if len(df_train_model) < 10:
    raise ValueError(
        f"학습 데이터가 너무 적습니다. 현재 {len(df_train_model)}행입니다. "
        "API 데이터 또는 기후 데이터 병합 결과를 확인하세요."
    )

df_train_features = df_train_model[["region", "fruit_slug", *numeric_feature_columns]].copy()
df_future_features = df_future_model[["region", "fruit_slug", *numeric_feature_columns]].copy()
y = df_train_model["production_ton"].copy()

combined_features = pd.concat(
    [df_train_features, df_future_features],
    ignore_index=True,
)
combined_encoded = pd.get_dummies(
    combined_features,
    columns=["region", "fruit_slug"],
    drop_first=False,
)

X = combined_encoded.iloc[:len(df_train_features)].copy()
X_future = combined_encoded.iloc[len(df_train_features):].copy()

print("\n--- 모델 입력 데이터 확인 ---")
print(f"사용 numeric 피처: {numeric_feature_columns}")
print(f"X shape: {X.shape}")
print(f"X_future shape: {X_future.shape}")
print(f"y shape: {y.shape}")


#########################################
# 8. 모델 학습 및 평가
#########################################

X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

if XGBRegressor is not None:
    print("\n--- XGBoost 모델 학습 시작 ---")

    model = XGBRegressor(
        n_estimators=200,
        learning_rate=0.02,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective="reg:squarederror",
    )
else:
    print("\n--- XGBoost 미설치: RandomForestRegressor로 학습 시작 ---")

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )

model.fit(X_train, y_train)

y_pred = model.predict(X_val)
r2 = r2_score(y_val, y_pred)
rmse = np.sqrt(mean_squared_error(y_val, y_pred))

print(f"검증셋 R2 Score: {r2:.4f}")
print(f"검증셋 RMSE: {rmse:.2f} 톤")


#########################################
# 9. 미래 기후 데이터를 통한 생산량 예측
#########################################

print("\n--- 미래 생산량 예측 진행 중 ---")

future_predictions = model.predict(X_future)

df_result = df_future_model.copy()
df_result["predicted_production_ton"] = future_predictions
df_result["predicted_production_ton"] = df_result["predicted_production_ton"].clip(lower=0)


#########################################
# 10. 농진청 미래 재배적지 데이터 결과 결합
#########################################

if not df_future_suitability.empty:
    require_columns(
        df_future_suitability,
        ["year", "region", "fruit_slug"],
        "rda_future_fruit_suitability.csv",
    )

    df_future_suitability["region"] = df_future_suitability["region"].map(normalize_region)
    df_future_suitability = to_number(
        df_future_suitability,
        ["year"],
        "rda_future_fruit_suitability.csv",
    )
    df_future_suitability = df_future_suitability.dropna(
        subset=["year", "region", "fruit_slug"]
    ).copy()
    df_future_suitability["year"] = df_future_suitability["year"].astype(int)

    suitability_columns = [
        col
        for col in df_future_suitability.columns
        if col not in ["year", "region", "fruit_slug"]
    ]

    df_result = pd.merge(
        df_result,
        df_future_suitability[["year", "region", "fruit_slug", *suitability_columns]],
        on=["year", "region", "fruit_slug"],
        how="left",
    )

    print("\n--- 농진청 미래 재배적지 데이터 결과 결합 완료 ---")
    print(f"결과 추가 컬럼: {suitability_columns}")


#########################################
# 11. 결과 CSV 저장
#########################################

print("\n--- 미래 과일 생산량 예측 결과 상위 10개 행 ---")
print(
    df_result[
        ["year", "region", "fruit_slug", "predicted_production_ton"]
    ].head(10)
)

df_result.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8-sig",
)

print(f"\n예측 결과 저장 완료: {OUTPUT_FILE}")
