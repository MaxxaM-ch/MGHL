import { useEffect, useMemo, useState } from "react";
import GuessInput, { type GuessOption } from "../../components/GuessInput";
import ResultModal from "../../components/ResultModal";
import AttemptHistory from "./components/AttemptHistory";
import LogoReveal from "./components/LogoReveal";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import { formatDateKey, pickDailyItem } from "../../lib/daily-puzzle/seed";
import { deriveGuessStatus, type GuessStatus } from "../../lib/daily-puzzle/status";
import { TEAM_LOGOS, type TeamLogoEntry } from "../../data/curated/team-logos";
import {
  buildShareGrid,
  computeZoomTransform,
  getBlurLevel,
  getSaturationLevel,
  isWinningGuess,
  pickDailyFocusPoint,
} from "./logic";
import "../../styles/components/guess-the-logo/guess-the-logo.scss";

const GAME_ID = "guess-the-logo";
const MAX_ATTEMPTS = 6;
// Gives the browser a real paint of the small, in-progress box before
// flipping to the revealed state — without this, restoring an
// already-finished game from localStorage sets status to "won"/"lost" in
// the same mount effect that sets it up, so React can batch the
// playing -> revealed change into a single paint and the box just
// appears already-enlarged instead of animating. guess-the-player has the
// same delay (REVEAL_DELAY_MS) for the same reason.
const REVEAL_DELAY_MS = 400;
// Lets the full reveal choreography (logo-reveal.scss: box grows, banner
// fades in, big logo appears then slides left, team name wipes in — the
// last of these starts at 1s and takes 1.1s, ending at 2.1s) finish
// playing before the result modal covers the reveal.
const MODAL_DELAY_MS = 2400;

export default function Game() {
  const [target, setTarget] = useState<TeamLogoEntry | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [status, setStatus] = useState<GuessStatus>("playing");
  const [revealReady, setRevealReady] = useState(false);
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
    const timer = setTimeout(() => setRevealReady(true), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!revealReady) return;
    const timer = setTimeout(() => setModalReady(true), MODAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [revealReady]);

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

  // Gated on revealReady (delayed), not raw status: see REVEAL_DELAY_MS.
  const revealed = revealReady;
  const transform = revealed
    ? { scale: 1, translateXPercent: 0, translateYPercent: 0 }
    : computeZoomTransform(attempts.length, MAX_ATTEMPTS, focusPoint);
  // Stay blurred/desaturated until the reveal actually starts, even once
  // the game has ended: clearing early would show the sharp, full-color
  // logo well before the staged reveal animation, spoiling the mystery.
  const blurPx = revealed ? 0 : getBlurLevel(attempts.length, MAX_ATTEMPTS);
  const saturationPercent = revealed ? 100 : getSaturationLevel(attempts.length, MAX_ATTEMPTS);

  return (
    <div className="guess-the-logo">
      <LogoReveal
        team={target.abbrev}
        revealed={revealed}
        blurPx={blurPx}
        saturationPercent={saturationPercent}
        alt={revealed ? target.name : "Logo mystère"}
        name={revealed ? target.name : undefined}
        {...transform}
      />

      {status === "playing" && (
        <GuessInput
          options={options}
          onSubmit={handleGuess}
          ariaLabel="Nom de l'équipe"
          placeholder={`Tentative ${attempts.length + 1} / ${MAX_ATTEMPTS}`}
        />
      )}

      <AttemptHistory attempts={attempts} target={target.abbrev} />

      {modalReady && !resultModalDismissed && (
        <ResultModal
          message={
            status === "won"
              ? `Trouvé en ${attempts.length} tentative${attempts.length > 1 ? "s" : ""} !`
              : `Perdu ! C'était ${target.name}.`
          }
          scoreLine={status === "won" ? `${attempts.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`}
          grid={buildShareGrid(attempts.length, status === "won")}
          gameId={GAME_ID}
          gameTitle="Devine le logo"
          onClose={() => setResultModalDismissed(true)}
        />
      )}
    </div>
  );
}
