# Frontend Country Data Dashboard

Frontend aplikacji prezentuje dane o państwach w dwóch głównych widokach:

- dashboard do wyboru i szybkiego porównania krajów,
- widok szczegółowego porównania z wykresami i historią danych.

Projekt został zbudowany w oparciu o React 19, TypeScript, Vite oraz Recharts.

## Dokumentacja

Szczegółowa dokumentacja znajduje się w katalogu `docs`:

- `docs/README.md` - indeks dokumentacji
- `docs/ARCHITEKTURA.md` - architektura, routing i przepływ danych
- `docs/KOMPONENTY.md` - opis stron, komponentów i odpowiedzialności
- `docs/API_FRONTEND.md` - integracja z backendem i normalizacja danych
- `docs/URUCHOMIENIE.md` - uruchomienie, budowanie i konfiguracja

## Szybki start

```bash
npm install
npm run dev
```

Domyślnie frontend oczekuje backendu pod adresem `http://localhost:8080/api`.

## Skrypty

- `npm run dev` - uruchamia środowisko developerskie Vite
- `npm run build` - wykonuje sprawdzenie TypeScript i buduje aplikację
- `npm run lint` - uruchamia ESLint
- `npm run preview` - uruchamia podgląd zbudowanej aplikacji
