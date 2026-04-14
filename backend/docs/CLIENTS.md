# Klienci Zewnętrznych API

## Przegląd

Aplikacja integruje się z trzema zewnętrznymi API aby agregować kompleksowe dane o krajach:

1. **RestCountries API** - podstawowe informacje o krajach
2. **World Bank API** - wskaźniki ekonomiczne i społeczne
3. **OpenMeteo API** - dane pogodowe

---

## RestCountriesClient

**Źródło**: [RestCountries API](https://restcountries.com)
**Base URL**: `https://restcountries.com/v3.1`

### Opis

Główne źródło danych geograficznych i demograficznych o krajach.

### Metody

#### getAllCountries()

Pobiera listę wszystkich krajów ze świata.

**Endpoint**: `GET /all?fields=cca2,cca3,name,capital,region,population,area,flag,languages,currencies`

**Zwraca**: `List<RestCountryDto>`

**Przykładowy request**:
```http
GET https://restcountries.com/v3.1/all?fields=cca2,cca3,name,capital,region,population,area,flag,languages,currencies
```

**Parametry zapytania**:
- `fields` - ogranicza zwracane pola (optymalizacja)

**Użycie**:
```kotlin
val countries = restCountriesClient.getAllCountries()
// Zwraca listę ~250 krajów
```

---

#### getCountryByCode(code: String)

Pobiera szczegóły pojedynczego kraju po jego kodzie.

**Endpoint**: `GET /alpha/{code}`

**Zwraca**: `List<RestCountryDto>` (zwykle 1-elementowa lista)

**Parametry**:
- `code` - 2-literowy kod kraju (ISO 3166-1 alpha-2), np. "PL", "DE"

**Przykładowy request**:
```http
GET https://restcountries.com/v3.1/alpha/PL
```

**Użycie**:
```kotlin
val countries = restCountriesClient.getCountryByCode("PL")
val poland = countries.first()
```

---

### RestCountryDto

Struktura danych zwracana z RestCountries API:

```kotlin
data class RestCountryDto(
    val cca2: String?,           // "PL"
    val cca3: String?,           // "POL"
    val name: NameDto?,
    val capital: List<String>?,  // ["Warsaw"]
    val region: String?,         // "Europe"
    val population: Long?,       // 37950802
    val area: Double?,           // 312679.0
    val flags: FlagsDto?,
    val languages: Map<String, String>?,  // {"pol": "Polish"}
    val currencies: Map<String, CurrencyDto>?
)

data class NameDto(
    val common: String?,   // "Poland"
    val official: String?  // "Republic of Poland"
)

data class FlagsDto(
    val png: String?,  // "https://flagcdn.com/w320/pl.png"
    val svg: String?   // "https://flagcdn.com/pl.svg"
)

data class CurrencyDto(
    val name: String?,    // "Polish złoty"
    val symbol: String?   // "zł"
)
```

---

### Limity i Ograniczenia

- **Rate Limiting**: Brak oficjalnych limitów, ale zalecane rozsądne użytkowanie
- **Dostępność**: 99.9% uptime
- **Cache**: Dane są stosunkowo statyczne, można cache'ować przez długi czas
- **Błędy**: Zwraca 404 dla nieistniejących kodów krajów

---

## WorldBankClient

**Źródło**: [World Bank Data API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392)
**Base URL**: `https://api.worldbank.org/v2`

### Opis

Dostarcza wskaźniki ekonomiczne, społeczne i środowiskowe dla wszystkich krajów świata.

### Metody

#### getIndicator(countryCode: String, indicator: String)

Pobiera surowe dane wskaźnika dla danego kraju.

**Endpoint**: `GET /country/{countryCode}/indicator/{indicator}?format=json`

**Zwraca**: `Any?` (surowe dane JSON)

**Parametry**:
- `countryCode` - 2-literowy kod kraju (lowercase)
- `indicator` - kod wskaźnika World Bank

**Przykładowy request**:
```http
GET https://api.worldbank.org/v2/country/pl/indicator/NY.GDP.PCAP.CD?format=json
```

**Użycie**:
```kotlin
val gdpData = worldBankClient.getIndicator("PL", "NY.GDP.PCAP.CD")
```

---

#### getLatestIndicatorValue(countryCode: String, indicator: String)

Pobiera najnowszą dostępną wartość wskaźnika dla kraju.

**Endpoint**: `GET /country/{countryCode}/indicator/{indicator}?format=json&per_page=100`

**Zwraca**: `WorldBankIndicatorValue?` - obiekt z wartością i rokiem

**Parametry**:
- `countryCode` - 2-literowy kod kraju (lowercase)
- `indicator` - kod wskaźnika World Bank

**Przykładowy request**:
```http
GET https://api.worldbank.org/v2/country/pl/indicator/NY.GDP.PCAP.CD?format=json&per_page=100
```

**Użycie**:
```kotlin
val gdp = worldBankClient.getLatestIndicatorValue("PL", "NY.GDP.PCAP.CD")
println("GDP per capita: ${gdp?.value} USD (${gdp?.year})")
// Output: GDP per capita: 17840.45 USD (2023)
```

---

### WorldBankIndicatorValue

```kotlin
data class WorldBankIndicatorValue(
    val value: Double?,  // Wartość wskaźnika
    val year: Int?       // Rok danych
)
```

---

### Wspierane Wskaźniki

Aplikacja używa następujących wskaźników:

| Wskaźnik | Kod | Opis | Jednostka |
|----------|-----|------|-----------|
| **GDP per Capita** | `NY.GDP.PCAP.CD` | PKB per capita (current USD) | USD |
| **Life Expectancy** | `SP.DYN.LE00.IN` | Oczekiwana długość życia przy urodzeniu | lata |
| **CO2 Emissions** | `EN.ATM.CO2E.PC` | Emisja CO2 per capita | tony metryczne |

### Inne Przydatne Wskaźniki

Można łatwo dodać wsparcie dla innych wskaźników:

| Kod | Opis |
|-----|------|
| `SP.POP.TOTL` | Całkowita populacja |
| `NY.GDP.MKTP.CD` | PKB (całkowity) |
| `SE.ADT.LITR.ZS` | Wskaźnik alfabetyzacji |
| `SH.XPD.CHEX.PC.CD` | Wydatki na zdrowie per capita |
| `SE.XPD.TOTL.GD.ZS` | Wydatki na edukację (% PKB) |
| `EG.USE.ELEC.KH.PC` | Zużycie energii elektrycznej per capita |

---

### Format Odpowiedzi World Bank API

```json
[
  {
    "page": 1,
    "pages": 1,
    "per_page": 100,
    "total": 63
  },
  [
    {
      "indicator": {
        "id": "NY.GDP.PCAP.CD",
        "value": "GDP per capita (current US$)"
      },
      "country": {
        "id": "PL",
        "value": "Poland"
      },
      "countryiso3code": "POL",
      "date": "2023",
      "value": 17840.45,
      "unit": "",
      "obs_status": "",
      "decimal": 2
    },
    {
      "date": "2022",
      "value": 17200.12,
      ...
    }
  ]
]
```

**Uwaga**: API zwraca tablicę gdzie:
- Element `[0]` = metadane
- Element `[1]` = dane (posortowane od najnowszych)

---

### Limity i Ograniczenia

- **Rate Limiting**: Brak oficjalnych limitów
- **Opóźnienie danych**: Dane zazwyczaj dostępne z opóźnieniem 1-2 lat
- **Brakujące dane**: Nie wszystkie kraje mają dane dla wszystkich wskaźników
- **Format**: Wymaga parsowania zagnieżdżonej struktury JSON

---

## OpenMeteoClient

**Źródło**: [Open-Meteo API](https://open-meteo.com)
**Geocoding Base URL**: `https://geocoding-api.open-meteo.com/v1`
**Weather Base URL**: `https://api.open-meteo.com/v1`

### Opis

Dostarcza darmowe dane pogodowe bez wymagania klucza API. Składa się z dwóch części:
1. Geocoding API - konwersja nazwy miasta na współrzędne
2. Weather API - dane pogodowe dla współrzędnych

### Metody

#### geocode(city: String)

Konwertuje nazwę miasta na współrzędne geograficzne.

**Endpoint**: `GET /search?name={city}&count=1&language=en&format=json`

**Zwraca**: `GeocodingResponseDto?`

**Parametry**:
- `city` - nazwa miasta do wyszukania
- `count` - liczba wyników (domyślnie 1)
- `language` - język wyników (en)
- `format` - format odpowiedzi (json)

**Przykładowy request**:
```http
GET https://geocoding-api.open-meteo.com/v1/search?name=Warsaw&count=1&language=en&format=json
```

**Użycie**:
```kotlin
val geo = openMeteoClient.geocode("Warsaw")
println("Lat: ${geo?.results?.firstOrNull()?.latitude}")
println("Lon: ${geo?.results?.firstOrNull()?.longitude}")
// Output: Lat: 52.2298, Lon: 21.0118
```

---

#### getCurrentWeather(lat: Double, lon: Double)

Pobiera aktualne dane pogodowe dla podanych współrzędnych.

**Endpoint**: `GET /forecast?latitude={lat}&longitude={lon}&current=temperature_2m,wind_speed_10m,weather_code`

**Zwraca**: `ForecastResponseDto?`

**Parametry**:
- `lat` - szerokość geograficzna
- `lon` - długość geograficzna
- `current` - lista żądanych parametrów pogodowych

**Przykładowy request**:
```http
GET https://api.open-meteo.com/v1/forecast?latitude=52.23&longitude=21.01&current=temperature_2m,wind_speed_10m,weather_code
```

**Użycie**:
```kotlin
val weather = openMeteoClient.getCurrentWeather(52.2298, 21.0118)
println("Temp: ${weather?.current?.temperature_2m}°C")
println("Wind: ${weather?.current?.wind_speed_10m} km/h")
// Output: Temp: 15.2°C, Wind: 12.5 km/h
```

---

### GeocodingResponseDto

```kotlin
data class GeocodingResponseDto(
    val results: List<GeocodingResult>?
)

data class GeocodingResult(
    val latitude: Double?,   // 52.2298
    val longitude: Double?,  // 21.0118
    val name: String?,       // "Warsaw"
    val country: String?,    // "Poland"
    val admin1: String?      // Region/województwo
)
```

---

### ForecastResponseDto

```kotlin
data class ForecastResponseDto(
    val current: CurrentWeather?
)

data class CurrentWeather(
    val temperature_2m: Double?,    // 15.2 (°C)
    val wind_speed_10m: Double?,    // 12.5 (km/h)
    val weather_code: Int?,         // 3 (WMO code)
    val time: String?               // "2026-04-14T18:00"
)
```

---

### Weather Codes (WMO)

Open-Meteo używa standardowych kodów WMO:

| Kod | Opis | Ikona |
|-----|------|-------|
| 0 | Bezchmurnie | ☀️ |
| 1-3 | Częściowo zachmurzenie | ⛅ |
| 45, 48 | Mgła | 🌫️ |
| 51-55 | Mżawka | 🌦️ |
| 61-65 | Deszcz | 🌧️ |
| 71-75 | Śnieg | 🌨️ |
| 80-82 | Przelotne opady | 🌦️ |
| 95-99 | Burze | ⛈️ |

---

### Limity i Ograniczenia

- **Rate Limiting**: 10,000 zapytań/dzień dla darmowego użytkowania
- **Brak klucza API**: Nie wymaga rejestracji
- **Dokładność**: Dane z modeli pogodowych, aktualizowane co godzinę
- **Geocoding**: Może nie znaleźć wszystkich miast (szczególnie małych)

---

## Obsługa Błędów

### Strategia Retry

Aplikacja **nie implementuje** automatycznego ponawiania prób. W przypadku błędu:
- Metody zwracają `null`
- Logi zawierają informację o błędzie
- Frontend otrzymuje częściowe dane (z polami null)

### Typowe Błędy

#### RestCountries API
```kotlin
try {
    val country = restCountriesClient.getCountryByCode("XX")
} catch (e: Exception) {
    // 404 - kraj nie istnieje
    // 500 - problem z API
}
```

#### World Bank API
```kotlin
val indicator = worldBankClient.getLatestIndicatorValue("XX", "NY.GDP.PCAP.CD")
// Zwraca null jeśli:
// - kraj nie istnieje
// - brak danych dla wskaźnika
// - problem z API
```

#### OpenMeteo API
```kotlin
val geo = openMeteoClient.geocode("NonExistentCity123")
// geo?.results będzie null lub puste
```

---

## Optymalizacja Wywołań

### Batch Processing

`CountryIngestionService.fetchAllCountriesSnapshots()` pobiera wszystkie kraje sekwencyjnie:

```kotlin
countries.forEach { country ->
    runCatching {
        val snapshot = buildSnapshot(country, fetchedAt)
        repository.save(snapshot)
    }.onFailure {
        println("Failed for country ${country.cca2}: ${it.message}")
    }
}
```

**Optymalizacja**: Błędy dla pojedynczych krajów nie przerywają całego procesu.

### Caching

**Obecny stan**: Brak cache'owania

**Możliwe ulepszenia**:
- Cache dla RestCountries (dane statyczne, ważne przez dni/tygodnie)
- Cache dla World Bank (dane ważne przez miesiące)
- Krótki cache dla OpenMeteo (5-15 minut)

```kotlin
// Przykład z Spring Cache
@Cacheable("countries", key = "#code")
fun getCountryByCode(code: String): List<RestCountryDto> { ... }
```

---

## Monitoring i Diagnostyka

### Przykładowe Logi

```
2026-04-14 20:30:00 INFO  Fetching all countries from RestCountries API
2026-04-14 20:30:02 INFO  Found 250 countries
2026-04-14 20:30:05 ERROR Failed for country XX: Connection timeout
2026-04-14 20:35:00 INFO  Successfully saved 249 snapshots
```

### Health Checks

Można dodać health check endpoints dla każdego klienta:

```kotlin
@GetMapping("/actuator/health/restcountries")
fun checkRestCountries(): HealthStatus {
    return try {
        restCountriesClient.getCountryByCode("PL")
        HealthStatus(status = "UP")
    } catch (e: Exception) {
        HealthStatus(status = "DOWN", error = e.message)
    }
}
```
