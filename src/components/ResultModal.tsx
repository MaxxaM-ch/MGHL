import { useEffect } from "react";
import ShareResult from "./ShareResult";
import StreakBadge from "./StreakBadge";
import CountdownTimer from "./CountdownTimer";
import "../styles/components/shared/result-modal.scss";

interface ResultModalProps {
  message: string;
  scoreLine: string;
  grid: string;
  gameId: string;
  gameTitle: string;
  onClose: () => void;
}

export default function ResultModal({ message, scoreLine, grid, gameId, gameTitle, onClose }: ResultModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="result-modal-backdrop" onClick={onClose}>
      <div
        className="result-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-message"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="result-modal__close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <p className="result-modal__message" id="result-modal-message">
          {message}
        </p>
        <ShareResult gameTitle={gameTitle} scoreLine={scoreLine} grid={grid} showTitle={false} showCopyButton={false} />
        <CountdownTimer />
        <StreakBadge gameId={gameId} />
      </div>
    </div>
  );
}
