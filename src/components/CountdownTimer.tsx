import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextUtcMidnight } from "../lib/countdown";
import "../styles/components/shared/countdown-timer.scss";

export default function CountdownTimer() {
  const [remainingMs, setRemainingMs] = useState(() => msUntilNextUtcMidnight(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(msUntilNextUtcMidnight(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-timer">
      <span className="countdown-timer__label">Prochaine partie dans</span>
      <span className="countdown-timer__value">{formatCountdown(remainingMs)}</span>
    </div>
  );
}
