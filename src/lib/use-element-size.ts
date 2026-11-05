"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Size = { width: number; height: number };

const FALLBACK: Size = { width: 600, height: 280 };
const MEASURE_TIMEOUT_MS = 120;

function readSize(node: HTMLElement): Size {
  const rect = node.getBoundingClientRect();
  let width = rect.width || node.clientWidth || node.offsetWidth;
  let height = rect.height || node.clientHeight || node.offsetHeight;

  // Percentage-height children can report 0 before the parent finishes layout.
  if ((width <= 0 || height <= 0) && node.parentElement) {
    const parent = node.parentElement;
    const parentRect = parent.getBoundingClientRect();
    if (width <= 0) {
      width = parentRect.width || parent.clientWidth || parent.offsetWidth;
    }
    if (height <= 0) {
      height =
        parentRect.height || parent.clientHeight || parent.offsetHeight;
    }
  }

  return {
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height)),
  };
}

/**
 * Measure an element with a callback ref + ResizeObserver.
 * Always settles to a usable size quickly via rAF retries and a fallback.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  fallback: Size = FALLBACK,
) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const nodeRef = useRef<T | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback(
    (next: Size, forceFallback = false) => {
      const width = next.width > 0 ? next.width : forceFallback ? fallback.width : 0;
      const height =
        next.height > 0 ? next.height : forceFallback ? fallback.height : 0;
      if (width <= 0 || height <= 0) return;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
      setReady(true);
    },
    [fallback.height, fallback.width],
  );

  const measure = useCallback(
    (forceFallback = false) => {
      const node = nodeRef.current;
      if (!node) {
        if (forceFallback) commit(fallback, true);
        return;
      }
      commit(readSize(node), forceFallback);
    },
    [commit, fallback],
  );

  const ref = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      nodeRef.current = node;
      if (!node) return;

      measure(false);

      // Layout may not be final on the first paint — retry next frames.
      rafRef.current = requestAnimationFrame(() => {
        measure(false);
        rafRef.current = requestAnimationFrame(() => measure(false));
      });

      // Never leave charts stuck measuring.
      timeoutRef.current = setTimeout(() => {
        measure(true);
      }, MEASURE_TIMEOUT_MS);

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          const box = entry.contentRect;
          const fromEntry = {
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
          if (fromEntry.width > 0 && fromEntry.height > 0) {
            commit(fromEntry);
            return;
          }
          measure(false);
        });
        observer.observe(node);
        observerRef.current = observer;
      } else {
        // Environments without ResizeObserver still get a usable chart.
        measure(true);
      }
    },
    [commit, measure],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    ref,
    width: ready ? size.width || fallback.width : size.width,
    height: ready ? size.height || fallback.height : size.height,
    ready,
  };
}
