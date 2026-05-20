# Spring Boot 도커 빌드.
# 2단계 빌드 — 1) gradle로 jar 만들고  2) 가벼운 JRE에 복사

# ── 1단계: 빌드 ──
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Gradle wrapper와 의존성 정의를 먼저 복사 → 의존성 캐시 효율
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew

# 의존성 다운로드만 미리 (소스 바뀌어도 이 레이어 재사용)
RUN ./gradlew --no-daemon dependencies || true

# 나머지 소스 복사 후 jar 빌드
COPY src ./src
RUN ./gradlew --no-daemon bootJar -x test

# ── 2단계: 실행 ──
FROM eclipse-temurin:21-jre
WORKDIR /app

# 빌드 결과 jar 한 개만 복사
COPY --from=build /app/build/libs/lasttable-api-*.jar app.jar

# 컨테이너가 노출할 포트 (실제 포트는 Render의 PORT env var 가 결정)
EXPOSE 8080

# Spring Boot 가 server.port=${PORT:8080} 으로 잡혀있어 Render의 PORT 자동 사용
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
