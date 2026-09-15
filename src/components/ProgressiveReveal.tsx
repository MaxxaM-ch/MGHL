interface ProgressiveRevealProps {
  src: string;
  alt: string;
  blurPx: number;
}

export default function ProgressiveReveal({ src, alt, blurPx }: ProgressiveRevealProps) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        filter: `blur(${blurPx}px)`,
        transition: "filter 0.3s ease",
        borderRadius: 12,
        width: "100%",
        maxWidth: 260,
        aspectRatio: "1 / 1",
        objectFit: "cover",
      }}
    />
  );
}
