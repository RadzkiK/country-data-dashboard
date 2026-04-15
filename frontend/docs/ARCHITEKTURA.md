# Architektura frontendu

## Przegląd

Frontend jest aplikacją SPA opartą o React i Vite. Cała logika widoków znajduje się po stronie klienta, a dane biznesowe są pobierane z backendu REST.

Struktura katalogu `src` jest podzielona na proste warstwy:

- `pages` - pełne ekrany aplikacji
- `components` - komponenty wielokrotnego użytku
- `services` - komunikacja HTTP i normalizacja danych
- `types` - definicje typów TypeScript
- `utils` - funkcje pomocnicze do formatowania danych

## Routing

Routing jest zdefiniowany w `src/App.tsx` przy użyciu `BrowserRouter`.

Dostępne ścieżki:

- `/` - dashboard z wyborem krajów i skróconym porównaniem
- `/compare` - widok szczegółowego porównania; oczekuje parametru query `codes`, np. `/compare?codes=PL,DE,CZ`

## Przepływ danych

Przepływ danych wygląda następująco:

1. Komponent strony wywołuje funkcję z `src/services/api.ts`.
2. Warstwa API pobiera dane z backendu przez `axios`.
3. Odpowiedź jest normalizowana do kształtu zgodnego z `CountrySnapshot`.
4. Dane trafiają do lokalnego stanu komponentu przez `useState`.
5. Komponenty prezentacyjne renderują wartości po sformatowaniu przez funkcje z `src/utils/format.ts`.

## Zarządzanie stanem

Aplikacja nie używa globalnego store'a. Stan jest przechowywany lokalnie w komponentach stron:

- `DashboardPage` przechowuje listę krajów, zaznaczone kody, wynik szybkiego porównania, status ładowania i błędy
- `ComparePage` przechowuje dane bieżące, dane historyczne, wybraną metrykę wykresu oraz stan ładowania

To podejście jest wystarczające, ponieważ aplikacja ma prosty przepływ danych i tylko dwa główne widoki.

## Warstwa integracji

Plik `src/services/api.ts` pełni dwie role:

- udostępnia funkcje wysokiego poziomu do pobierania danych
- zabezpiecza UI przed niespójnymi odpowiedziami backendu

Najważniejsze mechanizmy ochronne:

- normalizacja pola `fetchedAt`, które może przyjść jako string lub obiekt timestamp
- normalizacja pól `languages` i `currencies` do tablic stringów
- fallback dla `flagUrl`, budowany na podstawie kodu kraju
- fallback dla brakujących pól tekstowych, np. `capital`

## Formatowanie i prezentacja

Wspólne formatowanie zostało wyniesione do `src/utils/format.ts`.

Obsługiwane są między innymi:

- liczby pełne i skrócone
- temperatura i prędkość wiatru
- data i czas w lokalizacji `pl-PL`

## Warstwa wizualna

Globalne style znajdują się w `src/index.css`. Aplikacja nie używa biblioteki komponentów UI ani CSS-in-JS. Oznacza to, że:

- semantyka klas jest centralnie utrzymywana w jednym arkuszu stylów
- komponenty pozostają lekkie i skupione na renderowaniu
- zmiany wizualne zwykle wymagają pracy głównie w jednym pliku CSS

## Ograniczenia obecnej architektury

- adres backendu jest wpisany na stałe jako `http://localhost:8080/api`
- brak osobnej warstwy obsługi błędów HTTP i retry poza pojedynczymi `try/catch` w komponentach
- brak globalnego cache danych i brak synchronizacji stanu między trasami poza parametrem `codes`
- funkcja `getCountriesGrouped` istnieje w warstwie API, ale nie jest obecnie używana przez widoki