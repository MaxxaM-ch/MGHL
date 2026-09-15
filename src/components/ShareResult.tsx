import { useState } from "react";
import { buildShareGrid, type GuessFeedback } from "../games/devine-le-joueur/logic";

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
    <div>
      <p style={{ whiteSpace: "pre" }}>{shareText}</p>
      <button type="button" onClick={handleCopy}>
        {copied ? "Copié !" : "Copier le résultat"}
      </button>
    </div>
  );
}
