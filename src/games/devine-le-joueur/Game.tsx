import { useEffect, useState } from "react";
import AttemptFeedbackRow, { FeedbackGridHeader } from "../../components/AttemptFeedbackRow";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import ProgressiveReveal from "../../components/ProgressiveReveal";
import ShareResult from "../../components/ShareResult";
import StreakBadge from "../../components/StreakBadge";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import type { NormalizedPlayer } from "../../lib/nhl-api/types";
import { compareGuess, getBlurLevel, isWinningGuess, type GuessFeedback } from "./logic";
import "../../styles/games/devine-le-joueur.scss";

const GAME_ID = "devine-le-joueur";
const MAX_ATTEMPTS = 6;

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
      <ProgressiveReveal src={target.headshotUrl} alt="Joueur mystère" blurPx={blurPx} />

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
          {attempts.map((attempt) => (
            <AttemptFeedbackRow key={attempt.player.id} player={attempt.player} feedback={attempt.feedback} />
          ))}
        </div>
      )}

      {status !== "playing" && (
        <div className="result-panel">
          <p className="result-panel__message">
            {status === "won"
              ? `Trouvé en ${attempts.length} tentative${attempts.length > 1 ? "s" : ""} !`
              : `Perdu ! Le joueur était ${playerLabel(target)}.`}
          </p>
          <ShareResult
            gameTitle="Devine le joueur"
            attempts={attempts.map((a) => a.feedback)}
            won={status === "won"}
            maxAttempts={MAX_ATTEMPTS}
          />
          <StreakBadge gameId={GAME_ID} />
        </div>
      )}
    </div>
  );
}
