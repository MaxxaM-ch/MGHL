import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getTimerUrgency, type Answer, type TimerUrgency } from "../logic";
import "../../../styles/components/arret-ou-but/answer-controls.scss";

const TIMER_SECONDS = 8;

// Same hex values as $feedback-exact/$feedback-close/$feedback-wrong in
// _colors.scss. Driven from JS via a CSS custom property (like
// NextClipButton's --fill-percent) rather than modifier classes, since the
// color needs to be set on two separate elements (the seconds label and
// the bar fill) from a single source.
const URGENCY_COLORS: Record<TimerUrgency, string> = {
  calm: "#16a34a",
  warning: "#d97706",
  urgent: "#dc2626",
};

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

  const urgency = getTimerUrgency(secondsLeft);
  const fillPercent = (secondsLeft / TIMER_SECONDS) * 100;
  const timerStyle = { "--timer-color": URGENCY_COLORS[urgency] } as CSSProperties;

  return (
    <div className="answer-controls">
      <div className="answer-timer" style={timerStyle}>
        <span className="answer-timer__seconds" aria-live="polite">
          {secondsLeft}s
        </span>
        <div className="answer-timer__track">
          <div className="answer-timer__fill" style={{ width: `${fillPercent}%` }} />
        </div>
      </div>
      <div className="answer-controls__choices">
        <button
          type="button"
          className={`answer-controls__choice answer-controls__choice--arret${selected === "arret" ? " answer-controls__choice--selected" : ""}`}
          onClick={() => setSelected("arret")}
        >
          Arrêt
        </button>
        <button
          type="button"
          className={`answer-controls__choice answer-controls__choice--but${selected === "but" ? " answer-controls__choice--selected" : ""}`}
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
