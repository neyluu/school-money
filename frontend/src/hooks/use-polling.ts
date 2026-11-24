import * as React from "react";

function usePolling(
  task: () => Promise<void>,
  intervalMs: number,
  enabled = true,
  immediate = true,
) {
  const runTask = React.useEffectEvent(task);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    let stopped = false;
    let running = false;
    let timer: number | undefined;

    function schedule(delay: number) {
      window.clearTimeout(timer);
      if (!stopped) {
        timer = window.setTimeout(() => void tick(), delay);
      }
    }

    async function tick() {
      if (stopped || running) {
        return;
      }

      if (document.hidden) {
        schedule(intervalMs);
        return;
      }

      running = true;
      try {
        await runTask();
      } catch {
        //
      } finally {
        running = false;
      }
      schedule(intervalMs);
    }

    function handleVisibility() {
      if (!document.hidden) {
        schedule(0);
      }
    }

    schedule(immediate ? 0 : intervalMs);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, intervalMs, immediate]);
}

export { usePolling };
