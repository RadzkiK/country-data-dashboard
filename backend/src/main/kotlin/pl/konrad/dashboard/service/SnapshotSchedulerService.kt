package pl.konrad.dashboard.service

import RestCountryDto
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import pl.konrad.dashboard.client.OpenMeteoClient
import pl.konrad.dashboard.client.RestCountriesClient
import pl.konrad.dashboard.client.WorldBankClient
import pl.konrad.dashboard.model.*
import pl.konrad.dashboard.repository.CountrySnapshotRepository
import kotlin.time.Clock
import kotlin.time.Instant

@Service
class SnapshotSchedulerService(
    private val countryIngestionService: CountryIngestionService,
    private val repository: CountrySnapshotRepository
) {

    @Scheduled(fixedRate = 600_000) // 10 minut
    fun fetchSnapshotsPeriodically() {
        countryIngestionService.fetchAllCountriesSnapshots()
    }

    fun refreshCountry(code: String): CountrySnapshot {
        val snapshot = countryIngestionService.fetchCountrySnapshot(code)
        return repository.save(snapshot)
    }

    fun getCountry(code: String): CountrySnapshot? =
        repository.findTopByCountryCodeOrderByFetchedAtDesc(code.uppercase())

    fun getAll(): List<CountrySnapshot> {
        val distinctCodes = repository.findDistinctCountryCodes()
        return distinctCodes.mapNotNull { code ->
            repository.findTopByCountryCodeOrderByFetchedAtDesc(code)
        }.sortedBy { it.countryName }
    }

    fun getAllGroupedByRegion(): Map<String, List<CountrySnapshot>> {
        val distinctCodes = repository.findDistinctCountryCodes()
        val snapshots = distinctCodes.mapNotNull { code ->
            repository.findTopByCountryCodeOrderByFetchedAtDesc(code)
        }
        return snapshots
            .groupBy { it.region ?: "Unknown" }
            .mapValues { it.value.sortedBy { snapshot -> snapshot.countryName } }
            .toSortedMap()
    }

    fun compare(codes: List<String>): List<CountrySnapshot> =
        codes.mapNotNull { code ->
            repository.findTopByCountryCodeOrderByFetchedAtDesc(code.uppercase())
        }
}

@Service
class CountryIngestionService(
    private val restCountriesClient: RestCountriesClient,
    private val openMeteoClient: OpenMeteoClient,
    private val worldBankClient: WorldBankClient,
    private val repository: CountrySnapshotRepository
) {

    fun fetchAllCountriesSnapshots() {
        val fetchedAt = Clock.System.now()
        val countries = restCountriesClient.getAllCountries()

        countries.forEach { country ->
            runCatching {
                val snapshot = buildSnapshot(country, fetchedAt)
                repository.save(snapshot)
            }.onFailure {
                println("Failed for country ${country.cca2}: ${it.message}")
            }
        }
    }

    fun fetchCountrySnapshot(code: String): CountrySnapshot {
        val fetchedAt = Clock.System.now()
        val country = restCountriesClient.getCountryByCode(code).first() as RestCountryDto
        return buildSnapshot(country, fetchedAt)
    }

    fun buildSnapshot(country: RestCountryDto, fetchedAt: Instant): CountrySnapshot {
        val capital = country.capital?.firstOrNull().orEmpty()

        val geo = if (capital.isNotBlank()) openMeteoClient.geocode(capital)?.results?.firstOrNull() else null
        val forecast = if (geo?.latitude != null && geo.longitude != null) {
            openMeteoClient.getCurrentWeather(geo.latitude, geo.longitude)
        } else null

        val gdp = worldBankClient.getLatestIndicatorValue(country.cca2 ?: "", "NY.GDP.PCAP.CD")
        val life = worldBankClient.getLatestIndicatorValue(country.cca2 ?: "", "SP.DYN.LE00.IN")
        val co2 = worldBankClient.getLatestIndicatorValue(country.cca2 ?: "", "EN.ATM.CO2E.PC")

        return CountrySnapshot(
            countryCode = country.cca2 ?: "UNKNOWN",
            countryName = country.name?.common ?: "Unknown",
            capital = capital,
            region = country.region,
            population = country.population,
            area = country.area,
            flagUrl = country.flags?.png ?: country.flags?.svg,
            languages = country.languages?.values?.toList() ?: emptyList(),
            currencies = country.currencies?.values?.mapNotNull { it.name } ?: emptyList(),
            weather = WeatherSnapshot(
                temperature = forecast?.current?.temperature_2m,
                windSpeed = forecast?.current?.wind_speed_10m,
                weatherCode = forecast?.current?.weather_code,
                observationTime = forecast?.current?.time
            ),
            indicators = IndicatorSnapshot(
                gdpPerCapita = gdp?.value,
                lifeExpectancy = life?.value,
                co2PerCapita = co2?.value,
                year = gdp?.year ?: life?.year ?: co2?.year
            ),
            fetchedAt = fetchedAt,
            sourceTimestamps = SourceTimestamps(
                restCountriesFetchedAt = fetchedAt,
                openMeteoFetchedAt = fetchedAt,
                worldBankFetchedAt = fetchedAt
            )
        )
    }
}