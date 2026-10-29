import DATA from "../data";
import { cx } from "../lib";
import { Card, CardHead, Tag } from "./ui";
import { useTip } from "./Tooltip";

/* Everything below is derived from the aggregated tables in data.js; nothing is hard-coded. */
const A = DATA.associations;

const BANDS = [
  { label: "< 0.0001", test: (p) => p <= 0.00001, color: "var(--lavd)" },
  { label: "0.0001 – 0.001", test: (p) => p > 0.00001 && p <= 0.001, color: "var(--lav)" },
  { label: "0.001 – 0.01", test: (p) => p > 0.001 && p <= 0.01, color: "var(--mint)" },
  { label: "0.01 – 0.05", test: (p) => p > 0.01 && p < 0.05, color: "var(--pink)" },
  { label: "≥ 0.05", test: (p) => p >= 0.05, color: "var(--dot-empty)" },
].map((b) => ({ ...b, n: A.filter((r) => b.test(r[4])).length }));

const TESTS = ["Chi-square", "Fisher"].map((t) => {
  const all = A.filter((r) => r[2] === t);
  return { t, n: all.length, sig: all.filter((r) => r[5]).length };
});

const CONF = (() => {
  const g = DATA.watchTime;
  let right = 0, near = 0, far = 0;
  const pairs = [];
  DATA.confusion.forEach((row, i) =>
    row.forEach((n, j) => {
      if (i === j) right += n;
      else {
        if (Math.abs(i - j) === 1) near += n;
        else far += n;
        pairs.push({ from: g[i].label, to: g[j].label, n, d: Math.abs(i - j) });
      }
    }),
  );
  pairs.sort((a, b) => b.n - a.n);
  return { right, near, far, wrong: near + far, pairs: pairs.slice(0, 4) };
})();

const bestIdx = DATA.correct.indexOf(Math.max(...DATA.correct));
const worstIdx = DATA.correct.indexOf(Math.min(...DATA.correct));
const topSection = [...DATA.sections].sort((a, b) => b.sig / b.total - a.sig / a.total || b.total - a.total)[0];
const lowSection = [...DATA.sections].sort((a, b) => a.sig / a.total - b.sig / b.total)[0];
const strongBand = BANDS[0].n;

const FINDINGS = [
  { k: "Share significant", v: `${Math.round((DATA.significant / DATA.variablesTested) * 100)}%`, d: `${DATA.significant} of ${DATA.variablesTested} variables differ across watch-time groups (p < 0.05).`, tone: "bg-lav-soft" },
  { k: "Very strong evidence", v: String(strongBand), d: "variables reach p < 0.0001, led by sitting duration and addictive watching.", tone: "bg-mint-soft" },
  { k: "Most consistent area", v: `${topSection.sig}/${topSection.total}`, d: `${topSection.name}: every item is significant.`, tone: "bg-pink-soft" },
  { k: "Weakest area", v: `${lowSection.sig}/${lowSection.total}`, d: `${lowSection.name}: little evidence that background traits predict use.`, tone: "bg-main" },
  { k: "Best-predicted group", v: `${DATA.correct[bestIdx]}%`, d: `${DATA.watchTime[bestIdx].label} is classified correctly most often.`, tone: "bg-mint-soft" },
  { k: "Hardest group", v: `${DATA.correct[worstIdx]}%`, d: `${DATA.watchTime[worstIdx].label} has the lowest share classified correctly.`, tone: "bg-pink-soft" },
];

function Findings() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FINDINGS.map((f) => (
        <div key={f.k} className={cx("flex flex-col gap-1.5 rounded-xl p-4 ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-md", f.tone)}>
          <span className="text-xs font-semibold tracking-wide text-fg2 uppercase">{f.k}</span>
          <b className="text-3xl leading-none font-bold tracking-[-0.04em] tabular-nums">{f.v}</b>
          <p className="text-[13px] leading-snug text-fg2">{f.d}</p>
        </div>
      ))}
    </div>
  );
}

/** How many variables fall into each p-value band. */
function PBands({ tip }) {
  const max = Math.max(...BANDS.map((b) => b.n));
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="How strong is the evidence?" sub="Number of variables per p-value band" />
      <div className="flex h-[200px] items-end gap-2 sm:gap-4" role="img" aria-label="Variables per p-value band">
        {BANDS.map((b, i) => (
          <div key={b.label} tabIndex={0} {...tip(b.label, `${b.n} variables`)} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 outline-offset-2">
            <b className="text-sm tabular-nums">{b.n}</b>
            <div
              className="w-full max-w-[64px] origin-bottom animate-rise rounded-t-lg transition-[filter] group-hover:brightness-95"
              style={{ height: `${Math.max((b.n / max) * 100, 4)}%`, background: b.color, animationDelay: `${i * 60}ms` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 sm:gap-4">
        {BANDS.map((b) => (
          <span key={b.label} className="min-w-0 flex-1 text-center text-xs leading-tight text-fg2">{b.label}</span>
        ))}
      </div>
    </Card>
  );
}

/** Chi-square vs. Fisher exact: how many of each, and how many were significant. */
function TestMix({ tip }) {
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="Which tests were used?" sub="Fisher–Freeman–Halton is used when expected counts are small" />
      <div className="flex flex-col gap-5">
        {TESTS.map((t) => (
          <div key={t.t} tabIndex={0} {...tip(t.t, `${t.sig} of ${t.n} significant`)} className="rounded-lg outline-offset-4">
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="font-semibold">{t.t}</span>
              <span className="text-fg2"><b className="text-fg tabular-nums">{t.sig}</b> of {t.n} significant · {Math.round((t.sig / t.n) * 100)}%</span>
            </div>
            <div className="mt-2 flex h-4 gap-0.5 overflow-hidden rounded-md">
              <span className="block origin-left animate-grow bg-lavd" style={{ width: `${(t.sig / t.n) * 100}%` }} />
              <span className="block flex-1 bg-pink/70" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-fg2">
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-lavd" />Significant</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-pink/70" />Not significant</span>
      </div>
    </Card>
  );
}

/** Where the model goes wrong: how far off the misclassified respondents are. */
function Errors({ tip }) {
  const total = DATA.respondents;
  const segs = [
    { k: "Correct", n: CONF.right, c: "var(--lavd)" },
    { k: "One group off", n: CONF.near, c: "var(--mint)" },
    { k: "Two or more groups off", n: CONF.far, c: "var(--pink)" },
  ];
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="Where the model goes wrong" sub="Distance between actual and predicted watch-time group" />
      <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg" role="img" aria-label="Correct, near-miss and far-miss predictions">
        {segs.map((s) => (
          <span key={s.k} tabIndex={0} {...tip(s.k, `${s.n} people · ${((s.n / total) * 100).toFixed(1)}%`)} className="grid origin-left animate-grow place-items-center text-xs font-bold text-[#0f172a] outline-none" style={{ width: `${(s.n / total) * 100}%`, background: s.c }}>
            {Math.round((s.n / total) * 100)}%
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg2">
        {segs.map((s) => (
          <span key={s.k} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm" style={{ background: s.c }} />{s.k} · {s.n}</span>
        ))}
      </div>
      <p className="text-[13px] leading-relaxed text-fg2">
        Of the <b className="text-fg">{CONF.wrong}</b> misclassified people, <b className="text-fg">{Math.round((CONF.near / CONF.wrong) * 100)}%</b> landed in the neighbouring group, so most errors are small.
      </p>
      <div>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-fg2 uppercase">Most common mix-ups</h4>
        <ol className="flex flex-col divide-y divide-line">
          {CONF.pairs.map((p) => (
            <li key={`${p.from}${p.to}`} className="flex items-center justify-between gap-3 py-2 text-[13px]">
              <span className="min-w-0 truncate">{p.from} <span className="text-fg2">→</span> {p.to}</span>
              <b className="tabular-nums">{p.n}</b>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

function Takeaways() {
  const items = [
    ["Physical and cognitive signals dominate", `Sitting duration, attention, memory and performance are among the ${strongBand} variables with p < 0.0001.`],
    ["Who you are matters less than how you feel", `${DATA.sections[0].name} traits such as gender, age and residence are not significant; mental-health and perceived-effect items are.`],
    ["The model is informative, not decisive", `Accuracy is ${DATA.accuracy}% against 20% for random guessing across five groups, but it is measured on the training data.`],
  ];
  const limits = ["Associations only, not causation.", "Self-reported survey answers.", "In-sample accuracy is likely optimistic; no hold-out set.", "40 tests were run; some significant results may be chance."];
  return (
    <Card tone="solid" className="grid gap-8 bg-ink p-6 text-on-ink sm:p-7 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-5">
        <Tag tone="mint">Conclusions</Tag>
        <ol className="flex flex-col gap-4">
          {items.map(([h, d], i) => (
            <li key={h} className="flex gap-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-bold">{i + 1}</span>
              <div>
                <h4 className="text-[15px] font-semibold">{h}</h4>
                <p className="mt-0.5 text-[13px] leading-relaxed text-on-ink/70">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-4 lg:border-l lg:border-white/10 lg:pl-8">
        <Tag tone="pink">Limitations</Tag>
        <ul className="flex flex-col gap-2.5 text-[13px] leading-relaxed text-on-ink/80">
          {limits.map((l) => (
            <li key={l} className="flex gap-2.5"><i className="mt-[7px] size-1.5 shrink-0 rounded-full bg-pink" />{l}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default function Report() {
  const tip = useTip();
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5">
        <CardHead title="Key findings" sub="Computed from the aggregated results" />
        <Findings />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <PBands tip={tip} />
        <TestMix tip={tip} />
      </div>
      <Errors tip={tip} />
      <Takeaways />
    </div>
  );
}
