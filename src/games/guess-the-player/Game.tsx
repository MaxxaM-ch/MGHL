import { useEffect, useMemo, useState } from "react";
import AttemptFeedbackRow, { FeedbackGridHeader } from "./components/AttemptFeedbackRow";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import ProgressiveReveal from "./components/ProgressiveReveal";
import ResultModal from "./components/ResultModal";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import { formatDateKey, pickDailyItem } from "../../lib/daily-puzzle/seed";
import { deriveGuessStatus, type GuessStatus } from "../../lib/daily-puzzle/status";
import type { NormalizedPlayer } from "../../lib/nhl-api/types";
import { compareGuess, getBlurLevel, isWinningGuess, type GuessFeedback } from "./logic";
import "../../styles/components/guess-the-player/guess-the-player.scss";

const GAME_ID = "guess-the-player";
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
  const [loadError, setLoadError] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [status, setStatus] = useState<GuessStatus>("playing");
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

        const restoredAttempts: Attempt[] = saved.guessedIds
          .map((id) => data.find((p) => p.id === id))
          .filter((p): p is NormalizedPlayer => p !== undefined)
          .map((player) => ({ player, feedback: compareGuess(player, dailyTarget, new Date()) }));
        setAttempts(restoredAttempts);
        setStatus(deriveGuessStatus(restoredAttempts.map((a) => a.player), dailyTarget, MAX_ATTEMPTS, isWinningGuess));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleGuess(playerId: number) {
    if (!pool || !target || status !== "playing") return;
    if (attempts.some((a) => a.player.id === playerId)) return;
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

    const nextStatus = deriveGuessStatus(nextAttempts.map((a) => a.player), target, MAX_ATTEMPTS, isWinningGuess);
    setStatus(nextStatus);
    if (nextStatus !== "playing") {
      recordResult(GAME_ID, nextStatus === "won");
    }
  }

  const guessedIds = useMemo(() => new Set(attempts.map((a) => a.player.id)), [attempts]);

  const options: GuessOption[] = useMemo(
    () =>
      pool
        ? pool.filter((p) => !guessedIds.has(p.id)).map((p) => ({ id: p.id, label: playerLabel(p), team: p.team }))
        : [],
    [pool, guessedIds],
  );

  // Stay blurred until the reveal actually starts, even once the game has
  // ended: clearing early would show the sharp photo well before the
  // staged reveal animation, spoiling the mystery player.
  const blurPx = revealReady ? 0 : getBlurLevel(attempts.length, MAX_ATTEMPTS);

  if (loadError) {
    return <p>Impossible de charger les joueurs. Réessaie plus tard.</p>;
  }

  if (!pool || !target) {
    return <p>Chargement des joueurs…</p>;
  }

  return (
    <div className="guess-the-player">
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
          gameTitle="Devine le joueur"
          onClose={() => setResultModalDismissed(true)}
        />
      )}
    </div>
  );
}
