import axios from "axios";
import type { CountryDashboard } from "../types/country";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getCountries = async (): Promise<CountryDashboard[]> => {
  const response = await api.get("/countries");
  return response.data;
};

export const refreshCountry = async (code: string): Promise<CountryDashboard> => {
  const response = await api.post(`/countries/${code}/refresh`);
  return response.data;
};

export const compareCountries = async (codes: string[]): Promise<CountryDashboard[]> => {
  const params = new URLSearchParams();
  codes.forEach((code) => params.append("codes", code));
  const response = await api.get(`/countries/compare?${params.toString()}`);
  return response.data;
};