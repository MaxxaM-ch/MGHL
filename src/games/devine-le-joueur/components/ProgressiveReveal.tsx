import type { ReactNode } from "react";
import type { NormalizedPlayer } from "../../../lib/nhl-api/types";
import { calculateAge } from "../logic";
import { countryFlagUrl } from "../../../lib/country-flags";
import TeamLogo from "../../../components/TeamLogo";
import "../../../styles/components/progressive-reveal.scss";

interface ProgressiveRevealProps {
  player: NormalizedPlayer;
  blurPx: number;
  revealed: boolean;
}

function withSeparators(items: ReactNode[]): ReactNode[] {
  return items.flatMap((item, index) =>
    index === 0
      ? [item]
      : [
          <span key={`sep-${index}`} className="player-reveal__stats-separator" aria-hidden="true">
            ·
          </span>,
          item,
        ],
  );
}

export default function ProgressiveReveal({ player, blurPx, revealed }: ProgressiveRevealProps) {
  const flagUrl = countryFlagUrl(player.nationality);
  const age = calculateAge(player.birthDate, new Date());

  return (
    <div className={`player-reveal${revealed ? " player-reveal--revealed" : ""}`}>
      <img
        src={player.headshotUrl}
        alt="Joueur mystère"
        className="player-reveal__image player-reveal__image--guessing"
        style={{ filter: `blur(${blurPx}px)` }}
      />
      <div className="player-reveal__banner" style={{ backgroundImage: `url(${player.heroImageUrl})` }}>
        <div className="player-reveal__overlay" />
        <img
          src={player.headshotUrl}
          alt={`${player.firstName} ${player.lastName}`}
          className="player-reveal__image player-reveal__image--portrait"
        />
        <div className="player-reveal__info">
          <p className="player-reveal__name">
            <span className="player-reveal__first-name">{player.firstName}</span>
            <span className="player-reveal__last-name">{player.lastName}</span>
          </p>
          <p className="player-reveal__stats">
            {withSeparators([
              <span key="number">{player.jerseyNumber === null ? "Sans numéro" : `#${player.jerseyNumber}`}</span>,
              <span key="position">{player.position}</span>,
              <span key="age">{age} ans</span>,
              <span key="height">{player.heightCm} cm</span>,
              ...(flagUrl
                ? [
                    <span key="flag">
                      <img className="player-reveal__flag" src={flagUrl} alt={player.nationality} />
                    </span>,
                  ]
                : []),
            ])}
          </p>
        </div>
        <TeamLogo team={player.team} className="player-reveal__team-logo" forceDark />
      </div>
    </div>
  );
}
