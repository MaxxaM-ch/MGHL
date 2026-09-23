import "../../../styles/components/arret-ou-but/sound-toggle.scss";

interface SoundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  return (
    <div className="sound-toggle">
      <span className="sound-toggle__label">Jouer avec le son</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Activer le son"
        className={`sound-toggle__track${enabled ? " sound-toggle__track--on" : ""}`}
        onClick={() => onChange(!enabled)}
      >
        <span className="sound-toggle__icon sound-toggle__icon--off" aria-hidden="true">
          🔇
        </span>
        <span className="sound-toggle__icon sound-toggle__icon--on" aria-hidden="true">
          🔊
        </span>
        <span className="sound-toggle__thumb" />
      </button>
    </div>
  );
}
