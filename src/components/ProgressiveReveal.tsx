import type { NormalizedPlayer } from "../lib/nhl-api/types";
import { calculateAge } from "../games/devine-le-joueur/logic";
import { countryFlagUrl } from "../lib/country-flags";
import TeamLogo from "./TeamLogo";
import "../styles/components/progressive-reveal.scss";

interface ProgressiveRevealProps {
  player: NormalizedPlayer;
  blurPx: number;
  revealed: boolean;
}

export default function ProgressiveReveal({ player, blurPx, revealed }: ProgressiveRevealProps) {
  const flagUrl = countryFlagUrl(player.nationality);
  const age = calculateAge(player.birthDate, new Date());

  return (
    <div className={`player-reveal${revealed ? " player-reveal--revealed" : ""}`}>
      <img
        src={player.headshotUrl}
        alt="Joueur mystère"
        className="player-reveal__image"
        style={{ filter: `blur(${blurPx}px)` }}
      />
      <div className="player-reveal__banner" style={{ backgroundImage: `url(${player.heroImageUrl})` }}>
        <div className="player-reveal__overlay" />
        <div className="player-reveal__info">
          <p className="player-reveal__name">
            <span className="player-reveal__first-name">{player.firstName}</span>
            <span className="player-reveal__last-name">{player.lastName}</span>
          </p>
          <p className="player-reveal__stats">
            <span>{player.jerseyNumber === null ? "Sans numéro" : `#${player.jerseyNumber}`}</span>
            <span>{player.position}</span>
            <span>Âge : {age}</span>
            <span>{player.heightCm} cm</span>
            {flagUrl && <img className="player-reveal__flag" src={flagUrl} alt={player.nationality} />}
          </p>
        </div>
        <TeamLogo team={player.team} className="player-reveal__team-logo" forceDark />
      </div>
    </div>
  );
}
