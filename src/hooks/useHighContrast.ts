"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "medikiosk-high-contrast";

export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setIsHighContrast(true);
        document.body.classList.add("kiosk-high-contrast");
      }
    } catch {
      // localStorage not available (SSR / private browsing)
    }
  }, []);

  const toggle = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
    if (next) {
      document.body.classList.add("kiosk-high-contrast");
    } else {
      document.body.classList.remove("kiosk-high-contrast");
    }
  };

  return { isHighContrast, toggle };
}
