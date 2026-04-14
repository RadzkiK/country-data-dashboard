export interface WeatherSnapshot {
  temperature?: number;
  windSpeed?: number;
  weatherCode?: number;
  observationTime?: string;
}

export interface IndicatorSnapshot {
  gdpPerCapita?: number;
  lifeExpectancy?: number;
  co2PerCapita?: number;
  year?: number;
}

export interface CountrySnapshot {
  id?: string;
  countryCode: string;
  countryName: string;
  capital: string;
  region?: string;
  population?: number;
  area?: number;
  flagUrl?: string;
  languages: string[];
  currencies: string[];
  weather?: WeatherSnapshot;
  indicators?: IndicatorSnapshot;
  fetchedAt: string;
}

/** @deprecated Use CountrySnapshot instead */
export type CountryDashboard = CountrySnapshot;