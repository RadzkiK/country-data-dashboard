import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compareCountries, getCountryHistory } from "../services/api";
import type { CountrySnapshot } from "../types/country";
import { formatDateTime, formatNumber, formatTemperature } from "../utils/format";

type MetricKey = "gdpPerCapita" | "lifeExpectancy" | "co2PerCapita" | "temperature";

const metricOptions: Array<{ key: MetricKey; label: string; unit: string }> = [
  { key: "gdpPerCapita", label: "PKB per capita", unit: "USD" },
  { key: "lifeExpectancy", label: "Długość życia", unit: "lat" },
  { key: "co2PerCapita", label: "CO2 per capita", unit: "t" },
  { key: "temperature", label: "Temperatura", unit: "°C" },
];

const COUNTRY_COLORS = ["#14532d", "#b45309", "#1d4ed8", "#7c3aed"];

type HistoryEntry = {
  date: string;
  rawDate: string;
  [key: string]: number | string;
};

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codes = (searchParams.get("codes") ?? "").split(",").filter(Boolean);

  const [currentData, setCurrentData] = useState<CountrySnapshot[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, CountrySnapshot[]>>({});
  const [metric, setMetric] = useState<MetricKey>("gdpPerCapita");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [current, ...histories] = await Promise.all([
        compareCountries(codes),
        ...codes.map((code) => getCountryHistory(code, 30)),
      ]);

      setCurrentData(current);
      const map: Record<string, CountrySnapshot[]> = {};
      codes.forEach((code, index) => {
        map[code] = histories[index] ?? [];
      });
      setHistoryMap(map);
    } catch {
      setErrorMessage("Nie udało się pobrać danych. Sprawdź połączenie z backendem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (codes.length === 0) {
      navigate("/");
      return;
    }
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMetricValue = (snapshot: CountrySnapshot, key: MetricKey): number | undefined => {
    if (key === "temperature") return snapshot.weather?.temperature;
    return snapshot.indicators?.[key];
  };

  const buildHistoryChartData = (): HistoryEntry[] => {
    const allDates = new Set<string>();
    codes.forEach((code) => {
      historyMap[code]?.forEach((s) => {
        allDates.add(s.fetchedAt);
      });
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const entry: HistoryEntry = {
        date: formatDateTime(date),
        rawDate: date,
      };
      codes.forEach((code) => {
        const snapshots = historyMap[code] ?? [];
        const snapshot = snapshots.find((s) => s.fetchedAt === date);
        if (snapshot) {
          const value = getMetricValue(snapshot, metric);
          if (value !== undefined) {
            entry[code] = value;
          }
        }
      });
      return entry;
    });
  };

  const historyData = buildHistoryChartData();

  const formatYAxis = (value: number): string => {
    if (metric === "temperature") return `${Math.round(value)}°`;
    if (metric === "lifeExpectancy") return `${Math.round(value)}`;
    if (metric === "co2PerCapita") return `${value.toFixed(1)}`;
    return `$${formatNumber(value)}`;
  };

  const formatTooltipValue = (value: number): string => {
    const opt = metricOptions.find((o) => o.key === metric);
    if (metric === "temperature") return formatTemperature(value);
    if (metric === "gdpPerCapita") return `$${formatNumber(value)} ${opt?.unit ?? ""}`;
    return `${value.toFixed(2)} ${opt?.unit ?? ""}`;
  };

  if (isLoading) {
    return (
      <main className="dashboard-shell">
        <div className="empty-state">
          <h3>Ładowanie danych porównawczych...</h3>
          <p>Trwa pobieranie danych historycznych dla wybranych krajów.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <section className="compare-page-header">
        <button
          className="secondary-button back-button"
          type="button"
          onClick={() => navigate("/")}
        >
          ← Powrót do dashboardu
        </button>
        <div className="compare-page-title">
          <p className="eyebrow">Porównanie szczegółowe</p>
          <h1 className="compare-h1">
            {currentData.map((c) => c.countryName).join(" vs ")}
          </h1>
        </div>
      </section>

      {errorMessage ? (
        <div className="empty-state error-state">
          <h3>Błąd ładowania danych</h3>
          <p>{errorMessage}</p>
          <button className="secondary-button" type="button" onClick={() => void loadData()}>
            Spróbuj ponownie
          </button>
        </div>
      ) : null}

      <div className="compare-flags-row">
        {currentData.map((country, index) => (
          <article key={country.countryCode} className="compare-country-hero">
            <div
              className="compare-country-accent"
              style={{ background: COUNTRY_COLORS[index % COUNTRY_COLORS.length] }}
            />
            {country.flagUrl ? (
              <img
                src={country.flagUrl}
                alt={`Flaga ${country.countryName}`}
                className="compare-flag"
              />
            ) : (
              <div className="compare-flag-placeholder">{country.countryCode}</div>
            )}
            <div className="compare-country-info">
              <h2>{country.countryName}</h2>
              <p className="compare-country-meta">
                {country.capital} · {country.region ?? "Brak regionu"}
              </p>
              <div className="compare-stat-row">
                <span>Populacja</span>
                <strong>{country.population ? formatNumber(country.population) : "-"}</strong>
              </div>
              <div className="compare-stat-row">
                <span>PKB per capita</span>
                <strong>
                  {country.indicators?.gdpPerCapita
                    ? `$${formatNumber(country.indicators.gdpPerCapita)}`
                    : "-"}
                </strong>
              </div>
              <div className="compare-stat-row">
                <span>Dług. życia</span>
                <strong>
                  {country.indicators?.lifeExpectancy
                    ? `${country.indicators.lifeExpectancy.toFixed(1)} lat`
                    : "-"}
                </strong>
              </div>
              <div className="compare-stat-row">
                <span>CO2 per capita</span>
                <strong>
                  {country.indicators?.co2PerCapita
                    ? `${country.indicators.co2PerCapita.toFixed(2)} t`
                    : "-"}
                </strong>
              </div>
              <div className="compare-stat-row">
                <span>Temperatura</span>
                <strong>{formatTemperature(country.weather?.temperature)}</strong>
              </div>
              <p className="compare-last-updated">
                Aktualizacja: {formatDateTime(country.fetchedAt)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <section className="surface-card compare-history-section">
        <div className="section-heading">
          <div>
            <p className="section-label">Historia</p>
            <h2>Dane historyczne</h2>
          </div>
          <div className="chart-toolbar">
            {metricOptions.map((opt) => (
              <button
                key={opt.key}
                className={opt.key === metric ? "chart-tab active" : "chart-tab"}
                type="button"
                onClick={() => setMetric(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {historyData.length < 2 ? (
          <div className="chart-empty-state">
            <h3>Zbyt mało danych historycznych</h3>
            <p>
              Historia pojawi się, gdy backend zbierze więcej snapshotów. Odśwież dane kilka razy,
              aby zobaczyć trendy.
            </p>
          </div>
        ) : (
          <div className="chart-wrapper chart-wrapper-lg">
            <ResponsiveContainer>
              <LineChart data={historyData} margin={{ top: 8, right: 24, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#d6dfd6" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#4b5b52", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#4b5b52", fontSize: 11 }}
                  tickFormatter={formatYAxis}
                  width={64}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #d6dfd6",
                    boxShadow: "0 18px 40px rgba(24, 42, 33, 0.12)",
                  }}
                  formatter={(value, name) => {
                    const numVal = typeof value === "number" ? value : undefined;
                    const formatted = numVal !== undefined ? formatTooltipValue(numVal) : "-";
                    const label =
                      currentData.find((c) => c.countryCode === String(name))?.countryName ??
                      String(name);
                    return [formatted, label];
                  }}
                />
                <Legend
                  formatter={(value) =>
                    currentData.find((c) => c.countryCode === value)?.countryName ?? value
                  }
                />
                {codes.map((code, index) => (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    stroke={COUNTRY_COLORS[index % COUNTRY_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="surface-card compare-table-section">
        <div className="section-heading">
          <div>
            <p className="section-label">Tabela</p>
            <h2>Porównanie wskaźników</h2>
          </div>
        </div>
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Wskaźnik</th>
                {currentData.map((c) => (
                  <th key={c.countryCode}>
                    {c.flagUrl ? (
                      <img src={c.flagUrl} alt="" className="table-flag" />
                    ) : null}
                    {c.countryName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Populacja</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>
                    {c.population ? formatNumber(c.population) : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Powierzchnia (km²)</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>{c.area ? formatNumber(c.area) : "-"}</td>
                ))}
              </tr>
              <tr>
                <td>PKB per capita (USD)</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>
                    {c.indicators?.gdpPerCapita
                      ? `$${formatNumber(c.indicators.gdpPerCapita)}`
                      : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Długość życia</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>
                    {c.indicators?.lifeExpectancy
                      ? `${c.indicators.lifeExpectancy.toFixed(1)} lat`
                      : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>CO2 per capita</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>
                    {c.indicators?.co2PerCapita
                      ? `${c.indicators.co2PerCapita.toFixed(2)} t`
                      : "-"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Temperatura</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>{formatTemperature(c.weather?.temperature)}</td>
                ))}
              </tr>
              <tr>
                <td>Języki</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>{c.languages.join(", ") || "-"}</td>
                ))}
              </tr>
              <tr>
                <td>Waluty</td>
                {currentData.map((c) => (
                  <td key={c.countryCode}>{c.currencies.join(", ") || "-"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
