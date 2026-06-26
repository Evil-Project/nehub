import { EyeOff, ShieldCheck } from "lucide-react";
import { classNames } from "../lib";

type StatusPillProps = {
  active: boolean;
  label: string;
};

export function StatusPill({ active, label }: StatusPillProps) {
  return (
    <span className={classNames("status-pill", active && "is-active")}>
      {active ? <ShieldCheck size={14} /> : <EyeOff size={14} />}
      {label}
    </span>
  );
}
