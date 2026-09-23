import { useCallback, useEffect, useRef, useState } from "react";
import ResultModal from "../../components/ResultModal";
import AnswerControls from "./components/AnswerControls";
import ClipPlayer, { type ClipPlayerHandle } from "./components/ClipPlayer";
import RevealBadge from "./components/RevealBadge";
import NextClipButton from "./components/NextClipButton";
import { recordResult } from "../../lib/storage/stats";
import { getDailyProgress, saveDailyProgress } from "../../lib/storage/daily-progress";
import { formatDateKey, pickDailyItems } from "../../lib/daily-puzzle/seed";
import { buildShareGrid, computeRevealStopSecond, isCorrectGuess, type Answer } from "./logic";
import { CLIPS, type ArretOuButClip } from "../../data/curated/arret-ou-but-clips";
import "../../styles/components/arret-ou-but/arret-ou-but.scss";

const GAME_ID = "arret-ou-but";
const CLIPS_PER_ROUND = 5;
const REVEAL_DELAY_MS = 2000;
const MODAL_DELAY_MS = 1500;

type Phase = "playing" | "answering" | "revealing" | "error" | "next" | "done";

interface ClipResult {
  youtubeId: string;
  answer: Answer;
  correct: boolean;
}

function encodeToken(result: ClipResult): string {
  return `${result.youtubeId}:${result.answer}`;
}

function decodeToken(token: string): { youtubeId: string; answer: Answer } | null {
  const separatorIndex = token.lastIndexOf(":");
  if (separatorIndex === -1) return null;
  const youtubeId = token.slice(0, separatorIndex);
  const answer = token.slice(separatorIndex + 1) as Answer;
  if (answer !== "but" && answer !== "arret" && answer !== "none") return null;
  return { youtubeId, answer };
}

export default function Game() {
  const [started, setStarted] = useState(false);
  const [clips, setClips] = useState<ArretOuButClip[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [selectedAnswer, setSelectedAnswer] = useState<Answer>("none");
  const [results, setResults] = useState<ClipResult[]>([]);
  const [modalReady, setModalReady] = useState(false);
  const [resultModalDismissed, setResultModalDismissed] = useState(false);
  const clipPlayerRef = useRef<ClipPlayerHandle>(null);

  useEffect(() => {
    const now = new Date();
    const dailyClips = pickDailyItems(CLIPS, now, CLIPS_PER_ROUND);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClips(dailyClips);

    const today = formatDateKey(now);
    const saved = getDailyProgress(GAME_ID, today);
    if (!saved) return;

    const restoredResults: ClipResult[] = [];
    for (const token of saved.guessedIds) {
      if (typeof token !== "string") continue;
      const decoded = decodeToken(token);
      if (!decoded) continue;
      const clip = dailyClips.find((c) => c.youtubeId === decoded.youtubeId);
      if (!clip) continue;
      restoredResults.push({
        youtubeId: decoded.youtubeId,
        answer: decoded.answer,
        correct: isCorrectGuess(decoded.answer, clip.reponse),
      });
    }
    if (restoredResults.length === 0) return;

    setResults(restoredResults);
    setCurrentIndex(restoredResults.length);
    setStarted(true);
    if (restoredResults.length >= dailyClips.length) setPhase("done");
  }, []);

  const handleReachedGel = useCallback(() => {
    setPhase("answering");
  }, []);

  const handleError = useCallback(() => {
    setPhase("error");
  }, []);

  function handleAnswerSubmit(answer: Answer | null) {
    setSelectedAnswer(answer ?? "none");
    setPhase("revealing");
    clipPlayerRef.current?.resume();
  }

  const currentClip = clips?.[currentIndex] ?? null;

  useEffect(() => {
    if (phase !== "revealing" || !currentClip) return;
    const timer = setTimeout(() => {
      const correct = isCorrectGuess(selectedAnswer, currentClip.reponse);
      const nextResults = [...results, { youtubeId: currentClip.youtubeId, answer: selectedAnswer, correct }];
      setResults(nextResults);
      saveDailyProgress(GAME_ID, formatDateKey(new Date()), nextResults.map(encodeToken));
      setPhase("next");
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
    // Deliberately keyed on phase only: currentClip/selectedAnswer/results
    // are read at fire time on purpose (this timer represents "2s after
    // this specific submission", not a value that should restart if
    // something else re-renders the component in between).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleNext() {
    if (!clips) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= clips.length) {
      const finalScore = results.filter((r) => r.correct).length;
      setPhase("done");
      recordResult(GAME_ID, results.length > 0 && finalScore === results.length);
      return;
    }
    setCurrentIndex(nextIndex);
    setSelectedAnswer("none");
    setPhase("playing");
  }

  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(() => setModalReady(true), MODAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (!clips) return <p>Chargement…</p>;

  if (!started) {
    return (
      <div className="arret-ou-but">
        <button type="button" className="arret-ou-but__start" onClick={() => setStarted(true)}>
          Commencer
        </button>
      </div>
    );
  }

  const score = results.filter((r) => r.correct).length;
  const isLastClip = currentIndex + 1 >= clips.length;

  return (
    <div className="arret-ou-but">
      {phase !== "done" && currentClip && (
        <>
          <ClipPlayer
            // No key: this is one persistent player for the whole round,
            // not remounted per clip (see ClipPlayer's own comment) —
            // remounting would also throw away an already-unmuted state.
            ref={clipPlayerRef}
            youtubeId={currentClip.youtubeId}
            debut={currentClip.debut}
            gel={currentClip.gel}
            fin={computeRevealStopSecond(currentClip.fin)}
            onReachedGel={handleReachedGel}
            onError={handleError}
          />

          {phase === "answering" && <AnswerControls onSubmit={handleAnswerSubmit} />}

          {phase === "revealing" && <RevealBadge correct={isCorrectGuess(selectedAnswer, currentClip.reponse)} />}

          {phase === "error" && (
            <>
              <p className="arret-ou-but__error">{"Ce clip n'est plus disponible."}</p>
              <NextClipButton onNext={handleNext} label={isLastClip ? "Voir le score" : "Suivant"} />
            </>
          )}

          {phase === "next" && (
            <NextClipButton onNext={handleNext} label={isLastClip ? "Voir le score" : "Suivant"} />
          )}
        </>
      )}

      {modalReady && !resultModalDismissed && (
        <ResultModal
          message={`${score}/${results.length} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} !`}
          scoreLine={`${score}/${results.length}`}
          grid={buildShareGrid(results.map((r) => r.correct))}
          gameId={GAME_ID}
          gameTitle="Arrêt ou but ?"
          onClose={() => setResultModalDismissed(true)}
        />
      )}
    </div>
  );
}
