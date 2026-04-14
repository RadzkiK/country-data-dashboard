package pl.konrad.dashboard.controller

import org.springframework.web.bind.annotation.*
import pl.konrad.dashboard.model.CountrySnapshot
import pl.konrad.dashboard.service.SnapshotSchedulerService

@RestController
@RequestMapping("/api/countries")
class CountryController(
    private val service: SnapshotSchedulerService
) {

    @GetMapping
    fun getAll(): List<CountrySnapshot> = service.getAll()

    @GetMapping("/grouped")
    fun getAllGroupedByRegion(): Map<String, List<CountrySnapshot>> = service.getAllGroupedByRegion()

    @GetMapping("/{code}")
    fun getOne(@PathVariable code: String): CountrySnapshot? = service.getCountry(code)

    @PostMapping("/{code}/refresh")
    fun refresh(@PathVariable code: String): CountrySnapshot = service.refreshCountry(code)

    @GetMapping("/compare")
    fun compare(@RequestParam codes: List<String>): List<CountrySnapshot> =
        service.compare(codes)

    @GetMapping("/{code}/history")
    fun getHistory(
        @PathVariable code: String,
        @RequestParam(defaultValue = "20") limit: Int
    ): List<CountrySnapshot> = service.getHistory(code, limit)
}