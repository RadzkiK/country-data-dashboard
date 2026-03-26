data class RestCountryDto(
    val cca2: String?,
    val name: NameDto?,
    val capital: List<String>?,
    val region: String?,
    val population: Long?,
    val area: Double?,
    val flags: FlagsDto?,
    val languages: Map<String, String>?,
    val currencies: Map<String, CurrencyDto>?
)