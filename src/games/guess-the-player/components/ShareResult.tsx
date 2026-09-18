import { useState } from "react";
import { buildShareGrid, type GuessFeedback } from "../logic";
import "../../../styles/components/guess-the-player/share-result.scss";

interface ShareResultProps {
  gameTitle: string;
  attempts: GuessFeedback[];
  won: boolean;
  maxAttempts: number;
  showTitle?: boolean;
  showCopyButton?: boolean;
}

export default function ShareResult({
  gameTitle,
  attempts,
  won,
  maxAttempts,
  showTitle = true,
  showCopyButton = true,
}: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const scoreLine = won ? `${attempts.length}/${maxAttempts}` : `X/${maxAttempts}`;
  const grid = buildShareGrid(attempts);
  const shareText = `${gameTitle} ${scoreLine}\n${grid}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  }

  return (
    <div className="share-result">
      <p className="share-result__text">{showTitle ? shareText : grid}</p>
      {showCopyButton && (
        <button type="button" className="share-result__button" onClick={handleCopy}>
          {copied ? "Copié !" : copyFailed ? "Échec de la copie" : "Copier le résultat"}
        </button>
      )}
    </div>
  );
}
