package pl.konrad.dashboard.client

import ForecastResponseDto
import GeocodingResponseDto
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class OpenMeteoClient {

    private val geocodingClient = RestClient.builder()
        .baseUrl("https://geocoding-api.open-meteo.com/v1")
        .build()

    private val weatherClient = RestClient.builder()
        .baseUrl("https://api.open-meteo.com/v1")
        .build()

    fun geocode(city: String): GeocodingResponseDto? =
        geocodingClient.get()
            .uri { builder ->
                builder.path("/search")
                    .queryParam("name", city)
                    .queryParam("count", 1)
                    .queryParam("language", "en")
                    .queryParam("format", "json")
                    .build()
            }
            .retrieve()
            .body(GeocodingResponseDto::class.java)

    fun getCurrentWeather(lat: Double, lon: Double): ForecastResponseDto? =
        weatherClient.get()
            .uri { builder ->
                builder.path("/forecast")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("current", "temperature_2m,wind_speed_10m,weather_code")
                    .build()
            }
            .retrieve()
            .body(ForecastResponseDto::class.java)
}