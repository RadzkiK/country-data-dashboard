const locale = "pl-PL";

export function formatNumber(value: number) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  if (!value) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatTemperature(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toFixed(1)}°C`;
}

export function formatWindSpeed(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toFixed(1)} km/h`;
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
