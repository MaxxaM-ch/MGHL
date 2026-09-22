import { teamJerseyTextureUrl, teamLogoUrl, teamWireLogoUrl } from "../../../lib/team-logo";
import "../../../styles/components/guess-the-logo/logo-reveal.scss";

interface LogoRevealProps {
  team: string;
  scale: number;
  translateXPercent: number;
  translateYPercent: number;
  revealed: boolean;
  alt?: string;
  name?: string;
}

export default function LogoReveal({
  team,
  scale,
  translateXPercent,
  translateYPercent,
  revealed,
  alt = "Logo mystère",
  name,
}: LogoRevealProps) {
  const zoomStyle = {
    transform: `scale(${scale}) translate(${translateXPercent}%, ${translateYPercent}%)`,
  };
  const bannerStyle = {
    background: `radial-gradient(50% 100% at 50% 0%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%), url(${teamWireLogoUrl(team)}) center no-repeat, linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0, 1) 100%), url(${teamJerseyTextureUrl(team)}) repeat`,
    // Setting the `background` shorthand inline resets background-size to
    // its initial value for this element, regardless of what the stylesheet
    // says — it has to be set here too, alongside the shorthand, not in
    // logo-reveal.scss, or it's silently overridden back to "auto".
    backgroundSize: "auto, 656px, auto, 42px 42px",
  };

  return (
    <div className={`logo-reveal${revealed ? " logo-reveal--revealed" : ""}`}>
      <img
        className="logo-reveal__image logo-reveal__image--light"
        src={teamLogoUrl(team, "light")}
        alt={alt}
        style={zoomStyle}
      />
      <img
        className="logo-reveal__image logo-reveal__image--dark"
        src={teamLogoUrl(team, "dark")}
        alt={alt}
        style={zoomStyle}
      />
      <div className="logo-reveal__banner" style={bannerStyle} />
      <img
        className="logo-reveal__reveal-logo logo-reveal__reveal-logo--light"
        src={teamLogoUrl(team, "light")}
        alt=""
        aria-hidden="true"
      />
      <img
        className="logo-reveal__reveal-logo logo-reveal__reveal-logo--dark"
        src={teamLogoUrl(team, "dark")}
        alt=""
        aria-hidden="true"
      />
      {name && <p className="logo-reveal__name">{name}</p>}
    </div>
  );
}
