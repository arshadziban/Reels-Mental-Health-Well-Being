import { useCallback, useEffect, useState } from "react";

/** Light / dark theme: follows the system, remembered in localStorage, applied via data-theme on <html>. */
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);
  return [theme, toggle];
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Eases a number from 0 up to `target` (instant when the user prefers reduced motion). */
export function useCountUp(target, { duration = 1100, delay = 0 } = {}) {
  const [v, setV] = useState(() => (reducedMotion() ? target : 0));
  useEffect(() => {
    if (reducedMotion()) {
      setV(target);
      return undefined;
    }
    let raf = 0, start = 0, timer = 0;
    // safety net: browsers pause requestAnimationFrame in background tabs, so always land on the real value
    const settle = setTimeout(() => setV(target), delay + duration + 80);
    const tick = (now) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      setV(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      clearTimeout(settle);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return v;
}
