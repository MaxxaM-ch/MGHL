import { useState } from "react";
import "../styles/components/shared/share-result.scss";

interface ShareResultProps {
  gameTitle: string;
  scoreLine: string;
  grid: string;
  showTitle?: boolean;
  showCopyButton?: boolean;
}

export default function ShareResult({
  gameTitle,
  scoreLine,
  grid,
  showTitle = true,
  showCopyButton = true,
}: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

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
