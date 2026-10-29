import { useState } from "react";
import DATA from "../data";
import { cx } from "../lib";
import { Card, CardHead, Tag } from "./ui";

/* Content below is taken from analyssis_mindmap.md in this repository. */

const FACTS = [
  { k: "Sample", v: "503", d: "respondents after cleaning" },
  { k: "Outcome", v: "5 levels", d: "daily Reels watch time (ordinal)" },
  { k: "Predictors", v: "40", d: "categorical survey variables" },
  { k: "Method", v: "2 stages", d: "bivariate screening, then multinomial regression" },
];

const STEPS = [
  { n: 1, t: "Clean & recode", out: "dataset_v1.csv", d: "Load the survey sheet, rename columns, strip Bangla text, clean values (missing or unclear answers become the most common answer), merge Hindu and Christian, and bin numeric answers into groups." },
  { n: 2, t: "Ordered categories", out: "dataset_v2", d: "Put the grouped columns in their natural order, replace the numeric sources, and treat every column as categorical." },
  { n: 3, t: "Outlier checks", out: "dataset_v3 · 503 × 41", d: "Check rare categories, allowed values, missing data and duplicates, apply seven consistency rules, and drop respondents who break three or more." },
  { n: 4, t: "Chi-square", out: "cross-tab report", d: "Cross-tabulate every variable against watch time and run a chi-square test." },
  { n: 5, t: "Chi-square / Fisher", out: "Fisher report", d: "Where any expected count is 5 or less, use the Fisher–Freeman–Halton exact test (Monte Carlo, 100,000 resamples); otherwise chi-square." },
  { n: 6, t: "Keep p < 0.05", out: "dataset_v4 · 503 × 29", d: "Repeat the tests and keep the outcome plus the 28 variables with p < 0.05." },
  { n: 7, t: "Multinomial regression", out: "model report", d: "Fit a multinomial logistic regression: model fit, a likelihood-ratio test per predictor, odds ratios with 95% intervals, and a classification table." },
];

const ISSUES = [
  { t: "The model is too large for the data", e: "86 parameters per equation against 58 people in the smallest group, about 0.7 cases per parameter (at least 10 is the usual minimum).", f: "R², accuracy and odds ratios are inflated. A reduced model with the 10 significant predictors is the fix." },
  { t: "Some answer categories are very small", e: "Fewer than 20 people chose, for example Divorced (5), Bad (5), Very Uncomfortable (7) or Morning (11).", f: "Estimates become unstable (11 of 348 are flagged). Merging neighbouring categories would help." },
  { t: "Likert answers stored without order", e: "Many scale questions are listed alphabetically (Always, Never, Often…).", f: "Results are not affected, but tables read oddly; adding the orders in step 2 fixes the display." },
  { t: "“Not sure” is not a point on the scale", e: "It appears in four mental-health and perceived-effect questions.", f: "Treat it as its own category and list it last." },
  { t: "Ambiguous outcome wording", e: "“More than that” means over 3 hours, and “1 hour” and “2 hours” are points rather than ranges.", f: "Relabel in reports and note it as a questionnaire limitation." },
];

const FAQ = [
  ["What does p < 0.05 mean here?", "If watch time and the variable were unrelated, a pattern this strong would show up by chance less than 5% of the time. It signals an association, not a cause."],
  ["Why two kinds of test?", "Chi-square needs enough people in every cell. When some cells are tiny (expected count 5 or less) the Fisher–Freeman–Halton exact test is used instead."],
  ["What is Nagelkerke R² = 0.822?", "A rough measure of how much of the variation in watch time the model explains. It is high partly because the model is large for the data, so treat it as optimistic."],
  ["What does the 67.2% accuracy mean?", "The share of respondents the model put in their correct watch-time group. It is measured on the same data used to build the model, and random guessing would get about 20%."],
  ["What are the reference categories?", "Watch time is compared with “Less than 1 hour”. Each predictor is compared with its most common answer."],
  ["Can I say Reels cause these effects?", "No. This is a cross-sectional survey, so it shows which things go together, not which one causes the other."],
];

function Accordion({ items, render }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-line">
      {items.map((it, i) => {
        const on = open === i;
        const [title, body] = render(it);
        return (
          <div key={i}>
            <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-[14px] font-semibold transition-colors hover:text-lavd">
              {title}
              <span aria-hidden="true" className={cx("grid size-6 shrink-0 place-items-center rounded-md bg-main text-fg2 transition-transform duration-300", on && "rotate-45 bg-lav-soft text-lavd")}>+</span>
            </button>
            <div className={cx("grid transition-[grid-template-rows] duration-300", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden"><div className="pb-4 text-[13px] leading-relaxed text-fg2">{body}</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Pipeline() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="How the analysis was built" sub="Seven steps from the raw survey to the model · select a step" />
      <ol className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {STEPS.map((st, n) => (
          <li key={st.n} className="min-w-[88px] flex-1">
            <button type="button" aria-current={n === i} onClick={() => setI(n)} className={cx("flex w-full flex-col items-start gap-2 rounded-xl p-3 text-left ring-1 transition", n === i ? "bg-lavd text-white ring-lavd" : n < i ? "bg-lav-soft text-lavd ring-lavd/15 dark:text-lav" : "bg-main ring-line hover:ring-lavd/30")}>
              <span className={cx("grid size-6 place-items-center rounded-md text-xs font-bold", n === i ? "bg-white/20" : "bg-card")}>{st.n}</span>
              <span className="text-xs leading-tight font-semibold">{st.t}</span>
            </button>
          </li>
        ))}
      </ol>
      <div key={i} className="animate-fade rounded-xl bg-main p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="lav">Step {s.n}</Tag>
          <b className="text-[15px]">{s.t}</b>
          <span className="ml-auto rounded-md bg-card px-2 py-1 font-mono text-[11px] text-fg2 ring-1 ring-line">{s.out}</span>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-fg2">{s.d}</p>
      </div>
    </Card>
  );
}

function Domains() {
  const [pick, setPick] = useState(null);
  const letters = "ABCDEFGH";
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="The questionnaire" sub="Eight sections · share of variables significant" />
      <ul className="flex flex-col gap-1.5">
        {DATA.sections.map((s, n) => {
          const r = s.sig / s.total;
          return (
            <li key={s.name}>
              <button type="button" onClick={() => setPick(pick === n ? null : n)} aria-pressed={pick === n} className={cx("grid w-full grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl px-2.5 py-2 text-left transition", pick === n ? "bg-lav-soft ring-1 ring-lavd/25" : "hover:bg-main")}>
                <span className="grid size-7 place-items-center rounded-md bg-main text-xs font-bold text-fg2">{letters[n]}</span>
                <span>
                  <span className="block text-[13px] font-semibold">{s.name}</span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-dot"><span className="block h-full rounded-full bg-lavd transition-[width] duration-500" style={{ width: `${r * 100}%` }} /></span>
                </span>
                <b className="text-[13px] tabular-nums">{s.sig}/{s.total}</b>
              </button>
              {pick === n && (
                <ul className="animate-fade mt-1.5 mb-2 ml-[38px] flex flex-wrap gap-1.5">
                  {DATA.associations.filter((a) => a[1] === s.name).map((a) => (
                    <li key={a[0]} className={cx("rounded-md px-2 py-1 text-xs font-medium text-[#0f172a]", a[5] ? "bg-mint" : "bg-pink/70")}>{a[0]}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function Study() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {FACTS.map((f) => (
          <Card key={f.k} className="flex flex-col gap-1 p-5">
            <span className="text-xs font-semibold tracking-wide text-fg2 uppercase">{f.k}</span>
            <b className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{f.v}</b>
            <span className="text-[13px] leading-snug text-fg2">{f.d}</span>
          </Card>
        ))}
      </div>
      <Pipeline />
      <div className="grid gap-6 lg:grid-cols-2">
        <Domains />
        <Card className="flex flex-col gap-3">
          <CardHead title="Known issues" sub="What to keep in mind when reading the model" />
          <Accordion items={ISSUES} render={(x) => [x.t, <><p>{x.e}</p><p className="mt-1.5"><b className="text-fg">Effect and fix:</b> {x.f}</p></>]} />
        </Card>
      </div>
      <Card className="flex flex-col gap-3">
        <CardHead title="How to read these results" sub="Plain-language answers to common questions" />
        <Accordion items={FAQ} render={(x) => [x[0], x[1]]} />
      </Card>
    </div>
  );
}
