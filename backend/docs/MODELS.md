# Modele Danych

## Przegląd

Aplikacja używa MongoDB jako bazy danych. Głównym modelem danych jest `CountrySnapshot`, który reprezentuje snapshot danych kraju w określonym momencie czasu.

---

## CountrySnapshot

**Kolekcja MongoDB**: `country_snapshots`

**Opis**: Główny model przechowujący historyczne dane krajów z możliwością śledzenia zmian w czasie.

### Struktura

```kotlin
@Document(collection = "country_snapshots")
@CompoundIndex(name = "country_fetched_idx", def = "{'countryCode': 1, 'fetchedAt': -1}")
data class CountrySnapshot(
    @Id
    val id: String? = null,

    @Indexed
    val countryCode: String,

    val countryName: String,
    val capital: String,
    val region: String?,
    val population: Long?,
    val area: Double?,
    val flagUrl: String?,
    val languages: List<String> = emptyList(),
    val currencies: List<String> = emptyList(),
    val weather: WeatherSnapshot?,
    val indicators: IndicatorSnapshot?,

    @Indexed
    val fetchedAt: Instant,
    val sourceTimestamps: SourceTimestamps?
)
```

### Pola

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `id` | String | Unikalny identyfikator MongoDB | "507f1f77bcf86cd799439011" |
| `countryCode` | String | 2-literowy kod kraju (ISO 3166-1 alpha-2) | "PL" |
| `countryName` | String | Pełna nazwa kraju | "Poland" |
| `capital` | String | Stolica kraju | "Warsaw" |
| `region` | String? | Region/kontynent | "Europe" |
| `population` | Long? | Liczba ludności | 37950802 |
| `area` | Double? | Powierzchnia w km² | 312679.0 |
| `flagUrl` | String? | URL do obrazu flagi | "https://flagcdn.com/w320/pl.png" |
| `languages` | List<String> | Lista języków | ["Polish"] |
| `currencies` | List<String> | Lista walut | ["Polish złoty"] |
| `weather` | WeatherSnapshot? | Dane pogodowe stolicy | (patrz poniżej) |
| `indicators` | IndicatorSnapshot? | Wskaźniki ekonomiczne/społeczne | (patrz poniżej) |
| `fetchedAt` | Instant | Moment pobrania danych | "2026-04-14T20:30:00Z" |
| `sourceTimestamps` | SourceTimestamps? | Znaczniki czasu źródeł | (patrz poniżej) |

### Indeksy

1. **countryCode** (simple index) - szybkie wyszukiwanie po kodzie kraju
2. **fetchedAt** (simple index) - sortowanie chronologiczne
3. **country_fetched_idx** (compound index) - optymalizacja dla zapytań `{countryCode: 1, fetchedAt: -1}`

---

## WeatherSnapshot

**Opis**: Dane pogodowe dla stolicy kraju (z OpenMeteo API).

### Struktura

```kotlin
data class WeatherSnapshot(
    val temperature: Double?,
    val windSpeed: Double?,
    val weatherCode: Int?,
    val observationTime: String?
)
```

### Pola

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `temperature` | Double? | Temperatura w °C | 15.2 |
| `windSpeed` | Double? | Prędkość wiatru w km/h | 12.5 |
| `weatherCode` | Int? | Kod pogody WMO | 3 |
| `observationTime` | String? | Czas obserwacji (ISO 8601) | "2026-04-14T18:00" |

### Weather Codes (WMO)

| Kod | Opis |
|-----|------|
| 0 | Bezchmurnie |
| 1-3 | Częściowo zachmurzenie |
| 45, 48 | Mgła |
| 51-57 | Mżawka |
| 61-67 | Deszcz |
| 71-77 | Śnieg |
| 80-82 | Przelotne opady |
| 95-99 | Burze |

---

## IndicatorSnapshot

**Opis**: Wskaźniki ekonomiczne i społeczne z World Bank API.

### Struktura

```kotlin
data class IndicatorSnapshot(
    val gdpPerCapita: Double?,
    val lifeExpectancy: Double?,
    val co2PerCapita: Double?,
    val year: Int?
)
```

### Pola

| Pole | Typ | Opis | Jednostka | Przykład |
|------|-----|------|-----------|----------|
| `gdpPerCapita` | Double? | PKB per capita | USD | 17840.45 |
| `lifeExpectancy` | Double? | Średnia długość życia | lata | 77.8 |
| `co2PerCapita` | Double? | Emisja CO2 per capita | tony | 8.45 |
| `year` | Int? | Rok danych | - | 2023 |

### Kody Wskaźników World Bank

| Wskaźnik | Kod World Bank | Opis |
|----------|---------------|------|
| GDP per Capita | NY.GDP.PCAP.CD | PKB per capita (USD, current prices) |
| Life Expectancy | SP.DYN.LE00.IN | Oczekiwana długość życia przy urodzeniu |
| CO2 Emissions | EN.ATM.CO2E.PC | Emisja CO2 (tony per capita) |

---

## SourceTimestamps

**Opis**: Znaczniki czasu wskazujące kiedy dane z poszczególnych źródeł zostały pobrane.

### Struktura

```kotlin
data class SourceTimestamps(
    val restCountriesFetchedAt: Instant?,
    val openMeteoFetchedAt: Instant?,
    val worldBankFetchedAt: Instant?
)
```

### Pola

| Pole | Typ | Opis |
|------|-----|------|
| `restCountriesFetchedAt` | Instant? | Czas pobrania z RestCountries API |
| `openMeteoFetchedAt` | Instant? | Czas pobrania z OpenMeteo API |
| `worldBankFetchedAt` | Instant? | Czas pobrania z World Bank API |

---

## CountryDashboard (Legacy)

**Status**: ❌ **Zdeprecjonowany** - nie używany w aktualnej wersji

**Kolekcja MongoDB**: `country_dashboards`

Ten model był używany w poprzedniej wersji aplikacji. Aktualnie wszystkie dane są przechowywane jako `CountrySnapshot`.

---

## Przykłady Dokumentów

### Pełny CountrySnapshot

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "countryCode": "PL",
  "countryName": "Poland",
  "capital": "Warsaw",
  "region": "Europe",
  "population": 37950802,
  "area": 312679.0,
  "flagUrl": "https://flagcdn.com/w320/pl.png",
  "languages": ["Polish"],
  "currencies": ["Polish złoty"],
  "weather": {
    "temperature": 15.2,
    "windSpeed": 12.5,
    "weatherCode": 3,
    "observationTime": "2026-04-14T18:00"
  },
  "indicators": {
    "gdpPerCapita": 17840.45,
    "lifeExpectancy": 77.8,
    "co2PerCapita": 8.45,
    "year": 2023
  },
  "fetchedAt": {
    "$date": "2026-04-14T20:30:00.000Z"
  },
  "sourceTimestamps": {
    "restCountriesFetchedAt": {
      "$date": "2026-04-14T20:30:00.000Z"
    },
    "openMeteoFetchedAt": {
      "$date": "2026-04-14T20:30:05.000Z"
    },
    "worldBankFetchedAt": {
      "$date": "2026-04-14T20:30:10.000Z"
    }
  }
}
```

### CountrySnapshot z brakującymi danymi

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "countryCode": "XX",
  "countryName": "Unknown Country",
  "capital": "Unknown",
  "region": null,
  "population": null,
  "area": null,
  "flagUrl": null,
  "languages": [],
  "currencies": [],
  "weather": null,
  "indicators": null,
  "fetchedAt": {
    "$date": "2026-04-14T20:30:00.000Z"
  },
  "sourceTimestamps": null
}
```

---

## Strategia Przechowywania Danych

### Snapshot-Based Approach

Aplikacja używa podejścia opartego na snapshotach:

1. **Zapis historyczny**: Każde pobranie danych tworzy nowy dokument w bazie
2. **Śledzenie zmian**: Możliwość porównania danych w czasie
3. **Najnowsze dane**: Zapytania używają indeksów do szybkiego pobierania najnowszego snapshota

### Przykładowe Zapytania MongoDB

```javascript
// Pobierz najnowszy snapshot dla Polski
db.country_snapshots.find({ countryCode: "PL" })
  .sort({ fetchedAt: -1 })
  .limit(1)

// Pobierz historię snapshots Polski
db.country_snapshots.find({ countryCode: "PL" })
  .sort({ fetchedAt: -1 })

// Pobierz unikalne kody krajów
db.country_snapshots.aggregate([
  { $group: { _id: "$countryCode" } }
])

// Pobierz kraje z Europy (najnowsze snapshoty)
db.country_snapshots.aggregate([
  { $sort: { fetchedAt: -1 } },
  { $group: {
      _id: "$countryCode",
      latest: { $first: "$$ROOT" }
    }
  },
  { $replaceRoot: { newRoot: "$latest" } },
  { $match: { region: "Europe" } }
])
```

---

## Walidacja Danych

### Wymagane Pola
- `countryCode` - zawsze wymagane (minimum 2 znaki)
- `countryName` - zawsze wymagane
- `fetchedAt` - zawsze wymagane (automatycznie ustawiane)

### Opcjonalne Pola
Wszystkie pozostałe pola są opcjonalne i mogą być `null` jeśli dane nie są dostępne z API zewnętrznych.

### Domyślne Wartości
- `languages`: pusta lista `[]`
- `currencies`: pusta lista `[]`
- `capital`: "Unknown" (jeśli brak danych)
