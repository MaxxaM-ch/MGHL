import { useMemo, useState } from "react";
import TeamLogo from "./TeamLogo";
import "../styles/components/guess-input.scss";

export interface GuessOption {
  id: number;
  label: string;
  team: string;
}

interface GuessInputProps {
  options: GuessOption[];
  onSubmit: (id: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_SUGGESTIONS = 8;

export default function GuessInput({
  options,
  onSubmit,
  disabled = false,
  placeholder = "Nom du joueur",
}: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const suggestions = useMemo(() => {
    if (query.trim().length === 0 || selectedId !== null) return [];
    const lowerQuery = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lowerQuery)).slice(0, MAX_SUGGESTIONS);
  }, [query, options, selectedId]);

  function selectOption(option: GuessOption) {
    setQuery(option.label);
    setSelectedId(option.id);
  }

  function handleSubmit() {
    if (selectedId === null) return;
    onSubmit(selectedId);
    setQuery("");
    setSelectedId(null);
  }

  return (
    <div className="guess-input">
      <div className="guess-input__row">
        <input
          type="text"
          className="guess-input__field"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <button
          type="button"
          className="guess-input__submit"
          disabled={disabled || selectedId === null}
          onClick={handleSubmit}
        >
          Deviner
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="guess-input__suggestions">
          {suggestions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="guess-input__suggestion"
                onClick={() => selectOption(option)}
              >
                <TeamLogo team={option.team} className="guess-input__suggestion-logo" />
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
