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

    fun getLatestIndicatorValue(
        countryCode: String,
        indicator: String
    ): WorldBankIndicatorValue? {

        val response = client.get()
            .uri { builder ->
                builder.path("/country/{countryCode}/indicator/{indicator}")
                    .queryParam("format", "json")
                    .queryParam("per_page", 100) // więcej danych
                    .build(countryCode.lowercase(), indicator)
            }
            .retrieve()
            .body(Any::class.java) ?: return null

        val root = response as? List<*> ?: return null
        val data = root.getOrNull(1) as? List<*> ?: return null

        val firstValid = data.firstOrNull {
            val row = it as? Map<*, *>
            row?.get("value") != null
        } as? Map<*, *>

        val value = (firstValid?.get("value") as? Number)?.toDouble()
        val year = firstValid?.get("date")?.toString()?.toIntOrNull()

        return if (value != null && year != null) {
            WorldBankIndicatorValue(value = value, year = year)
        } else {
            null
        }
    }
}

data class WorldBankIndicatorValue(
    val value: Double?,
    val year: Int?
)