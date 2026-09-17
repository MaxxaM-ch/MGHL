import ShareResult from "./ShareResult";
import StreakBadge from "./StreakBadge";
import CountdownTimer from "./CountdownTimer";
import type { GuessFeedback } from "../games/devine-le-joueur/logic";
import "../styles/components/result-modal.scss";

interface ResultModalProps {
  won: boolean;
  message: string;
  attempts: GuessFeedback[];
  maxAttempts: number;
  gameId: string;
  onClose: () => void;
}

export default function ResultModal({ won, message, attempts, maxAttempts, gameId, onClose }: ResultModalProps) {
  return (
    <div className="result-modal-backdrop" onClick={onClose}>
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="result-modal__close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <p className="result-modal__message">{message}</p>
        <ShareResult
          gameTitle="Devine le joueur"
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
