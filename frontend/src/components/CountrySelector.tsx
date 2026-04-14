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
      </div>
    </div>
  );
}
