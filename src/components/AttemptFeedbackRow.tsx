import type { ReactNode } from "react";
import type { NormalizedPlayer } from "../lib/nhl-api/types";
import { calculateAge, type AttributeComparison, type GuessFeedback } from "../games/devine-le-joueur/logic";
import { teamLogoUrl } from "../lib/team-logo";
import { nationalityToFlag } from "../lib/country-flags";
import "../styles/components/feedback-grid.scss";

interface AttemptFeedbackRowProps {
  player: NormalizedPlayer;
  feedback: GuessFeedback;
}

const ATTRIBUTE_CELLS: {
  key: keyof GuessFeedback;
  label: string;
  render: (player: NormalizedPlayer) => ReactNode;
}[] = [
  { key: "team", label: "Équipe", render: (p) => <img className="feedback-grid__logo" src={teamLogoUrl(p.team)} alt={p.team} /> },
  { key: "position", label: "Poste", render: (p) => p.position },
  { key: "nationality", label: "Nat.", render: (p) => <span aria-label={p.nationality}>{nationalityToFlag(p.nationality)}</span> },
  { key: "jerseyNumber", label: "N°", render: (p) => (p.jerseyNumber === null ? "Sans numéro" : `#${p.jerseyNumber}`) },
  { key: "age", label: "Âge", render: (p) => String(calculateAge(p.birthDate, new Date())) },
  { key: "heightCm", label: "Taille", render: (p) => `${p.heightCm} cm` },
  { key: "draftYear", label: "Draft", render: (p) => (p.draftYear === null ? "Non drafté" : String(p.draftYear)) },
];

function symbolFor(comparison: AttributeComparison): string | null {
  switch (comparison.type) {
    case "exact":
      return "✔";
    case "higher":
      return "↑";
    case "lower":
      return "↓";
    case "no-match":
      return null;
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
    <div className="feedback-grid__row feedback-grid__row--attempt">
      <span className="feedback-grid__cell feedback-grid__cell--name">
        {player.firstName} {player.lastName}
      </span>
      {ATTRIBUTE_CELLS.map(({ key, render }) => {
        const symbol = symbolFor(feedback[key]);
        return (
          <span
            key={key}
            className={`feedback-grid__cell feedback-grid__cell--${feedback[key].type}`}
          >
            <span className="feedback-grid__value">{render(player)}</span>
            {symbol && <span className="feedback-grid__symbol">{symbol}</span>}
          </span>
        );
      })}
    </div>
  );
}
