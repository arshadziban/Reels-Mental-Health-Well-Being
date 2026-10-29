import { useEffect, useMemo, useRef, useState } from "react";
import DATA from "../data";
import { NAV, cx } from "../lib";
import Icon from "./Icon";

const ITEMS = [
  ...NAV.map((n) => ({ kind: "View", label: n.label, hint: n.hint, icon: n.icon, go: n.id })),
  ...DATA.associations.map((r) => ({ kind: "Variable", label: r[0], hint: `${r[1]} · p ${r[3]}`, icon: "chart", variable: r[0], ok: r[5] })),
];

/** Search dialog: jump to a view, or find a variable in the associations table. */
export default function CommandPalette({ open, onClose, onVariable, onGo }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef(null);
  const list = useRef(null);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (n ? ITEMS.filter((x) => `${x.label} ${x.hint || ""}`.toLowerCase().includes(n)) : ITEMS.filter((x) => x.kind === "View")).slice(0, 12);
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);
  useEffect(() => setI(0), [q]);
  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [i]);

  if (!open) return null;

  const run = (x) => {
    onClose();
    if (x.go) onGo(x.go);
    else onVariable(x.variable);
  };
  const onKey = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") (e.preventDefault(), setI((v) => Math.min(v + 1, results.length - 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setI((v) => Math.max(v - 1, 0)));
    else if (e.key === "Enter" && results[i]) run(results[i]);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start justify-items-center bg-ink/50 px-4 pt-[12vh] backdrop-blur-sm animate-fade" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKey} className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-card shadow-2xl">
        <div className="flex h-12 items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="size-[18px] text-fg2" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search views and variables…"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg2/80"
          />
          <kbd className="rounded border border-line bg-main px-1.5 text-[11px] font-medium text-fg2">Esc</kbd>
        </div>
        <ul ref={list} className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-fg2">No results for “{q}”.</li>}
          {results.map((x, n) => (
            <li
              key={`${x.kind}${x.label}`}
              data-active={n === i}
              onPointerEnter={() => setI(n)}
              onClick={() => run(x)}
              className={cx("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2", n === i && "bg-main")}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-lav-soft text-lavd dark:text-lav">
                <Icon name={x.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[13px] font-medium">{x.label}</b>
                {x.hint && <small className="block truncate text-xs text-fg2">{x.hint}</small>}
              </span>
              <span className="text-[11px] font-medium text-fg2">{x.kind}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
