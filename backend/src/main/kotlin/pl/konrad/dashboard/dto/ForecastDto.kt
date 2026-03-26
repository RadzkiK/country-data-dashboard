data class ForecastResponseDto(
    val current: CurrentWeatherDto?
)

data class CurrentWeatherDto(
    val time: String?,
    val temperature_2m: Double?,
    val wind_speed_10m: Double?,
    val weather_code: Int?
)