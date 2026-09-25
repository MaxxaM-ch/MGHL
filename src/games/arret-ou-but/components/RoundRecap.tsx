import type { ArretOuButClip } from "../../../data/curated/arret-ou-but-clips";
import type { Answer, ClipResult } from "../logic";
import "../../../styles/components/arret-ou-but/round-recap.scss";

interface RoundRecapProps {
  clips: ArretOuButClip[];
  results: ClipResult[];
}

const ANSWER_LABELS: Record<Answer, string> = {
  but: "But",
  arret: "Arrêt",
  none: "Pas répondu",
};

export default function RoundRecap({ clips, results }: RoundRecapProps) {
  return (
    <div className="round-recap-wrapper">
      <table className="round-recap">
        <thead>
          <tr>
            <th scope="col"></th>
            {results.map((result, index) => (
              <th scope="col" key={result.youtubeId}>
                Clip {index + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Résultat</th>
            {results.map((result) => (
              <td key={result.youtubeId} className={result.correct ? "round-recap__correct" : "round-recap__wrong"}>
                {result.correct ? "✅" : "❌"}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Ta réponse</th>
            {results.map((result) => (
              <td key={result.youtubeId}>{ANSWER_LABELS[result.answer]}</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Réponse</th>
            {results.map((result) => {
              const clip = clips.find((c) => c.youtubeId === result.youtubeId);
              return <td key={result.youtubeId}>{clip ? ANSWER_LABELS[clip.reponse] : "?"}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
