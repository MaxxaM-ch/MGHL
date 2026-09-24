import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
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
  guessReveal: number;
  fin: number;
  wantsSound: boolean;
  onReachedGel: () => void;
  onReachedGuessReveal: () => void;
  onError: () => void;
}

const ClipPlayer = forwardRef<ClipPlayerHandle, ClipPlayerProps>(function ClipPlayer(
  { youtubeId, debut, gel, guessReveal, fin, wantsSound, onReachedGel, onReachedGuessReveal, onError },
  ref,
) {
  const mountId = `clip-player-${useId().replace(/:/g, "")}`;
  const playerRef = useRef<YouTubePlayer | null>(null);
  const gelTargetRef = useRef(gel);
  const guessRevealTargetRef = useRef(guessReveal);
  const finTargetRef = useRef(fin);
  const stageRef = useRef<"gel" | "revealing">("gel");
  const gelReachedRef = useRef(false);
  const guessRevealReachedRef = useRef(false);
  const finReachedRef = useRef(false);
  // Starts already "unmuted" (no button) only if the player asked for sound
  // upfront; the async check below flips it back to muted if that attempt
  // was silently blocked, so the manual button stays a reliable fallback.
  const [muted, setMuted] = useState(!wantsSound);

  useImperativeHandle(ref, () => ({
    resume() {
      stageRef.current = "revealing";
      guessRevealReachedRef.current = false;
      finReachedRef.current = false;
      playerRef.current?.playVideo();
    },
  }));

  // Created once for the whole round (no youtubeId in the dependency
  // array): a single persistent player reused across every clip via
  // loadVideoById below, rather than one destroyed-and-recreated player
  // per clip. This is also what lets a single "unmute" click keep sound on
  // for the rest of the round, since it's the same iframe throughout.
  useEffect(() => {
    let cancelled = false;

    createYouTubePlayer(mountId, onError).then((player) => {
      if (cancelled) return;
      playerRef.current = player;
      if (wantsSound) {
        player.unMute();
        // The browser sometimes silently ignores this if the click that
        // started the round is judged too far removed by the time this
        // promise resolves (script load + iframe handshake) — verify it
        // actually took, and fall back to the manual button if not.
        setTimeout(() => {
          if (!cancelled && player.isMuted()) setMuted(true);
        }, 500);
      } else {
        player.mute();
      }
    });

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      // The very first playVideo() call right after onReady/loadVideoById
      // is unreliable — the player accepts it but silently stays paused (a
      // known IFrame API timing quirk). Keep nudging it every tick until
      // it actually starts; harmless to call on an already-playing video.
      if (player.getPlayerState() !== PLAYER_STATE_PLAYING) {
        player.playVideo();
      }

      if (stageRef.current === "gel") {
        if (gelReachedRef.current) return;
        if (player.getCurrentTime() >= gelTargetRef.current) {
          gelReachedRef.current = true;
          player.pauseVideo();
          player.seekTo(gelTargetRef.current, true);
          onReachedGel();
        }
        return;
      }

      // stage === "revealing": plays straight through from gel to fin, no
      // pause at guessReveal — only a callback fires there so the parent
      // can show the badge and start the "Suivant" button while the clip
      // keeps showing the actual outcome, instead of freezing right as it
      // happens.
      if (!guessRevealReachedRef.current && player.getCurrentTime() >= guessRevealTargetRef.current) {
        guessRevealReachedRef.current = true;
        onReachedGuessReveal();
      }
      if (!finReachedRef.current && player.getCurrentTime() >= finTargetRef.current) {
        finReachedRef.current = true;
        player.pauseVideo();
        player.seekTo(finTargetRef.current, true);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loads whichever clip is current into the persistent player, including
  // the first one (retried until the player above finishes initializing).
  useEffect(() => {
    stageRef.current = "gel";
    gelTargetRef.current = gel;
    guessRevealTargetRef.current = guessReveal;
    finTargetRef.current = fin;
    gelReachedRef.current = false;
    guessRevealReachedRef.current = false;
    finReachedRef.current = false;

    let cancelled = false;
    const tryLoad = () => {
      if (cancelled) return;
      const player = playerRef.current;
      if (!player) {
        setTimeout(tryLoad, 50);
        return;
      }
      player.loadVideoById(youtubeId, debut);
    };
    tryLoad();

    return () => {
      cancelled = true;
    };
  }, [youtubeId, debut, gel, guessReveal, fin]);

  function handleUnmute() {
    playerRef.current?.unMute();
    setMuted(false);
  }

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
      <div className="clip-player__blocker" />
      {muted && (
        <button type="button" className="clip-player__unmute" onClick={handleUnmute}>
          🔊 Activer le son
        </button>
      )}
    </div>
  );
});

export default ClipPlayer;
