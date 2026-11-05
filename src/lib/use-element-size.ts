"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Size = { width: number; height: number };

const FALLBACK: Size = { width: 640, height: 280 };

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
 * Always starts with a usable fallback size so charts never mount blank;
 * ResizeObserver only upgrades to the real measured size.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  fallback: Size = FALLBACK,
) {
  const [size, setSize] = useState<Size>(fallback);
  const observerRef = useRef<ResizeObserver | null>(null);
  const nodeRef = useRef<T | null>(null);
  const rafRef = useRef<number | null>(null);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const commit = useCallback((next: Size) => {
    const fb = fallbackRef.current;
    const width = next.width > 0 ? next.width : fb.width;
    const height = next.height > 0 ? next.height : fb.height;
    setSize((prev) =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, []);

  const measure = useCallback(() => {
    const node = nodeRef.current;
    if (!node) {
      commit(fallbackRef.current);
      return;
    }
    commit(readSize(node));
  }, [commit]);

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

      nodeRef.current = node;
      if (!node) return;

      // Immediate measure (or parent/fallback) so Recharts never waits.
      measure();

      rafRef.current = requestAnimationFrame(() => {
        measure();
        rafRef.current = requestAnimationFrame(() => measure());
      });

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          const box = entry.contentRect;
          const fromEntry = {
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
          // Only upgrade when we have a real positive size.
          if (fromEntry.width > 0 && fromEntry.height > 0) {
            commit(fromEntry);
            return;
          }
          measure();
        });
        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [commit, measure],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    ref,
    width: size.width > 0 ? size.width : fallback.width,
    height: size.height > 0 ? size.height : fallback.height,
  };
}
