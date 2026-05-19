package com.lasttable.api.aquaculture;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 수산 양식 관련 HTTP API.
 *
 * 제공하는 URL
 *   GET /api/kosis/aquaculture/production?years=5
 *       → 최근 N년치 시도별 양식 총생산량 (단위: 톤)
 *   GET /api/kosis/aquaculture/production?years=5&region=전라남도
 *       → 특정 시도만 필터
 */
@RestController
@RequestMapping("/api/kosis/aquaculture")
public class AquacultureController {

    private final AquacultureService service;

    public AquacultureController(AquacultureService service) {
        this.service = service;
    }

    @GetMapping("/production")
    public ResponseEntity<List<AquacultureProduction>> production(
            @RequestParam(name = "years",  defaultValue = "5") int years,
            @RequestParam(name = "region", required = false)   String region
    ) {
        // 1) 서비스에서 시도 전체 데이터 가져오기
        List<AquacultureProduction> data = service.getProduction(years);

        // 2) region 파라미터가 있으면 그 시도만 골라내기
        if (region != null && !region.isBlank()) {
            List<AquacultureProduction> filtered = new ArrayList<>();
            for (AquacultureProduction row : data) {
                if (region.equals(row.getRegionName())) {
                    filtered.add(row);
                }
            }
            data = filtered;
        }

        return ResponseEntity.ok(data);
    }
}
