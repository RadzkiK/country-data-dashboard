import { useMemo, useState } from "react";
import type { CountrySnapshot } from "../types/country";

type Props = {
  countries: CountrySnapshot[];
  selectedCodes: string[];
  onSelectionChange: (codes: string[]) => void;
  onCompare?: () => void;
  disabled?: boolean;
};

export default function CountrySelector({
  countries,
  selectedCodes,
  onSelectionChange,
  onCompare,
  disabled = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [populationMin, setPopulationMin] = useState("");
  const [populationMax, setPopulationMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [gdpMin, setGdpMin] = useState("");
  const [gdpMax, setGdpMax] = useState("");

  const regions = useMemo(() => {
    return Array.from(new Set(countries.map((country) => country.region).filter(Boolean)))
      .map((region) => region ?? "")
      .sort();
  }, [countries]);

  const visibleCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const popMin = toNumber(populationMin);
    const popMax = toNumber(populationMax);
    const arMin = toNumber(areaMin);
    const arMax = toNumber(areaMax);
    const gMin = toNumber(gdpMin);
    const gMax = toNumber(gdpMax);

    const filtered = countries.filter((country) => {
      if (q) {
        const haystack = [country.countryName, country.countryCode, country.capital]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }

      if (regionFilter !== "all" && country.region !== regionFilter) {
        return false;
      }

      if (!inRange(country.population, popMin, popMax)) {
        return false;
      }

      if (!inRange(country.area, arMin, arMax)) {
        return false;
      }

      if (!inRange(country.indicators?.gdpPerCapita, gMin, gMax)) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => compareCountries(a, b, sortBy));
    return filtered;
  }, [
    countries,
    query,
    regionFilter,
    sortBy,
    populationMin,
    populationMax,
    areaMin,
    areaMax,
    gdpMin,
    gdpMax,
  ]);

  const handleToggle = (code: string) => {
    if (disabled) {
      return;
    }

    if (selectedCodes.includes(code)) {
      onSelectionChange(selectedCodes.filter((selectedCode) => selectedCode !== code));
      return;
    }

    if (selectedCodes.length >= 3) {
      return;
    }

    onSelectionChange([...selectedCodes, code]);
  };

  return (
    <div className="selector-layout">
      <div className="selector-controls">
        <label className="control-group control-group-search">
          <span>Szukaj kraju</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nazwa, kod lub stolica"
            disabled={disabled}
          />
        </label>

        <label className="control-group">
          <span>Kontynent</span>
          <select
            value={regionFilter}
            onChange={(event) => setRegionFilter(event.target.value)}
            disabled={disabled}
          >
            <option value="all">Wszystkie</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="control-group">
          <span>Sortowanie</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} disabled={disabled}>
            <option value="name-asc">Nazwa A-Z</option>
            <option value="name-desc">Nazwa Z-A</option>
            <option value="population-desc">Populacja malejąco</option>
            <option value="population-asc">Populacja rosnąco</option>
            <option value="area-desc">Powierzchnia malejąco</option>
            <option value="area-asc">Powierzchnia rosnąco</option>
            <option value="gdp-desc">PKB malejąco</option>
            <option value="gdp-asc">PKB rosnąco</option>
          </select>
        </label>

        <label className="control-group">
          <span>Populacja od/do</span>
          <div className="range-pair">
            <input
              type="number"
              inputMode="numeric"
              value={populationMin}
              onChange={(event) => setPopulationMin(event.target.value)}
              placeholder="min"
              disabled={disabled}
            />
            <input
              type="number"
              inputMode="numeric"
              value={populationMax}
              onChange={(event) => setPopulationMax(event.target.value)}
              placeholder="max"
              disabled={disabled}
            />
          </div>
        </label>

        <label className="control-group control-group-area">
          <span>Powierzchnia od/do (km2)</span>
          <div className="range-pair">
            <input
              type="number"
              inputMode="decimal"
              value={areaMin}
              onChange={(event) => setAreaMin(event.target.value)}
              placeholder="min"
              disabled={disabled}
            />
            <input
              type="number"
              inputMode="decimal"
              value={areaMax}
              onChange={(event) => setAreaMax(event.target.value)}
              placeholder="max"
              disabled={disabled}
            />
          </div>
        </label>

        <label className="control-group control-group-gdp">
          <span>PKB per capita od/do (USD)</span>
          <div className="range-pair">
            <input
              type="number"
              inputMode="decimal"
              value={gdpMin}
              onChange={(event) => setGdpMin(event.target.value)}
              placeholder="min"
              disabled={disabled}
            />
            <input
              type="number"
              inputMode="decimal"
              value={gdpMax}
              onChange={(event) => setGdpMax(event.target.value)}
              placeholder="max"
              disabled={disabled}
            />
          </div>
        </label>
      </div>

      <div className="selected-strip" aria-live="polite">
        {selectedCodes.length > 0 ? (
          selectedCodes.map((code) => {
            const country = countries.find((item) => item.countryCode === code);
            return (
              <button
                key={code}
                className="selected-chip"
                type="button"
                onClick={() => handleToggle(code)}
                title="Kliknij, aby usunąć"
              >
                {country?.flagUrl ? (
                  <img
                    src={country.flagUrl}
                    alt={`Flaga ${country.countryName}`}
                    className="chip-flag"
                  />
                ) : null}
                <span>{country?.countryName ?? code}</span>
                <strong>{code}</strong>
              </button>
            );
          })
        ) : (
          <p className="helper-text">Nie wybrano jeszcze żadnego kraju.</p>
        )}
      </div>

      {selectedCodes.length >= 2 && onCompare ? (
        <div className="compare-action-row">
          <button
            className="primary-button compare-button"
            type="button"
            onClick={onCompare}
            disabled={disabled}
          >
            Porównaj kraje →
          </button>
          <span className="compare-hint">Otwórz szczegółowe porównanie z wykresami historycznymi</span>
        </div>
      ) : null}

      <div className="selector-grid">
        {visibleCountries.map((country) => {
          const isSelected = selectedCodes.includes(country.countryCode);
          const isLocked = !isSelected && selectedCodes.length >= 3;

          return (
            <button
              key={country.countryCode}
              className={isSelected ? "country-option active" : "country-option"}
              type="button"
              onClick={() => handleToggle(country.countryCode)}
              disabled={disabled || isLocked}
            >
              <div className="country-option-left">
                {country.flagUrl ? (
                  <img
                    src={country.flagUrl}
                    alt={`Flaga ${country.countryName}`}
                    className="option-flag"
                  />
                ) : (
                  <div className="option-flag-placeholder">{country.countryCode}</div>
                )}
                <div>
                  <strong>{country.countryName}</strong>
                  <span>{country.capital}</span>
                </div>
              </div>
              <small className="option-region">{country.region ?? "Brak regionu"}</small>
            </button>
          );
        })}

        {visibleCountries.length === 0 ? (
          <p className="helper-text">Brak krajów pasujących do filtrów.</p>
        ) : null}
      </div>
    </div>
  );
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function inRange(value: number | undefined, min?: number, max?: number): boolean {
  if (min === undefined && max === undefined) {
    return true;
  }

  if (typeof value !== "number") {
    return false;
  }

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

function compareCountries(a: CountrySnapshot, b: CountrySnapshot, sortBy: string): number {
  switch (sortBy) {
    case "name-desc":
      return b.countryName.localeCompare(a.countryName, "pl");
    case "population-desc":
      return (b.population ?? -1) - (a.population ?? -1);
    case "population-asc":
      return (a.population ?? Number.MAX_SAFE_INTEGER) - (b.population ?? Number.MAX_SAFE_INTEGER);
    case "area-desc":
      return (b.area ?? -1) - (a.area ?? -1);
    case "area-asc":
      return (a.area ?? Number.MAX_SAFE_INTEGER) - (b.area ?? Number.MAX_SAFE_INTEGER);
    case "gdp-desc":
      return (b.indicators?.gdpPerCapita ?? -1) - (a.indicators?.gdpPerCapita ?? -1);
    case "gdp-asc":
      return (a.indicators?.gdpPerCapita ?? Number.MAX_SAFE_INTEGER) - (b.indicators?.gdpPerCapita ?? Number.MAX_SAFE_INTEGER);
    case "name-asc":
    default:
      return a.countryName.localeCompare(b.countryName, "pl");
  }
}
