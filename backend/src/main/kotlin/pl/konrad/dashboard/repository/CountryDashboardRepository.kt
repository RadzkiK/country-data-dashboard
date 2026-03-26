package pl.konrad.dashboard.repository

import org.springframework.data.mongodb.repository.MongoRepository
import pl.konrad.dashboard.model.CountryDashboard

interface CountryDashboardRepository : MongoRepository<CountryDashboard, String> {
    fun findByCountryCode(countryCode: String): CountryDashboard?
    fun findAllByCountryCodeIn(countryCodes: List<String>): List<CountryDashboard>
}