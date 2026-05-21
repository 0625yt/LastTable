import argparse
import os
import re
import time
from zipfile import ZipFile
from pathlib import Path
from typing import Any, Optional
from xml.etree import ElementTree as ET

import pandas as pd
import requests


PROJECT_DIR = Path(__file__).resolve().parent
DATA_DIR = PROJECT_DIR / "data"
RAW_SSP_DIR = PROJECT_DIR / "raw" / "ssp"

FRUIT_SLUGS = ["apple", "pear", "peach", "grape", "mandarin"]

SGG_TO_PROVINCE = {
    "서울": "서울특별시",
    "부산": "부산광역시",
    "대구": "대구광역시",
    "인천": "인천광역시",
    "광주": "광주광역시",
    "대전": "대전광역시",
    "울산": "울산광역시",
    "세종": "세종특별자치시",
    "수원": "경기도",
    "성남": "경기도",
    "의정부": "경기도",
    "안양": "경기도",
    "부천": "경기도",
    "광명": "경기도",
    "평택": "경기도",
    "동두천": "경기도",
    "안산": "경기도",
    "고양": "경기도",
    "과천": "경기도",
    "구리": "경기도",
    "남양주": "경기도",
    "오산": "경기도",
    "시흥": "경기도",
    "군포": "경기도",
    "의왕": "경기도",
    "하남": "경기도",
    "용인": "경기도",
    "파주": "경기도",
    "이천": "경기도",
    "안성": "경기도",
    "김포": "경기도",
    "화성": "경기도",
    "광주": "경기도",
    "양주": "경기도",
    "포천": "경기도",
    "여주": "경기도",
    "연천": "경기도",
    "가평": "경기도",
    "양평": "경기도",
    "춘천": "강원특별자치도",
    "원주": "강원특별자치도",
    "강릉": "강원특별자치도",
    "동해": "강원특별자치도",
    "태백": "강원특별자치도",
    "속초": "강원특별자치도",
    "삼척": "강원특별자치도",
    "홍천": "강원특별자치도",
    "횡성": "강원특별자치도",
    "영월": "강원특별자치도",
    "평창": "강원특별자치도",
    "정선": "강원특별자치도",
    "철원": "강원특별자치도",
    "화천": "강원특별자치도",
    "양구": "강원특별자치도",
    "인제": "강원특별자치도",
    "고성": "강원특별자치도",
    "양양": "강원특별자치도",
}

ADMIN_ID_TO_PROVINCE = {
    1: "경기도", 2: "경기도", 3: "전라북도", 4: "경상남도", 5: "경상남도",
    6: "전라남도", 7: "경상북도", 8: "충청북도", 9: "경기도", 10: "경상북도",
    11: "강원도", 12: "경기도", 13: "전라북도", 14: "경상북도", 15: "울산광역시",
    16: "경상북도", 17: "충청남도", 18: "경기도", 19: "충청남도", 20: "경기도",
    21: "경상북도", 22: "인천광역시", 23: "강원도", 24: "전라남도", 25: "전라남도",
    26: "울산광역시", 27: "충청북도", 28: "전라남도", 29: "전라남도", 30: "경기도",
    31: "전라남도", 32: "부산광역시", 33: "충청북도", 34: "충청남도", 35: "강원도",
    36: "전라북도", 37: "충청북도", 38: "경상북도", 39: "인천광역시", 40: "충청남도",
    41: "전라북도", 42: "경상북도", 43: "충청남도", 44: "경상북도", 45: "제주도",
    46: "강원도", 47: "전라남도", 48: "대전광역시", 49: "경기도", 50: "강원도",
    51: "경상북도", 52: "강원도", 53: "경상남도", 54: "경상남도", 55: "충청남도",
    56: "강원도", 57: "충청남도", 58: "강원도", 59: "전라남도", 60: "경상북도",
    61: "전라남도", 62: "경상북도", 63: "경기도", 64: "강원도", 65: "강원도",
    66: "충청남도", 67: "충청남도", 68: "경상남도", 69: "전라남도", 70: "경상북도",
    71: "경기도", 72: "충청북도", 73: "충청남도", 74: "경기도", 75: "전라북도",
    76: "경기도", 77: "충청남도", 78: "전라북도", 79: "경상북도", 80: "경기도",
    81: "전라남도", 82: "경상북도", 83: "경기도", 84: "경상북도", 85: "제주도",
    86: "경기도", 87: "경기도", 88: "경상북도", 89: "경기도", 90: "경기도",
    91: "경기도", 92: "전라북도", 93: "경상북도", 94: "전라북도", 95: "경상북도",
    96: "경상북도", 97: "부산광역시", 98: "충청북도", 99: "경상남도", 100: "전라남도",
    101: "전라남도", 102: "경상남도", 103: "충청북도", 104: "충청남도", 105: "경기도",
    106: "경상남도", 107: "강원도", 108: "경기도", 109: "경상북도", 110: "강원도",
    111: "강원도", 112: "전라남도", 113: "경기도", 114: "전라남도", 115: "강원도",
    116: "강원도", 117: "경상남도", 118: "전라남도", 119: "전라북도", 120: "경상남도",
    121: "경상남도", 122: "충청북도", 123: "전라남도", 124: "경상남도", 125: "전라북도",
    126: "전라북도", 127: "충청북도", 128: "서울특별시", 129: "세종특별자치시", 130: "경기도",
    131: "충청북도", 132: "광주광역시", 133: "경상남도", 134: "경기도", 135: "경기도",
    136: "경상남도", 137: "경기도", 138: "전라남도", 139: "전라남도", 140: "충청남도",
    141: "전라북도", 142: "경기도", 143: "경기도", 144: "대구광역시", 145: "경기도",
    146: "강원도", 147: "경상남도", 148: "경기도", 149: "대구광역시", 150: "경기도",
    151: "강원도", 152: "충청남도", 153: "경상남도", 154: "경상남도", 155: "전라북도",
    156: "전라북도", 157: "충청남도", 158: "충청북도", 159: "경상북도", 160: "경상북도",
    161: "전라남도", 162: "경상북도", 163: "경상남도", 164: "전라남도", 165: "전라남도",
    166: "강원도", 167: "인천광역시",
}

REGION_NAME_ALIASES = {
    "강원도": "강원특별자치도",
    "전라북도": "전북특별자치도",
    "제주도": "제주특별자치도",
}


def normalize_region_name(region: str) -> str:
    region = str(region).strip()
    return REGION_NAME_ALIASES.get(region, region)

# 대표 ASOS 지점. 필요하면 같은 시도에 지점을 더 추가해서 평균을 내면 됩니다.
REGION_ASOS_STATIONS = {
    "서울특별시": ["108"],
    "부산광역시": ["159"],
    "대구광역시": ["143"],
    "인천광역시": ["112"],
    "광주광역시": ["156"],
    "대전광역시": ["133"],
    "울산광역시": ["152"],
    "세종특별자치시": ["239"],
    "경기도": ["119"],
    "강원특별자치도": ["101"],
    "충청북도": ["131"],
    "충청남도": ["129"],
    "전북특별자치도": ["146"],
    "전라남도": ["165"],
    "경상북도": ["136"],
    "경상남도": ["155"],
    "제주특별자치도": ["184"],
}

DATA_GO_KR_ASOS_URL = "http://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList"
DATA_KMA_ASOS_URL = "https://data.kma.go.kr/apiData/getData"
RDA_AGRI_WEATHER_URL = (
    "http://apis.data.go.kr/1390802/AgriWeather/WeatherObsrInfo/V3/GnrlWeather"
)

COLUMN_ALIASES = {
    "date": ["date", "일자", "날짜", "tm", "time", "ymd", "base_date"],
    "year": ["year", "연도", "년도"],
    "region": ["region", "시도", "지역", "행정구역", "area", "province"],
    "avg_temp": [
        "avg_temp",
        "평균기온",
        "평균기온(℃)",
        "평균기온(°C)",
        "기온",
        "ta",
        "avgTa",
        "avg_ta",
    ],
    "max_temp": ["max_temp", "최고기온", "최고기온(℃)", "tmax", "maxTa"],
    "min_temp": ["min_temp", "최저기온", "최저기온(℃)", "tmin", "minTa"],
    "precipitation": [
        "precipitation",
        "강수량",
        "강수량(mm)",
        "강수량합",
        "prcp",
        "sumRn",
        "rn",
    ],
    "humidity": ["humidity", "상대습도", "평균습도", "hm", "avgRhm"],
    "solar_radiation": ["solar_radiation", "일사량", "합계일사량", "srqty"],
    "sunshine_hours": ["sunshine_hours", "일조시간", "합계일조시간", "sumSsHr"],
    "wind_speed": ["wind_speed", "풍속", "평균풍속", "ws", "avgWs"],
}


def read_service_key(provider: str) -> str:
    if provider == "data-kma":
        service_key = os.getenv("KMA_DATA_API_KEY") or os.getenv("KMA_SERVICE_KEY")
        key_name = "KMA_DATA_API_KEY"
        portal_name = "기상자료개방포털"
    else:
        service_key = os.getenv("DATA_GO_KR_SERVICE_KEY")
        key_name = "DATA_GO_KR_SERVICE_KEY"
        portal_name = "공공데이터포털"

    if not service_key:
        raise RuntimeError(
            f"{portal_name} 서비스키가 없습니다. "
            f"{key_name} 환경변수에 인증키를 넣어주세요."
        )

    return service_key


def get_json(
    url: str,
    params: dict[str, Any],
    timeout: int = 30,
    max_retries: int = 3,
) -> dict[str, Any]:
    last_response = None

    for attempt in range(1, max_retries + 1):
        response = requests.get(url, params=params, timeout=timeout)
        last_response = response

        if response.status_code in [401, 403, 429, 500, 502, 503, 504]:
            if attempt < max_retries:
                wait_seconds = min(60, 3 ** attempt)
                print(
                    f"API 응답 {response.status_code}. "
                    f"{wait_seconds}초 후 재시도합니다 ({attempt}/{max_retries})."
                )
                time.sleep(wait_seconds)
                continue

            if response.status_code in [401, 403]:
                raise RuntimeError(
                    "인증에 실패했습니다. 지금 사용한 키가 이 API에 승인된 키인지 확인해주세요.\n"
                    "- 공공데이터포털(data.go.kr) 키: --kma-provider data-go-kr, DATA_GO_KR_SERVICE_KEY 사용\n"
                    "- 기상자료개방포털(data.kma.go.kr) 키: --kma-provider data-kma, KMA_DATA_API_KEY 사용\n"
                    f"응답 코드: {response.status_code}\n"
                    f"응답 앞부분: {response.text[:500]}"
                )

        response.raise_for_status()

        try:
            return response.json()
        except ValueError as exc:
            raise RuntimeError(
                f"JSON 응답이 아닙니다. 인증키가 URL 인코딩되어 있거나 XML 오류 응답일 수 있습니다.\n"
                f"응답 앞부분: {response.text[:500]}"
            ) from exc

    raise RuntimeError(f"API 요청에 실패했습니다. 마지막 응답: {last_response}")


def extract_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload

    if isinstance(payload.get("data"), list):
        return payload["data"]

    body = payload.get("response", {}).get("body", {})
    items = body.get("items", {})

    if isinstance(items, dict):
        item = items.get("item", [])
    else:
        item = items

    if isinstance(item, dict):
        return [item]

    if isinstance(item, list):
        return item

    return []


def fetch_kma_asos_daily(
    service_key: str,
    provider: str,
    start_year: int,
    end_year: int,
    sleep_seconds: float,
    max_retries: int,
    allow_missing: bool,
    failed_output_path: Path,
) -> pd.DataFrame:
    rows = []
    failed_rows = []

    for region, station_ids in REGION_ASOS_STATIONS.items():
        for station_id in station_ids:
            for year in range(start_year, end_year + 1):
                if provider == "data-kma":
                    url = DATA_KMA_ASOS_URL
                    params = {
                        "type": "json",
                        "dataCd": "ASOS",
                        "dateCd": "DAY",
                        "startDt": f"{year}0101",
                        "endDt": f"{year}1231",
                        "stnIds": station_id,
                        "schListCnt": 400,
                        "pageIndex": 1,
                        "apiKey": service_key,
                    }
                else:
                    url = DATA_GO_KR_ASOS_URL
                    params = {
                        "serviceKey": service_key,
                        "pageNo": 1,
                        "numOfRows": 400,
                        "dataType": "JSON",
                        "dataCd": "ASOS",
                        "dateCd": "DAY",
                        "startDt": f"{year}0101",
                        "endDt": f"{year}1231",
                        "stnIds": station_id,
                    }

                print(f"ASOS 수집: {region} stn={station_id} year={year}")
                try:
                    payload = get_json(url, params, max_retries=max_retries)
                except Exception as exc:
                    if not allow_missing:
                        raise

                    print(f"ASOS 수집 실패, 건너뜀: {region} stn={station_id} year={year}")
                    print(str(exc)[:500])
                    failed_rows.append(
                        {
                            "year": year,
                            "region": region,
                            "station_id": station_id,
                            "error": str(exc)[:500],
                        }
                    )
                    continue

                items = extract_items(payload)

                for item in items:
                    rows.append(
                        {
                            "year": year,
                            "region": region,
                            "station_id": station_id,
                            "date": item.get("tm"),
                            "avg_temp": item.get("avgTa"),
                            "precipitation": item.get("sumRn"),
                        }
                    )

                if sleep_seconds > 0:
                    time.sleep(sleep_seconds)

    if failed_rows:
        failed_output_path.parent.mkdir(parents=True, exist_ok=True)
        pd.DataFrame(failed_rows).to_csv(
            failed_output_path,
            index=False,
            encoding="utf-8-sig",
        )
        print(f"\nASOS 실패 목록 저장: {failed_output_path} ({len(failed_rows)}건)")

    if not rows:
        raise RuntimeError("ASOS API에서 수집된 데이터가 없습니다.")

    df = pd.DataFrame(rows)
    df["avg_temp"] = pd.to_numeric(df["avg_temp"], errors="coerce")
    df["precipitation"] = pd.to_numeric(df["precipitation"], errors="coerce").fillna(0)

    station_year = (
        df.groupby(["year", "region", "station_id"], as_index=False)
        .agg(avg_temp=("avg_temp", "mean"), precipitation=("precipitation", "sum"))
    )

    return (
        station_year.groupby(["year", "region"], as_index=False)
        .agg(avg_temp=("avg_temp", "mean"), precipitation=("precipitation", "mean"))
        .sort_values(["year", "region"])
    )


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename_map = {}
    normalized = {str(col).strip(): col for col in df.columns}

    for standard_name, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in normalized:
                rename_map[normalized[alias]] = standard_name
                break

    return df.rename(columns=rename_map)


def read_raw_weather_file(path: Path) -> pd.DataFrame:
    if path.suffix.lower() in [".xlsx", ".xls"]:
        try:
            return pd.read_excel(path)
        except ImportError:
            return read_xlsx_without_openpyxl(path)

    for encoding in ["utf-8-sig", "cp949", "euc-kr", "utf-8"]:
        try:
            return pd.read_csv(path, encoding=encoding)
        except UnicodeDecodeError:
            continue

    return pd.read_csv(path)


def read_xlsx_without_openpyxl(path: Path) -> pd.DataFrame:
    ns = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

    with ZipFile(path) as archive:
        shared_strings = []
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))

        for item in shared_root.findall("a:si", ns):
            text = "".join(
                text_node.text or ""
                for text_node in item.findall(".//a:t", ns)
            )
            shared_strings.append(text)

        sheet_root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = []

        for row in sheet_root.findall(".//a:row", ns):
            values = []
            for cell in row.findall("a:c", ns):
                value_node = cell.find("a:v", ns)
                value = "" if value_node is None else value_node.text

                if cell.attrib.get("t") == "s" and value != "":
                    value = shared_strings[int(value)]

                values.append(value)

            rows.append(values)

    if not rows:
        return pd.DataFrame()

    max_len = max(len(row) for row in rows)
    normalized_rows = [row + [""] * (max_len - len(row)) for row in rows]
    return pd.DataFrame(normalized_rows[1:], columns=normalized_rows[0])


def find_admin_region_file(raw_dir: Path) -> Optional[Path]:
    candidates = [
        path
        for path in raw_dir.rglob("*")
        if path.suffix.lower() in [".csv", ".xlsx", ".xls"]
        and any(keyword in path.name.lower() for keyword in ["행정", "admin", "region", "sig", "code"])
        and not path.name.startswith("SQM_")
    ]

    return candidates[0] if candidates else None


def load_admin_region_map(raw_dir: Path) -> pd.DataFrame:
    admin_file = find_admin_region_file(raw_dir)

    if admin_file is None:
        raise FileNotFoundError(
            "농업날씨365 ENS 파일은 1~167 번호 컬럼으로 되어 있어서 행정구역 매핑 파일이 필요합니다.\n"
            "다운로드 화면의 '행정구역 - 167개 행정구역(시군구) 정보' 첨부 파일도 받아서 "
            f"{raw_dir} 안에 넣어주세요."
        )

    print(f"행정구역 매핑 파일 로드: {admin_file}")
    df = normalize_columns(read_raw_weather_file(admin_file))

    if "NAME" in df.columns and "ID" in df.columns:
        pairs = []
        columns = list(df.columns)

        for _, row in df.iterrows():
            for index in range(0, len(columns), 2):
                if index + 1 >= len(columns):
                    continue

                name = row.iloc[index]
                admin_id = row.iloc[index + 1]

                if pd.isna(name) or pd.isna(admin_id):
                    continue

                name = str(name).strip()
                admin_id = str(admin_id).strip()

                if not name or not admin_id:
                    continue

                admin_id = int(float(admin_id))
                pairs.append(
                    {
                        "admin_code": str(admin_id),
                        "region": ADMIN_ID_TO_PROVINCE.get(admin_id),
                    }
                )

        result = pd.DataFrame(pairs).dropna().drop_duplicates()
        result["region"] = result["region"].map(normalize_region_name)

        if len(result) < 167:
            raise ValueError(
                f"행정구역 매핑이 167개보다 적습니다: {len(result)}개. "
                "행정구역 파일 형식을 확인해주세요."
            )

        return result

    code_candidates = ["code", "id", "번호", "no", "No", "NO", "행정구역코드", "sigungu_code"]
    name_candidates = ["region", "행정구역", "시군구", "지역", "name", "Name"]
    province_candidates = ["province", "시도", "광역시도", "sido"]

    code_col = next((col for col in code_candidates if col in df.columns), None)
    name_col = next((col for col in name_candidates if col in df.columns), None)
    province_col = next((col for col in province_candidates if col in df.columns), None)

    if code_col is None:
        first_col = df.columns[0]
        if pd.to_numeric(df[first_col], errors="coerce").notna().any():
            code_col = first_col

    if province_col is None and name_col is not None:
        df["province"] = df[name_col].astype(str).str.split().str[0]
        province_col = "province"

    if code_col is None or province_col is None:
        raise KeyError(
            "행정구역 매핑 파일에서 번호/시도 컬럼을 찾지 못했습니다.\n"
            f"현재 컬럼: {df.columns.tolist()}\n"
            "필요한 형태 예: code,region 또는 번호,시도"
        )

    result = df[[code_col, province_col]].copy()
    result.columns = ["admin_code", "region"]
    result["admin_code"] = result["admin_code"].astype(str).str.strip()
    result["region"] = result["region"].map(normalize_region_name)
    return result.dropna().drop_duplicates()


def prepare_future_ssp_from_sqm(raw_dir: Path, output_path: Path) -> pd.DataFrame:
    pattern = re.compile(
        r"SQM_ENS_(?P<variable>prcp|tmax|tmin|rhum|rsds|wspd)_(?P<scenario>ssp\d{3})_(?P<year>\d{4})\.csv$"
    )

    files_by_key = {}
    for path in raw_dir.rglob("SQM_ENS_*.csv"):
        match = pattern.match(path.name)
        if not match:
            continue

        info = match.groupdict()
        key = (info["scenario"], int(info["year"]))
        files_by_key.setdefault(key, {})[info["variable"]] = path

    target_keys = [
        key
        for key, value in files_by_key.items()
        if key[0] == "ssp245" and "prcp" in value and "tmax" in value and "tmin" in value
    ]

    if not target_keys:
        raise FileNotFoundError(
            "SSP245의 prcp/tmax/tmin 파일 조합을 찾지 못했습니다. "
            "ENS 압축이 제대로 풀렸는지 확인해주세요."
        )

    admin_map = load_admin_region_map(raw_dir)
    frames = []

    for scenario, year in sorted(target_keys):
        variable_frames = []

        for variable, output_column in [
            ("prcp", "precipitation"),
            ("tmax", "max_temp"),
            ("tmin", "min_temp"),
            ("rhum", "humidity"),
            ("rsds", "solar_radiation"),
            ("wspd", "wind_speed"),
        ]:
            path = files_by_key[(scenario, year)].get(variable)
            if path is None:
                continue

            df = read_raw_weather_file(path)
            value_columns = [col for col in df.columns if col != "dates"]
            long_df = df.melt(
                id_vars=["dates"],
                value_vars=value_columns,
                var_name="admin_code",
                value_name=output_column,
            )
            long_df["admin_code"] = long_df["admin_code"].astype(str).str.strip()
            long_df[output_column] = pd.to_numeric(long_df[output_column], errors="coerce")

            if output_column == "precipitation":
                annual = (
                    long_df.groupby("admin_code", as_index=False)[output_column]
                    .sum()
                )
            else:
                annual = (
                    long_df.groupby("admin_code", as_index=False)[output_column]
                    .mean()
                )

            variable_frames.append(annual)

        merged = variable_frames[0]
        for variable_df in variable_frames[1:]:
            merged = pd.merge(merged, variable_df, on="admin_code", how="outer")

        merged = pd.merge(merged, admin_map, on="admin_code", how="left")
        merged["year"] = year
        merged["scenario"] = scenario
        frames.append(merged)

    combined = pd.concat(frames, ignore_index=True)
    combined = combined.dropna(subset=["year", "region", "max_temp", "min_temp", "precipitation"])
    combined["avg_temp"] = (combined["max_temp"] + combined["min_temp"]) / 2

    agg_map = {
        "avg_temp": "mean",
        "precipitation": "mean",
    }
    for column in ["humidity", "solar_radiation", "wind_speed"]:
        if column in combined.columns:
            agg_map[column] = "mean"

    annual = (
        combined.groupby(["year", "region"], as_index=False)
        .agg(agg_map)
        .sort_values(["year", "region"])
    )

    future = annual.merge(pd.DataFrame({"fruit_slug": FRUIT_SLUGS}), how="cross")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    future.to_csv(output_path, index=False, encoding="utf-8-sig")
    return future


def prepare_future_ssp_from_raw(raw_dir: Path, output_path: Path) -> pd.DataFrame:
    files = sorted(
        [
            path
            for path in raw_dir.rglob("*")
            if path.suffix.lower() in [".csv", ".xlsx", ".xls"]
        ]
    )

    if not files:
        raise FileNotFoundError(
            f"SSP 원본 파일이 없습니다: {raw_dir}\n"
            "농업날씨365 또는 기후정보포털에서 미래 기후 CSV/XLSX를 받아 이 폴더에 넣어주세요."
        )

    if any(path.name.startswith("SQM_ENS_") for path in files):
        return prepare_future_ssp_from_sqm(raw_dir, output_path)

    frames = []

    for path in files:
        print(f"SSP 원본 변환: {path}")
        df = normalize_columns(read_raw_weather_file(path))

        if "year" not in df.columns:
            if "date" not in df.columns:
                raise KeyError(f"{path.name}에서 year 또는 date 컬럼을 찾지 못했습니다.")

            df["year"] = pd.to_datetime(df["date"], errors="coerce").dt.year

        if "region" not in df.columns:
            raise KeyError(f"{path.name}에서 region/시도/지역 컬럼을 찾지 못했습니다.")

        if "avg_temp" not in df.columns:
            if "max_temp" in df.columns and "min_temp" in df.columns:
                df["avg_temp"] = (
                    pd.to_numeric(df["max_temp"], errors="coerce")
                    + pd.to_numeric(df["min_temp"], errors="coerce")
                ) / 2
            else:
                raise KeyError(
                    f"{path.name}에서 평균기온 컬럼을 찾지 못했습니다. "
                    "avg_temp 또는 최고/최저기온 컬럼이 필요합니다."
                )

        if "precipitation" not in df.columns:
            raise KeyError(f"{path.name}에서 precipitation/강수량 컬럼을 찾지 못했습니다.")

        keep_columns = ["year", "region", "avg_temp", "precipitation"]
        optional_columns = [
            col
            for col in ["humidity", "solar_radiation", "sunshine_hours", "wind_speed"]
            if col in df.columns
        ]
        frames.append(df[keep_columns + optional_columns].copy())

    combined = pd.concat(frames, ignore_index=True)
    combined["region"] = combined["region"].map(normalize_region_name)

    numeric_columns = [
        col
        for col in combined.columns
        if col not in ["region"]
    ]

    for column in numeric_columns:
        combined[column] = pd.to_numeric(combined[column], errors="coerce")

    combined = combined.dropna(subset=["year", "region", "avg_temp", "precipitation"]).copy()
    combined["year"] = combined["year"].astype(int)

    agg_map = {"avg_temp": "mean", "precipitation": "sum"}
    for column in ["humidity", "solar_radiation", "sunshine_hours", "wind_speed"]:
        if column in combined.columns:
            agg_map[column] = "mean"

    annual = (
        combined.groupby(["year", "region"], as_index=False)
        .agg(agg_map)
        .sort_values(["year", "region"])
    )

    future = annual.merge(pd.DataFrame({"fruit_slug": FRUIT_SLUGS}), how="cross")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    future.to_csv(output_path, index=False, encoding="utf-8-sig")
    return future


def fetch_rda_agri_weather(
    service_key: str,
    station_map_file: Path,
    start_year: int,
    end_year: int,
    output_path: Path,
    sleep_seconds: float,
) -> pd.DataFrame:
    if not station_map_file.exists():
        raise FileNotFoundError(
            f"농진청 관측지점 매핑 파일이 없습니다: {station_map_file}\n"
            "station_code,region 컬럼으로 만들어주세요."
        )

    station_map = pd.read_csv(station_map_file)
    required = {"station_code", "region"}
    missing = required - set(station_map.columns)

    if missing:
        raise KeyError(f"{station_map_file}에 필요한 컬럼이 없습니다: {sorted(missing)}")

    rows = []

    for _, row in station_map.iterrows():
        station_code = str(row["station_code"]).strip()
        region = str(row["region"]).strip()

        for year in range(start_year, end_year + 1):
            params = {
                "serviceKey": service_key,
                "pageNo": 1,
                "numOfRows": 400,
                "dataType": "JSON",
                "stn_Cd": station_code,
                "date": f"{year}",
            }

            print(f"농진청 농업기상 수집: {region} stn={station_code} year={year}")
            payload = get_json(RDA_AGRI_WEATHER_URL, params)

            for item in extract_items(payload):
                max_temp = pd.to_numeric(item.get("hghst_Artmp"), errors="coerce")
                min_temp = pd.to_numeric(item.get("lowst_Artmp"), errors="coerce")
                rows.append(
                    {
                        "year": year,
                        "region": region,
                        "station_code": station_code,
                        "rda_avg_temp": (max_temp + min_temp) / 2,
                        "rda_precipitation": item.get("rn"),
                        "solar_radiation": item.get("srqty"),
                    }
                )

            if sleep_seconds > 0:
                time.sleep(sleep_seconds)

    if not rows:
        raise RuntimeError("농진청 농업기상 API에서 수집된 데이터가 없습니다.")

    df = pd.DataFrame(rows)

    for column in ["rda_avg_temp", "rda_precipitation", "solar_radiation"]:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    annual = (
        df.groupby(["year", "region", "station_code"], as_index=False)
        .agg(
            rda_avg_temp=("rda_avg_temp", "mean"),
            rda_precipitation=("rda_precipitation", "sum"),
            solar_radiation=("solar_radiation", "mean"),
        )
        .groupby(["year", "region"], as_index=False)
        .agg(
            rda_avg_temp=("rda_avg_temp", "mean"),
            rda_precipitation=("rda_precipitation", "mean"),
            solar_radiation=("solar_radiation", "mean"),
        )
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    annual.to_csv(output_path, index=False, encoding="utf-8-sig")
    return annual


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="실제 ASOS/농업기상/SSP 자료를 모델 표준 CSV로 준비합니다."
    )
    parser.add_argument("--start-year", type=int, default=2004)
    parser.add_argument("--end-year", type=int, default=2024)
    parser.add_argument("--data-dir", default=str(DATA_DIR))
    parser.add_argument("--ssp-raw-dir", default=str(RAW_SSP_DIR))
    parser.add_argument(
        "--kma-provider",
        choices=["data-go-kr", "data-kma"],
        default=os.getenv("KMA_PROVIDER", "data-go-kr"),
        help="ASOS 수집 API 출처. data-go-kr=공공데이터포털, data-kma=기상자료개방포털",
    )
    parser.add_argument("--skip-asos", action="store_true")
    parser.add_argument("--skip-ssp", action="store_true")
    parser.add_argument("--fetch-rda", action="store_true")
    parser.add_argument(
        "--rda-station-map",
        default=str(DATA_DIR / "rda_station_region_map.csv"),
        help="농진청 station_code,region 매핑 CSV",
    )
    parser.add_argument("--sleep-seconds", type=float, default=1.0)
    parser.add_argument("--max-retries", type=int, default=7)
    parser.add_argument(
        "--allow-missing-asos",
        action="store_true",
        help="일부 ASOS 연도/지점 수집이 실패해도 실패 목록을 저장하고 계속 진행합니다.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir = Path(args.data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)

    service_key = None

    if not args.skip_asos or args.fetch_rda:
        service_key = read_service_key(args.kma_provider)

    if not args.skip_asos:
        asos = fetch_kma_asos_daily(
            service_key=service_key,
            provider=args.kma_provider,
            start_year=args.start_year,
            end_year=args.end_year,
            sleep_seconds=args.sleep_seconds,
            max_retries=args.max_retries,
            allow_missing=args.allow_missing_asos,
            failed_output_path=data_dir / "kma_past_weather_failed_requests.csv",
        )
        output_path = data_dir / "kma_past_weather.csv"
        asos.to_csv(output_path, index=False, encoding="utf-8-sig")
        print(f"ASOS 과거 기상 저장 완료: {output_path} ({len(asos)}행)")

    if args.fetch_rda:
        rda = fetch_rda_agri_weather(
            service_key=service_key,
            station_map_file=Path(args.rda_station_map),
            start_year=args.start_year,
            end_year=args.end_year,
            output_path=data_dir / "rda_agri_weather_past.csv",
            sleep_seconds=args.sleep_seconds,
        )
        print(f"농진청 농업기상 저장 완료 ({len(rda)}행)")

    if not args.skip_ssp:
        future = prepare_future_ssp_from_raw(
            raw_dir=Path(args.ssp_raw_dir),
            output_path=data_dir / "ssp_future_weather.csv",
        )
        print(f"SSP 미래 기상 저장 완료: {data_dir / 'ssp_future_weather.csv'} ({len(future)}행)")


if __name__ == "__main__":
    main()
