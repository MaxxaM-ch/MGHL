import "../styles/components/shared/loader.scss";

interface LoaderProps {
  label?: string;
}

export default function Loader({ label = "Chargement…" }: LoaderProps) {
  return (
    <div className="loader">
      <div className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
}
