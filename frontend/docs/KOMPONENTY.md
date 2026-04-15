# Strony i komponenty

## Strony

### `DashboardPage`

Strona główna aplikacji odpowiada za:

- pobranie pełnej listy krajów po wejściu na stronę
- utrzymanie listy zaznaczonych krajów, domyślnie `PL`, `DE`, `CZ`
- pobranie szybkiego porównania dla aktualnej selekcji
- odświeżenie danych dla zaznaczonych krajów
- prezentację kart podsumowujących oraz skróconych kart państw
- przejście do szczegółowego porównania po kliknięciu akcji `Porównaj kraje`

Najważniejsze elementy stanu:

- `countries` - pełna lista krajów dostępnych do wyboru
- `selectedCodes` - aktualny wybór użytkownika, maksymalnie 3 kody
- `compared` - dane do szybkiego porównania
- `status` - status ładowania listy krajów
- `isRefreshing` - stan odświeżania danych
- `errorMessage` - komunikat błędu dla UI

### `ComparePage`

Widok szczegółowy jest odpowiedzialny za:

- odczytanie parametru `codes` z query string
- pobranie bieżących danych dla porównywanych krajów
- pobranie historii danych dla każdego kraju z limitem `30`
- render wykresu słupkowego, wykresu historycznego i tabeli porównawczej
- zmianę aktywnej metryki historycznej bez ponownego pobierania danych

Obsługiwane metryki historyczne:

- `gdpPerCapita`
- `lifeExpectancy`
- `temperature`

Jeżeli nie ma kodów w query string, użytkownik jest przekierowywany na dashboard.

## Komponenty współdzielone

### `CountrySelector`

Komponent odpowiada za wybór krajów i posiada najwięcej logiki filtrującej po stronie UI.

Funkcjonalności:

- wyszukiwanie po nazwie kraju, kodzie i stolicy
- filtrowanie po regionie
- sortowanie po nazwie, populacji, powierzchni i PKB per capita
- filtrowanie zakresowe dla populacji, powierzchni i PKB per capita
- ograniczenie wyboru do maksymalnie trzech krajów
- prezentacja zaznaczonych krajów jako chipów
- przycisk przejścia do widoku porównania po zaznaczeniu co najmniej dwóch krajów

Komponent jest kontrolowany z zewnątrz przez propsy `selectedCodes` i `onSelectionChange`.

### `CountryCard`

Komponent prezentacyjny do wyświetlania danych pojedynczego kraju.

Obsługuje dwa tryby:

- standardowy - większa karta z pełnym zestawem podstawowych informacji
- `compact` - skrócona karta używana na dashboardzie

Komponent defensywnie obsługuje brakujące języki i waluty, aby nie powodować błędów renderowania.

### `CompareChart`

Komponent renderuje wykres słupkowy dla bieżących danych wybranych krajów. Użytkownik może przełączać aktywną metrykę bez zmiany strony.

Obsługiwane metryki:

- PKB per capita
- długość życia
- temperatura stolicy
- populacja

Wizualizacja korzysta z `ResponsiveContainer`, więc dopasowuje się do szerokości kontenera.

## Narzędzia pomocnicze

### `format.ts`

Zawiera funkcje do spójnego formatowania wartości w całej aplikacji:

- `formatNumber`
- `formatCompactNumber`
- `formatTemperature`
- `formatWindSpeed`
- `formatDateTime`

Lokalizacja formatowania to `pl-PL`, co zapewnia polski zapis dat i liczb.

### `country.ts`

Definiuje centralny typ `CountrySnapshot` oraz typy zagnieżdżone:

- `WeatherSnapshot`
- `IndicatorSnapshot`

Typ ten jest podstawowym kontraktem danych używanym przez wszystkie komponenty UI.