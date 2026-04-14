import type { CountryDashboard } from "../types/country";

type Props = {
  countries: CountryDashboard[];
  selectedCodes: string[];
  onSelectionChange: (codes: string[]) => void;
  disabled?: boolean;
};

export default function CountrySelector({
  countries,
  selectedCodes,
  onSelectionChange,
  disabled = false,
}: Props) {
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
              >
                <span>{country?.name ?? code}</span>
                <strong>{code}</strong>
              </button>
            );
          })
        ) : (
          <p className="helper-text">Nie wybrano jeszcze żadnego kraju.</p>
        )}
      </div>

      <div className="selector-grid">
        {countries.map((country) => {
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
              <div>
                <strong>{country.name}</strong>
                <span>
                  {country.countryCode} · {country.capital}
                </span>
              </div>
              <small>{country.region ?? "Brak regionu"}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
