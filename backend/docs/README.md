# Dokumentacja Techniczna - Country Data Dashboard Backend

## Spis Treści
1. [Przegląd Systemu](#przegląd-systemu)
2. [Technologie](#technologie)
3. [Architektura](#architektura)
4. [Instalacja i Uruchomienie](#instalacja-i-uruchomienie)
5. [Dokumentacja API](./API.md)
6. [Modele Danych](./MODELS.md)
7. [Klienci Zewnętrzni](./CLIENTS.md)

## Przegląd Systemu

Country Data Dashboard Backend to aplikacja Spring Boot napisana w Kotlinie, która agreguje dane o krajach z różnych źródeł zewnętrznych i udostępnia je przez REST API.

### Główne Funkcjonalności

- **Agregacja danych**: Pobieranie danych o krajach z wielu źródeł (RestCountries, World Bank, OpenMeteo)
- **Snapshoty czasowe**: Przechowywanie historycznych snapshots danych krajów z znacznikami czasu
- **Automatyczna synchronizacja**: Okresowe odświeżanie danych (co 10 minut)
- **REST API**: Udostępnianie danych przez RESTful endpoints
- **Porównywanie krajów**: Możliwość porównania wielu krajów jednocześnie

## Technologie

### Framework i Język
- **Kotlin** 2.3.20
- **Spring Boot** 4.1.0-M3
- **Java** 21

### Główne Zależności
- **Spring Data MongoDB** - persystencja danych
- **Spring Web MVC** - REST API
- **Spring Boot DevTools** - wsparcie deweloperskie
- **Jackson Kotlin Module** - serializacja JSON
- **Spring Validation** - walidacja danych

### Baza Danych
- **MongoDB** - NoSQL database dla przechowywania snapshots krajów

## Architektura

Aplikacja wykorzystuje architekturę warstwową:

```
┌─────────────────────────────────────┐
│         Controllers Layer           │  ← REST API Endpoints
├─────────────────────────────────────┤
│          Services Layer             │  ← Business Logic
├─────────────────────────────────────┤
│        Repositories Layer           │  ← Data Access
├─────────────────────────────────────┤
│          Clients Layer              │  ← External APIs
└─────────────────────────────────────┘
```

### Struktura Pakietów

```
pl.konrad.dashboard/
├── controller/          # REST Controllers
│   ├── CountryController.kt
│   └── AdminController.kt
├── service/            # Business Logic
│   └── SnapshotSchedulerService.kt
├── repository/         # Data Access Layer
│   └── CountrySnapshotRepository.kt
├── client/            # External API Clients
│   ├── RestCountriesClient.kt
│   ├── WorldBankClient.kt
│   └── OpenMeteoClient.kt
├── model/             # Data Models
│   └── CountryDashboard.kt
└── BackendApplication.kt
```

## Instalacja i Uruchomienie

### Wymagania
- Java 21
- MongoDB (uruchomiony lokalnie lub zdalnie)
- Gradle (wrapper included)

### Konfiguracja

1. **MongoDB**: Skonfiguruj connection string w `application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/country_dashboard
```

2. **Build projektu**:
```bash
./gradlew build
```

3. **Uruchomienie aplikacji**:
```bash
./gradlew bootRun
```

Aplikacja będzie dostępna pod adresem: `http://localhost:8080`

### Inicjalizacja Danych

Po uruchomieniu aplikacji, załaduj przykładowe dane:
```bash
POST http://localhost:8080/api/admin/seed
```

## Przepływ Danych

### 1. Automatyczne Odświeżanie (co 10 minut)
```
SnapshotSchedulerService (scheduler)
    ↓
fetchAllCountriesSnapshots()
    ↓
RestCountriesClient.getAllCountries()
    ↓
Dla każdego kraju:
    ↓
buildSnapshot() → pobiera dane z OpenMeteo + WorldBank
    ↓
Zapis do MongoDB (country_snapshots)
```

### 2. Ręczne Odświeżanie Pojedynczego Kraju
```
POST /api/countries/{code}/refresh
    ↓
SnapshotSchedulerService.refreshCountry()
    ↓
fetchCountrySnapshot(code)
    ↓
Pobieranie z RestCountries + OpenMeteo + WorldBank
    ↓
Zapis nowego snapshot do MongoDB
```

### 3. Pobieranie Aktualnych Danych
```
GET /api/countries
    ↓
SnapshotSchedulerService.getAll()
    ↓
1. Pobranie unikalnych kodów krajów (MongoDB aggregation)
2. Dla każdego kodu: pobranie najnowszego snapshot
3. Sortowanie alfabetyczne po nazwie kraju
    ↓
Zwrócenie listy CountrySnapshot
```

## Kolekcje MongoDB

### country_snapshots
Główna kolekcja przechowująca historyczne snapshoty danych krajów.

**Indeksy:**
- `countryCode` (indexed)
- `fetchedAt` (indexed)
- Compound index: `{countryCode: 1, fetchedAt: -1}`

**Struktura dokumentu**: Zobacz [MODELS.md](./MODELS.md)

## Monitorowanie i Logi

Aplikacja używa Spring Boot Actuator endpoints (jeśli włączone):
- Health check: `/actuator/health`
- Info: `/actuator/info`

## Dalsze Kroki

- [Dokumentacja API - endpoints, parametry, przykłady](./API.md)
- [Modele Danych - szczegółowe opisy struktur](./MODELS.md)
- [Klienci Zewnętrzni - integracje z API](./CLIENTS.md)
