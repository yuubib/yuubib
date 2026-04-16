import type { NavigateFunction, NavigateOptions, To } from "react-router";

declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  }
}

export function navigateWithTransition(
  navigate: NavigateFunction,
  to: To,
  options?: NavigateOptions
) {
  if (typeof document !== "undefined" && typeof document.startViewTransition === "function") {
    document.startViewTransition(() => {
      navigate(to, options);
    });
    return;
  }

  navigate(to, options);
}
