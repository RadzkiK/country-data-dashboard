import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CountrySnapshot } from "../types/country";
import { formatNumber, formatTemperature } from "../utils/format";

type Props = {
  countries: CountrySnapshot[];
};

type MetricKey = "gdpPerCapita" | "lifeExpectancy" | "temperature" | "population";

const metricOptions: Array<{ key: MetricKey; label: string; color: string }> = [
  { key: "gdpPerCapita", label: "PKB per capita", color: "#14532d" },
  { key: "lifeExpectancy", label: "Długość życia", color: "#0f766e" },
  { key: "temperature", label: "Temperatura stolicy", color: "#b45309" },
  { key: "population", label: "Populacja", color: "#1d4ed8" },
];

export default function CompareChart({ countries }: Props) {
  const [metric, setMetric] = useState<MetricKey>("gdpPerCapita");

  const data = countries.map((country) => ({
    name: country.countryName,
    code: country.countryCode,
    gdpPerCapita: country.indicators?.gdpPerCapita ?? 0,
    lifeExpectancy: country.indicators?.lifeExpectancy ?? 0,
    temperature: country.weather?.temperature ?? 0,
    population: country.population ?? 0,
  }));

  const activeMetric = metricOptions.find((option) => option.key === metric) ?? metricOptions[0];

  if (countries.length === 0) {
    return (
      <div className="chart-empty-state">
        <h3>Brak danych do wykresu</h3>
        <p>Po wybraniu krajów pojawi się tutaj porównanie wskaźników.</p>
      </div>
    );
  }

  return (
    <div className="chart-panel">
      <div className="chart-toolbar">
        {metricOptions.map((option) => (
          <button
            key={option.key}
            className={option.key === metric ? "chart-tab active" : "chart-tab"}
            type="button"
            onClick={() => setMetric(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#d6dfd6" strokeDasharray="4 4" />
            <XAxis
              dataKey="code"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4b5b52", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4b5b52", fontSize: 12 }}
              tickFormatter={(value) => formatAxisValue(metric, value)}
            />
            <Tooltip
              cursor={{ fill: "rgba(20, 83, 45, 0.08)" }}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #d6dfd6",
                boxShadow: "0 18px 40px rgba(24, 42, 33, 0.12)",
              }}
              formatter={(value) => {
                if (typeof value !== "number") return "";
                return formatTooltipValue(metric, value);
              }}
              labelFormatter={(_, payload) => {
                const entry = payload?.[0]?.payload;
                return entry ? `${entry.name} (${entry.code})` : "";
              }}
            />
            <Bar dataKey={metric} radius={[12, 12, 4, 4]}>
              {data.map((entry) => (
                <Cell key={entry.code} fill={activeMetric.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatAxisValue(metric: MetricKey, value: number) {
  if (metric === "temperature") {
    return `${Math.round(value)}°`;
  }

  if (metric === "lifeExpectancy") {
    return `${Math.round(value)}`;
  }

  if (metric === "population") {
    return formatNumber(value);
  }

  return `$${formatNumber(value)}`;
}

function formatTooltipValue(metric: MetricKey, value: number) {
  if (metric === "temperature") {
    return [formatTemperature(value), "Wartość"];
  }

  if (metric === "lifeExpectancy") {
    return [`${value.toFixed(1)} lat`, "Wartość"];
  }

  if (metric === "population") {
    return [formatNumber(value), "Wartość"];
  }

  return [`$${formatNumber(value)}`, "Wartość"];
}
