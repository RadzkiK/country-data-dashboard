# Dokumentacja API

## Przegląd

Backend udostępnia RESTful API do zarządzania danymi krajów. Wszystkie endpointy zwracają dane w formacie JSON.

**Base URL**: `http://localhost:8080/api`

## Endpointy

### Countries API

#### 1. Pobierz wszystkie kraje (sortowane alfabetycznie)

```http
GET /api/countries
```

**Opis**: Zwraca listę wszystkich krajów z najnowszymi snapshotami, posortowaną alfabetycznie po nazwie kraju.

**Response**:
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
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
    "fetchedAt": "2026-04-14T20:30:00.000000000Z",
    "sourceTimestamps": {
      "restCountriesFetchedAt": "2026-04-14T20:30:00.000000000Z",
      "openMeteoFetchedAt": "2026-04-14T20:30:00.000000000Z",
      "worldBankFetchedAt": "2026-04-14T20:30:00.000000000Z"
    }
  }
]
```

**Status Codes**:
- `200 OK` - Sukces

---

#### 2. Pobierz kraje pogrupowane po regionach

```http
GET /api/countries/grouped
```

**Opis**: Zwraca kraje pogrupowane według regionów (kontynentów), z sortowaniem alfabetycznym w obrębie każdej grupy.

**Response**:
```json
{
  "Africa": [
    {
      "countryCode": "EG",
      "countryName": "Egypt",
      ...
    }
  ],
  "Asia": [
    {
      "countryCode": "CN",
      "countryName": "China",
      ...
    }
  ],
  "Europe": [
    {
      "countryCode": "FR",
      "countryName": "France",
      ...
    },
    {
      "countryCode": "PL",
      "countryName": "Poland",
      ...
    }
  ]
}
```

**Status Codes**:
- `200 OK` - Sukces

---

#### 3. Pobierz pojedynczy kraj

```http
GET /api/countries/{code}
```

**Parametry**:
- `code` (path parameter) - Kod kraju (2-literowy, np. "PL", "DE")

**Przykład**:
```http
GET /api/countries/PL
```

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "countryCode": "PL",
  "countryName": "Poland",
  "capital": "Warsaw",
  ...
}
```

**Status Codes**:
- `200 OK` - Kraj znaleziony
- `404 Not Found` - Kraj nie istnieje w bazie (zwraca `null`)

---

#### 4. Odśwież dane kraju

```http
POST /api/countries/{code}/refresh
```

**Opis**: Wymusza pobranie świeżych danych dla danego kraju ze wszystkich źródeł zewnętrznych i zapisuje nowy snapshot.

**Parametry**:
- `code` (path parameter) - Kod kraju (2-literowy, np. "PL", "DE")

**Przykład**:
```http
POST /api/countries/PL/refresh
```

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439012",
  "countryCode": "PL",
  "countryName": "Poland",
  "fetchedAt": "2026-04-14T20:35:00.000000000Z",
  ...
}
```

**Status Codes**:
- `200 OK` - Dane odświeżone pomyślnie
- `400 Bad Request` - Błąd zwrócony przez zewnętrzne API dla danego kraju lub wskaźnika
- `500 Internal Server Error` - Błąd podczas pobierania danych z API zewnętrznych

**Uwaga**: Ta operacja może potrwać kilka sekund ze względu na wywołania do zewnętrznych API.

### Diagnostyka błędów `400` dla `/refresh`

Backend loguje szczegóły odświeżenia i błędów zewnętrznych źródeł. Dla każdego wywołania zobaczysz:

- start i zakończenie ręcznego odświeżenia,
- kod kraju,
- źródło błędu (`rest-countries.alpha`, `open-meteo.geocode`, `open-meteo.forecast`, `world-bank.<indicator>`),
- kod HTTP oraz skrócone body odpowiedzi z API zewnętrznego.

Przykładowe wpisy w logach:

```text
INFO  ... Manual refresh started for country=PL
ERROR ... External call failed country=PL source=world-bank.NY.GDP.PCAP.CD status=400 body={...}
ERROR ... Manual refresh failed for country=PL
```

Najczęstsza interpretacja: endpoint `/api/countries/{code}/refresh` działa poprawnie, ale konkretne zewnętrzne źródło odrzuca zapytanie dla danego kraju lub wskaźnika.

---

#### 5. Porównaj kraje

```http
GET /api/countries/compare?codes=PL,DE,FR
```

**Parametry**:
- `codes` (query parameter) - Lista kodów krajów oddzielonych przecinkami

**Przykład**:
```http
GET /api/countries/compare?codes=PL,DE,FR,ES
```

**Response**:
```json
[
  {
    "countryCode": "PL",
    "countryName": "Poland",
    ...
  },
  {
    "countryCode": "DE",
    "countryName": "Germany",
    ...
  },
  {
    "countryCode": "FR",
    "countryName": "France",
    ...
  }
]
```

**Status Codes**:
- `200 OK` - Sukces (zwraca tylko znalezione kraje)

**Uwaga**: Jeśli jakiś kraj nie istnieje w bazie, jest pomijany (nie powoduje błędu).

---

### Admin API

#### 6. Załaduj przykładowe dane (seed)

```http
POST /api/admin/seed
```

**Opis**: Ładuje dane dla wybranych krajów (PL, DE, CZ, FR, ES). Używane głównie do inicjalizacji bazy danych.

**Response**:
```json
[
  {
    "countryCode": "PL",
    "countryName": "Poland",
    ...
  },
  {
    "countryCode": "DE",
    "countryName": "Germany",
    ...
  }
]
```

**Status Codes**:
- `200 OK` - Dane załadowane pomyślnie

---

## Automatyczne Zadania

### Okresowe Odświeżanie Danych

Aplikacja automatycznie odświeża dane wszystkich krajów **co 10 minut** (600 000 ms).

**Implementacja**: `SnapshotSchedulerService.fetchSnapshotsPeriodically()`

**Konfiguracja**:
```kotlin
@Scheduled(fixedRate = 600_000) // 10 minut
```

Można zmienić częstotliwość modyfikując wartość `fixedRate` w adnotacji `@Scheduled`.

---

## Obsługa Błędów

### Typowe Kody Błędów

| Kod | Opis |
|-----|------|
| 200 | OK - Operacja zakończona sukcesem |
| 404 | Not Found - Zasób nie znaleziony |
| 500 | Internal Server Error - Błąd serwera (np. problem z API zewnętrznym) |

### Format Błędu

```json
{
  "timestamp": "2026-04-14T20:32:06.379+02:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to fetch data from external API",
  "path": "/api/countries/XX/refresh"
}
```

---

## Przykłady Użycia

### cURL

```bash
# Pobierz wszystkie kraje
curl http://localhost:8080/api/countries

# Pobierz kraje pogrupowane
curl http://localhost:8080/api/countries/grouped

# Pobierz dane Polski
curl http://localhost:8080/api/countries/PL

# Odśwież dane Polski
curl -X POST http://localhost:8080/api/countries/PL/refresh

# Porównaj kraje
curl "http://localhost:8080/api/countries/compare?codes=PL,DE,FR"

# Załaduj przykładowe dane
curl -X POST http://localhost:8080/api/admin/seed
```

### JavaScript (Fetch API)

```javascript
// Pobierz wszystkie kraje
const countries = await fetch('http://localhost:8080/api/countries')
  .then(res => res.json());

// Odśwież dane kraju
const refreshed = await fetch('http://localhost:8080/api/countries/PL/refresh', {
  method: 'POST'
}).then(res => res.json());

// Porównaj kraje
const comparison = await fetch('http://localhost:8080/api/countries/compare?codes=PL,DE,FR')
  .then(res => res.json());
```

---

## Limity i Ograniczenia

1. **Rate Limiting**: Obecnie brak limitów, ale zalecane jest użycie odpowiedzialnego pobierania danych
2. **External API Dependencies**: Dane zależą od dostępności:
   - RestCountries API
   - World Bank API
   - OpenMeteo API
3. **Timeout**: Operacje odświeżania danych mogą trwać 5-10 sekund ze względu na wywołania zewnętrznych API

---

## CORS

Domyślnie CORS nie jest skonfigurowany. Jeśli potrzebujesz dostępu z frontendu na innej domenie, dodaj konfigurację CORS w `WebConfig`.
