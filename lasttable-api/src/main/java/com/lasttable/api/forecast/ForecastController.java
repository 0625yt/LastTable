package com.lasttable.api.forecast;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 미래 과일 생산량 예측 API.
 *
 * <p>학습된 회귀모델이 SSP 미래 기상 시나리오를 입력받아
 * 2011~2100년까지 시도×작물 단위로 예측한 생산량을 노출한다.
 *
 * <p>제공 URL
 *   GET /api/fruits/rising?base=2025&target=2050&limit=5
 *       → 기준연도 대비 목표연도에서 가장 크게 증가한 작물 TOP N
 */
@RestController
@RequestMapping("/api/fruits")
public class ForecastController {

    private final ForecastService service;

    public ForecastController(ForecastService service) {
        this.service = service;
    }

    @GetMapping("/rising")
    public ResponseEntity<List<ForecastService.RisingCrop>> rising(
            @RequestParam(name = "base", defaultValue = "2025") int baseYear,
            @RequestParam(name = "target", defaultValue = "2050") int targetYear,
            @RequestParam(name = "limit", defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(service.risingCrops(baseYear, targetYear, limit));
    }
}
