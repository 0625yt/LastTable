package com.lasttable.api.forecast;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

/**
 * 미래 과일 생산량 예측 CSV를 부팅 시 한 번 읽어 메모리에 들고 있는 서비스.
 *
 * <p>학습 데이터: KOSIS 과실생산량(실측) + 기상청 ASOS(과거 기상)<br>
 * 입력 시나리오: SSP 미래 기상 시나리오<br>
 * 모델: baseline 회귀 (자세한 내용은 model/output/future_fruit_production_prediction_report.md 참고)
 *
 * <p>지금은 "읽어오기"만 담당한다. 검색·집계 같은 비즈니스 로직은
 * 추후 별도 메서드로 붙일 예정.
 */
@Service
public class ForecastService {

    private static final Logger log = LoggerFactory.getLogger(ForecastService.class);
    private static final String CSV_PATH = "data/future_fruit_production_predictions_v3.csv";

    /** 전체 행. 부팅 후엔 불변 취급. */
    private List<ForecastRow> rows = Collections.emptyList();

    @PostConstruct
    public void load() {
        ClassPathResource resource = new ClassPathResource(CSV_PATH);
        if (!resource.exists()) {
            log.warn("forecast csv not found: {}", CSV_PATH);
            return;
        }

        List<ForecastRow> parsed = new ArrayList<>();
        try (InputStream in = resource.getInputStream();
             BufferedReader reader = new BufferedReader(
                     new InputStreamReader(in, StandardCharsets.UTF_8))) {

            String header = reader.readLine();
            if (header == null) {
                log.warn("forecast csv is empty");
                return;
            }
            // 헤더 앞에 BOM이 있을 수 있으므로 무시하고 컬럼 순서를 그대로 신뢰한다.
            //
            // 컬럼 순서:
            //   0:year  1:region  2:avg_temp  3:precipitation
            //   4:humidity  5:solar_radiation  6:wind_speed
            //   7:fruit_slug  8:predicted_production_ton

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] f = line.split(",");
                if (f.length < 9) continue;
                try {
                    parsed.add(new ForecastRow(
                            Integer.parseInt(f[0].trim()),
                            f[1].trim(),
                            f[7].trim(),
                            Double.parseDouble(f[8].trim()),
                            Double.parseDouble(f[2].trim()),
                            Double.parseDouble(f[3].trim())
                    ));
                } catch (NumberFormatException ignored) {
                    // 손상된 행은 건너뛰고 계속 진행
                }
            }
        } catch (IOException e) {
            log.error("failed to load forecast csv", e);
            return;
        }

        rows = parsed;
        log.info("forecast csv loaded: {} rows", rows.size());
    }

    /** 전체 행을 그대로 노출 (읽기 전용 용도). */
    public List<ForecastRow> getRows() {
        return Collections.unmodifiableList(rows);
    }

    /**
     * "떠오르는 작물" — 기준연도(base) 대비 목표연도(target)에서
     * 전국 합산 예측 생산량의 증가율이 큰 순으로 정렬.
     *
     * @param baseYear   비교 기준 연도 (예: 2025)
     * @param targetYear 비교 대상 연도 (예: 2050)
     * @param limit      최대 반환 개수 (0 이하면 전체)
     */
    public List<RisingCrop> risingCrops(int baseYear, int targetYear, int limit) {
        Map<String, Double> baseSum = new HashMap<>();
        Map<String, Double> targetSum = new HashMap<>();

        for (ForecastRow r : rows) {
            double v = r.getPredictedProductionTon();
            if (r.getYear() == baseYear) {
                baseSum.merge(r.getFruitSlug(), v, (a, b) -> a.doubleValue() + b.doubleValue());
            } else if (r.getYear() == targetYear) {
                targetSum.merge(r.getFruitSlug(), v, (a, b) -> a.doubleValue() + b.doubleValue());
            }
        }

        List<RisingCrop> out = new ArrayList<>();
        for (Map.Entry<String, Double> e : targetSum.entrySet()) {
            String slug = e.getKey();
            double target = e.getValue();
            double base = baseSum.getOrDefault(slug, 0.0);
            double growthPct = base > 0 ? ((target - base) / base) * 100.0 : 0.0;
            out.add(new RisingCrop(slug, base, target, growthPct));
        }
        out.sort(Comparator.comparingDouble(RisingCrop::getGrowthPct).reversed());
        if (limit > 0 && out.size() > limit) {
            return new ArrayList<>(out.subList(0, limit));
        }
        return out;
    }

    /** 응답 DTO — 단순 holder. */
    public static class RisingCrop {
        private final String fruitSlug;
        private final double baseTon;
        private final double targetTon;
        private final double growthPct;

        public RisingCrop(String fruitSlug, double baseTon, double targetTon, double growthPct) {
            this.fruitSlug = fruitSlug;
            this.baseTon = baseTon;
            this.targetTon = targetTon;
            this.growthPct = growthPct;
        }

        public String getFruitSlug() { return fruitSlug; }
        public double getBaseTon()   { return baseTon; }
        public double getTargetTon() { return targetTon; }
        public double getGrowthPct() { return growthPct; }
    }
}
