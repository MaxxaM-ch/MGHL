import { useEffect, useState } from "react";
import AttemptFeedbackRow from "../../components/AttemptFeedbackRow";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import ProgressiveReveal from "../../components/ProgressiveReveal";
import ShareResult from "../../components/ShareResult";
import StreakBadge from "../../components/StreakBadge";
import { recordResult } from "../../lib/storage/stats";
import type { NormalizedPlayer } from "../../lib/nhl-api/types";
import { compareGuess, getBlurLevel, isWinningGuess, type GuessFeedback } from "./logic";

const GAME_ID = "devine-le-joueur";
const MAX_ATTEMPTS = 6;

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
        if (!cancelled) setPool(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleGuess(playerId: number) {
    if (!pool || status !== "playing") return;
    const guessedPlayer = pool.find((p) => p.id === playerId);
    if (!guessedPlayer) return;

    const feedback = compareGuess(guessedPlayer, target, new Date());
    const nextAttempts = [...attempts, { player: guessedPlayer, feedback }];
    setAttempts(nextAttempts);

    if (isWinningGuess(guessedPlayer, target)) {
      setStatus("won");
      recordResult(GAME_ID, true);
    } else if (nextAttempts.length >= MAX_ATTEMPTS) {
      setStatus("lost");
      recordResult(GAME_ID, false);
    }
  }

  const options: GuessOption[] = pool
    ? pool.map((p) => ({ id: p.id, label: playerLabel(p) }))
    : [];

  const blurPx = status === "playing" ? getBlurLevel(attempts.length, MAX_ATTEMPTS) : 0;

  return (
    <div>
      <ProgressiveReveal src={target.headshotUrl} alt="Joueur mystère" blurPx={blurPx} />

      {attempts.map((attempt) => (
        <AttemptFeedbackRow
          key={attempt.player.id}
          playerName={playerLabel(attempt.player)}
          feedback={attempt.feedback}
        />
      ))}

      {status === "playing" &&
        (pool ? (
          <GuessInput options={options} onSubmit={handleGuess} />
        ) : (
          <p>Chargement des joueurs…</p>
        ))}

      {status !== "playing" && (
        <>
          <p>
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
        </>
      )}

      <StreakBadge gameId={GAME_ID} />
    </div>
  );
}
