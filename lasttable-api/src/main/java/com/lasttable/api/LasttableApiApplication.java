package com.lasttable.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Spring Boot 애플리케이션의 시작점(=main 메서드).
 *
 *  - @SpringBootApplication : Spring Boot 자동설정/스캔을 켜는 어노테이션.
 *  - @ConfigurationPropertiesScan : application.yml 값을 자바 클래스로 매핑하는
 *    @ConfigurationProperties 클래스들을 자동으로 등록한다.
 *    (우리는 KosisProperties 에서 이걸 사용한다.)
 */
@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.lasttable.api")
public class LasttableApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LasttableApiApplication.class, args);
    }
}
