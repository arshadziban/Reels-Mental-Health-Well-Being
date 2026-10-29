import Icon from "./Icon";
import { NAV, cx } from "../lib";

/** Dashboard top bar: current view title, theme and search. On small screens it also carries the view tabs. */
export function Topbar({ view, theme, onToggleTheme, onSearch, onNavigate }) {
  const next = theme === "dark" ? "light" : "dark";
  const current = NAV.find((n) => n.id === view) || NAV[0];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/85 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-5 lg:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">{current.label}</h1>
          <p className="hidden truncate text-xs text-fg2 sm:block">{current.hint}</p>
        </div>
        <button type="button" onClick={onToggleTheme} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} className="grid size-9 place-items-center rounded-lg text-fg2 transition hover:bg-main hover:text-fg active:scale-95">
          <Icon name={theme === "dark" ? "sun" : "moon"} className="size-[18px]" />
        </button>
        <button type="button" onClick={onSearch} aria-label="Search (Ctrl or Cmd K)" title="Search (⌘K)" className="grid size-9 place-items-center rounded-lg border border-line bg-main text-fg2 transition hover:text-fg active:scale-95">
          <Icon name="search" className="size-4" />
        </button>
      </div>

      <nav aria-label="Views" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={(e) => (e.preventDefault(), onNavigate(n.id))}
            aria-current={view === n.id ? "page" : undefined}
            className={cx("shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap", view === n.id ? "bg-lav-soft text-lavd dark:text-lav" : "text-fg2")}
          >
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
