# Dokumentacja frontendu

Ten katalog zawiera dokumentację techniczną frontendu aplikacji Country Data Dashboard.

## Zawartość

- `ARCHITEKTURA.md` - opis warstw aplikacji, routingu i przepływu danych
- `KOMPONENTY.md` - odpowiedzialność stron i komponentów React
- `API_FRONTEND.md` - opis komunikacji z backendem i normalizacji odpowiedzi
- `URUCHOMIENIE.md` - wymagania, komendy oraz sposób uruchomienia

## Zakres aplikacji

Frontend udostępnia dwa podstawowe scenariusze:

1. Wybór do trzech krajów i szybkie porównanie podstawowych wskaźników na dashboardzie.
2. Przejście do widoku szczegółowego z wykresami słupkowymi, linią historii i tabelą porównawczą.

## Najważniejsze cechy techniczne

- React 19 z komponentami funkcyjnymi i hookami
- TypeScript w trybie `strict`
- routing oparty o `react-router-dom`
- komunikacja HTTP przez `axios`
- wizualizacje danych przez `recharts`
- defensywna normalizacja danych przychodzących z backendu

## Szybkie odnośniki

Jeżeli chcesz szybko wejść w kod, zacznij od tych plików:

- `src/App.tsx` - definicja routingu
- `src/pages/DashboardPage.tsx` - strona główna aplikacji
- `src/pages/ComparePage.tsx` - widok szczegółowego porównania
- `src/services/api.ts` - warstwa komunikacji z backendem
- `src/types/country.ts` - kontrakty danych używane w UI