package pl.konrad.dashboard.repository

import org.springframework.data.mongodb.repository.Aggregation
import org.springframework.data.mongodb.repository.MongoRepository
import pl.konrad.dashboard.model.CountrySnapshot
import kotlin.time.Instant

interface CountrySnapshotRepository : MongoRepository<CountrySnapshot, String> {

    fun findTopByCountryCodeOrderByFetchedAtDesc(countryCode: String): CountrySnapshot?

    fun findByCountryCodeOrderByFetchedAtDesc(countryCode: String): List<CountrySnapshot>

    fun findByCountryCodeAndFetchedAtBetweenOrderByFetchedAtAsc(
        countryCode: String,
        from: Instant,
        to: Instant
    ): List<CountrySnapshot>

    fun findByCountryCodeInAndFetchedAtBetween(
        countryCodes: List<String>,
        from: Instant,
        to: Instant
    ): List<CountrySnapshot>

    @Aggregation(pipeline = [
        "{ '\$group': { '_id': '\$countryCode' } }"
    ])
    fun findDistinctCountryCodes(): List<String>
}