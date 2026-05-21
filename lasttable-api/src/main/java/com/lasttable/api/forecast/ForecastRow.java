package com.lasttable.api.forecast;

/**
 * 미래 과일 생산량 예측 한 행.
 * CSV 한 줄을 객체 하나로 본다.
 *
 *  year,region,avg_temp,precipitation,humidity,solar_radiation,wind_speed,
 *  fruit_slug,predicted_production_ton
 */
public class ForecastRow {

    private final int year;
    private final String region;
    private final String fruitSlug;
    private final double predictedProductionTon;
    private final double avgTemp;
    private final double precipitation;

    public ForecastRow(int year, String region, String fruitSlug,
                       double predictedProductionTon,
                       double avgTemp, double precipitation) {
        this.year = year;
        this.region = region;
        this.fruitSlug = fruitSlug;
        this.predictedProductionTon = predictedProductionTon;
        this.avgTemp = avgTemp;
        this.precipitation = precipitation;
    }

    public int    getYear()                   { return year; }
    public String getRegion()                 { return region; }
    public String getFruitSlug()              { return fruitSlug; }
    public double getPredictedProductionTon() { return predictedProductionTon; }
    public double getAvgTemp()                { return avgTemp; }
    public double getPrecipitation()          { return precipitation; }
}
