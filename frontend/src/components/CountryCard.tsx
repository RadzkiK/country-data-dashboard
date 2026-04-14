import type { CountrySnapshot } from "../types/country";
import {
  formatDateTime,
  formatNumber,
  formatTemperature,
  formatWindSpeed,
} from "../utils/format";

type Props = {
  country: CountrySnapshot;
};

export default function CountryCard({ country }: Props) {
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
              {country.countryCode} · {country.capital}
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
          <span>Temperatura</span>
          <strong>{formatTemperature(country.weather?.temperature)}</strong>
        </div>
        <div className="metric-tile">
          <span>Wiatr</span>
          <strong>{formatWindSpeed(country.weather?.windSpeed)}</strong>
        </div>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Języki</dt>
          <dd>{country.languages.length > 0 ? country.languages.join(", ") : "-"}</dd>
        </div>
        <div>
          <dt>Waluty</dt>
          <dd>{country.currencies.length > 0 ? country.currencies.join(", ") : "-"}</dd>
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
          <dt>Długość życia</dt>
          <dd>
            {country.indicators?.lifeExpectancy
              ? `${country.indicators.lifeExpectancy.toFixed(1)} lat`
              : "-"}
          </dd>
        </div>
        <div>
          <dt>CO2 per capita</dt>
          <dd>
            {country.indicators?.co2PerCapita
              ? `${country.indicators.co2PerCapita.toFixed(2)} t`
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
