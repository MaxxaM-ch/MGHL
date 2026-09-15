import type { AttributeComparison, GuessFeedback } from "../games/devine-le-joueur/logic";

interface AttemptFeedbackRowProps {
  playerName: string;
  feedback: GuessFeedback;
}

const ATTRIBUTE_LABELS: { key: keyof GuessFeedback; label: string }[] = [
  { key: "team", label: "Équipe" },
  { key: "position", label: "Poste" },
  { key: "nationality", label: "Nationalité" },
  { key: "jerseyNumber", label: "Numéro" },
  { key: "age", label: "Âge" },
  { key: "heightCm", label: "Taille" },
  { key: "draftYear", label: "Draft" },
];

function symbolFor(comparison: AttributeComparison): string {
  switch (comparison.type) {
    case "exact":
      return "✔";
    case "higher":
      return "↑";
    case "lower":
      return "↓";
    case "no-match":
      return "✘";
  }
}

export default function AttemptFeedbackRow({ playerName, feedback }: AttemptFeedbackRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ minWidth: 140, fontWeight: 700 }}>{playerName}</span>
      {ATTRIBUTE_LABELS.map(({ key, label }) => (
        <span key={key} title={label} style={{ minWidth: 32, textAlign: "center" }}>
          {symbolFor(feedback[key])}
        </span>
      ))}
    </div>
  );
}
