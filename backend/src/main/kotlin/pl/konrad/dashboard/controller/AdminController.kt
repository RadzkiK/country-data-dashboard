package pl.konrad.dashboard.controller

import org.springframework.web.bind.annotation.*
import pl.konrad.dashboard.model.CountrySnapshot
import pl.konrad.dashboard.service.SnapshotSchedulerService

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val service: SnapshotSchedulerService
) {
    @PostMapping("/seed")
    fun seed(): List<CountrySnapshot> {
        val codes = listOf("PL", "DE", "CZ", "FR", "ES")
        return codes.map { service.refreshCountry(it) }
    }
}