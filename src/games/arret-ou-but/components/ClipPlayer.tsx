import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createYouTubePlayer, type YouTubePlayer } from "../../../lib/youtube-player";
import "../../../styles/components/arret-ou-but/clip-player.scss";

const POLL_INTERVAL_MS = 150;

export interface ClipPlayerHandle {
  resume: () => void;
}

interface ClipPlayerProps {
  youtubeId: string;
  debut: number;
  gel: number;
  fin: number;
  onReachedGel: () => void;
  onError: () => void;
}

const ClipPlayer = forwardRef<ClipPlayerHandle, ClipPlayerProps>(function ClipPlayer(
  { youtubeId, debut, gel, fin, onReachedGel, onError },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const targetRef = useRef(gel);
  const stageRef = useRef<"gel" | "fin">("gel");
  const reachedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    resume() {
      stageRef.current = "fin";
      targetRef.current = fin;
      reachedRef.current = false;
      playerRef.current?.playVideo();
    },
  }));

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    createYouTubePlayer(container, youtubeId, onError).then((player) => {
      if (cancelled) return;
      playerRef.current = player;
      player.seekTo(debut, true);
      player.playVideo();
    });

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player || reachedRef.current) return;
      if (player.getCurrentTime() >= targetRef.current) {
        reachedRef.current = true;
        player.pauseVideo();
        player.seekTo(targetRef.current, true);
        if (stageRef.current === "gel") onReachedGel();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      playerRef.current?.destroy();
    };
    // Deliberately keyed on youtubeId only: onReachedGel/onError must be
    // stable (useCallback with no deps) in the caller, and debut/gel/fin
    // never change for an already-mounted clip — re-running this effect on
    // every render would tear down and recreate the underlying iframe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  return <div className="clip-player" ref={containerRef} />;
});

export default ClipPlayer;
