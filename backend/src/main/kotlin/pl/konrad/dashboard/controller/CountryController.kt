package pl.konrad.dashboard.controller

import org.springframework.web.bind.annotation.*
import pl.konrad.dashboard.model.CountryDashboard
import pl.konrad.dashboard.service.CountryAggregationService

@RestController
@RequestMapping("/api/countries")
class CountryController(
    private val service: CountryAggregationService
) {

    @GetMapping
    fun getAll(): List<CountryDashboard> = service.getAll()

    @GetMapping("/{code}")
    fun getOne(@PathVariable code: String): CountryDashboard? = service.getCountry(code)

    @PostMapping("/{code}/refresh")
    fun refresh(@PathVariable code: String): CountryDashboard = service.refreshCountry(code)

    @GetMapping("/compare")
    fun compare(@RequestParam codes: List<String>): List<CountryDashboard> =
        service.compare(codes)
}