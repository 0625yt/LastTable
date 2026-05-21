import argparse
import subprocess
import sys
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
DATA_DIR = PROJECT_DIR / "data"
RAW_SSP_DIR = PROJECT_DIR / "raw" / "ssp"
OUTPUT_FILE = PROJECT_DIR / "output" / "future_fruit_production_predictions_v3.csv"


def run(command: list[str]) -> None:
    print("\n실행:", " ".join(command))
    subprocess.run(command, check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="실제 기상 데이터 준비부터 미래 생산량 예측 CSV 생성까지 실행합니다."
    )
    parser.add_argument("--start-year", type=int, default=2004)
    parser.add_argument("--end-year", type=int, default=2024)
    parser.add_argument(
        "--base-url",
        default="http://localhost:8080",
        help="과실 생산량 API 서버 주소",
    )
    parser.add_argument(
        "--skip-collect",
        action="store_true",
        help="이미 model/data/*.csv가 있으면 데이터 수집/변환을 건너뜁니다.",
    )
    parser.add_argument(
        "--skip-asos",
        action="store_true",
        help="ASOS API 수집을 건너뜁니다.",
    )
    parser.add_argument(
        "--kma-provider",
        choices=["data-go-kr", "data-kma"],
        default="data-go-kr",
        help="ASOS 수집 API 출처. data-go-kr=공공데이터포털, data-kma=기상자료개방포털",
    )
    parser.add_argument(
        "--skip-ssp",
        action="store_true",
        help="SSP 원본 파일 변환을 건너뜁니다.",
    )
    parser.add_argument(
        "--fetch-rda",
        action="store_true",
        help="농진청 농업기상 API도 수집합니다. station_code,region 매핑 CSV가 필요합니다.",
    )
    parser.add_argument(
        "--allow-missing-asos",
        action="store_true",
        help="일부 ASOS 요청 실패를 기록하고 계속 진행합니다.",
    )
    parser.add_argument(
        "--rda-station-map",
        default=str(DATA_DIR / "rda_station_region_map.csv"),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    RAW_SSP_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    if not args.skip_collect:
        collect_command = [
            sys.executable,
            str(PROJECT_DIR / "collect_real_weather_data.py"),
            "--start-year",
            str(args.start_year),
            "--end-year",
            str(args.end_year),
            "--data-dir",
            str(DATA_DIR),
            "--ssp-raw-dir",
            str(RAW_SSP_DIR),
            "--kma-provider",
            args.kma_provider,
        ]

        if args.skip_asos:
            collect_command.append("--skip-asos")

        if args.skip_ssp:
            collect_command.append("--skip-ssp")

        if args.fetch_rda:
            collect_command.extend(["--fetch-rda", "--rda-station-map", args.rda_station_map])

        if args.allow_missing_asos:
            collect_command.append("--allow-missing-asos")

        run(collect_command)

    run(
        [
            sys.executable,
            str(PROJECT_DIR / "harvest_predict_model_v3.py"),
            "--base-url",
            args.base_url,
            "--data-dir",
            str(DATA_DIR),
            "--output",
            str(OUTPUT_FILE),
        ]
    )

    print(f"\n최종 예측 CSV 생성 완료: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
