import { createContext, useContext, useMemo, useState } from "react";

/** The watch-time group the reader is focusing on (index into DATA.watchTime, or null). Shared by every chart. */
const FocusContext = createContext({ focus: null, toggle: () => {}, clear: () => {} });

export function FocusProvider({ children }) {
  const [focus, setFocus] = useState(null);
  const api = useMemo(
    () => ({
      focus,
      toggle: (i) => setFocus((f) => (f === i ? null : i)),
      clear: () => setFocus(null),
    }),
    [focus],
  );
  return <FocusContext.Provider value={api}>{children}</FocusContext.Provider>;
}

export const useFocus = () => useContext(FocusContext);
