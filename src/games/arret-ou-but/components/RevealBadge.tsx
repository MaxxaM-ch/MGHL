import "../../../styles/components/arret-ou-but/reveal-badge.scss";

interface RevealBadgeProps {
  correct: boolean;
}

export default function RevealBadge({ correct }: RevealBadgeProps) {
  return (
    <div className={`reveal-badge${correct ? " reveal-badge--correct" : " reveal-badge--wrong"}`}>
      <span aria-hidden="true">{correct ? "✅" : "❌"}</span>
      <span className="reveal-badge__label">{correct ? "Bonne réponse !" : "Mauvaise réponse"}</span>
    </div>
  );
}
