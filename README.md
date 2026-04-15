# Country Data Dashboard

Country Data Dashboard to aplikacja webowa typu monorepo, która agreguje dane o państwach z zewnętrznych źródeł, zapisuje historyczne snapshoty w MongoDB i udostępnia je w formie dashboardu oraz widoku porównawczego.

Projekt składa się z trzech głównych elementów:

- backendu w Kotlinie i Spring Boot, który pobiera, normalizuje i udostępnia dane,
- frontendu w React i TypeScript, który wizualizuje dane oraz umożliwia porównywanie krajów,
- bazy MongoDB przechowującej bieżące i historyczne snapshoty.

## Najważniejsze funkcje

- pobieranie danych o krajach z wielu zewnętrznych API,
- agregacja danych geograficznych, pogodowych i ekonomicznych,
- przechowywanie historii snapshotów w MongoDB,
- REST API do pobierania listy krajów, porównań i historii,
- dashboard z wyborem do trzech krajów,
- szczegółowy widok porównawczy z wykresami i tabelą.

## Architektura

System ma prostą architekturę trójwarstwową:

1. Frontend renderuje dane i obsługuje interakcję użytkownika.
2. Backend integruje się z zewnętrznymi API, składa odpowiedzi i zapisuje snapshoty.
3. MongoDB przechowuje dane historyczne i najnowsze odczyty.

## Technologie

### Backend

- Kotlin 2.3.20
- Spring Boot 4.1.0-M3
- Spring Web MVC
- Spring Data MongoDB
- Gradle
- Java 21

### Frontend

- React 19
- TypeScript 5
- Vite 8
- Axios
- React Router
- Recharts

### Infrastruktura

- MongoDB 8
- Docker Compose do lokalnego uruchomienia bazy

## Źródła danych

Backend korzysta z trzech zewnętrznych źródeł danych:

- REST Countries
- Open-Meteo
- World Bank Indicators API

## Struktura repozytorium

```text
country-data-dashboard/
  backend/
  frontend/
  docs/
  docker-compose.yml
  README.md
```

- `backend/` - aplikacja Spring Boot i dokumentacja techniczna backendu
- `frontend/` - aplikacja React oraz dokumentacja techniczna frontendu
- `docs/` - dodatkowe pliki pomocnicze repozytorium
- `docker-compose.yml` - lokalne uruchomienie MongoDB

## Szybki start

### 1. Uruchom MongoDB

W katalogu głównym repozytorium:

```bash
docker compose up -d
```

Domyślnie MongoDB będzie dostępne na porcie `27017`.

### 2. Uruchom backend

W katalogu `backend`:

```bash
./gradlew bootRun
```

Na Windows można użyć:

```bash
gradlew.bat bootRun
```

Backend będzie dostępny pod adresem `http://localhost:8080`.

### 3. Uruchom frontend

W katalogu `frontend`:

```bash
npm install
npm run dev
```

Frontend komunikuje się z backendem pod adresem `http://localhost:8080/api`.

## Najważniejsze endpointy backendu

- `GET /api/countries` - lista krajów z najnowszymi snapshotami
- `GET /api/countries/grouped` - kraje pogrupowane po regionach
- `GET /api/countries/{code}` - dane pojedynczego kraju
- `POST /api/countries/{code}/refresh` - ręczne odświeżenie danych kraju
- `GET /api/countries/compare?codes=PL,DE,CZ` - porównanie wybranych krajów
- `GET /api/countries/{code}/history?limit=30` - historia danych kraju

## Dokumentacja

### Backend

- [backend/docs/README.md](backend/docs/README.md)
- [backend/docs/API.md](backend/docs/API.md)
- [backend/docs/MODELS.md](backend/docs/MODELS.md)
- [backend/docs/CLIENTS.md](backend/docs/CLIENTS.md)

### Frontend

- [frontend/README.md](frontend/README.md)
- [frontend/docs/README.md](frontend/docs/README.md)
- [frontend/docs/ARCHITEKTURA.md](frontend/docs/ARCHITEKTURA.md)
- [frontend/docs/KOMPONENTY.md](frontend/docs/KOMPONENTY.md)
- [frontend/docs/API_FRONTEND.md](frontend/docs/API_FRONTEND.md)
- [frontend/docs/URUCHOMIENIE.md](frontend/docs/URUCHOMIENIE.md)

## Uwagi techniczne

- frontend ma na stałe ustawiony bazowy adres API `http://localhost:8080/api`,
- backend zapisuje snapshoty danych w MongoDB,
- frontend normalizuje odpowiedzi backendu, żeby defensywnie obsługiwać różne formaty czasu i brakujące tablice,
- część dokumentacji w repo opisuje stan techniczny bardziej szczegółowo niż główny README.
