import axios from "axios";
import type { CountrySnapshot } from "../types/country";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getCountries = async (): Promise<CountrySnapshot[]> => {
  const response = await api.get("/countries");
  return response.data;
};

export const getCountriesGrouped = async (): Promise<Record<string, CountrySnapshot[]>> => {
  const response = await api.get("/countries/grouped");
  return response.data;
};

export const refreshCountry = async (code: string): Promise<CountrySnapshot> => {
  const response = await api.post(`/countries/${code}/refresh`);
  return response.data;
};

export const compareCountries = async (codes: string[]): Promise<CountrySnapshot[]> => {
  const params = new URLSearchParams();
  codes.forEach((code) => params.append("codes", code));
  const response = await api.get(`/countries/compare?${params.toString()}`);
  return response.data;
};

export const getCountryHistory = async (code: string, limit = 20): Promise<CountrySnapshot[]> => {
  const response = await api.get(`/countries/${code}/history?limit=${limit}`);
  return response.data;
};