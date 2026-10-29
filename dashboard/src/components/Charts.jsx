import { useState } from "react";
import DATA from "../data";
import { cx } from "../lib";
import { useTip } from "./Tooltip";

/** CSS variable behind each watch-time colour key, for SVG fills (dark-mode safe). */
const VAR = {
  mint: "var(--mint)",
  lav: "var(--lav)",
  lavd: "var(--lavd)",
  pink: "var(--pink)",
  ink: "var(--text)",
};

/** Donut of the five watch-time groups. Click a slice to focus it; the centre reports the selection. */
export function Donut({ focus, onSelect }) {
  const tip = useTip();
  const [hover, setHover] = useState(null);
  const R = 78, W = 30, C = 2 * Math.PI * R, GAP = 3;
  const shown = hover ?? focus;
  const g = shown !== null ? DATA.watchTime[shown] : null;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
      <svg viewBox="0 0 200 200" className="size-[230px] shrink-0" role="img" aria-label="Share of respondents by daily watch time">
        <g transform="rotate(-90 100 100)">
          {DATA.watchTime.map((w, i) => {
            const len = (w.pct / 100) * C;
            const el = (
              <circle
                key={w.label}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={VAR[w.color]}
                strokeWidth={shown === i ? W + 7 : W}
                strokeDasharray={`${Math.max(len - GAP, 1)} ${C}`}
                strokeDashoffset={-offset}
                tabIndex={0}
                role="button"
                aria-pressed={focus === i}
                aria-label={`${w.label}: ${w.pct}%`}
                opacity={shown !== null && shown !== i ? 0.3 : 1}
                className="cursor-pointer outline-none transition-[stroke-width,opacity] duration-200"
                onClick={() => onSelect(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(i))}
                onMouseEnter={() => setHover(i)}
                onMouseOut={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                {...tip(w.label, `${w.count} people · ${w.pct}%`)}
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <text x="100" y={g ? 94 : 100} textAnchor="middle" className="fill-fg text-[30px] font-bold tracking-tighter">
          {g ? `${g.pct}%` : DATA.respondents}
        </text>
        <text x="100" y={g ? 114 : 120} textAnchor="middle" className="fill-fg2 text-[11px]">
          {g ? g.short : "respondents"}
        </text>
      </svg>
      <ul className="grid w-full gap-1.5 sm:w-auto sm:min-w-[210px]">
        {DATA.watchTime.map((w, i) => (
          <li key={w.label}>
            <button
              type="button"
              aria-pressed={focus === i}
              onClick={() => onSelect(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition",
                focus === i ? "bg-main ring-2 ring-lavd/70" : "hover:bg-main/70",
                focus !== null && focus !== i && "opacity-45",
              )}
            >
              <i className="size-3 rounded-full" style={{ background: VAR[w.color] }} />
              <span className="flex-1 font-medium">{w.label}</span>
              <b className="tabular-nums">{w.pct}%</b>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bars, one per group, scaled to the largest. */
export function GroupBars({ focus, onSelect }) {
  const tip = useTip();
  const max = Math.max(...DATA.watchTime.map((w) => w.pct));
  return (
    <div className="flex flex-col gap-3.5">
      {DATA.watchTime.map((w, i) => (
        <button
          key={w.label}
          type="button"
          aria-pressed={focus === i}
          onClick={() => onSelect(i)}
          {...tip(w.label, `${w.count} people · ${w.pct}%`)}
          className={cx(
            "grid grid-cols-[1fr_52px] items-center gap-x-3 gap-y-1.5 rounded-2xl px-2.5 py-2 text-left transition sm:grid-cols-[130px_1fr_52px]",
            focus === i ? "bg-main ring-2 ring-lavd/70" : "hover:bg-main/70",
            focus !== null && focus !== i && "opacity-35",
          )}
        >
          <span className="text-[13px] font-medium">{w.label}</span>
          <span className="col-span-2 row-start-2 h-6 overflow-hidden rounded-lg bg-dot sm:col-span-1 sm:row-start-auto">
            <span
              className="block h-full origin-left animate-grow rounded-lg"
              style={{ width: `${(w.pct / max) * 100}%`, background: VAR[w.color], animationDelay: `${i * 70}ms` }}
            />
          </span>
          <b className="col-start-2 row-start-1 text-right text-[13px] tabular-nums sm:col-auto sm:row-auto">{w.pct}%</b>
        </button>
      ))}
    </div>
  );
}

/** Cumulative share of respondents as watch time rises: an area/line chart. */
export function CumulativeCurve({ focus, onSelect }) {
  const tip = useTip();
  const W = 520, H = 250, L = 38, B = 34, T = 16, Rr = 16;
  let run = 0;
  const pts = DATA.watchTime.map((w, i) => {
    run += w.pct;
    const cum = Math.min(run, 100);
    return { w, i, cum, x: L + (i / 4) * (W - L - Rr), y: T + (1 - cum / 100) * (H - T - B) };
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const area = `${line} L${pts[4].x} ${H - B} L${pts[0].x} ${H - B} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Cumulative share of respondents by daily watch time">
        <defs>
          <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lavd)" stopOpacity=".38" />
            <stop offset="100%" stopColor="var(--lavd)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((t) => {
          const y = T + (1 - t / 100) * (H - T - B);
          return (
            <g key={t}>
              <line x1={L} x2={W - Rr} y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 4" />
              <text x={L - 8} y={y + 3} textAnchor="end" className="fill-fg2 text-[11px]">{t}%</text>
            </g>
          );
        })}
        <path d={area} fill="url(#cumFill)" />
        <path d={line} fill="none" stroke="var(--lavd)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="animate-draw" />
        {pts.map((p) => (
          <g key={p.w.label} className="cursor-pointer" onClick={() => onSelect(p.i)} {...tip(p.w.label, `${p.cum.toFixed(1)}% watch this much or less`)}>
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={focus === p.i ? 8 : 5.5}
              fill={focus === p.i ? VAR[p.w.color] : "var(--card)"}
              stroke="var(--lavd)"
              strokeWidth="3"
              className="transition-[r] duration-200"
            />
            <text x={p.x} y={p.y - 14} textAnchor="middle" className="fill-fg text-[11px] font-bold">{p.cum.toFixed(0)}%</text>
            <text x={p.x} y={H - 12} textAnchor="middle" className={cx("text-[11px] font-medium", focus === p.i ? "fill-fg" : "fill-fg2")}>{p.w.short}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center text-xs text-fg2">Cumulative share of respondents · 81% watch up to 2 hours a day</p>
    </div>
  );
}

/** Evidence landscape: each of the 40 variables as a point, higher = stronger evidence (−log10 p). */
export function EvidenceScatter({ section, onPick, picked }) {
  const tip = useTip();
  const W = 680, H = 300, L = 44, B = 30, T = 14, Rr = 14, YMAX = 5;
  const rows = DATA.associations;
  const x = (i) => L + (i / (rows.length - 1)) * (W - L - Rr);
  const y = (p) => T + (1 - Math.min(-Math.log10(p), YMAX) / YMAX) * (H - T - B);
  const yThr = y(0.05);
  return (
    <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[560px]" role="group" aria-label="Strength of evidence for each of the 40 variables">
      <rect x={L} y={T} width={W - L - Rr} height={yThr - T} fill="var(--lavd)" opacity=".07" />
      {[0, 1, 2, 3, 4, 5].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - Rr} y1={T + (1 - t / YMAX) * (H - T - B)} y2={T + (1 - t / YMAX) * (H - T - B)} stroke="var(--line)" strokeDasharray="3 4" />
          <text x={L - 8} y={T + (1 - t / YMAX) * (H - T - B) + 3} textAnchor="end" className="fill-fg2 text-[11px]">{t}</text>
        </g>
      ))}
      <line x1={L} x2={W - Rr} y1={yThr} y2={yThr} stroke="var(--pink)" strokeWidth="2" strokeDasharray="6 4" />
      <text x={W - Rr} y={yThr - 6} textAnchor="end" className="fill-fg2 text-[11px] font-semibold">p = 0.05 threshold</text>
      <text transform={`translate(12 ${H / 2}) rotate(-90)`} textAnchor="middle" className="fill-fg2 text-[11px]">Evidence (−log₁₀ p)</text>
      <text x={(L + W - Rr) / 2} y={H - 6} textAnchor="middle" className="fill-fg2 text-[11px]">Variables, strongest to weakest</text>
      {rows.map((r, i) => {
        const dim = (section && r[1] !== section) || false;
        const sel = picked === r[0];
        return (
          <g
            key={r[0]}
            tabIndex={0}
            role="button"
            aria-label={`${r[0]}, p ${r[3]}`}
            className={cx("cursor-pointer outline-none transition-opacity", dim && "opacity-15")}
            onClick={() => onPick(r[0])}
            onKeyDown={(e) => e.key === "Enter" && onPick(r[0])}
            {...tip(r[0], `${r[1]} · p ${r[3].startsWith("<") ? r[3] : `= ${r[3]}`}`)}
          >
            <circle cx={x(i)} cy={y(r[4])} r="14" fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(r[4])}
              r={sel ? 8 : 5.5}
              fill={r[5] ? "var(--lavd)" : "var(--pink)"}
              stroke={sel ? "var(--text)" : "var(--card)"}
              strokeWidth={sel ? 2.5 : 1.5}
              className="transition-[r] duration-150"
            />
          </g>
        );
      })}
    </svg>
    </div>
  );
}

/** Radar of the share of significant variables in each questionnaire section. */
export function Radar() {
  const tip = useTip();
  const S = DATA.sections, N = S.length, CX = 170, CY = 150, R = 100;
  const pos = (i, k) => {
    const a = -Math.PI / 2 + (i / N) * 2 * Math.PI;
    return [CX + R * k * Math.cos(a), CY + R * k * Math.sin(a)];
  };
  const poly = (f) => S.map((s, i) => pos(i, f(s)).join(",")).join(" ");
  return (
    <svg viewBox="0 0 340 300" className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label="Share of significant variables per section">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={poly(() => k)} fill="none" stroke="var(--line)" />
      ))}
      {S.map((s, i) => {
        const [ex, ey] = pos(i, 1);
        const [lx, ly] = pos(i, 1.17);
        return (
          <g key={s.name}>
            <line x1={CX} y1={CY} x2={ex} y2={ey} stroke="var(--line)" />
            <text x={lx} y={ly + 3} textAnchor={lx < CX - 4 ? "end" : lx > CX + 4 ? "start" : "middle"} className="fill-fg text-[11px] font-medium">
              {s.name}
            </text>
          </g>
        );
      })}
      <polygon points={poly((s) => s.sig / s.total)} fill="var(--lavd)" fillOpacity=".25" stroke="var(--lavd)" strokeWidth="2.5" strokeLinejoin="round" />
      {S.map((s, i) => {
        const [px, py] = pos(i, s.sig / s.total);
        return (
          <g key={s.name} tabIndex={0} {...tip(s.name, `${s.sig} of ${s.total} significant · ${Math.round((s.sig / s.total) * 100)}%`)} className="outline-none">
            <circle cx={px} cy={py} r="12" fill="transparent" />
            <circle cx={px} cy={py} r="4.5" fill="var(--lavd)" stroke="var(--card)" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

/** Stacked horizontal bars: significant vs. not significant variables per section. */
export function SectionBars() {
  const tip = useTip();
  return (
    <div className="flex flex-col gap-3">
      {DATA.sections.map((s, i) => (
        <div
          key={s.name}
          tabIndex={0}
          {...tip(s.name, `${s.sig} significant · ${s.total - s.sig} not`)}
          className="grid grid-cols-[110px_1fr_44px] items-center gap-3 rounded-lg outline-offset-4 sm:grid-cols-[150px_1fr_44px]"
        >
          <span className="truncate text-[13px] font-medium">{s.name}</span>
          <div className="flex h-5 gap-0.5 overflow-hidden rounded-md">
            <span className="block origin-left animate-grow bg-lavd" style={{ width: `${(s.sig / s.total) * 100}%`, animationDelay: `${i * 50}ms` }} />
            <span className="block flex-1 bg-pink/70" />
          </div>
          <b className="text-right text-[13px] tabular-nums">{s.sig}/{s.total}</b>
        </div>
      ))}
      <div className="mt-1 flex gap-4 text-xs text-fg2">
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-lavd" />Significant</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-pink/70" />Not significant</span>
      </div>
    </div>
  );
}
