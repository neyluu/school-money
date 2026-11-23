import * as React from "react";

function usePolling(
  task: () => Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const runTask = React.useEffectEvent(task);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    let stopped = false;
    let running = false;
    let timer: number | undefined;

    async function tick() {
      window.clearTimeout(timer);
      if (stopped || running || document.hidden) {
        return;
      }
      running = true;
      await runTask();
      running = false;
      if (!stopped) {
        timer = window.setTimeout(() => void tick(), intervalMs);
      }
    }

    function handleVisibility() {
      void tick();
    }

    timer = window.setTimeout(() => void tick(), intervalMs);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, intervalMs]);
}

export { usePolling };
