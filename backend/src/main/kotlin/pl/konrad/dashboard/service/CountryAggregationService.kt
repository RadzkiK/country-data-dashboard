package pl.konrad.dashboard.service

import org.springframework.stereotype.Service
import pl.konrad.dashboard.client.OpenMeteoClient
import pl.konrad.dashboard.client.RestCountriesClient
import pl.konrad.dashboard.client.WorldBankClient
import pl.konrad.dashboard.model.*
import pl.konrad.dashboard.repository.CountryDashboardRepository
import java.time.LocalDateTime

@Service
class CountryAggregationService(
    private val restCountriesClient: RestCountriesClient,
    private val openMeteoClient: OpenMeteoClient,
    private val worldBankClient: WorldBankClient,
    private val repository: CountryDashboardRepository
) {

    fun refreshCountry(code: String): CountryDashboard {
        val now = LocalDateTime.now()

        val countryRaw = restCountriesClient.getCountryByCode(code)
        val country = countryRaw.first()

        val name = ((country["name"] as Map<*, *>)["common"] as String)
        val capital = ((country["capital"] as? List<*>)?.firstOrNull() as? String) ?: "Unknown"
        val region = country["region"] as? String
        val population = (country["population"] as? Number)?.toLong()
        val area = (country["area"] as? Number)?.toDouble()

        val flags = country["flags"] as? Map<*, *>
        val flagUrl = flags?.get("png") as? String

        val languages = ((country["languages"] as? Map<*, *>)?.values?.map { it.toString() }) ?: emptyList()
        val currencies = ((country["currencies"] as? Map<*, *>)?.values?.mapNotNull {
            (it as? Map<*, *>)?.get("name")?.toString()
        }) ?: emptyList()

        val geo = openMeteoClient.geocode(capital)?.results?.firstOrNull()
        val weatherResponse = if (geo?.latitude != null && geo.longitude != null) {
            openMeteoClient.getCurrentWeather(geo.latitude, geo.longitude)
        } else null

        val weather = WeatherSnapshot(
            temperature = weatherResponse?.current?.temperature_2m,
            windSpeed = weatherResponse?.current?.wind_speed_10m,
            weatherCode = weatherResponse?.current?.weather_code,
            observationTime = weatherResponse?.current?.time
        )

        val indicators = IndicatorSnapshot(
            gdpPerCapita = extractWorldBankValue(worldBankClient.getIndicator(code, "NY.GDP.PCAP.CD")),
            lifeExpectancy = extractWorldBankValue(worldBankClient.getIndicator(code, "SP.DYN.LE00.IN")),
            co2PerCapita = extractWorldBankValue(worldBankClient.getIndicator(code, "EN.ATM.CO2E.PC")),
            year = extractWorldBankYear(worldBankClient.getIndicator(code, "NY.GDP.PCAP.CD"))
        )

        val dashboard = CountryDashboard(
            countryCode = code.uppercase(),
            name = name,
            capital = capital,
            region = region,
            population = population,
            area = area,
            flagUrl = flagUrl,
            languages = languages,
            currencies = currencies,
            weather = weather,
            indicators = indicators,
            sourceMetadata = SourceMetadata(
                restCountriesFetchedAt = now,
                openMeteoFetchedAt = now,
                worldBankFetchedAt = now
            ),
            lastUpdated = now
        )

        return repository.save(dashboard)
    }

    fun getCountry(code: String): CountryDashboard? =
        repository.findByCountryCode(code.uppercase())

    fun getAll(): List<CountryDashboard> = repository.findAll()

    fun compare(codes: List<String>): List<CountryDashboard> =
        repository.findAllByCountryCodeIn(codes.map { it.uppercase() })

    private fun extractWorldBankValue(response: Any?): Double? {
        val root = response as? List<*> ?: return null
        val data = root.getOrNull(1) as? List<*> ?: return null

        val firstWithValue = data.firstOrNull {
            val row = it as? Map<*, *>
            row?.get("value") != null
        } as? Map<*, *>

        return (firstWithValue?.get("value") as? Number)?.toDouble()
    }

    private fun extractWorldBankYear(response: Any?): Int? {
        val root = response as? List<*> ?: return null
        val data = root.getOrNull(1) as? List<*> ?: return null

        val firstWithValue = data.firstOrNull {
            val row = it as? Map<*, *>
            row?.get("value") != null
        } as? Map<*, *>

        return firstWithValue?.get("date")?.toString()?.toIntOrNull()
    }
}