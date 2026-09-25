import { useEffect, useState } from "react";
import { computeCountdownTickMs } from "../logic";
import "../../../styles/components/arret-ou-but/clip-countdown.scss";

const COUNTDOWN_START = 3;
// Shown as a full "3, 2, 1" countdown but compressed into a shorter real
// duration than 3 seconds, so the pace between clips feels snappier while
// still giving the player a beat to look away from the previous outcome.
const COUNTDOWN_TOTAL_MS = 2500;
const TICK_MS = computeCountdownTickMs(COUNTDOWN_TOTAL_MS, COUNTDOWN_START);

interface ClipCountdownProps {
  onComplete: () => void;
}

export default function ClipCountdown({ onComplete }: ClipCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);

  useEffect(() => {
    if (secondsLeft <= 1) {
      const timer = setTimeout(onComplete, TICK_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), TICK_MS);
    return () => clearTimeout(timer);
    // Deliberately excludes onComplete: it must be stable in the caller,
    // and only secondsLeft should drive re-scheduling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <div className="clip-countdown">
      <span className="clip-countdown__number" key={secondsLeft}>
        {secondsLeft}
      </span>
    </div>
  );
}
