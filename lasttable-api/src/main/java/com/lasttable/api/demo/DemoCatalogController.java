package com.lasttable.api.demo;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lasttable.api.supabase.SupabaseClient;

/**
 * 데모 카탈로그 — 못난이 마켓 / 환경 기부 / 시연 농가 등
 * Supabase 의 demo_catalog 테이블을 그대로 노출한다.
 *
 * <p>제공 URL
 *   GET /api/demo/{kind}
 *     kind = market | donation | farmer ...
 *   응답 예:
 *     [ { "kind":"market","slug":"apple-uiseong","title":"...", "payload":{...}, ... }, ... ]
 */
@RestController
@RequestMapping("/api/demo")
public class DemoCatalogController {

    private final SupabaseClient supabase;

    public DemoCatalogController(SupabaseClient supabase) {
        this.supabase = supabase;
    }

    @GetMapping("/{kind}")
    public ResponseEntity<List<Map<String, Object>>> byKind(@PathVariable String kind) {
        String query = "kind=eq." + kind + "&visible=eq.true&order=sort_order.asc";
        return ResponseEntity.ok(supabase.select("demo_catalog", query));
    }
}
