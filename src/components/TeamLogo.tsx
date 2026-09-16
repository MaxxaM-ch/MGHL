import { teamLogoUrl } from "../lib/team-logo";
import "../styles/components/team-logo.scss";

interface TeamLogoProps {
  team: string;
  className?: string;
  alt?: string;
}

export default function TeamLogo({ team, className = "", alt = "" }: TeamLogoProps) {
  return (
    <span className="team-logo-badge">
      <img className={`team-logo team-logo--light ${className}`} src={teamLogoUrl(team, "light")} alt={alt} />
      <img className={`team-logo team-logo--dark ${className}`} src={teamLogoUrl(team, "dark")} alt={alt} />
    </span>
  );
}
