import type { CountrySnapshot } from "../types/country";
import {
  formatDateTime,
  formatNumber,
  formatTemperature,
  formatWindSpeed,
} from "../utils/format";

type Props = {
  country: CountrySnapshot;
  compact?: boolean;
};

export default function CountryCard({ country, compact = false }: Props) {
  const languages = Array.isArray(country.languages) ? country.languages : [];
  const currencies = Array.isArray(country.currencies) ? country.currencies : [];

  if (compact) {
    return (
      <article className="country-card country-card-compact">
        <header className="country-card-header">
          <div className="country-title-group">
            {country.flagUrl ? (
              <img className="country-flag" src={country.flagUrl} alt={`Flaga ${country.countryName}`} />
            ) : (
              <div className="country-flag-placeholder">{country.countryCode}</div>
            )}
            <div>
              <h3>{country.countryName}</h3>
              <p>
                {country.countryCode} - {country.capital}
              </p>
            </div>
          </div>
          <span className="muted-pill">{country.region ?? "Brak regionu"}</span>
        </header>

        <div className="metric-grid metric-grid-compact">
          <div className="metric-tile">
            <span>Populacja</span>
            <strong>{country.population ? formatNumber(country.population) : "-"}</strong>
          </div>
          <div className="metric-tile">
            <span>Temperatura stolicy</span>
            <strong>{formatTemperature(country.weather?.temperature)}</strong>
          </div>
        </div>

        <p className="compact-update-row">Aktualizacja: {formatDateTime(country.fetchedAt)}</p>
      </article>
    );
  }

  return (
    <article className="country-card">
      <header className="country-card-header">
        <div className="country-title-group">
          {country.flagUrl ? (
            <img className="country-flag" src={country.flagUrl} alt={`Flaga ${country.countryName}`} />
          ) : (
            <div className="country-flag-placeholder">{country.countryCode}</div>
          )}
          <div>
            <h3>{country.countryName}</h3>
            <p>
              {country.countryCode} - {country.capital}
            </p>
          </div>
        </div>
        <span className="muted-pill">{country.region ?? "Brak regionu"}</span>
      </header>

      <div className="metric-grid">
        <div className="metric-tile">
          <span>Populacja</span>
          <strong>{country.population ? formatNumber(country.population) : "-"}</strong>
        </div>
        <div className="metric-tile">
          <span>Powierzchnia</span>
          <strong>{country.area ? `${formatNumber(country.area)} km2` : "-"}</strong>
        </div>
        <div className="metric-tile">
          <span>Temperatura stolicy</span>
          <strong>{formatTemperature(country.weather?.temperature)}</strong>
        </div>
        <div className="metric-tile">
          <span>Wiatr</span>
          <strong>{formatWindSpeed(country.weather?.windSpeed)}</strong>
        </div>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Jezyki</dt>
          <dd>{languages.length > 0 ? languages.join(", ") : "-"}</dd>
        </div>
        <div>
          <dt>Waluty</dt>
          <dd>{currencies.length > 0 ? currencies.join(", ") : "-"}</dd>
        </div>
        <div>
          <dt>PKB per capita</dt>
          <dd>
            {country.indicators?.gdpPerCapita
              ? `$${formatNumber(country.indicators.gdpPerCapita)}`
              : "-"}
          </dd>
        </div>
        <div>
          <dt>Dlugosc zycia</dt>
          <dd>
            {country.indicators?.lifeExpectancy
              ? `${country.indicators.lifeExpectancy.toFixed(1)} lat`
              : "-"}
          </dd>
        </div>
        <div>
          <dt>Ostatnia aktualizacja</dt>
          <dd>{formatDateTime(country.fetchedAt)}</dd>
        </div>
      </dl>
    </article>
  );
}
