package pl.konrad.dashboard.controller

import org.springframework.web.bind.annotation.*
import pl.konrad.dashboard.model.CountryDashboard
import pl.konrad.dashboard.service.CountryAggregationService

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val service: CountryAggregationService
) {
    @PostMapping("/seed")
    fun seed(): List<CountryDashboard> {
        val codes = listOf("PL", "DE", "CZ", "FR", "ES")
        return codes.map { service.refreshCountry(it) }
    }
}