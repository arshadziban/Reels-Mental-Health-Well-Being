import { useState } from "react";
import DATA from "../data";
import { FILL, cx } from "../lib";
import { useCountUp } from "../hooks";
import { Card, CardHead, CountUp, Segmented, Tag } from "./ui";
import { useTip } from "./Tooltip";

const BAR_COLORS = ["ink", "lavd", "lav", "pink", "mint"];
const MAX = DATA.predictors[0].chi2;
// chart scale: the axis tops out just above the largest value
const AXIS_MAX = 220;
const TICKS = [0, 50, 100, 150, 200];
const PLOT = 236; // px height of the plot area

/** Five tallest predictors as columns, the rest as chips. */
function TopFive({ tip }) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="flex flex-col items-start gap-2.5 sm:w-[150px] sm:shrink-0">
          <Tag tone="ink" className="px-3 py-[7px]">Top predictor</Tag>
          <b className="text-4xl leading-none font-bold tracking-[-0.045em] tabular-nums">
            <CountUp value={MAX} decimals={2} />
          </b>
          <p className="text-[13px] leading-snug text-fg2">Sitting duration, about 4× the next predictor</p>
        </div>

        <div className="min-w-0 flex-1" role="img" aria-label="Likelihood-ratio chi-square of the five strongest predictors">
          {/* plot area: gridlines + bars share one baseline */}
          <div className="relative" style={{ height: PLOT }}>
            {TICKS.map((t) => (
              <div key={t} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: (t / AXIS_MAX) * PLOT }}>
                <span className="absolute -top-2 left-0 bg-card pr-1.5 text-[11px] text-fg2 tabular-nums">{t}</span>
              </div>
            ))}
            <div className="absolute inset-0 flex items-end gap-2 pl-8 sm:gap-4 sm:pl-9">
              {DATA.predictors.slice(0, 5).map((p, i) => (
                <div
                  key={p.name}
                  tabIndex={0}
                  {...tip(p.name, `χ² ${p.chi2.toFixed(2)} · p < 0.05`)}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 rounded-xl outline-offset-2"
                >
                  <span className="text-[11px] font-bold tabular-nums sm:text-[13px]">{p.chi2.toFixed(1)}</span>
                  <div
                    className={cx(
                      "w-full max-w-[76px] origin-bottom animate-rise rounded-t-[14px] rounded-b-[5px] transition-[filter] group-hover:brightness-95 sm:rounded-t-[18px]",
                      i === 0 ? "bg-ink dark:bg-lav" : FILL[BAR_COLORS[i]],
                    )}
                    style={{ height: Math.max((p.chi2 / AXIS_MAX) * PLOT, 10), animationDelay: `${i * 60}ms` }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* names under the baseline, in the same columns */}
          <div className="mt-2.5 flex gap-2 pl-8 sm:gap-4 sm:pl-9">
            {DATA.predictors.slice(0, 5).map((p) => (
              <div key={p.name} className="min-w-0 flex-1 text-center text-[11px] leading-tight font-medium sm:text-xs">
                {p.short}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {DATA.predictors.slice(5).map((p) => (
          <span key={p.name} className="inline-flex gap-2 rounded-lg bg-lav-soft px-3 py-1.5 text-xs font-medium">
            {p.name} <b className="font-bold text-fg2 tabular-nums">{p.chi2.toFixed(2)}</b>
          </span>
        ))}
      </div>
    </>
  );
}

/** Lollipop: a stem and a dot per predictor, compact and easy to compare. */
function Lollipop({ tip }) {
  return (
    <ol className="flex flex-col gap-2">
      {DATA.predictors.map((p, i) => (
        <li
          key={p.name}
          tabIndex={0}
          {...tip(p.name, `χ² ${p.chi2.toFixed(2)} · p < 0.05`)}
          className="group grid grid-cols-[minmax(0,1fr)_52px] items-center gap-x-3 gap-y-0.5 rounded-lg outline-offset-4 sm:grid-cols-[200px_minmax(0,1fr)_56px]"
        >
          <span className="truncate text-[13px] font-medium">{p.name}</span>
          <div className="relative col-span-2 row-start-2 h-5 sm:col-span-1 sm:row-start-auto">
            <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
            <span className="absolute top-1/2 left-0 h-[3px] origin-left -translate-y-1/2 animate-grow rounded-full bg-lav" style={{ width: `${(p.chi2 / MAX) * 100}%`, animationDelay: `${i * 50}ms` }} />
            <span
              className={cx("absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-card transition-transform group-hover:scale-125", i === 0 ? "bg-ink dark:bg-lav" : "bg-lavd")}
              style={{ left: `${(p.chi2 / MAX) * 100}%` }}
            />
          </div>
          <b className="col-start-2 row-start-1 text-right text-[13px] tabular-nums sm:col-auto sm:row-auto">{p.chi2.toFixed(2)}</b>
        </li>
      ))}
    </ol>
  );
}

/** All ten predictors, ranked. */
function RankedList({ tip }) {
  return (
    <ol className="flex flex-col gap-3.5">
      {DATA.predictors.map((p, i) => (
        <li
          key={p.name}
          tabIndex={0}
          {...tip(p.name, `χ² ${p.chi2.toFixed(2)} · p < 0.05`)}
          className="grid grid-cols-[20px_minmax(0,1fr)_52px] items-center gap-x-3 gap-y-1.5 rounded-lg outline-offset-4 sm:grid-cols-[24px_200px_minmax(0,1fr)_56px]"
        >
          <span className="text-xs font-semibold text-fg2 tabular-nums">{i + 1}</span>
          <span className="truncate text-[13px] font-medium">{p.name}</span>
          <div className="col-span-3 col-start-1 row-start-2 h-2.5 overflow-hidden rounded-full bg-dot sm:col-span-1 sm:col-start-auto sm:row-start-auto">
            <div
              className={cx("h-full origin-left animate-grow rounded-full", i === 0 ? "bg-ink dark:bg-lav" : "bg-lavd")}
              style={{ width: `${(p.chi2 / MAX) * 100}%`, animationDelay: `${i * 50}ms` }}
            />
          </div>
          <b className="col-start-3 row-start-1 text-right text-[13px] tabular-nums sm:col-auto sm:row-auto">{p.chi2.toFixed(2)}</b>
        </li>
      ))}
    </ol>
  );
}

function PredictorsCard() {
  const tip = useTip();
  const [view, setView] = useState("top5");
  return (
    <Card className="flex flex-col gap-[22px]">
      <CardHead title="Strongest predictors" sub="Likelihood-ratio χ² · all 10 significant at p < 0.05">
        <Segmented
          label="Number of predictors shown"
          value={view}
          onChange={setView}
          options={[
            { value: "top5", label: "Top 5" },
            { value: "all", label: "Bars" },
            { value: "dots", label: "Lollipop" },
          ]}
        />
      </CardHead>
      <div key={view} className="animate-fade">
        {view === "top5" ? <TopFive tip={tip} /> : view === "all" ? <RankedList tip={tip} /> : <Lollipop tip={tip} />}
      </div>
    </Card>
  );
}

/** 30-segment half-circle gauge for Nagelkerke R²; it sweeps up on load. */
function Gauge({ value }) {
  const v = useCountUp(value, { duration: 1300, delay: 150 });
  const N = 30, filled = Math.round(v * N), cx0 = 150, cy0 = 150, R = 148, r = R * 0.78, gap = 0.012;
  const pt = (a, rad) => `${cx0 + rad * Math.cos(a)} ${cy0 + rad * Math.sin(a)}`;
  return (
    <svg viewBox="0 0 300 170" className="mx-auto block h-auto w-full max-w-[300px]" role="img" aria-label={`Nagelkerke R squared ${value.toFixed(3)}`}>
      {Array.from({ length: N }, (_, i) => {
        const a0 = Math.PI + (i * Math.PI) / N + gap;
        const a1 = Math.PI + ((i + 1) * Math.PI) / N - gap;
        const d = `M${pt(a0, R)} A${R} ${R} 0 0 1 ${pt(a1, R)} L${pt(a1, r)} A${r} ${r} 0 0 0 ${pt(a0, r)} Z`;
        const fill = i < filled ? (i < Math.round(value * N) - 6 ? "var(--lavd)" : "var(--lav)") : "var(--dot-empty)";
        return <path key={i} d={d} fill={fill} />;
      })}
      <text x="150" y="132" textAnchor="middle" className="fill-fg text-[46px] font-bold tracking-tighter">{v.toFixed(3)}</text>
      <text x="150" y="156" textAnchor="middle" className="fill-fg2 text-[13px]">Nagelkerke R²</text>
    </svg>
  );
}

export function GaugeCard() {
  const m = DATA.model;
  const rows = [
    ["McFadden R²", m.mcfadden.toFixed(3)],
    ["Likelihood-ratio χ²", m.lrChi2.toFixed(2)],
    ["Degrees of freedom", String(m.df)],
  ];
  return (
    <Card className="flex flex-col gap-[18px]">
      <CardHead title="Model fit" sub="Multinomial logistic regression" />
      <Gauge value={m.nagelkerke} />
      <dl>
        {rows.map(([k, v], i) => (
          <div key={k} className={cx("flex items-center justify-between border-b border-line py-3", i === 0 && "border-t")}>
            <dt className="text-[13px] font-medium text-fg2">{k}</dt>
            <dd className="text-[15px] font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <Tag tone="mint">p &lt; 0.0001 vs. intercept-only model</Tag>
    </Card>
  );
}

export default PredictorsCard;
