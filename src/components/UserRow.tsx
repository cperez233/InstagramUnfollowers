/* editorial-ui · Cristian Pérez · cristianperez.me */
import React, { useEffect, useState } from "react";
import { UserNode } from "../model/user";
import { Language, t } from "../utils/i18n";
import { HideIcon, RestoreIcon, VerifiedBadge } from "./icons/Icons";

export type UnfollowState = "idle" | "confirm" | "pending" | "done";

interface UserRowProps {
  readonly user: UserNode;
  readonly isIgnored: boolean;
  readonly unfollowState: UnfollowState;
  readonly unfollowDisabled: boolean;
  readonly onToggleIgnore: (user: UserNode) => void;
  readonly onUnfollowClick: (user: UserNode) => void;
  readonly onUnfollowCancel: (user: UserNode) => void;
  readonly lang: Language;
}

export const UserRow = ({
  user,
  isIgnored,
  unfollowState,
  unfollowDisabled,
  onToggleIgnore,
  onUnfollowClick,
  onUnfollowCancel,
  lang,
}: UserRowProps) => {
  const [avatarFailed, setAvatarFailed] = useState(false);

  // The confirmation step steps back on its own if it isn't confirmed.
  useEffect(() => {
    if (unfollowState !== "confirm") {
      return;
    }
    const timeout = setTimeout(() => onUnfollowCancel(user), 4000);
    return () => clearTimeout(timeout);
  }, [unfollowState, user, onUnfollowCancel]);

  const profileUrl = `https://www.instagram.com/${user.username}/`;
  const isDone = unfollowState === "done";

  let unfollowLabel: string;
  switch (unfollowState) {
    case "confirm":
      unfollowLabel = t(lang, "confirmUnfollow");
      break;
    case "pending":
      unfollowLabel = t(lang, "unfollowing");
      break;
    case "done":
      unfollowLabel = t(lang, "unfollowedState");
      break;
    default:
      unfollowLabel = t(lang, "following");
  }

  return (
    <li className={`iu-row ${isDone ? "is-done" : ""}`}>
      <a
        className="iu-row__profile"
        href={profileUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={t(lang, "openProfile", user.username)}
      >
        <span className="iu-avatar" aria-hidden="true">
          {avatarFailed || !user.profile_pic_url ? (
            <span className="iu-avatar__initial">{user.username.charAt(0).toUpperCase()}</span>
          ) : (
            <img src={user.profile_pic_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} />
          )}
        </span>
        <span className="iu-row__names">
          <span className="iu-row__username">
            <span className="iu-row__handle">{user.username}</span>
            {user.is_verified && <VerifiedBadge label={t(lang, "verified")} />}
          </span>
          {(user.full_name || user.is_private) && (
            <span className="iu-row__fullname">
              {user.full_name}
              {user.full_name && user.is_private && " · "}
              {user.is_private && t(lang, "privateAccount")}
            </span>
          )}
        </span>
      </a>
      <div className="iu-row__actions">
        {isDone ? (
          <span className="iu-row__done">{unfollowLabel}</span>
        ) : (
          <button
            type="button"
            className={`iu-follow-button ${unfollowState === "confirm" ? "is-confirm" : ""}`}
            disabled={unfollowDisabled || unfollowState === "pending"}
            aria-busy={unfollowState === "pending"}
            onClick={() => onUnfollowClick(user)}
          >
            {unfollowLabel}
          </button>
        )}
        <button
          type="button"
          className="iu-icon-button iu-row__ignore"
          onClick={() => onToggleIgnore(user)}
          aria-label={isIgnored ? t(lang, "restoreHint", user.username) : t(lang, "ignoreHint", user.username)}
          title={isIgnored ? t(lang, "restore") : t(lang, "ignore")}
        >
          {isIgnored ? <RestoreIcon /> : <HideIcon />}
        </button>
      </div>
    </li>
  );
};
