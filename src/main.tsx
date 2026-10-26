/* editorial-ui · Cristian Pérez · cristianperez.me */
import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import "./styles.scss";

import { UserNode } from "./model/user";
import { Toast, ToastState } from "./components/Toast";
import {
  DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
  DEFAULT_TIME_BETWEEN_UNFOLLOWS,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
  DEFAULT_USERS_PER_SEARCH_CYCLE,
  FOLLOWERS_PAGE_SAFETY_LIMIT,
  FOLLOWING_PAGE_SAFETY_LIMIT,
  CHECKS_BEFORE_LONG_SLEEP,
  FOLLOWERS_LOADED_MIN_RATIO,
  FRIENDSHIP_STATUS_COST_FACTOR,
  FRIENDSHIP_STATUS_MAX_FOLLOWING,
  INSTAGRAM_HOSTNAME,
  RATE_LIMIT_COOLDOWN_SECONDS,
} from "./constants/constants";
import {
  addFollowerToIndex,
  createFollowerIndex,
  fetchFriendshipsPage,
  fetchFriendshipStatus,
  fetchViewerFollowerCount,
  FriendshipsListKind,
  getCookie,
  InstagramApiError,
  isUserInFollowerIndex,
  RawFriendshipUser,
  rawFriendshipUserToUserNode,
  sleep,
} from "./utils/utils";
import { NotSearching } from "./components/NotSearching";
import { State } from "./model/state";
import { Results } from "./components/Results";
import { Header } from "./components/Header";
import { Timings } from "./model/timings";
import { loadCachedScanResults, loadTimings, loadWhitelist, saveCachedScanResults, saveWhitelist } from "./utils/whitelist-manager";
import { getInitialLanguage, Language, saveLanguage, t } from "./utils/i18n";

const LOCAL_PREVIEW_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const isLocalPreview = LOCAL_PREVIEW_HOSTS.has(location.hostname);
const previewMode = isLocalPreview ? new URLSearchParams(location.search).get("preview") : null;

// Preview-only avatars, drawn inline so the preview works offline.
const _avatarUrl = (seed: string): string => {
  const hue = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" fill="hsl(${hue} 30% 72%)"/><text x="44" y="57" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="36" font-weight="600" text-anchor="middle" fill="hsl(${hue} 35% 26%)">${seed.charAt(0).toUpperCase()}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const _createPreviewUser = (
  id: string,
  username: string,
  fullName: string,
  options: { readonly isPrivate?: boolean; readonly isVerified?: boolean } = {},
): UserNode => ({
  id,
  username,
  full_name: fullName,
  profile_pic_url: _avatarUrl(username),
  is_private: options.isPrivate ?? false,
  is_verified: options.isVerified ?? false,
  followed_by_viewer: true,
  follows_viewer: false,
  requested_by_viewer: false,
});

const _getPreviewUsers = (): readonly UserNode[] => [
  _createPreviewUser("1", "alina.frames", "Alina Moreno", { isVerified: true }),
  _createPreviewUser("2", "brassandbone", "Theo Walsh", { isPrivate: true }),
  _createPreviewUser("3", "citrus.archive", "Mara Kim"),
  _createPreviewUser("4", "dawnledger", "Jon Bell", { isPrivate: true }),
  _createPreviewUser("5", "elias.market", "Elias Noor", { isVerified: true }),
  _createPreviewUser("6", "fieldnotes.studio", "Nadia Reyes"),
  _createPreviewUser("7", "glint.supply", ""),
  _createPreviewUser("8", "harbor.sequence", "Ivy Chen", { isPrivate: true }),
  _createPreviewUser("9", "inkline.daily", "Sofia Grant"),
  _createPreviewUser("10", "juniper.signal", "Cal Reed", { isVerified: true }),
  _createPreviewUser("11", "keystone.labs", "Mina Torres"),
  _createPreviewUser("12", "lowlight.club.and.a.really.long.username", "Owen Voss with a rather long display name", { isPrivate: true }),
];

const _scanningState = (results: readonly UserNode[], extra: Partial<Extract<State, { status: "scanning" }>> = {}): State => ({
  status: "scanning",
  page: 1,
  searchTerm: "",
  currentTab: "non_whitelisted",
  percentage: 0,
  results,
  whitelistedResults: [],
  filter: {
    showVerified: true,
    showPrivate: true,
    showWithOutProfilePicture: true,
  },
  ...extra,
});

const _getInitialState = (): State => {
  switch (previewMode) {
    case "results":
      return _scanningState(_getPreviewUsers(), { percentage: 100, totalScanned: 486, whitelistedResults: _getPreviewUsers().slice(10, 11) });
    case "live":
      return _scanningState(_getPreviewUsers().slice(0, 5), { percentage: 46, isScanningActive: true, totalScanned: 212 });
    default:
      return { status: "initial" };
  }
};

function App() {
  const [state, setState] = useState<State>(_getInitialState);

  const [toast, setToast] = useState<ToastState>(
    previewMode === "live"
      ? { show: true, text: t(getInitialLanguage(), "scanningFollowingProgress", 212, 486) }
      : { show: false },
  );

  // The scan reads its pacing from saved timings; there is no settings screen
  // anymore, so these are the defaults unless an older version saved others.
  const [timings] = useState<Timings>(() => {
    const storedTimings = loadTimings();
    return {
      timeBetweenSearchCycles: storedTimings?.timeBetweenSearchCycles ?? DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
      timeToWaitAfterFiveSearchCycles: storedTimings?.timeToWaitAfterFiveSearchCycles ?? DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
      timeBetweenUnfollows: storedTimings?.timeBetweenUnfollows ?? DEFAULT_TIME_BETWEEN_UNFOLLOWS,
      timeToWaitAfterFiveUnfollows: storedTimings?.timeToWaitAfterFiveUnfollows ?? DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
      usersPerSearchCycle: storedTimings?.usersPerSearchCycle ?? DEFAULT_USERS_PER_SEARCH_CYCLE,
    };
  });

  const [cachedScan, setCachedScan] = useState<{ readonly results: readonly UserNode[]; readonly timestamp: number } | null>(() =>
    loadCachedScanResults(),
  );

  const [lang, setLang] = useState<Language>(() => getInitialLanguage());

  const [scanningPaused, setScanningPaused] = useState(false);
  const scanningPausedRef = React.useRef(false);

  const pauseScan = () => {
    setScanningPaused(prev => {
      const next = !prev;
      scanningPausedRef.current = next;
      return next;
    });
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

  const isActiveProcess = state.status === "scanning" && Boolean(state.isScanningActive);

  // Messages the app shows itself go away on their own; while a scan runs,
  // its messages are shown as the status line instead (see Results).
  useEffect(() => {
    if (!toast.show || isActiveProcess) {
      return;
    }
    const timeout = setTimeout(() => setToast({ show: false }), toast.text.length > 70 ? 12000 : 5000);
    return () => clearTimeout(timeout);
  }, [toast, isActiveProcess]);

  const onLoadCached = () => {
    if (!cachedScan || cachedScan.results.length === 0) {
      return;
    }
    setState(_scanningState(cachedScan.results, {
      percentage: 100,
      whitelistedResults: loadWhitelist(),
      scannedAt: cachedScan.timestamp,
    }));
  };

  const onScan = () => {
    if (state.status !== "initial") {
      return;
    }
    if (isLocalPreview) {
      setState(_scanningState(_getPreviewUsers(), { percentage: 100, totalScanned: 486 }));
      return;
    }
    setScanningPaused(false);
    scanningPausedRef.current = false;
    setState(_scanningState([], {
      percentage: 0,
      isScanningActive: true,
      whitelistedResults: loadWhitelist(),
    }));
  };

  // A new scan has to start from the initial state, because the scan effect
  // only runs when the status changes.
  const [rescanRequested, setRescanRequested] = useState(false);
  const onRescan = () => {
    setToast({ show: false });
    setState({ status: "initial" });
    setRescanRequested(true);
  };
  useEffect(() => {
    if (state.status === "initial" && rescanRequested) {
      setRescanRequested(false);
      onScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, rescanRequested]);

  const onWhitelistUpdate = (updatedWhitelist: readonly UserNode[]) => {
    saveWhitelist(updatedWhitelist);
    setState(prevState =>
      prevState.status === "scanning" ? { ...prevState, whitelistedResults: updatedWhitelist } : prevState,
    );
  };

  const onClose = () => {
    if (isActiveProcess && !confirm(t(lang, "closeConfirm"))) {
      return;
    }
    location.reload();
  };

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prompt user if he tries to leave while in the middle of a scan.
      // This is especially good for avoiding accidental tab closing which would result in a frustrating experience.
      if (!isActiveProcess) {
        return;
      }

      // `e` Might be undefined in older browsers, so silence linter for this one.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      e = e || window.event;

      // `e` Might be undefined in older browsers, so silence linter for this one.
      // For IE and Firefox prior to version 4
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (e) {
        e.returnValue = "Changes you made may not be saved.";
      }

      // For Safari
      return "Changes you made may not be saved.";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isActiveProcess, state]);

  useEffect(() => {
    // Runs one Instagram request, retrying with backoff on rate limits / network errors.
    // `blocked` is true when retries were exhausted for such a transient error
    // (the scan should stop); false means a different, non-retryable error
    // (e.g. 404 / unavailable account), which callers may choose to skip.
    type RequestResult<T> =
      | { readonly ok: true; readonly value: T }
      | { readonly ok: false; readonly blocked: boolean };

    const fetchWithRetry = async <T,>(
      label: string,
      request: () => Promise<T>,
    ): Promise<RequestResult<T>> => {
      let retries = 0;
      const maxRetries = 3;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        try {
          return { ok: true, value: await request() };
        } catch (e: any) {
          const status = e?.status;
          const message = String(e?.message ?? "");
          const isRateLimitOrSoftBlock =
            (e instanceof InstagramApiError || e?.name === "InstagramApiError") &&
            (status === 429 || /feedback_required|checkpoint|rate limit|please wait/i.test(message));
          const isNetworkError = e instanceof TypeError || /fetch|network/i.test(message);
          const isTransient = isRateLimitOrSoftBlock || isNetworkError;

          if (isTransient && retries < maxRetries) {
            retries++;
            const waitSeconds = isRateLimitOrSoftBlock
              ? RATE_LIMIT_COOLDOWN_SECONDS * retries
              : 5 * retries;
            for (let sec = waitSeconds; sec > 0; sec--) {
              setToast({
                show: true,
                text: t(lang, "rateLimitPause", sec),
              });
              await sleep(1000);
            }
            setToast({ show: false });
            continue;
          }
          console.error(`${label} request failed:`, e);
          return { ok: false, blocked: isTransient };
        }
      }
    };

    let requestsSinceLongSleep = 0;
    const paceRequest = async () => {
      // Pause scanning if user requested so.
      while (scanningPausedRef.current) {
        await sleep(1000);
        console.info("Scan paused");
      }

      await sleep(Math.floor(Math.random() * 700) + 300);
      await sleep(Math.floor(Math.random() * (timings.timeBetweenSearchCycles - timings.timeBetweenSearchCycles * 0.7)) + timings.timeBetweenSearchCycles);

      requestsSinceLongSleep++;
      if (requestsSinceLongSleep >= CHECKS_BEFORE_LONG_SLEEP) {
        requestsSinceLongSleep = 0;
        const longSleepVar = Math.max(
          0,
          timings.timeToWaitAfterFiveSearchCycles + (Math.random() * 10000 - 5000), // +/- 5 seconds
        );
        setToast({
          show: true,
          text: t(lang, "sleepingSafety", Math.round(longSleepVar / 1000)),
        });
        await sleep(longSleepVar);
      }
      setToast({ show: false });
    };

    // Walks the viewer's own list (followers or following) page by page. `onPageUsers` is
    // awaited for each page before the next one is requested and returns
    // false to stop the walk early. Resolves true only if the whole list was
    // walked.
    const fetchList = async (
      kind: FriendshipsListKind,
      pageSafetyLimit: number,
      onPageUsers: (pageUsers: readonly RawFriendshipUser[]) => Promise<boolean>,
    ): Promise<boolean> => {
      let maxId: string | undefined;
      let pagesFetched = 0;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (true) {
        const pageMaxId = maxId;
        const result = await fetchWithRetry(kind, () => fetchFriendshipsPage(kind, pageMaxId, timings.usersPerSearchCycle));
        if (!result.ok) {
          console.error(`Stopping ${kind} scan early.`);
          return false;
        }
        const page = result.value;
        const pageUsers = page.users ?? [];

        if (!(await onPageUsers(pageUsers))) {
          return false;
        }

        const hasMore = Boolean(page.next_max_id) && page.has_more !== false;
        if (!hasMore || pageUsers.length === 0) {
          return true;
        }

        pagesFetched += 1;
        if (pagesFetched >= pageSafetyLimit) {
          console.error(`Stopping ${kind} scan early: hit the safety cap of ${pageSafetyLimit} pages.`);
          return false;
        }
        maxId = page.next_max_id;

        await paceRequest();
      }
    };

    const setScanPercentage = (percentage: number) =>
      setState(prevState =>
        prevState.status === "scanning" ? { ...prevState, percentage } : prevState,
      );

    type StatusCheckOutcome = {
      readonly nonFollowers: readonly UserNode[];
      readonly checkedCount: number;
      readonly complete: boolean;
      readonly blocked: boolean;
    };

    // Asks Instagram, account by account, whether each followed account follows
    // the viewer back, so the cost grows with how many accounts the viewer
    // follows, not with how many followers they have. Resolves null if
    // Instagram doesn't give this session that answer, in which case the
    // caller walks the followers list instead.
    const checkByFriendshipStatus = async (following: readonly RawFriendshipUser[]): Promise<StatusCheckOutcome | null> => {
      const nonFollowers: UserNode[] = [];
      let checkedCount = 0;
      let skippedCount = 0;
      let blocked = false;

      for (const user of following) {
        await paceRequest();
        const result = await fetchWithRetry(
          `Friendship status for ${user.username}`,
          () => fetchFriendshipStatus(String(user.pk_id ?? user.pk)),
        );
        if (!result.ok && result.blocked) {
          blocked = true;
          break;
        }
        if (!result.ok) {
          if (checkedCount === 0 && skippedCount === 0) {
            console.warn("Friendship status isn't available; walking the followers list instead.");
            return null;
          }
          // A non-retryable failure for one account (e.g. unavailable profile)
          // leaves it unverified, so it's skipped rather than listed.
          skippedCount++;
        } else if (!result.value.following) {
          // Every account checked here is one the viewer follows, so an answer
          // saying otherwise can't be trusted for followed_by either.
          console.warn(`Ignoring inconsistent friendship status for ${user.username}.`);
          skippedCount++;
        } else {
          checkedCount++;
          if (!result.value.followedBy) {
            const node = rawFriendshipUserToUserNode(user, false);
            nonFollowers.push(node);
            setState(prevState =>
              prevState.status === "scanning"
                ? { ...prevState, results: [...prevState.results, node] }
                : prevState,
            );
          }
        }

        const done = checkedCount + skippedCount;
        setState(prevState =>
          prevState.status === "scanning"
            ? {
                ...prevState,
                percentage: Math.min(99, 10 + Math.round((89 * done) / following.length)),
                totalScanned: checkedCount,
              }
            : prevState,
        );
        setToast({
          show: true,
          text: t(lang, "scanningFollowingProgress", done, following.length),
        });
      }

      return {
        nonFollowers,
        checkedCount,
        complete: !blocked && skippedCount === 0 && checkedCount === following.length,
        blocked,
      };
    };

    // Loads and dual-indexes every follower by ID and normalized lowercase
    // username, then compares the following list against it. Resolves null if
    // the followers list couldn't be loaded completely: an incomplete index
    // would flag real followers as non-followers.
    const checkByFollowerIndex = async (
      following: readonly RawFriendshipUser[],
      followerCount: number | null,
    ): Promise<readonly UserNode[] | null> => {
      const followerIndex = createFollowerIndex();
      let followersLoaded = 0;

      const indexFollowersPage = async (pageUsers: readonly RawFriendshipUser[]): Promise<boolean> => {
        for (const user of pageUsers) {
          addFollowerToIndex(followerIndex, user);
          followersLoaded++;
        }

        const fraction = followerCount
          ? followersLoaded / followerCount
          : 1 - 1 / (1 + followersLoaded / 150);
        setScanPercentage(Math.min(99, 10 + Math.round(89 * Math.min(1, fraction))));
        setToast({
          show: true,
          text: t(lang, "indexingFollowersProgress", followersLoaded),
        });

        return true;
      };

      await paceRequest();
      if (!(await fetchList("followers", FOLLOWERS_PAGE_SAFETY_LIMIT, indexFollowersPage))) {
        return null;
      }
      // A throttled Instagram can answer with an empty last page instead of an
      // error, which ends the walk early. Deactivated accounts count towards
      // the total without being listed, hence the small tolerance.
      if (followerCount !== null && followersLoaded < followerCount * FOLLOWERS_LOADED_MIN_RATIO) {
        console.error(`Followers list ended early: loaded ${followersLoaded} of ${followerCount}.`);
        return null;
      }
      return following
        .filter(user => !isUserInFollowerIndex(followerIndex, user))
        .map(user => rawFriendshipUserToUserNode(user, false));
    };

    const scan = async () => {
      if (state.status !== "scanning" || isLocalPreview) {
        return;
      }
      if (state.percentage === 100) {
        return;
      }

      const viewerId = getCookie("ds_user_id");
      if (viewerId === null) {
        setState(prevState =>
          prevState.status === "scanning" ? { ...prevState, isScanningActive: false } : prevState,
        );
        setToast({ show: true, text: t(lang, "scanFailedFollowing") });
        return;
      }

      // Phase 1: Load the accounts the viewer follows. Only these can be non-followers.
      const following: RawFriendshipUser[] = [];
      const followingCompleted = await fetchList(
        "following",
        FOLLOWING_PAGE_SAFETY_LIMIT,
        async pageUsers => {
          following.push(...pageUsers);
          setScanPercentage(Math.min(9, Math.round(10 * (1 - 1 / (1 + following.length / 150)))));
          setToast({
            show: true,
            text: t(lang, "loadingFollowingProgress", following.length),
          });
          return true;
        },
      );

      if (!followingCompleted && following.length === 0) {
        setState(prevState =>
          prevState.status === "scanning" ? { ...prevState, isScanningActive: false } : prevState,
        );
        setToast({
          show: true,
          text: t(lang, "scanFailedFollowing"),
        });
        return;
      }
      setScanPercentage(10);

      // Phase 2: Find out which of them follow back, picking the method that
      // needs fewer requests for this account.
      await paceRequest();
      const followerCount = await fetchViewerFollowerCount(viewerId);
      const statusCheckIsCheaper = followerCount === null
        ? following.length <= FRIENDSHIP_STATUS_MAX_FOLLOWING
        : following.length * FRIENDSHIP_STATUS_COST_FACTOR <= followerCount;
      const statusOutcome = statusCheckIsCheaper ? await checkByFriendshipStatus(following) : null;

      let nonFollowers: readonly UserNode[];
      let checkedCount: number;
      let scanIsComplete: boolean;
      let blocked = false;
      if (statusOutcome !== null) {
        nonFollowers = statusOutcome.nonFollowers;
        checkedCount = statusOutcome.checkedCount;
        scanIsComplete = followingCompleted && statusOutcome.complete;
        blocked = statusOutcome.blocked;
      } else {
        const indexed = await checkByFollowerIndex(following, followerCount);
        if (indexed === null) {
          setState(prevState =>
            prevState.status === "scanning"
              ? { ...prevState, isScanningActive: false, scanIncomplete: true }
              : prevState,
          );
          setToast({
            show: true,
            text: t(lang, "scanFailedFollowers"),
          });
          return;
        }
        nonFollowers = indexed;
        checkedCount = following.length;
        scanIsComplete = followingCompleted;
      }

      if (scanIsComplete || nonFollowers.length > 0) {
        saveCachedScanResults(nonFollowers);
        setCachedScan({ results: nonFollowers, timestamp: Date.now() });
      }

      setState(prevState => {
        if (prevState.status !== "scanning") {
          return prevState;
        }
        return {
          ...prevState,
          percentage: 100,
          scanIncomplete: !scanIsComplete,
          isScanningActive: false,
          results: nonFollowers,
          totalScanned: checkedCount,
        };
      });

      let finalToast: string;
      if (scanIsComplete) {
        finalToast = t(lang, "scanCompleted");
      } else if (blocked) {
        finalToast = t(lang, "scanBlocked", checkedCount);
      } else {
        finalToast = t(lang, "partialScanInterrupted", checkedCount);
      }
      setToast({ show: true, text: finalToast });
    };
    scan();
    // Dependency array not entirely legit, but works this way. TODO: Find a way to fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  return (
    <main id="main" role="main" className="iu">
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onClose={onClose}
        progress={isActiveProcess && state.status === "scanning" ? state.percentage : null}
      />

      {state.status === "initial" ? (
        <NotSearching onScan={onScan} lang={lang} cachedScan={cachedScan} onLoadCached={onLoadCached} />
      ) : (
        <Results
          state={state}
          setState={setState}
          scanningPaused={scanningPaused}
          pauseScan={pauseScan}
          statusText={isActiveProcess && toast.show ? toast.text : null}
          onRescan={onRescan}
          onWhitelistUpdate={onWhitelistUpdate}
          onUnfollowed={() => setCachedScan(loadCachedScanResults())}
          isLocalPreview={isLocalPreview}
          setToast={setToast}
          lang={lang}
        />
      )}

      <Toast
        toast={!isActiveProcess ? toast : { show: false }}
        onClose={() => setToast({ show: false })}
        closeLabel={lang === "es" ? "Cerrar" : "Close"}
      />
    </main>
  );
}

// Follows the theme chosen in Instagram's own settings, which it marks on <html>.
const applyInstagramTheme = () => {
  const root = document.documentElement;
  if (root.classList.contains("__fb-dark-mode")) {
    root.dataset.iuTheme = "dark";
  } else if (root.classList.contains("__fb-light-mode")) {
    root.dataset.iuTheme = "light";
  }
};

if (location.hostname !== INSTAGRAM_HOSTNAME && !isLocalPreview) {
  alert("Can be used only on Instagram routes");
} else {
  document.title = "InstagramUnfollowers";
  applyInstagramTheme();
  document.body.innerHTML = "";
  console.info("%cInstagramUnfollowers%c · interfaz rediseñada por Cristian Pérez · https://cristianperez.me", "font-weight:700;color:#0095f6", "");
  render(<App />, document.body);
}
