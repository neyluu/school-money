import * as React from "react";
import { useLocation } from "react-router";

const SUPPORTS_VIEW_TRANSITIONS =
  typeof document !== "undefined" && "startViewTransition" in document;

function RouteTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div
      key={pathname}
      className={
        SUPPORTS_VIEW_TRANSITIONS
          ? undefined
          : "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-150"
      }
    >
      {children}
    </div>
  );
}

export { RouteTransition };
