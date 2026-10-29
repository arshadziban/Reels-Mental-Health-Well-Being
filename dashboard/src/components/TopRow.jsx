import DATA from "../data";
import { FILL, cx } from "../lib";
import { useFocus } from "../focus";
import { Card, CardHead, CountUp, Tag, pill } from "./ui";
import { useTip } from "./Tooltip";
import { useState } from "react";
import { Donut, GroupBars, CumulativeCurve } from "./Charts";
import { Segmented } from "./ui";

/** Dot matrix: one dot = 2.5% of respondents. Click a group to focus it across the dashboard. */
function DistributionCard() {
  const tip = useTip();
  const { focus, toggle, clear } = useFocus();
  const [view, setView] = useState("dots");
  let n = 0; // running index so dots pop in one after another
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="Daily Reels watch time" sub="Select a group to follow it through the charts below">
        <Segmented
          label="Chart style"
          value={view}
          onChange={setView}
          options={[
            { value: "dots", label: "Dots" },
            { value: "donut", label: "Donut" },
            { value: "bars", label: "Bars" },
            { value: "curve", label: "Curve" },
          ]}
        />
      </CardHead>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <b className="text-[44px] leading-none font-bold tracking-[-0.045em] tabular-nums">
          <CountUp value={DATA.respondents} />
        </b>
        <span className="text-[13px] text-fg2">respondents · N = {DATA.respondents}</span>
        {focus !== null && (
          <button type="button" onClick={clear} className={cx(pill("ink"), "ml-auto h-8")}>
            {DATA.watchTime[focus].short} selected · Clear
          </button>
        )}
      </div>

      {view === "donut" && <div key="donut" className="animate-fade"><Donut focus={focus} onSelect={toggle} /></div>}
      {view === "bars" && <div key="bars" className="animate-fade"><GroupBars focus={focus} onSelect={toggle} /></div>}
      {view === "curve" && <div key="curve" className="animate-fade"><CumulativeCurve focus={focus} onSelect={toggle} /></div>}

      <div hidden={view !== "dots"} className="flex flex-1 flex-col justify-between gap-1 sm:gap-1.5 [&[hidden]]:hidden" role="group" aria-label="Daily Reels watch time; one dot equals 2.5 percent of respondents">
        {DATA.watchTime.map((g, gi) => {
          const on = Math.round(g.pct / 2.5);
          const dim = focus !== null && focus !== gi;
          return (
            <button
              key={g.label}
              type="button"
              aria-pressed={focus === gi}
              onClick={() => toggle(gi)}
              {...tip(g.label, `${g.count} people · ${g.pct}%`)}
              className={cx(
                "grid grid-cols-[1fr_52px] items-center gap-x-2.5 gap-y-2 rounded-xl px-2.5 py-2 text-left transition sm:grid-cols-[140px_1fr_52px]",
                focus === gi ? "bg-main ring-2 ring-lavd/70" : "hover:bg-main/70",
                dim && "opacity-35",
              )}
            >
              <div className="text-[13px] font-medium">{g.label}</div>
              <div className="col-span-2 row-start-2 grid w-full max-w-[560px] grid-cols-12 gap-[6px] sm:col-span-1 sm:row-start-auto">
                {Array.from({ length: 12 }, (_, i) => (
                  <i
                    key={i}
                    className={cx("aspect-square rounded-full", i < on ? cx(FILL[g.color], "animate-pop") : "bg-dot")}
                    style={i < on ? { animationDelay: `${(n++) * 22}ms` } : undefined}
                  />
                ))}
              </div>
              <div className="col-start-2 row-start-1 text-right text-[13px] leading-tight font-semibold tabular-nums sm:col-auto sm:row-auto">
                {g.pct}%<small className="block text-[11px] font-normal text-fg2">{g.count}</small>
              </div>
            </button>
          );
        })}
      </div>

      {view === "dots" && (
        <div className="flex items-center gap-2 text-xs text-fg2">
          <i className="size-2.5 rounded-full bg-lav" />
          One dot = 2.5% of respondents
        </div>
      )}
    </Card>
  );
}

function InsightCard() {
  const top = DATA.predictors.slice(0, 5);
  const max = top[0].chi2;
  return (
    <Card tone="solid" className="relative flex flex-col justify-between gap-6 overflow-hidden bg-ink p-6 text-on-ink sm:p-7">
      <i className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-lavd/40 blur-3xl" />
      <i className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-pink/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3">
        <Tag tone="mint">Key insight</Tag>
        <span className="text-[11px] font-semibold tracking-widest text-on-ink/60 uppercase">p &lt; 0.0001</span>
      </div>

      <div className="relative">
        <h3 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.03em] sm:text-[26px]">
          Sitting duration is the strongest predictor of heavy Reels use
        </h3>
        <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-on-ink/70">
          Its likelihood-ratio χ² is about four times that of the next factor.
        </p>
      </div>

      <div className="relative flex items-end justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          <b className="block text-4xl leading-none font-bold tracking-[-0.045em] tabular-nums">206.3</b>
          <span className="mt-1.5 block text-xs text-on-ink/60">LR χ² · sitting duration</span>
        </div>
        <div className="flex h-14 items-end gap-1.5" aria-hidden="true">
          {top.map((p, i) => (
            <span
              key={p.name}
              className={cx("w-5 origin-bottom animate-rise rounded-t-md", i === 0 ? "bg-lav" : "bg-white/25")}
              style={{ height: `${Math.max((p.chi2 / max) * 100, 10)}%`, animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

const KPIS = [
  { label: "Respondents", value: 503, note: "survey responses", style: "bg-card" },
  { label: "Variables tested", value: 40, note: "categorical variables", style: "bg-card" },
  { label: "Significant", value: 28, note: "p < 0.05 of 40", style: "bg-lav text-[#18181f]", bar: 28 / 40, href: "#associations" },
  { label: "Model accuracy", value: 67.2, decimals: 1, suffix: "%", note: "in-sample", style: "bg-ink text-on-ink", bar: 0.672, href: "#model" },
];

function Kpis() {
  return (
    <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-4">
      {KPIS.map((k, i) => {
        const tinted = k.style.includes("text-");
        return (
          <Card key={k.label} as={k.href ? "a" : "article"} href={k.href} tone={tinted ? "solid" : "plain"} className={cx("flex flex-col gap-1.5 p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5", k.style)}>
            <span className={cx("text-[13px] font-medium", tinted ? "opacity-80" : "text-fg2")}>{k.label}</span>
            <b className="text-[30px] leading-[1.1] font-bold tracking-[-0.045em] tabular-nums sm:text-4xl">
              <CountUp value={k.value} decimals={k.decimals} suffix={k.suffix} delay={i * 90} />
            </b>
            <small className={cx("text-xs", tinted ? "opacity-80" : "text-fg2")}>{k.note}</small>
            {k.bar !== undefined && (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-current/20" aria-hidden="true">
                <div className="h-full origin-left animate-grow rounded-full bg-current" style={{ width: `${k.bar * 100}%` }} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/** Overview: the headline insight and the four key numbers. */
export function OverviewRow() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <InsightCard />
      <Kpis />
    </div>
  );
}

export default DistributionCard;
