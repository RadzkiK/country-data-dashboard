package pl.konrad.dashboard.client

import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class RestCountriesClient {

    private val client = RestClient.builder()
        .baseUrl("https://restcountries.com/v3.1")
        .build()

    fun getCountryByCode(code: String): List<Map<String, Any>> {
        return client.get()
            .uri("/alpha/{code}", code)
            .retrieve()
            .body(List::class.java) as List<Map<String, Any>>
    }
}