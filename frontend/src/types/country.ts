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

export interface CountryDashboard {
  id?: string;
  countryCode: string;
  name: string;
  capital: string;
  region?: string;
  population?: number;
  area?: number;
  flagUrl?: string;
  languages: string[];
  currencies: string[];
  weather?: WeatherSnapshot;
  indicators?: IndicatorSnapshot;
  lastUpdated: string;
}