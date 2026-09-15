import type { NormalizedPlayer } from "../lib/nhl-api/types";
import { calculateAge, type AttributeComparison, type GuessFeedback } from "../games/devine-le-joueur/logic";
import "../styles/components/feedback-grid.scss";

interface AttemptFeedbackRowProps {
  player: NormalizedPlayer;
  feedback: GuessFeedback;
}

const ATTRIBUTE_CELLS: {
  key: keyof GuessFeedback;
  label: string;
  value: (player: NormalizedPlayer) => string;
}[] = [
  { key: "team", label: "Équipe", value: (p) => p.team },
  { key: "position", label: "Poste", value: (p) => p.position },
  { key: "nationality", label: "Nat.", value: (p) => p.nationality },
  { key: "jerseyNumber", label: "N°", value: (p) => `#${p.jerseyNumber}` },
  { key: "age", label: "Âge", value: (p) => String(calculateAge(p.birthDate, new Date())) },
  { key: "heightCm", label: "Taille", value: (p) => `${p.heightCm} cm` },
  { key: "draftYear", label: "Draft", value: (p) => (p.draftYear === null ? "Non drafté" : String(p.draftYear)) },
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

export function FeedbackGridHeader() {
  return (
    <div className="feedback-grid__row">
      <span className="feedback-grid__cell feedback-grid__cell--header feedback-grid__cell--name" />
      {ATTRIBUTE_CELLS.map(({ key, label }) => (
        <span key={key} className="feedback-grid__cell feedback-grid__cell--header">
          {label}
        </span>
      ))}
    </div>
  );
}

export default function AttemptFeedbackRow({ player, feedback }: AttemptFeedbackRowProps) {
  return (
    <div className="feedback-grid__row">
      <span className="feedback-grid__cell feedback-grid__cell--name">
        {player.firstName} {player.lastName}
      </span>
      {ATTRIBUTE_CELLS.map(({ key, value }) => (
        <span
          key={key}
          className={`feedback-grid__cell feedback-grid__cell--${feedback[key].type}`}
        >
          <span className="feedback-grid__value">{value(player)}</span>
          <span className="feedback-grid__symbol">{symbolFor(feedback[key])}</span>
        </span>
      ))}
    </div>
  );
}
