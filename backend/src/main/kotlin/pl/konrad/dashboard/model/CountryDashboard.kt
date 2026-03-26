package pl.konrad.dashboard.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "country_dashboards")
data class CountryDashboard(
    @Id
    val id: String? = null,
    val countryCode: String,
    val name: String,
    val capital: String,
    val region: String?,
    val population: Long?,
    val area: Double?,
    val flagUrl: String?,
    val languages: List<String> = emptyList(),
    val currencies: List<String> = emptyList(),
    val weather: WeatherSnapshot?,
    val indicators: IndicatorSnapshot?,
    val sourceMetadata: SourceMetadata?,
    val lastUpdated: LocalDateTime
)

data class WeatherSnapshot(
    val temperature: Double?,
    val windSpeed: Double?,
    val weatherCode: Int?,
    val observationTime: String?
)

data class IndicatorSnapshot(
    val gdpPerCapita: Double?,
    val lifeExpectancy: Double?,
    val co2PerCapita: Double?,
    val year: Int?
)

data class SourceMetadata(
    val restCountriesFetchedAt: LocalDateTime?,
    val openMeteoFetchedAt: LocalDateTime?,
    val worldBankFetchedAt: LocalDateTime?
)