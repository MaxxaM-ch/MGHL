import "../styles/components/progressive-reveal.scss";

interface ProgressiveRevealProps {
  src: string;
  alt: string;
  blurPx: number;
}

export default function ProgressiveReveal({ src, alt, blurPx }: ProgressiveRevealProps) {
  return (
    <div className="player-reveal">
      <img
        src={src}
        alt={alt}
        className="player-reveal__image"
        style={{ filter: `blur(${blurPx}px)` }}
      />
    </div>
  );
}
