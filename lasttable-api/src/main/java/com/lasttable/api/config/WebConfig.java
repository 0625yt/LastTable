package com.lasttable.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹(브라우저) 설정.
 *
 * - CORS 허용: 프론트엔드(Vite 개발서버 localhost:5173)가
 *   백엔드(Spring localhost:8080) 의 /api/** 를 호출할 수 있게 한다.
 *   브라우저는 기본적으로 다른 포트로의 요청을 차단(같은 출처 정책)하기 때문에
 *   서버에서 "이 출처는 허용한다" 라고 명시해줘야 한다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",   // Vite 기본 포트
                        "http://localhost:3000"    // React 기본 포트(혹시 모를 경우 대비)
                )
                .allowedMethods("GET")
                .allowCredentials(false);
    }
}
