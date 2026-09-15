import { useMemo, useState } from "react";

export interface GuessOption {
  id: number;
  label: string;
}

interface GuessInputProps {
  options: GuessOption[];
  onSubmit: (id: number) => void;
  disabled?: boolean;
}

const MAX_SUGGESTIONS = 8;

export default function GuessInput({ options, onSubmit, disabled = false }: GuessInputProps) {
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
    <div>
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Nom du joueur"
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button type="button" disabled={disabled || selectedId === null} onClick={handleSubmit}>
        Deviner
      </button>
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((option) => (
            <li key={option.id}>
              <button type="button" onClick={() => selectOption(option)}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
