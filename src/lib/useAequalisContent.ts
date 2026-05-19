"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getDefaultContent,
  getDefaultContentSnapshot,
  getStoredContentSnapshot,
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

  return useMemo<AequalisContent>(() => {
    try {
      const parsed = JSON.parse(snapshot) as Partial<AequalisContent>;

      return {
        products: Array.isArray(parsed.products)
          ? parsed.products
          : getDefaultContent().products,
        journals: Array.isArray(parsed.journals)
          ? parsed.journals
          : getDefaultContent().journals,
      };
    } catch {
      return getDefaultContent();
    }
  }, [snapshot]);
}
