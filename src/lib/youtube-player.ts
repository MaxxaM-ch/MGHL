// Minimal hand-written types for the handful of YouTube IFrame Player API
// members this project actually uses — avoids pulling in a full @types
// package for a handful of methods.
export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  mute(): void;
  destroy(): void;
}

// YT.PlayerState.PLAYING. Not using the full enum since nothing else here
// needs it.
export const PLAYER_STATE_PLAYING = 1;

interface YouTubePlayerReadyEvent {
  target: YouTubePlayer;
}

interface YouTubePlayerConstructorOptions {
  videoId: string;
  host: string;
  playerVars: {
    controls: 0 | 1;
    disablekb: 0 | 1;
    modestbranding: 0 | 1;
    rel: 0 | 1;
    iv_load_policy: 1 | 3;
    fs: 0 | 1;
    playsinline: 0 | 1;
  };
  events: {
    onReady: (event: YouTubePlayerReadyEvent) => void;
    onError: () => void;
  };
}

declare global {
  interface Window {
    YT?: {
      // The constructor's first argument must be an element id (string),
      // not an element reference — passing an element directly is
      // silently mishandled by the API's internal bootstrap code.
      Player: new (
        elementId: string,
        options: YouTubePlayerConstructorOptions,
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SCRIPT_URL = "https://www.youtube.com/iframe_api";
// The bootstrap script above always loads from youtube.com, but passing
// this as the player's `host` makes the embedded iframe itself use the
// privacy-enhanced domain (fewer cookies set before playback starts).
const PRIVACY_HOST = "https://www.youtube-nocookie.com";

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = API_SCRIPT_URL;
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

export async function createYouTubePlayer(
  elementId: string,
  videoId: string,
  onError: () => void,
): Promise<YouTubePlayer> {
  await loadYouTubeApi();
  return new Promise((resolve) => {
    new window.YT!.Player(elementId, {
      videoId,
      host: PRIVACY_HOST,
      playerVars: {
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => resolve(event.target),
        onError,
      },
    });
  });
}
