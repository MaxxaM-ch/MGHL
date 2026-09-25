import { useEffect, useRef, useState, type CSSProperties } from "react";
import "../../../styles/components/arret-ou-but/next-clip-button.scss";

const DEFAULT_FILL_DURATION_MS = 3000;
const TICK_MS = 50;

interface NextClipButtonProps {
  onNext: () => void;
  label: string;
  fillDurationMs?: number;
}

export default function NextClipButton({ onNext, label, fillDurationMs = DEFAULT_FILL_DURATION_MS }: NextClipButtonProps) {
  const [fillPercent, setFillPercent] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const percent = Math.min((elapsed / fillDurationMs) * 100, 100);
      setFillPercent(percent);
      if (percent >= 100 && !firedRef.current) {
        firedRef.current = true;
        onNext();
      }
    }, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    if (firedRef.current) return;
    firedRef.current = true;
    onNext();
  }

  const style = { "--fill-percent": `${fillPercent}%` } as CSSProperties;

  return (
    <button type="button" className="next-clip-button" style={style} onClick={handleClick}>
      {label}
    </button>
  );
}
