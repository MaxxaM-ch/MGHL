import { teamLogoUrl } from "../../../lib/team-logo";
import "../../../styles/components/guess-the-logo/logo-reveal.scss";

interface LogoRevealProps {
  team: string;
  scale: number;
  originXPercent: number;
  originYPercent: number;
}

export default function LogoReveal({ team, scale, originXPercent, originYPercent }: LogoRevealProps) {
  const style = {
    transform: `scale(${scale})`,
    transformOrigin: `${originXPercent}% ${originYPercent}%`,
  };

  return (
    <div className="logo-reveal">
      <img
        className="logo-reveal__image logo-reveal__image--light"
        src={teamLogoUrl(team, "light")}
        alt="Logo mystère"
        style={style}
      />
      <img
        className="logo-reveal__image logo-reveal__image--dark"
        src={teamLogoUrl(team, "dark")}
        alt="Logo mystère"
        style={style}
      />
    </div>
  );
}
