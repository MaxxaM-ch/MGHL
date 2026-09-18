import { useEffect } from "react";
import ShareResult from "./ShareResult";
import StreakBadge from "../../../components/StreakBadge";
import CountdownTimer from "../../../components/CountdownTimer";
import type { GuessFeedback } from "../logic";
import "../../../styles/components/guess-the-player/result-modal.scss";

interface ResultModalProps {
  won: boolean;
  message: string;
  attempts: GuessFeedback[];
  maxAttempts: number;
  gameId: string;
  gameTitle: string;
  onClose: () => void;
}

export default function ResultModal({
  won,
  message,
  attempts,
  maxAttempts,
  gameId,
  gameTitle,
  onClose,
}: ResultModalProps) {
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
        <ShareResult
          gameTitle={gameTitle}
          attempts={attempts}
          won={won}
          maxAttempts={maxAttempts}
          showTitle={false}
          showCopyButton={false}
        />
        <CountdownTimer />
        <StreakBadge gameId={gameId} />
      </div>
    </div>
  );
}
