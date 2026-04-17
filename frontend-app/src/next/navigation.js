import { useSyncExternalStore } from "react";

const EVENT_NAME = "locationchange";

function patchHistory() {
  if (typeof window === "undefined" || window.__homeBuddyHistoryPatched) {
    return;
  }

  const { pushState, replaceState } = window.history;

  window.history.pushState = function patchedPushState(...args) {
    const result = pushState.apply(this, args);
    window.dispatchEvent(new Event(EVENT_NAME));
    return result;
  };

  window.history.replaceState = function patchedReplaceState(...args) {
    const result = replaceState.apply(this, args);
    window.dispatchEvent(new Event(EVENT_NAME));
    return result;
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event(EVENT_NAME));
  });

  window.__homeBuddyHistoryPatched = true;
}

function subscribe(onStoreChange) {
  patchHistory();
  window.addEventListener(EVENT_NAME, onStoreChange);
  return () => window.removeEventListener(EVENT_NAME, onStoreChange);
}

function getSnapshot() {
  return window.location.pathname;
}

function getServerSnapshot() {
  return "/";
}

function navigate(pathname, replace = false) {
  window.history[replace ? "replaceState" : "pushState"]({}, "", pathname);
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useRouter() {
  return {
    push: (pathname) => navigate(pathname, false),
    replace: (pathname) => navigate(pathname, true),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.dispatchEvent(new Event(EVENT_NAME)),
  };
}