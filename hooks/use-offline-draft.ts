"use client";

import * as React from "react";

const PREFIX = "mbg-offline-draft:";

export function useOfflineDraft<T extends object>(key: string) {
  const storageKey = `${PREFIX}${key}`;

  const load = React.useCallback((): Record<string, unknown> | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [storageKey]);

  const save = React.useCallback(
    (data: Partial<T>) => {
      try {
        const prev = load() ?? {};
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...prev, ...data, _savedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    },
    [load, storageKey],
  );

  const clear = React.useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { load, save, clear };
}
