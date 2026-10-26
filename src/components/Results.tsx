/* editorial-ui · Cristian Pérez · cristianperez.me */
import React, { useCallback, useMemo, useState } from "react";
import { State } from "../model/state";
import { UserNode } from "../model/user";
import { ScanningTab } from "../model/scanning-tab";
import { UNFOLLOWERS_PER_PAGE } from "../constants/constants";
import { getCookie, getUsersForDisplay, sleep, unfollowUser } from "../utils/utils";
import { removeFromCachedScan } from "../utils/whitelist-manager";
import { formatCount, formatWhen } from "../utils/format";
import { Language, t } from "../utils/i18n";
import { ToastState } from "./Toast";
import { UnfollowState, UserRow } from "./UserRow";
import { CopyIcon, SearchIcon } from "./icons/Icons";

type ScanningState = Extract<State, { status: "scanning" }>;

interface ResultsProps {
  readonly state: ScanningState;
  readonly setState: (update: (prev: State) => State) => void;
  readonly scanningPaused: boolean;
  readonly pauseScan: () => void;
  // The scan's latest progress message while it runs.
  readonly statusText: string | null;
  readonly onRescan: () => void;
  readonly onWhitelistUpdate: (users: readonly UserNode[]) => void;
  readonly onUnfollowed: () => void;
  readonly isLocalPreview: boolean;
  readonly setToast: (toast: ToastState) => void;
  readonly lang: Language;
}

const ALL_ACCOUNTS = { showVerified: true, showPrivate: true, showWithOutProfilePicture: true };

const byUsername = (a: UserNode, b: UserNode) => (a.username > b.username ? 1 : -1);

export const Results = ({
  state,
  setState,
  scanningPaused,
  pauseScan,
  statusText,
  onRescan,
  onWhitelistUpdate,
  onUnfollowed,
  isLocalPreview,
  setToast,
  lang,
}: ResultsProps) => {
  const [unfollowStates, setUnfollowStates] = useState<Readonly<Record<string, UnfollowState>>>({});
  const [unfollowBlocked, setUnfollowBlocked] = useState(false);

  const isActive = Boolean(state.isScanningActive);
  const update = (patch: Partial<ScanningState>) =>
    setState(prev => (prev.status === "scanning" ? { ...prev, ...patch } : prev));

  const nonFollowerCount = getUsersForDisplay(state.results, state.whitelistedResults, "non_whitelisted", "", ALL_ACCOUNTS).length;
  const ignoredCount = getUsersForDisplay(state.results, state.whitelistedResults, "whitelisted", "", ALL_ACCOUNTS).length;
  const hasVerified = state.results.some(user => user.is_verified && !user.follows_viewer);
  const ignoredIds = useMemo(() => new Set(state.whitelistedResults.map(user => user.id)), [state.whitelistedResults]);

  const displayed = [
    ...getUsersForDisplay(state.results, state.whitelistedResults, state.currentTab, state.searchTerm, state.filter),
  ].sort(byUsername);
  const visible = displayed.slice(0, state.page * UNFOLLOWERS_PER_PAGE);
  const remaining = displayed.length - visible.length;

  const setUnfollowState = (userId: string, value: UnfollowState) =>
    setUnfollowStates(prev => ({ ...prev, [userId]: value }));

  const onUnfollowCancel = useCallback((user: UserNode) => {
    setUnfollowStates(prev => (prev[user.id] === "confirm" ? { ...prev, [user.id]: "idle" } : prev));
  }, []);

  const onUnfollowClick = async (user: UserNode) => {
    if ((unfollowStates[user.id] ?? "idle") === "idle") {
      setUnfollowState(user.id, "confirm");
      return;
    }
    if (unfollowStates[user.id] !== "confirm") {
      return;
    }
    setUnfollowState(user.id, "pending");

    let outcome: "unfollowed" | "failed" | "blocked" = "failed";
    if (isLocalPreview) {
      await sleep(900);
      outcome = "unfollowed";
    } else {
      const csrftoken = getCookie("csrftoken");
      if (csrftoken !== null) {
        try {
          const result = await unfollowUser(user, csrftoken);
          outcome = result.outcome;
          if (outcome !== "unfollowed") {
            console.warn(`Unfollow for ${user.username} not confirmed: ${result.detail}`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (outcome === "unfollowed") {
      setUnfollowState(user.id, "done");
      removeFromCachedScan(user.id);
      onUnfollowed();
      return;
    }
    setUnfollowState(user.id, "idle");
    if (outcome === "blocked") {
      setUnfollowBlocked(true);
      setToast({ show: true, text: t(lang, "actionBlockedWarning") });
    } else {
      setToast({ show: true, text: t(lang, "unfollowFailed", user.username) });
    }
  };

  const onToggleIgnore = (user: UserNode) => {
    const previous = state.whitelistedResults;
    if (ignoredIds.has(user.id)) {
      onWhitelistUpdate(previous.filter(ignored => ignored.id !== user.id));
      setToast({ show: true, text: t(lang, "restoredToast", user.username) });
    } else {
      onWhitelistUpdate([...previous, user]);
      setToast({
        show: true,
        text: t(lang, "ignoredToast", user.username),
        action: { label: t(lang, "undo"), onClick: () => onWhitelistUpdate(previous) },
      });
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayed.map(user => user.username).join("\n"));
      setToast({ show: true, text: t(lang, "copiedToClipboard", formatCount(displayed.length, lang)) });
    } catch (e) {
      console.error("Could not copy the list:", e);
    }
  };

  const switchTab = (tab: ScanningTab) => {
    if (state.currentTab !== tab) {
      update({ currentTab: tab, page: 1 });
    }
  };

  let title: string;
  if (state.currentTab === "whitelisted") {
    title = t(lang, "ignoredTitle", formatCount(ignoredCount, lang));
  } else if (isActive && nonFollowerCount === 0) {
    title = t(lang, "scanningTitle");
  } else if (nonFollowerCount === 1) {
    title = t(lang, "nonFollowersTitleOne");
  } else {
    title = t(lang, "nonFollowersTitle", formatCount(nonFollowerCount, lang));
  }

  let meta: string | null = null;
  if (isActive) {
    meta = scanningPaused ? t(lang, "paused") : statusText;
  } else if (state.scannedAt !== undefined) {
    meta = t(lang, "scannedMeta", formatWhen(state.scannedAt, lang));
  } else if (state.totalScanned !== undefined) {
    meta = t(lang, "checkedMeta", formatCount(state.totalScanned, lang));
  }

  let empty: React.ReactNode = null;
  if (displayed.length === 0) {
    if (state.searchTerm !== "") {
      empty = (
        <>
          <p>{t(lang, "emptySearch", state.searchTerm)}</p>
          <button type="button" className="iu-text-button iu-text-button--accent" onClick={() => update({ searchTerm: "", page: 1 })}>
            {t(lang, "clearSearch")}
          </button>
        </>
      );
    } else if (state.currentTab === "whitelisted") {
      empty = (
        <>
          <p>{t(lang, "emptyIgnored")}</p>
          <p className="iu-empty__hint">{t(lang, "emptyIgnoredHint")}</p>
        </>
      );
    } else if (isActive) {
      empty = <p>{t(lang, "waitingFirstResults")}</p>;
    } else if (nonFollowerCount === 0) {
      empty = <p>{t(lang, "emptyNonFollowers")}</p>;
    }
  }

  const showTabs = ignoredCount > 0 || state.currentTab === "whitelisted";

  return (
    <section className="iu-results" aria-busy={isActive}>
      <div className="iu-summary">
        <div className="iu-summary__text">
          <h1 aria-live="polite">{title}</h1>
          {meta && <p className="iu-summary__meta">{meta}</p>}
        </div>
        {isActive ? (
          <button type="button" className="iu-button iu-button--secondary iu-button--small" onClick={pauseScan}>
            {scanningPaused ? t(lang, "resume") : t(lang, "pause")}
          </button>
        ) : (
          <button type="button" className="iu-button iu-button--secondary iu-button--small" onClick={onRescan}>
            {t(lang, "rescan")}
          </button>
        )}
      </div>

      {state.scanIncomplete && !isActive && (
        <p className="iu-note" role="alert">{t(lang, "partialScanWarning")}</p>
      )}

      {showTabs && (
        <div className="iu-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={state.currentTab === "non_whitelisted"}
            className="iu-tab"
            onClick={() => switchTab("non_whitelisted")}
          >
            {t(lang, "nonFollowersTab")} <span className="iu-tab__count">{formatCount(nonFollowerCount, lang)}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={state.currentTab === "whitelisted"}
            className="iu-tab"
            onClick={() => switchTab("whitelisted")}
          >
            {t(lang, "ignoredTab")} <span className="iu-tab__count">{formatCount(ignoredCount, lang)}</span>
          </button>
        </div>
      )}

      {state.results.length > 0 && (
        <div className="iu-toolbar">
          <label className="iu-search">
            <SearchIcon />
            <input
              type="search"
              placeholder={t(lang, "searchPlaceholder")}
              aria-label={t(lang, "searchPlaceholder")}
              value={state.searchTerm}
              onInput={e => update({ searchTerm: e.currentTarget.value, page: 1 })}
            />
          </label>
          <div className="iu-toolbar__options">
            {hasVerified && (
              <button
                type="button"
                className="iu-chip"
                aria-pressed={!state.filter.showVerified}
                onClick={() => update({ filter: { ...state.filter, showVerified: !state.filter.showVerified }, page: 1 })}
              >
                {t(lang, "hideVerified")}
              </button>
            )}
            <button type="button" className="iu-text-button" onClick={onCopy} disabled={displayed.length === 0}>
              <CopyIcon />
              {t(lang, "copyList")}
            </button>
          </div>
        </div>
      )}

      {empty ? (
        <div className="iu-empty">{empty}</div>
      ) : (
        <ul className="iu-list">
          {visible.map(user => (
            <UserRow
              key={user.id}
              user={user}
              isIgnored={ignoredIds.has(user.id)}
              unfollowState={unfollowStates[user.id] ?? "idle"}
              unfollowDisabled={isActive || unfollowBlocked}
              onToggleIgnore={onToggleIgnore}
              onUnfollowClick={onUnfollowClick}
              onUnfollowCancel={onUnfollowCancel}
              lang={lang}
            />
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <button type="button" className="iu-button iu-button--secondary iu-more" onClick={() => update({ page: state.page + 1 })}>
          {t(lang, "showMore", formatCount(Math.min(remaining, UNFOLLOWERS_PER_PAGE), lang))}
        </button>
      )}
    </section>
  );
};
