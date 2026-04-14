package pl.konrad.dashboard.client

import RestCountryDto
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class RestCountriesClient {

    private val client = RestClient.builder()
        .baseUrl("https://restcountries.com/v3.1")
        .build()

    fun getAllCountries(): List<RestCountryDto> {
        return client.get()
            .uri("/all?fields=cca2,cca3,name,capital,region,population,area,flag,languages,currencies")
            .retrieve()
            .body(object : ParameterizedTypeReference<List<RestCountryDto>>() {})
            ?: emptyList()
    }


    fun getCountryByCode(code: String): List<RestCountryDto> {
        return client.get()
            .uri("/alpha/{code}", code)
            .retrieve()
            .body(object : ParameterizedTypeReference<List<RestCountryDto>>() {})
            ?: emptyList()
    }
}