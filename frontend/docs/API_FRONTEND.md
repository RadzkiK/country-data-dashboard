# Integracja z backendem

## Punkt wejścia

Warstwa API znajduje się w pliku `src/services/api.ts`.

Do komunikacji wykorzystywany jest klient `axios` skonfigurowany z bazowym adresem:

`http://localhost:8080/api`

Oznacza to, że frontend zakłada lokalnie uruchomiony backend na porcie `8080`.

## Udostępnione funkcje API

### `getCountries()`

Pobiera listę wszystkich krajów z endpointu:

`GET /countries`

Zwraca tablicę `CountrySnapshot[]` po normalizacji odpowiedzi.

### `getCountriesGrouped()`

Pobiera kraje pogrupowane według klucza zwracanego przez backend:

`GET /countries/grouped`

Funkcja jest dostępna, ale aktualnie nie jest używana przez widoki.

### `refreshCountry(code)`

Wymusza odświeżenie danych pojedynczego kraju:

`POST /countries/{code}/refresh`

Po stronie dashboardu funkcja jest wywoływana równolegle dla wszystkich zaznaczonych krajów.

Szczegóły implementacyjne:

- kod kraju jest normalizowany po stronie frontendu (`trim + uppercase`),
- żądanie `POST` wysyłane jest jawnie z pustym body,
- frontend zbiera wyniki odświeżenia przez `Promise.allSettled`, więc pojedyncza porażka nie blokuje ponownego pobrania całego widoku.

### `compareCountries(codes)`

Pobiera porównanie dla listy kodów krajów:

`GET /countries/compare?codes=PL,DE,CZ`

Istotny detal integracyjny: backend oczekuje pojedynczego parametru `codes` zawierającego listę rozdzieloną przecinkami, a nie wielu parametrów o tej samej nazwie.

### `getCountryHistory(code, limit)`

Pobiera historię snapshotów dla kraju:

`GET /countries/{code}/history?limit=30`

Na stronie porównawczej domyślny limit to `30` rekordów.

## Normalizacja danych

Warstwa API nie przekazuje surowej odpowiedzi bezpośrednio do komponentów. Najpierw wykonuje normalizację, aby UI operowało na przewidywalnym modelu danych.

### Normalizacja czasu `fetchedAt`

Backend może zwracać czas w kilku formatach:

- jako string ISO
- jako obiekt z polami `epochSeconds` i `nanosecondsOfSecond`
- jako obiekt zawierający `$date`

Frontend sprowadza te warianty do pojedynczego stringa, najlepiej w formacie ISO.

### Normalizacja tablic

Pola `languages` i `currencies` są filtrowane do tablic stringów. Jeżeli backend zwróci `null`, `undefined` albo inny typ, frontend zastąpi je pustą tablicą.

To zabezpiecza widoki przed błędami typu:

- wywołanie `.join()` na `undefined`
- sprawdzanie `.length` na wartości niebędącej tablicą

### Normalizacja flagi

Jeżeli `flagUrl` nie jest poprawnym stringiem, frontend próbuje zbudować adres flagi na podstawie dwuliterowego kodu kraju i serwisu `flagcdn.com`.

### Fallback dla brakujących danych

Przykładowe domyślne wartości:

- `countryCode` -> pusty string
- `countryName` -> pusty string
- `capital` -> `-`
- `fetchedAt` -> pusty string

## Obsługa błędów

Obsługa błędów jest realizowana na poziomie komponentów stron przez `try/catch`.

Skutki w UI:

- wyświetlenie komunikatu błędu użytkownikowi
- możliwość ponowienia akcji przez przycisk
- brak przerywania renderu przy częściowych brakach danych po normalizacji
- przy odświeżaniu krajów informacja o błędzie może dotyczyć tylko części kodów, a pozostałe dane są nadal aktualizowane

## Diagnostyka `400 Bad Request` przy odświeżaniu

Jeżeli przycisk `Odśwież dane` zwraca błąd, najczęściej oznacza to błąd po stronie jednego z API zewnętrznych, a nie samego endpointu backendu.

Weryfikacja:

1. Sprawdź logi backendu dla wpisów `Manual refresh failed` i `External call failed`.
2. Zidentyfikuj `source=...` i `status=...` w logach.
3. Powtórz odświeżanie tylko dla jednego kodu kraju, aby zawęzić problem.

## Typ danych używany przez UI

Najważniejszy model to `CountrySnapshot`, który zawiera:

- dane identyfikacyjne kraju
- informacje geograficzne, takie jak stolica, region, populacja i powierzchnia
- dane pogodowe `weather`
- wskaźniki ekonomiczno-społeczne `indicators`
- czas pobrania `fetchedAt`