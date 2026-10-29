import { createContext, useCallback, useContext, useMemo, useState } from "react";

const TipContext = createContext(null);

/** Cursor-following tooltip shared by every chart. */
export function TooltipProvider({ children }) {
  const [tip, setTip] = useState(null);
  const show = useCallback((e, label, value) => setTip({ x: e.clientX, y: e.clientY, label, value }), []);
  const hide = useCallback(() => setTip(null), []);
  const api = useMemo(() => ({ show, hide }), [show, hide]);

  const x = tip ? Math.min(Math.max(tip.x, 130), window.innerWidth - 130) : 0;
  return (
    <TipContext.Provider value={api}>
      {children}
      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 max-w-60 rounded-xl bg-ink px-3 py-2.5 text-xs leading-snug text-on-ink dark:bg-[#f5f4fa] dark:text-[#08080c]"
          style={{ left: x, top: tip.y, transform: "translate(-50%, calc(-100% - 14px))" }}
        >
          {tip.label}
          <b className="mt-0.5 block text-sm font-semibold">{tip.value}</b>
        </div>
      )}
    </TipContext.Provider>
  );
}

/** Returns a function: tip(label, value) -> props to spread on the hoverable element. */
export function useTip() {
  const { show, hide } = useContext(TipContext);
  return (label, value) => ({
    onMouseMove: (e) => show(e, label, value),
    onMouseLeave: hide,
    onFocus: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      show({ clientX: r.left + r.width / 2, clientY: r.top }, label, value);
    },
    onBlur: hide,
  });
}
