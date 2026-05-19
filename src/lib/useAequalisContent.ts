"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  getDefaultContent,
  getDefaultContentSnapshot,
  getStoredContentSnapshot,
  normalizeAequalisContent,
  writeStoredContent,
  type AequalisContent,
} from "./aequalisContent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("aequalis-content-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("aequalis-content-updated", callback);
  };
}

export function useAequalisContent() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getStoredContentSnapshot,
    getDefaultContentSnapshot,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadServerContent() {
      try {
        const response = await fetch("/api/aequalis-content", {
          cache: "no-store",
        });

        if (!response.ok || !isMounted) {
          return;
        }

        const data = (await response.json()) as { content?: unknown };
        writeStoredContent(normalizeAequalisContent(data.content));
      } catch {
        // Keep the local snapshot if the server is not reachable.
      }
    }

    void loadServerContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo<AequalisContent>(() => {
    try {
      const parsed = JSON.parse(snapshot) as Partial<AequalisContent>;

      return normalizeAequalisContent(parsed);
    } catch {
      return getDefaultContent();
    }
  }, [snapshot]);
}
