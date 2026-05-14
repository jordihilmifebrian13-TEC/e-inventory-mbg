"use client";

import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { IDLE_TIMEOUT_MS } from "@/lib/constants";

export function useIdleSignOut() {
  const { status } = useSession();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (status !== "authenticated") return;
    timer.current = setTimeout(() => {
      void signOut({ callbackUrl: "/login?reason=idle" });
    }, IDLE_TIMEOUT_MS);
  }, [status]);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    reset();
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reset, status]);
}
