import DATA from "../data";
import { FILL, cx } from "../lib";
import { useFocus } from "../focus";
import { Card, CardHead, CountUp, Tag } from "./ui";
import { useTip } from "./Tooltip";
import { GaugeCard } from "./ModelRow";

const TIER = (v) =>
  v < 5 ? "bg-dot text-fg2" : v < 15 ? "bg-lav-soft text-fg2" : v < 30 ? "bg-lav text-[#18181f]" : v < 55 ? "bg-lavd text-white" : "bg-ink text-on-ink dark:border dark:border-line";

function HeatmapCard() {
  const tip = useTip();
  const { focus } = useFocus();
  const wt = DATA.watchTime;
  const grid = "grid grid-cols-[38px_repeat(5,minmax(0,1fr))_54px] items-center gap-1 sm:grid-cols-[50px_repeat(5,minmax(0,1fr))_70px] sm:gap-1.5";
  return (
    <Card className="flex flex-col gap-[18px]">
      <CardHead title="Classification accuracy by group" sub="Row % · rows are observed groups, columns are predicted groups" />
      <div className={grid} role="img" aria-label="Confusion matrix as row percentages">
        <div />
        {wt.map((g, j) => (
          <div key={g.short} className={cx("text-center text-[11px] font-medium whitespace-nowrap text-fg2 transition sm:text-xs", focus === j && "font-bold text-fg", focus !== null && focus !== j && "opacity-40")}>{g.short}</div>
        ))}
        <div className="text-center text-[11px] font-bold text-fg2 sm:text-xs">Correct</div>

        {DATA.confusion.map((row, i) => {
          const total = row.reduce((a, b) => a + b, 0);
          const rowDim = focus !== null && focus !== i;
          return [
            <div key={`r${i}`} className={cx("text-[11px] font-semibold transition sm:text-xs", rowDim && "opacity-40")}>{wt[i].short}</div>,
            ...row.map((n, j) => {
              const pct = (n / total) * 100;
              const dim = focus !== null && focus !== i && focus !== j;
              return (
                <div
                  key={`${i}-${j}`}
                  {...tip(`${wt[i].label} → predicted ${wt[j].label}`, `${n} of ${total} people · ${pct.toFixed(1)}%`)}
                  className={cx("grid h-[40px] place-items-center rounded-lg text-[11px] transition sm:h-[54px] sm:rounded-xl sm:text-[13px] tabular-nums", TIER(pct), i === j ? "font-bold" : "font-medium", dim && "opacity-25")}
                >
                  {Math.round(pct)}%
                </div>
              );
            }),
            <div key={`c${i}`} className={cx("grid h-[40px] place-items-center rounded-lg bg-mint text-[11px] font-bold text-[#18181f] transition sm:h-[54px] sm:rounded-xl sm:text-[13px] tabular-nums", rowDim && "opacity-25")}>
              {DATA.correct[i].toFixed(1)}%
            </div>,
          ];
        })}
      </div>
    </Card>
  );
}

function AccuracyCard() {
  const { focus } = useFocus();
  return (
    <Card className="flex flex-col gap-[18px]">
      <CardHead title="Accuracy by watch-time group" sub="Share of each group predicted correctly" />
      <div className="flex flex-wrap items-baseline gap-2.5">
        <b className="text-[44px] leading-none font-bold tracking-[-0.045em] tabular-nums">
          <CountUp value={DATA.accuracy} decimals={1} suffix="%" />
        </b>
        <span className="text-[13px] text-fg2">overall · in-sample</span>
      </div>
      <div className="flex flex-col gap-[18px]">
        {DATA.watchTime.map((g, i) => (
          <div key={g.label} className={cx("transition", focus !== null && focus !== i && "opacity-30")}>
            <div className="flex justify-between text-[13px] font-medium">
              <span>{g.label}</span>
              <b className="font-bold tabular-nums">{DATA.correct[i].toFixed(1)}%</b>
            </div>
            <div className="mt-2 h-3.5 overflow-hidden rounded-lg bg-dot">
              <div className={cx("h-full origin-left animate-grow rounded-lg", FILL[g.color])} style={{ width: `${DATA.correct[i]}%`, animationDelay: `${i * 70}ms` }} />
            </div>
          </div>
        ))}
      </div>
      <Tag tone="pink">Measured on training data, likely optimistic</Tag>
    </Card>
  );
}

/** Model fit, then where the model gets each group right. */
export default function Performance() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_388px]">
        <HeatmapCard />
        <GaugeCard />
      </div>
      <AccuracyCard />
    </div>
  );
}
