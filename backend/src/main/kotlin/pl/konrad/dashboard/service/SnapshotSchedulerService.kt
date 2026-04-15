package pl.konrad.dashboard.service

import RestCountryDto
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClientResponseException
import pl.konrad.dashboard.client.OpenMeteoClient
import pl.konrad.dashboard.client.RestCountriesClient
import pl.konrad.dashboard.client.WorldBankClient
import pl.konrad.dashboard.model.*
import pl.konrad.dashboard.repository.CountrySnapshotRepository
import org.slf4j.LoggerFactory
import kotlin.time.Clock
import kotlin.time.Instant

@Service
class SnapshotSchedulerService(
    private val countryIngestionService: CountryIngestionService,
    private val repository: CountrySnapshotRepository
) {

    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedRate = 600_000) // 10 minut
    fun fetchSnapshotsPeriodically() {
        log.info("Starting scheduled snapshots refresh")
        countryIngestionService.fetchAllCountriesSnapshots()
        log.info("Finished scheduled snapshots refresh")
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

    fun getHistory(code: String, limit: Int): List<CountrySnapshot> =
        repository.findByCountryCodeOrderByFetchedAtDesc(code.uppercase()).take(limit)
}

@Service
class CountryIngestionService(
    private val restCountriesClient: RestCountriesClient,
    private val openMeteoClient: OpenMeteoClient,
    private val worldBankClient: WorldBankClient,
    private val repository: CountrySnapshotRepository
) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun fetchAllCountriesSnapshots() {
        val fetchedAt = Clock.System.now()
        val countries = restCountriesClient.getAllCountries()

        log.info("Starting full ingestion for {} countries", countries.size)

        countries.forEach { country ->
            runCatching {
                val snapshot = buildSnapshot(country, fetchedAt)
                repository.save(snapshot)
            }.onFailure {
                log.error(
                    "Failed periodic ingestion for country code={} name={}",
                    country.cca2,
                    country.name?.common,
                    it,
                )
            }
        }

        log.info("Finished full ingestion for {} countries", countries.size)
    }

    fun fetchCountrySnapshot(code: String): CountrySnapshot {
        val fetchedAt = Clock.System.now()
        val normalizedCode = code.trim().uppercase()

        log.info("Manual refresh started for country={}", normalizedCode)

        return runCatching {
            val country = tracedCall(normalizedCode, "rest-countries.alpha") {
                restCountriesClient.getCountryByCode(normalizedCode).first() as RestCountryDto
            }

            buildSnapshot(country, fetchedAt)
        }.onSuccess {
            log.info("Manual refresh finished successfully for country={}", normalizedCode)
        }.onFailure {
            log.error("Manual refresh failed for country={}", normalizedCode, it)
        }.getOrThrow()
    }

    fun buildSnapshot(country: RestCountryDto, fetchedAt: Instant): CountrySnapshot {
        val countryCode = country.cca2 ?: "UNKNOWN"
        val capital = country.capital?.firstOrNull().orEmpty()

        val geo = if (capital.isNotBlank()) {
            tracedCall(countryCode, "open-meteo.geocode") {
                openMeteoClient.geocode(capital)?.results?.firstOrNull()
            }
        } else {
            log.info("Skipping geocoding for country={} because capital is blank", countryCode)
            null
        }

        val forecast = if (geo?.latitude != null && geo.longitude != null) {
            tracedCall(countryCode, "open-meteo.forecast") {
                openMeteoClient.getCurrentWeather(geo.latitude, geo.longitude)
            }
        } else null

        val gdp = tracedCall(countryCode, "world-bank.NY.GDP.PCAP.CD") {
            worldBankClient.getLatestIndicatorValue(countryCode, "NY.GDP.PCAP.CD")
        }
        val life = tracedCall(countryCode, "world-bank.SP.DYN.LE00.IN") {
            worldBankClient.getLatestIndicatorValue(countryCode, "SP.DYN.LE00.IN")
        }
        val co2 = tracedCall(countryCode, "world-bank.EN.ATM.CO2E.PC") {
            worldBankClient.getLatestIndicatorValue(countryCode, "EN.ATM.CO2E.PC")
        }

        return CountrySnapshot(
            countryCode = countryCode,
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

    private fun <T> tracedCall(countryCode: String, source: String, block: () -> T): T {
        return try {
            block()
        } catch (ex: RestClientResponseException) {
            val responseBody = ex.responseBodyAsString
                ?.replace("\n", " ")
                ?.take(500)
                ?: "<empty>"

            log.error(
                "External call failed country={} source={} status={} body={}",
                countryCode,
                source,
                ex.statusCode.value(),
                responseBody,
                ex,
            )
            throw ex
        } catch (ex: Exception) {
            log.error(
                "External call failed country={} source={} message={}",
                countryCode,
                source,
                ex.message,
                ex,
            )
            throw ex
        }
    }
}