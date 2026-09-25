import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { createYouTubePlayer, PLAYER_STATE_PLAYING, type YouTubePlayer } from "../../../lib/youtube-player";
import ClipCountdown from "./ClipCountdown";
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
  countingDown: boolean;
  onCountdownComplete: () => void;
  onReachedGel: () => void;
  onReachedGuessReveal: () => void;
  onError: () => void;
}

const ClipPlayer = forwardRef<ClipPlayerHandle, ClipPlayerProps>(function ClipPlayer(
  {
    youtubeId,
    debut,
    gel,
    guessReveal,
    fin,
    wantsSound,
    countingDown,
    onCountdownComplete,
    onReachedGel,
    onReachedGuessReveal,
    onError,
  },
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
  // Mirrors the countingDown prop for the polling interval below, which is
  // created once ([] deps) and reads refs rather than props — without this,
  // a leftover video from the previous clip (paused at its own "fin") would
  // get nudged back into playing behind the countdown overlay.
  const countingDownRef = useRef(countingDown);
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

  useEffect(() => {
    countingDownRef.current = countingDown;
  }, [countingDown]);

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
      // Never touch the player while the pre-clip countdown is showing —
      // otherwise this nudge would resume whatever the previous clip left
      // paused on, behind the countdown overlay.
      if (countingDownRef.current) return;

      if (stageRef.current === "gel") {
        // Once paused at gel, stop touching the player entirely — the nudge
        // below would otherwise see "not playing" and immediately resume
        // it, right past the freeze point, with nothing left to stop it
        // before it plays out the whole answer.
        if (gelReachedRef.current) return;
        // The very first playVideo() call right after onReady/loadVideoById
        // is unreliable — the player accepts it but silently stays paused
        // (a known IFrame API timing quirk). Keep nudging it every tick
        // until it actually starts; harmless once it's already playing.
        if (player.getPlayerState() !== PLAYER_STATE_PLAYING) {
          player.playVideo();
        }
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
      // happens. Same reasoning as above: once paused at fin, stop nudging.
      if (finReachedRef.current) return;
      if (player.getPlayerState() !== PLAYER_STATE_PLAYING) {
        player.playVideo();
      }
      if (!guessRevealReachedRef.current && player.getCurrentTime() >= guessRevealTargetRef.current) {
        guessRevealReachedRef.current = true;
        onReachedGuessReveal();
      }
      if (player.getCurrentTime() >= finTargetRef.current) {
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
  // Gated on countingDown so the video only actually starts once the
  // pre-clip countdown overlay finishes, not the instant the clip's props
  // change — re-runs when countingDown flips to false to load right then.
  useEffect(() => {
    stageRef.current = "gel";
    gelTargetRef.current = gel;
    guessRevealTargetRef.current = guessReveal;
    finTargetRef.current = fin;
    gelReachedRef.current = false;
    guessRevealReachedRef.current = false;
    finReachedRef.current = false;

    if (countingDown) return;

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
  }, [youtubeId, debut, gel, guessReveal, fin, countingDown]);

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
      {countingDown && <ClipCountdown onComplete={onCountdownComplete} />}
      {muted && !countingDown && (
        <button type="button" className="clip-player__unmute" onClick={handleUnmute}>
          🔊 Activer le son
        </button>
      )}
    </div>
  );
});

export default ClipPlayer;
