import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CountryCard from "../components/CountryCard";
import CountrySelector from "../components/CountrySelector";
import { compareCountries, getCountries, refreshCountry } from "../services/api";
import type { CountrySnapshot } from "../types/country";
import {
  formatCompactNumber,
  formatDateTime,
  formatNumber,
  formatTemperature,
} from "../utils/format";

type Status = "idle" | "loading" | "ready" | "error";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountrySnapshot[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["PL", "DE", "CZ"]);
  const [compared, setCompared] = useState<CountrySnapshot[]>([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCompare = () => {
    if (selectedCodes.length >= 2) {
      navigate(`/compare?codes=${selectedCodes.join(",")}`);
    }
  };

  const summary = useMemo(() => {
    const totalPopulation = compared.reduce((sum, country) => sum + (country.population ?? 0), 0);
    const avgTemperature = average(compared.map((country) => country.weather?.temperature));
    const avgGdp = average(compared.map((country) => country.indicators?.gdpPerCapita));
    const lastUpdated = compared
      .map((country) => country.fetchedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      totalPopulation,
      avgTemperature,
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

      <section className="content-grid content-grid-single">
        <section className="surface-card selector-panel">
          <div className="section-heading">
            <div>
              <p className="section-label">Selekcja</p>
              <h2>Wybór krajów do porównania</h2>
            </div>
            <span className="muted-pill">Maksymalnie 3 kraje</span>
          </div>

          {status === "ready" && compared.length > 0 ? (
            <div className="compact-country-grid">
              {compared.map((country) => (
                <CountryCard key={country.countryCode} country={country} compact />
              ))}
            </div>
          ) : null}

          <div className="selector-divider" />

          <CountrySelector
            countries={countries}
            selectedCodes={selectedCodes}
            onSelectionChange={setSelectedCodes}
            onCompare={handleCompare}
            disabled={status === "loading"}
          />

          {status === "loading" ? (
            <div className="empty-state compact-empty-state">
              <h3>Ładowanie danych...</h3>
              <p>Trwa pobieranie listy krajów z backendu.</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="empty-state error-state compact-empty-state">
              <h3>Nie udało się załadować danych</h3>
              <p>{errorMessage}</p>
              <button className="secondary-button" type="button" onClick={() => void loadCountries()}>
                Spróbuj ponownie
              </button>
            </div>
          ) : null}
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
