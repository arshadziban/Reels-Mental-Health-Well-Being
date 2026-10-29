import DATA from "../data";
import { cx } from "../lib";
import { useState } from "react";
import { Card, CardHead, Segmented } from "./ui";
import { Radar, SectionBars } from "./Charts";
import { useTip } from "./Tooltip";

const TINT = ["bg-mint-soft", "bg-pink-soft", "bg-lav-soft"];
const C = 2 * Math.PI * 22;

function Ring({ ratio }) {
  return (
    <div className="relative size-[52px] shrink-0">
      <svg viewBox="0 0 52 52" className="block size-full -rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r="22" fill="none" strokeWidth="8" className="stroke-card" />
        <circle
          cx="26"
          cy="26"
          r="22"
          fill="none"
          strokeWidth="8"
          className="stroke-lavd"
          strokeDasharray={`${(C * ratio).toFixed(2)} ${C.toFixed(2)}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold">{Math.round(ratio * 100)}%</span>
    </div>
  );
}

export default function SectionsCard() {
  const tip = useTip();
  const [view, setView] = useState("rings");
  return (
    <Card as="section" className="flex flex-col gap-5">
      <CardHead title="Significance by section" sub="Variables significantly associated with daily watch time (p < 0.05)">
        <Segmented
          label="Chart style"
          value={view}
          onChange={setView}
          options={[
            { value: "rings", label: "Rings" },
            { value: "radar", label: "Radar" },
            { value: "bars", label: "Bars" },
          ]}
        />
      </CardHead>
      {view === "radar" && <div key="radar" className="animate-fade"><Radar /></div>}
      {view === "bars" && <div key="bars" className="animate-fade"><SectionBars /></div>}
      <div hidden={view !== "rings"} className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 [&[hidden]]:hidden">
        {DATA.sections.map((s, i) => (
          <div
            key={s.name}
            {...tip(s.name, `${s.sig} of ${s.total} variables significant`)}
            className={cx("flex flex-col items-start gap-2.5 rounded-xl px-3.5 py-4 sm:flex-row sm:items-center sm:gap-3 sm:py-[18px]", TINT[i % 3])}
          >
            <Ring ratio={s.sig / s.total} />
            <div className="min-w-0">
              <h4 className="text-[13px] leading-tight font-semibold">{s.name}</h4>
              <p className="mt-[3px] text-xs text-fg2">
                {s.sig} of {s.total} significant
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
