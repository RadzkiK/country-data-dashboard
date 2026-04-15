# Uruchomienie i rozwój

## Wymagania

Do pracy z frontendem potrzebujesz:

- Node.js
- npm
- uruchomionego backendu dostępnego pod `http://localhost:8080`

Frontend nie korzysta obecnie z pliku `.env` do konfiguracji adresu API. Bazowy URL jest wpisany bezpośrednio w `src/services/api.ts`.

## Instalacja zależności

W katalogu `frontend` uruchom:

```bash
npm install
```

## Tryb developerski

```bash
npm run dev
```

Vite uruchomi lokalny serwer developerski z HMR.

## Budowanie aplikacji

```bash
npm run build
```

Proces budowania wykonuje dwa kroki:

1. `tsc -b` - sprawdzenie i kompilacja projektu TypeScript
2. `vite build` - zbudowanie aplikacji produkcyjnej

Artefakty trafiają do katalogu `dist`.

## Linting

```bash
npm run lint
```

Projekt używa ESLint z konfiguracją dla:

- JavaScript
- TypeScript
- React Hooks
- integracji z Vite

## Podgląd buildu

```bash
npm run preview
```

Ta komenda uruchamia lokalny podgląd wersji produkcyjnej po wcześniejszym buildzie.

## Najważniejsze zależności

- `react` i `react-dom` - warstwa UI
- `react-router-dom` - routing aplikacji
- `axios` - komunikacja HTTP
- `recharts` - wykresy
- `clsx` - pomocnicze budowanie klas CSS

Uwaga: `clsx` jest obecne w zależnościach, ale w aktualnym kodzie frontendu nie jest używane.

## Wskazówki rozwojowe

- nowe endpointy najlepiej dopisywać w `src/services/api.ts`
- nowe kontrakty danych warto centralizować w `src/types`
- wspólne formatowanie należy utrzymywać w `src/utils/format.ts`
- jeśli pojawi się więcej ekranów lub współdzielonego stanu, warto rozważyć wydzielenie warstwy cache lub store'a

## Znane ograniczenia

- brak konfigurowalnego URL backendu przez zmienne środowiskowe
- brak testów jednostkowych i integracyjnych po stronie frontendu
- brak centralnych interceptorów `axios` do mapowania błędów HTTP

## Diagnostyka odświeżania danych

Jeżeli w UI pojawia się błąd przy kliknięciu `Odśwież dane`:

1. Upewnij się, że backend działa pod `http://localhost:8080`.
2. Sprawdź, czy ręczne wywołanie endpointu działa:

```bash
curl -X POST http://localhost:8080/api/countries/PL/refresh
```

3. Sprawdź logi backendu i wyszukaj wpisy:
	- `Manual refresh started`
	- `External call failed`
	- `Manual refresh failed`

Backend loguje źródło błędu (`source=...`) oraz status HTTP zewnętrznego API, co ułatwia diagnozę przypadków `400 Bad Request`.