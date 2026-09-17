import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const suggestions = useMemo(() => {
    if (query.trim().length === 0 || selectedId !== null) return [];
    const lowerQuery = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lowerQuery)).slice(0, MAX_SUGGESTIONS);
  }, [query, options, selectedId]);

  function selectOption(option: GuessOption) {
    setQuery(option.label);
    setSelectedId(option.id);
    setHighlightedIndex(-1);
  }

  function submitOption(option: GuessOption) {
    onSubmit(option.id);
    setQuery("");
    setSelectedId(null);
    setHighlightedIndex(-1);
  }

  function handleSubmit() {
    if (selectedId === null) return;
    onSubmit(selectedId);
    setQuery("");
    setSelectedId(null);
  }

  useEffect(() => {
    if (highlightedIndex >= 0) {
      suggestionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        submitOption(suggestions[highlightedIndex]);
      } else {
        handleSubmit();
      }
    }
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
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
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
          {suggestions.map((option, index) => (
            <li key={option.id}>
              <button
                type="button"
                ref={(el) => {
                  suggestionRefs.current[index] = el;
                }}
                className={`guess-input__suggestion${index === highlightedIndex ? " guess-input__suggestion--highlighted" : ""}`}
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
