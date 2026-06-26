import { classNames } from "../lib";

const avatarInitial = (value: string) => value.trim().slice(0, 1).toUpperCase() || "?";

export function DefaultAvatar({ className, name }: { className?: string; name: string }) {
  return (
    <span className={classNames("default-avatar", className)} aria-hidden="true">
      {avatarInitial(name)}
    </span>
  );
}
