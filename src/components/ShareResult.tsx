import { useState } from "react";
import { buildShareGrid, type GuessFeedback } from "../games/devine-le-joueur/logic";
import "../styles/components/share-result.scss";

interface ShareResultProps {
  gameTitle: string;
  attempts: GuessFeedback[];
  won: boolean;
  maxAttempts: number;
}

export default function ShareResult({ gameTitle, attempts, won, maxAttempts }: ShareResultProps) {
  const [copied, setCopied] = useState(false);

  const scoreLine = won ? `${attempts.length}/${maxAttempts}` : `X/${maxAttempts}`;
  const shareText = `${gameTitle} ${scoreLine}\n${buildShareGrid(attempts)}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
  }

  return (
    <div className="share-result">
      <p className="share-result__text">{shareText}</p>
      <button type="button" className="share-result__button" onClick={handleCopy}>
        {copied ? "Copié !" : "Copier le résultat"}
      </button>
    </div>
  );
}
