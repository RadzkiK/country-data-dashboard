import { useEffect, useMemo, useState } from "react";
import CompareChart from "../components/CompareChart";
import CountryCard from "../components/CountryCard";
import CountrySelector from "../components/CountrySelector";
import { compareCountries, getCountries, refreshCountry } from "../services/api";
import type { CountryDashboard } from "../types/country";
import {
  formatCompactNumber,
  formatDateTime,
  formatNumber,
  formatTemperature,
} from "../utils/format";

type Status = "idle" | "loading" | "ready" | "error";

export default function DashboardPage() {
  const [countries, setCountries] = useState<CountryDashboard[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["PL", "DE", "CZ"]);
  const [compared, setCompared] = useState<CountryDashboard[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCodes.length > 0) {
      void loadCompare();
    } else {
      setCompared([]);
    }
  }, [selectedCodes]);

  const loadCountries = async () => {
    try {
      setStatus("loading");
      setErrorMessage(null);
      const data = await getCountries();
      setCountries(data);
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage("Nie udało się pobrać listy krajów. Sprawdź połączenie z backendem.");
    }
  };

  const loadCompare = async () => {
    try {
      setErrorMessage(null);
      const data = await compareCountries(selectedCodes);
      setCompared(data);
    } catch {
      setErrorMessage("Nie udało się pobrać danych porównawczych.");
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);
      await Promise.all(selectedCodes.map((code) => refreshCountry(code)));
      const [allCountries, comparedCountries] = await Promise.all([
        getCountries(),
        compareCountries(selectedCodes),
      ]);
      setCountries(allCountries);
      setCompared(comparedCountries);
    } catch {
      setErrorMessage("Odświeżenie danych nie powiodło się.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const summary = useMemo(() => {
    const totalPopulation = compared.reduce((sum, country) => sum + (country.population ?? 0), 0);
    const avgTemperature = average(compared.map((country) => country.weather?.temperature));
    const avgLifeExpectancy = average(
      compared.map((country) => country.indicators?.lifeExpectancy),
    );
    const avgGdp = average(compared.map((country) => country.indicators?.gdpPerCapita));
    const lastUpdated = compared
      .map((country) => country.lastUpdated)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      totalPopulation,
      avgTemperature,
      avgLifeExpectancy,
      avgGdp,
      lastUpdated,
    };
  }, [compared]);

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Country Data Dashboard</p>
          <h1>Porównanie danych państw w przejrzystym widoku analitycznym</h1>
          <p className="hero-description">
            Jedno miejsce do zestawienia danych geograficznych, pogodowych i
            społeczno-ekonomicznych dla wybranych krajów.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || selectedCodes.length === 0}
            >
              {isRefreshing ? "Odświeżanie..." : "Odśwież dane"}
            </button>
            <span className="refresh-note">
              {summary.lastUpdated
                ? `Ostatnia aktualizacja: ${formatDateTime(summary.lastUpdated)}`
                : "Wybierz kraje, aby zobaczyć szczegóły"}
            </span>
          </div>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <span className="summary-label">Wybrane kraje</span>
            <strong>{selectedCodes.length}/3</strong>
            <p>Limit trzech państw ułatwia czytelne porównanie.</p>
          </article>
          <article className="summary-card accent">
            <span className="summary-label">Łączna populacja</span>
            <strong>{formatCompactNumber(summary.totalPopulation)}</strong>
            <p>Suma populacji dla aktualnie porównywanych krajów.</p>
          </article>
          <article className="summary-card">
            <span className="summary-label">Średnia temperatura</span>
            <strong>{formatTemperature(summary.avgTemperature)}</strong>
            <p>Bieżący wskaźnik pogodowy dla wybranej grupy państw.</p>
          </article>
          <article className="summary-card">
            <span className="summary-label">Średnie PKB per capita</span>
            <strong>{summary.avgGdp ? `$${formatNumber(summary.avgGdp)}` : "-"}</strong>
            <p>Przybliżona średnia wartość ekonomiczna na mieszkańca.</p>
          </article>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-stack">
          <section className="surface-card">
            <div className="section-heading">
              <div>
                <p className="section-label">Selekcja</p>
                <h2>Wybór krajów do porównania</h2>
              </div>
              <span className="muted-pill">Maksymalnie 3 kraje</span>
            </div>
            <CountrySelector
              countries={countries}
              selectedCodes={selectedCodes}
              onSelectionChange={setSelectedCodes}
              disabled={status === "loading"}
            />
          </section>

          <section className="surface-card">
            <div className="section-heading">
              <div>
                <p className="section-label">Analityka</p>
                <h2>Porównanie wskaźników</h2>
              </div>
              <span className="muted-pill">
                Średnia długość życia:{" "}
                {summary.avgLifeExpectancy ? `${summary.avgLifeExpectancy.toFixed(1)} lat` : "-"}
              </span>
            </div>
            <CompareChart countries={compared} />
          </section>
        </div>

        <section className="surface-card details-panel">
          <div className="section-heading">
            <div>
              <p className="section-label">Kraje</p>
              <h2>Karty informacyjne</h2>
            </div>
            {errorMessage ? <span className="error-badge">{errorMessage}</span> : null}
          </div>

          {status === "loading" ? (
            <div className="empty-state">
              <h3>Ładowanie danych...</h3>
              <p>Trwa pobieranie listy krajów z backendu.</p>
            </div>
          ) : status === "error" ? (
            <div className="empty-state error-state">
              <h3>Nie udało się załadować danych</h3>
              <p>{errorMessage}</p>
              <button className="secondary-button" type="button" onClick={() => void loadCountries()}>
                Spróbuj ponownie
              </button>
            </div>
          ) : compared.length === 0 ? (
            <div className="empty-state">
              <h3>Brak danych do porównania</h3>
              <p>Wybierz co najmniej jeden kraj, aby wyświetlić szczegóły.</p>
            </div>
          ) : (
            <div className="country-grid">
              {compared.map((country) => (
                <CountryCard key={country.countryCode} country={country} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function average(values: Array<number | undefined>) {
  const validValues = values.filter((value): value is number => typeof value === "number");
  if (validValues.length === 0) {
    return undefined;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}
