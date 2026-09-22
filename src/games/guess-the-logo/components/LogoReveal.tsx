import { teamLogoUrl } from "../../../lib/team-logo";
import "../../../styles/components/guess-the-logo/logo-reveal.scss";

interface LogoRevealProps {
  team: string;
  scale: number;
  translateXPercent: number;
  translateYPercent: number;
  alt?: string;
}

export default function LogoReveal({
  team,
  scale,
  translateXPercent,
  translateYPercent,
  alt = "Logo mystère",
}: LogoRevealProps) {
  const style = {
    transform: `scale(${scale}) translate(${translateXPercent}%, ${translateYPercent}%)`,
  };

  return (
    <div className="logo-reveal">
      <img
        className="logo-reveal__image logo-reveal__image--light"
        src={teamLogoUrl(team, "light")}
        alt={alt}
        style={style}
      />
      <img
        className="logo-reveal__image logo-reveal__image--dark"
        src={teamLogoUrl(team, "dark")}
        alt={alt}
        style={style}
      />
    </div>
  );
}
