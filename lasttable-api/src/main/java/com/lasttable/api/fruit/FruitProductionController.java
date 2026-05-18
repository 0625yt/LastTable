package com.lasttable.api.fruit;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 과실 생산량 관련 HTTP API 엔드포인트.
 *
 * 제공하는 URL
 *   GET /api/kosis/fruits
 *       → 우리 서비스가 지원하는 과일 목록
 *
 *   GET /api/kosis/fruits/{fruit}/production?years=5
 *       → 특정 과일의 최근 N년치 시도별 생산량
 *       (예) /api/kosis/fruits/apple/production?years=3
 */
@RestController
@RequestMapping("/api/kosis/fruits")
public class FruitProductionController {

    private final FruitProductionService service;

    public FruitProductionController(FruitProductionService service) {
        this.service = service;
    }

    /**
     * 지원하는 과일 목록 응답.
     * 화면에서 드롭다운 만들 때 쓰면 좋다.
     */
    @GetMapping
    public List<FruitItem> list() {
        return Arrays.asList(FruitItem.values());
    }

    /**
     * 특정 과일의 시도별 생산량.
     *
     * @param fruit URL 슬러그 (예: "apple", "mandarin")
     * @param years 최근 몇 년치를 가져올지 (기본 5년)
     */
    @GetMapping("/{fruit}/production")
    public ResponseEntity<List<FruitProduction>> production(
            @PathVariable String fruit,
            @RequestParam(name = "years", defaultValue = "5") int years,
            @RequestParam(name = "region", required = false) String region
    ) {
        // 1) URL 슬러그 → enum 변환. 모르는 과일이면 400.
        FruitItem item = FruitItem.fromSlug(fruit);
        if (item == null) {
            throw new IllegalArgumentException("unknown fruit slug: " + fruit);
        }

        // 2) 서비스에서 시도 전체 데이터 가져오기.
        List<FruitProduction> data = service.getProduction(item, years);

        // 3) region 파라미터가 주어졌다면 그 시도만 골라낸다.
        //    예: region="서울특별시" 이면 서울 행만 남김.
        if (region != null && !region.isBlank()) {

            // 새 결과를 담을 빈 리스트 준비
            List<FruitProduction> filtered = new ArrayList<>();

            // data 리스트를 한 줄씩 돌면서 검사
            for (FruitProduction row : data) {

                // 현재 행의 시도 이름이 사용자가 요청한 값과 같으면 통과
                if (region.equals(row.getRegionName())) {
                    filtered.add(row);
                }
            }

            // 걸러낸 결과로 교체
            data = filtered;
        }

        return ResponseEntity.ok(data);
    }
}
