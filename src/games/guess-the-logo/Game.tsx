// src/games/guess-the-logo/Game.tsx
import { useEffect, useMemo, useState } from "react";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import LogoReveal from "./components/LogoReveal";
import ResultModal from "./components/ResultModal";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import { formatDateKey, pickDailyItem } from "../../lib/daily-puzzle/seed";
import { deriveGuessStatus, type GuessStatus } from "../../lib/daily-puzzle/status";
import { TEAM_LOGOS, type TeamLogoEntry } from "../../data/curated/team-logos";
import { computeZoomTransform, isWinningGuess, pickDailyFocusPoint } from "./logic";
import "../../styles/components/guess-the-logo/guess-the-logo.scss";

const GAME_ID = "guess-the-logo";
const MAX_ATTEMPTS = 6;
// Lets the CSS zoom-out transition (logo-reveal.scss: 0.6s) finish playing
// before the result modal covers the reveal.
const MODAL_DELAY_MS = 700;

export default function Game() {
  const [target, setTarget] = useState<TeamLogoEntry | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [status, setStatus] = useState<GuessStatus>("playing");
  const [modalReady, setModalReady] = useState(false);
  const [resultModalDismissed, setResultModalDismissed] = useState(false);

  useEffect(() => {
    // Picked client-side (never in a lazy useState initializer, which Astro
    // would execute during the island's server-rendered snapshot) so the
    // answer never appears in the page's static HTML.
    const now = new Date();
    const dailyTarget = pickDailyItem(TEAM_LOGOS, now);
    // TEAM_LOGOS is a static local import (no fetch/async boundary like
    // guess-the-player's data load), so there is no external system to
    // synchronize with here; this effect's job is to compute the daily
    // target and restore saved progress, off the SSR/lazy-init path.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(dailyTarget);
    setFocusPoint(pickDailyFocusPoint(formatDateKey(now), dailyTarget.abbrev, dailyTarget.contentBounds));

    const today = formatDateKey(now);
    const saved = getDailyProgress(GAME_ID, today);
    if (!saved) return;

    const restoredAttempts = saved.guessedIds.filter((id): id is string => typeof id === "string");
    setAttempts(restoredAttempts);
    setStatus(deriveGuessStatus(restoredAttempts, dailyTarget.abbrev, MAX_ATTEMPTS, isWinningGuess));
  }, []);

  useEffect(() => {
    if (status === "playing") return;
    const timer = setTimeout(() => setModalReady(true), MODAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  function handleGuess(id: string | number) {
    const abbrev = String(id);
    if (!target || status !== "playing") return;
    if (attempts.includes(abbrev)) return;

    const nextAttempts = [...attempts, abbrev];
    setAttempts(nextAttempts);
    saveDailyProgress(GAME_ID, formatDateKey(new Date()), nextAttempts);

    const nextStatus = deriveGuessStatus(nextAttempts, target.abbrev, MAX_ATTEMPTS, isWinningGuess);
    setStatus(nextStatus);
    if (nextStatus !== "playing") {
      recordResult(GAME_ID, nextStatus === "won");
    }
  }

  const guessedAbbrevs = useMemo(() => new Set(attempts), [attempts]);

  const options: GuessOption[] = useMemo(
    () =>
      TEAM_LOGOS.filter((t) => !guessedAbbrevs.has(t.abbrev)).map((t) => ({
        id: t.abbrev,
        label: t.name,
        team: t.abbrev,
      })),
    [guessedAbbrevs],
  );

  if (!target || !focusPoint) {
    return <p>Chargement…</p>;
  }

  const revealed = status !== "playing";
  const transform = revealed
    ? { scale: 1, translateXPercent: 0, translateYPercent: 0 }
    : computeZoomTransform(attempts.length, MAX_ATTEMPTS, focusPoint);

  return (
    <div className="guess-the-logo">
      <LogoReveal team={target.abbrev} alt={revealed ? target.name : "Logo mystère"} {...transform} />

      {status === "playing" && (
        <GuessInput
          options={options}
          onSubmit={handleGuess}
          ariaLabel="Nom de l'équipe"
          placeholder={`Tentative ${attempts.length + 1} / ${MAX_ATTEMPTS}`}
        />
      )}

      {modalReady && !resultModalDismissed && (
        <ResultModal
          won={status === "won"}
          message={
            status === "won"
              ? `Trouvé en ${attempts.length} tentative${attempts.length > 1 ? "s" : ""} !`
              : `Perdu ! C'était ${target.name}.`
          }
          attemptCount={attempts.length}
          maxAttempts={MAX_ATTEMPTS}
          gameId={GAME_ID}
          gameTitle="Devine le logo"
          onClose={() => setResultModalDismissed(true)}
        />
      )}
    </div>
  );
}
