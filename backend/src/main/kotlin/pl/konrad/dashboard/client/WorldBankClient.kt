package pl.konrad.dashboard.client

import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class WorldBankClient {

    private val client = RestClient.builder()
        .baseUrl("https://api.worldbank.org/v2")
        .build()

    fun getIndicator(countryCode: String, indicator: String): Any? {
        return client.get()
            .uri { builder ->
                builder.path("/country/{countryCode}/indicator/{indicator}")
                    .queryParam("format", "json")
                    .build(countryCode.lowercase(), indicator)
            }
            .retrieve()
            .body(Any::class.java)
    }
}