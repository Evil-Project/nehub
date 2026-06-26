import type { ReactNode } from "react";
import { classNames } from "../lib";

type StatusCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  active: boolean;
  detail: string;
};

export function StatusCard({ icon, label, value, active, detail }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className={classNames("status-card-icon", active && "is-active")}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  );
}
