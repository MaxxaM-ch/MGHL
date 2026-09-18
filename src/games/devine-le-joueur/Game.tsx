import { useEffect, useState } from "react";
import AttemptFeedbackRow, { FeedbackGridHeader } from "./components/AttemptFeedbackRow";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import ProgressiveReveal from "./components/ProgressiveReveal";
import ResultModal from "./components/ResultModal";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import { formatDateKey, pickDailyItem } from "../../lib/daily-puzzle/seed";
import type { NormalizedPlayer } from "../../lib/nhl-api/types";
import { compareGuess, deriveStatus, getBlurLevel, type GuessFeedback, type Status } from "./logic";
import "../../styles/games/devine-le-joueur.scss";

const GAME_ID = "devine-le-joueur";
const MAX_ATTEMPTS = 6;
// Lets the newest feedback row's cell-flip animation finish before the big
// reveal starts (see feedback-grid.scss: 8 cells x 0.08s stagger + 0.35s ~= 910ms).
const REVEAL_DELAY_MS = 950;
// Matches the reveal banner's own CSS transition duration (progressive-reveal.scss).
const BANNER_ANIMATION_MS = 650;
const MODAL_DELAY_AFTER_REVEAL_MS = 1000;

interface Attempt {
  player: NormalizedPlayer;
  feedback: GuessFeedback;
}

function playerLabel(player: NormalizedPlayer): string {
  return `${player.firstName} ${player.lastName}`;
}

export default function Game() {
  const [pool, setPool] = useState<NormalizedPlayer[] | null>(null);
  const [target, setTarget] = useState<NormalizedPlayer | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [status, setStatus] = useState<Status>("playing");
  const [revealReady, setRevealReady] = useState(false);
  const [modalReady, setModalReady] = useState(false);
  const [resultModalDismissed, setResultModalDismissed] = useState(false);

  useEffect(() => {
    if (status === "playing") return;

    let modalTimer: ReturnType<typeof setTimeout> | undefined;
    const revealTimer = setTimeout(() => {
      setRevealReady(true);
      modalTimer = setTimeout(() => setModalReady(true), BANNER_ANIMATION_MS + MODAL_DELAY_AFTER_REVEAL_MS);
    }, REVEAL_DELAY_MS);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(modalTimer);
    };
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/players.json")
      .then((res) => res.json())
      .then((data: NormalizedPlayer[]) => {
        if (cancelled) return;
        setPool(data);

        // Picked client-side (never passed down from the server) so the
        // answer never appears in the page's static HTML.
        const dailyTarget = pickDailyItem(data, new Date());
        setTarget(dailyTarget);

        const today = formatDateKey(new Date());
        const saved = getDailyProgress(GAME_ID, today);
        if (!saved) return;

        const restoredAttempts: Attempt[] = saved.guessedPlayerIds
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is NormalizedPlayer => p !== undefined)
          .map((player) => ({ player, feedback: compareGuess(player, dailyTarget, new Date()) }));
        setAttempts(restoredAttempts);
        setStatus(deriveStatus(restoredAttempts.map((a) => a.player), dailyTarget, MAX_ATTEMPTS));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleGuess(playerId: number) {
    if (!pool || !target || status !== "playing") return;
    const guessedPlayer = pool.find((p) => p.id === playerId);
    if (!guessedPlayer) return;

    const feedback = compareGuess(guessedPlayer, target, new Date());
    const nextAttempts = [...attempts, { player: guessedPlayer, feedback }];
    setAttempts(nextAttempts);
    saveDailyProgress(
      GAME_ID,
      formatDateKey(new Date()),
      nextAttempts.map((a) => a.player.id),
    );

    const nextStatus = deriveStatus(nextAttempts.map((a) => a.player), target, MAX_ATTEMPTS);
    setStatus(nextStatus);
    if (nextStatus !== "playing") {
      recordResult(GAME_ID, nextStatus === "won");
    }
  }

  const options: GuessOption[] = pool
    ? pool.map((p) => ({ id: p.id, label: playerLabel(p), team: p.team }))
    : [];

  const blurPx = status === "playing" ? getBlurLevel(attempts.length, MAX_ATTEMPTS) : 0;

  if (!pool || !target) {
    return <p>Chargement des joueurs…</p>;
  }

  return (
    <div className="devine-le-joueur">
      <ProgressiveReveal player={target} blurPx={blurPx} revealed={revealReady} />

      {status === "playing" && (
        <GuessInput
          options={options}
          onSubmit={handleGuess}
          placeholder={`Tentative ${attempts.length + 1} / ${MAX_ATTEMPTS}`}
        />
      )}

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
