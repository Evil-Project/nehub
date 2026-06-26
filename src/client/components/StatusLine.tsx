type StatusLineProps = {
  label: string;
  value: string;
  active: boolean;
};

export function StatusLine({ label, value, active }: StatusLineProps) {
  return (
    <div className="status-line">
      <span>{label}</span>
      <strong className={active ? "is-active" : ""}>{value}</strong>
    </div>
  );
}
