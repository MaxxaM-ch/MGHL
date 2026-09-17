import { useEffect, useState } from "react";
import AttemptFeedbackRow, { FeedbackGridHeader } from "../../components/AttemptFeedbackRow";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import ProgressiveReveal from "../../components/ProgressiveReveal";
import ResultModal from "../../components/ResultModal";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import type { NormalizedPlayer } from "../../lib/nhl-api/types";
import { compareGuess, getBlurLevel, isWinningGuess, type GuessFeedback } from "./logic";
import "../../styles/games/devine-le-joueur.scss";

const GAME_ID = "devine-le-joueur";
const MAX_ATTEMPTS = 6;
const REVEAL_DELAY_MS = 950;
// Matches the reveal banner's own CSS transition duration (progressive-reveal.scss).
const BANNER_ANIMATION_MS = 650;
const MODAL_DELAY_AFTER_REVEAL_MS = 1000;

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

interface GameProps {
  target: NormalizedPlayer;
}

interface Attempt {
  player: NormalizedPlayer;
  feedback: GuessFeedback;
}

type Status = "playing" | "won" | "lost";

function playerLabel(player: NormalizedPlayer): string {
  return `${player.firstName} ${player.lastName}`;
}

export default function Game({ target }: GameProps) {
  const [pool, setPool] = useState<NormalizedPlayer[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [status, setStatus] = useState<Status>("playing");
  const [revealReady, setRevealReady] = useState(false);
  const [modalReady, setModalReady] = useState(false);
  const [resultModalDismissed, setResultModalDismissed] = useState(false);

  useEffect(() => {
    if (status === "playing") return;
    const timer = setTimeout(() => setRevealReady(true), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!revealReady) return;
    const timer = setTimeout(() => setModalReady(true), BANNER_ANIMATION_MS + MODAL_DELAY_AFTER_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [revealReady]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/players.json")
      .then((res) => res.json())
      .then((data: NormalizedPlayer[]) => {
        if (cancelled) return;
        setPool(data);

        const today = todayDateString();
        const saved = getDailyProgress(GAME_ID, today);
        if (!saved) return;

        const restoredAttempts: Attempt[] = saved.guessedPlayerIds
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is NormalizedPlayer => p !== undefined)
          .map((player) => ({ player, feedback: compareGuess(player, target, new Date()) }));
        setAttempts(restoredAttempts);

        if (restoredAttempts.some((a) => isWinningGuess(a.player, target))) {
          setStatus("won");
        } else if (restoredAttempts.length >= MAX_ATTEMPTS) {
          setStatus("lost");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [target]);

  function handleGuess(playerId: number) {
    if (!pool || status !== "playing") return;
    const guessedPlayer = pool.find((p) => p.id === playerId);
    if (!guessedPlayer) return;

    const feedback = compareGuess(guessedPlayer, target, new Date());
    const nextAttempts = [...attempts, { player: guessedPlayer, feedback }];
    setAttempts(nextAttempts);
    saveDailyProgress(GAME_ID, todayDateString(), nextAttempts.map((a) => a.player.id));

    if (isWinningGuess(guessedPlayer, target)) {
      setStatus("won");
      recordResult(GAME_ID, true);
    } else if (nextAttempts.length >= MAX_ATTEMPTS) {
      setStatus("lost");
      recordResult(GAME_ID, false);
    }
  }

  const options: GuessOption[] = pool
    ? pool.map((p) => ({ id: p.id, label: playerLabel(p), team: p.team }))
    : [];

  const blurPx = status === "playing" ? getBlurLevel(attempts.length, MAX_ATTEMPTS) : 0;

  return (
    <div className="devine-le-joueur">
      <ProgressiveReveal player={target} blurPx={blurPx} revealed={revealReady} />

      {status === "playing" &&
        (pool ? (
          <GuessInput
            options={options}
            onSubmit={handleGuess}
            placeholder={`Tentative ${attempts.length + 1} / ${MAX_ATTEMPTS}`}
          />
        ) : (
          <p>Chargement des joueurs…</p>
        ))}

      {attempts.length > 0 && (
        <div className="feedback-grid">
          <FeedbackGridHeader />
          {[...attempts].reverse().map((attempt) => (
            <AttemptFeedbackRow key={attempt.player.id} player={attempt.player} feedback={attempt.feedback} />
          ))}
        </div>
      )}

      {modalReady && !resultModalDismissed && (
        <ResultModal
          won={status === "won"}
          message={
            status === "won"
              ? `Trouvé en ${attempts.length} tentative${attempts.length > 1 ? "s" : ""} !`
              : `Perdu ! Le joueur était ${playerLabel(target)}.`
          }
          attempts={attempts.map((a) => a.feedback)}
          maxAttempts={MAX_ATTEMPTS}
          gameId={GAME_ID}
          onClose={() => setResultModalDismissed(true)}
        />
      )}
    </div>
  );
}
