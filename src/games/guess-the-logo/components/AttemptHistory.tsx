import TeamLogo from "../../../components/TeamLogo";
import { TEAM_LOGOS } from "../../../data/curated/team-logos";
import "../../../styles/components/guess-the-logo/attempt-history.scss";

interface AttemptHistoryProps {
  attempts: string[];
  target: string;
}

export default function AttemptHistory({ attempts, target }: AttemptHistoryProps) {
  if (attempts.length === 0) return null;

  return (
    <ul className="attempt-history">
      {[...attempts].reverse().map((abbrev) => {
        const isCorrect = abbrev === target;
        const teamName = TEAM_LOGOS.find((t) => t.abbrev === abbrev)?.name ?? abbrev;
        return (
          <li
            key={abbrev}
            className={`attempt-history__row${isCorrect ? " attempt-history__row--correct" : " attempt-history__row--wrong"}`}
          >
            <TeamLogo team={abbrev} className="attempt-history__logo" />
            <span className="attempt-history__name">{teamName}</span>
          </li>
        );
      })}
    </ul>
  );
}
