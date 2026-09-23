import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { createYouTubePlayer, PLAYER_STATE_PLAYING, type YouTubePlayer } from "../../../lib/youtube-player";
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
  const mountId = `clip-player-${useId().replace(/:/g, "")}`;
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

    createYouTubePlayer(mountId, youtubeId, onError).then((player) => {
      if (cancelled) return;
      playerRef.current = player;
      // Unmuted autoplay is silently blocked by the browser here: by the
      // time this promise resolves (external script load + iframe
      // handshake), the click that started the round no longer counts as a
      // "fresh" user gesture from this iframe's own autoplay policy. Muted
      // autoplay has no such restriction — the game is playable on visuals
      // alone, so this trade-off is unconditional, not a fallback.
      player.mute();
      player.seekTo(debut, true);
      player.playVideo();
    });

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player || reachedRef.current) return;
      // The very first playVideo() call right after onReady is
      // unreliable — the player accepts it but silently stays in the
      // "unstarted"/"paused" state (a known IFrame API timing quirk).
      // Keep nudging it every tick until it actually starts; harmless to
      // call on an already-playing video.
      if (player.getPlayerState() !== PLAYER_STATE_PLAYING) {
        player.playVideo();
      }
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

  // The YouTube IFrame API *replaces* the element it's given with its own
  // iframe (it doesn't mount inside it) — so that element must never be the
  // node React itself is tracking as this component's root, or React's own
  // unmount cleanup later tries to remove a node YouTube already swapped
  // out from under it. This wrapper is React's stable root; the inner div
  // (targeted by id, per the API's documented usage) is the disposable one
  // YouTube is allowed to replace.
  return (
    <div className="clip-player">
      <div id={mountId} />
    </div>
  );
});

export default ClipPlayer;
