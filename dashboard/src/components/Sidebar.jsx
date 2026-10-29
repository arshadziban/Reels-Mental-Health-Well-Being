import Icon from "./Icon";
import { NAV, cx } from "../lib";

/** Left navigation rail (desktop). Below lg the same list becomes the tab strip in the top bar. */
export default function Sidebar({ view, onNavigate }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col border-r border-line bg-card md:flex lg:w-60">
      <div className="flex h-14 items-center justify-center gap-2.5 border-b border-line lg:justify-start lg:px-5">
        <span className="grid size-8 place-items-center rounded-lg bg-ink dark:bg-lavd">
          <i className="size-3 rounded-[3px] bg-white" />
        </span>
        <b className="hidden text-[15px] font-semibold tracking-tight lg:block">Reels Insights</b>
      </div>

      <nav aria-label="Views" className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 lg:gap-0.5 lg:p-3">
        <span className="hidden px-3 pt-2 pb-1.5 lg:block text-[11px] font-semibold tracking-widest text-fg2 uppercase">Dashboard</span>
        {NAV.map((n) => {
          const on = view === n.id;
          return (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => (e.preventDefault(), onNavigate(n.id))}
              aria-current={on ? "page" : undefined}
              title={n.label}
              className={cx(
                "flex h-10 items-center justify-center gap-3 rounded-lg lg:h-9 lg:justify-start lg:px-3 text-[13px] font-medium transition-colors",
                on ? "bg-lav-soft text-lavd dark:text-lav" : "text-fg2 hover:bg-main hover:text-fg",
              )}
            >
              <Icon name={n.icon} className="size-[18px] lg:size-4" />
              <span className="hidden lg:inline">{n.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="m-3 hidden rounded-lg border border-line bg-main p-3.5 lg:block">
        <b className="block text-[13px] font-semibold">Survey of 503 respondents</b>
        <span className="mt-0.5 block text-xs text-fg2">Bangladesh · 2026</span>
      </div>
    </aside>
  );
}
