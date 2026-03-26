data class GeocodingResponseDto(
    val results: List<GeocodingResultDto>?
)

data class GeocodingResultDto(
    val name: String?,
    val latitude: Double?,
    val longitude: Double?
)