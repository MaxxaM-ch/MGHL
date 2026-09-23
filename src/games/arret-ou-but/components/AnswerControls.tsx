import { useEffect, useRef, useState } from "react";
import type { Answer } from "../logic";
import "../../../styles/components/arret-ou-but/answer-controls.scss";

const TIMER_SECONDS = 8;

interface AnswerControlsProps {
  onSubmit: (answer: Answer | null) => void;
}

export default function AnswerControls({ onSubmit }: AnswerControlsProps) {
  const [selected, setSelected] = useState<Answer | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!submittedRef.current) {
        submittedRef.current = true;
        onSubmit(selected);
      }
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // Deliberately excludes onSubmit/selected: onSubmit must be stable in
    // the caller, and reading `selected` at timeout time (not as a
    // dependency) is exactly the "whatever was chosen when time ran out"
    // behavior this timer is meant to implement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function handleValidate() {
    if (selected === null || submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(selected);
  }

  return (
    <div className="answer-controls">
      <div className="answer-controls__timer" aria-live="polite">
        {secondsLeft}s
      </div>
      <div className="answer-controls__choices">
        <button
          type="button"
          className={`answer-controls__choice${selected === "arret" ? " answer-controls__choice--selected" : ""}`}
          onClick={() => setSelected("arret")}
        >
          Arrêt
        </button>
        <button
          type="button"
          className={`answer-controls__choice${selected === "but" ? " answer-controls__choice--selected" : ""}`}
          onClick={() => setSelected("but")}
        >
          But
        </button>
      </div>
      <button
        type="button"
        className="answer-controls__validate"
        disabled={selected === null}
        onClick={handleValidate}
      >
        Valider
      </button>
    </div>
  );
}
