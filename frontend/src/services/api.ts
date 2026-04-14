import axios from "axios";
import type { CountrySnapshot } from "../types/country";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

type RawTimestamp =
  | string
  | {
      epochSeconds?: number;
      nanosecondsOfSecond?: number;
      $date?: string;
    }
  | null
  | undefined;

function normalizeTimestamp(value: RawTimestamp): string {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.$date === "string") {
    return value.$date;
  }

  if (typeof value.epochSeconds === "number") {
    const nanos = typeof value.nanosecondsOfSecond === "number" ? value.nanosecondsOfSecond : 0;
    const milliseconds = value.epochSeconds * 1000 + Math.floor(nanos / 1_000_000);
    return new Date(milliseconds).toISOString();
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeCountrySnapshot(raw: unknown): CountrySnapshot {
  const item = (raw ?? {}) as Partial<CountrySnapshot> & {
    fetchedAt?: RawTimestamp;
    languages?: unknown;
    currencies?: unknown;
  };

  return {
    ...item,
    countryCode: typeof item.countryCode === "string" ? item.countryCode : "",
    countryName: typeof item.countryName === "string" ? item.countryName : "",
    capital: typeof item.capital === "string" ? item.capital : "-",
    languages: normalizeStringArray(item.languages),
    currencies: normalizeStringArray(item.currencies),
    fetchedAt: normalizeTimestamp(item.fetchedAt),
  };
}

function normalizeCountrySnapshotList(raw: unknown): CountrySnapshot[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => normalizeCountrySnapshot(item));
}

export const getCountries = async (): Promise<CountrySnapshot[]> => {
  const response = await api.get("/countries");
  return normalizeCountrySnapshotList(response.data);
};

export const getCountriesGrouped = async (): Promise<Record<string, CountrySnapshot[]>> => {
  const response = await api.get("/countries/grouped");
  const rawData = response.data as Record<string, unknown>;
  const grouped: Record<string, CountrySnapshot[]> = {};

  Object.entries(rawData ?? {}).forEach(([region, countries]) => {
    grouped[region] = normalizeCountrySnapshotList(countries);
  });

  return grouped;
};

export const refreshCountry = async (code: string): Promise<CountrySnapshot> => {
  const response = await api.post(`/countries/${code}/refresh`);
  return normalizeCountrySnapshot(response.data);
};

export const compareCountries = async (codes: string[]): Promise<CountrySnapshot[]> => {
  const params = new URLSearchParams();
  params.set("codes", codes.join(","));
  const response = await api.get(`/countries/compare?${params.toString()}`);
  return normalizeCountrySnapshotList(response.data);
};

export const getCountryHistory = async (code: string, limit = 20): Promise<CountrySnapshot[]> => {
  const response = await api.get(`/countries/${code}/history?limit=${limit}`);
  return normalizeCountrySnapshotList(response.data);
};