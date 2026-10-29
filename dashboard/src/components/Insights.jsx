import DATA from "../data";
import { cx } from "../lib";
import Icon from "./Icon";
import { Card, CardHead, CountUp } from "./ui";

const wt = DATA.watchTime;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const offRows = DATA.associations.filter((r) => !r[5]);
const strong = DATA.associations.filter((r) => r[3] === "< 0.0001").length;
const heavy = wt[3].count + wt[4].count;
const light = wt[0].count + wt[1].count;
const pct = (n) => ((n / DATA.respondents) * 100).toFixed(1);
const bestIdx = DATA.correct.indexOf(Math.max(...DATA.correct));
const worstIdx = DATA.correct.indexOf(Math.min(...DATA.correct));
const fisher = DATA.associations.filter((r) => r[2] === "Fisher").length;
const fullSections = DATA.sections.filter((s) => s.sig === s.total);

const TONE = {
  lav: "bg-lav-soft text-lavd dark:text-lav",
  mint: "bg-mint-soft text-emerald-700 dark:text-mint",
  pink: "bg-pink-soft text-rose-700 dark:text-pink",
  ink: "bg-main text-fg",
};

/** Row of headline numbers at the top of a view. Each item: { label, value, decimals, suffix, text, note, icon, tone }. */
export function StatStrip({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((s, i) => (
        <Card key={s.label} className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-fg2 sm:text-[13px]">{s.label}</span>
            <span className={cx("hidden size-8 shrink-0 place-items-center rounded-lg sm:grid", TONE[s.tone || "lav"])}>
              <Icon name={s.icon} className="size-4" />
            </span>
          </div>
          <div>
            <b className="block text-2xl leading-none font-semibold tracking-[-0.03em] tabular-nums sm:text-[32px]">
              {s.text ?? <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} delay={i * 80} />}
            </b>
            <span className="mt-2 block text-xs leading-snug text-fg2">{s.note}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Short titled cards, each with a number, a heading and a sentence. */
function FindingCards({ title, sub, items }) {
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title={title} sub={sub} />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((f) => (
          <div key={f.h} className="flex flex-col gap-2 rounded-lg border border-line bg-main/60 p-4">
            <span className={cx("grid size-8 place-items-center rounded-lg", TONE[f.tone])}>
              <Icon name={f.icon} className="size-4" />
            </span>
            <h4 className="mt-1 text-sm font-semibold">{f.h}</h4>
            <p className="text-[13px] leading-relaxed text-fg2">{f.p}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OverviewStats() {
  return (
    <StatStrip
      items={[
        { label: "Heavy users (3 h +)", value: Number(pct(heavy)), decimals: 1, suffix: "%", note: `${heavy} of ${DATA.respondents} respondents`, icon: "clock", tone: "pink" },
        { label: "Light users (≤ 1 h)", value: Number(pct(light)), decimals: 1, suffix: "%", note: `${light} of ${DATA.respondents} respondents`, icon: "clock", tone: "mint" },
        { label: "Most common group", text: wt[2].short, note: `${wt[2].pct}% of respondents, the largest single group`, icon: "chart", tone: "lav" },
        { label: "Median group", text: wt[2].short, note: "Cumulative share passes 50% here", icon: "filter", tone: "ink" },
      ]}
    />
  );
}

export function OverviewFindings() {
  return (
    <FindingCards
      title="What the numbers say"
      sub="Three things to take from the survey at a glance"
      items={[
        { icon: "clock", tone: "pink", h: "Nearly a third are heavy users", p: `${pct(heavy)}% watch three hours or more a day, so heavy use is common rather than rare in this sample.` },
        { icon: "chart", tone: "lav", h: `${DATA.significant} of ${DATA.variablesTested} variables matter`, p: `${Math.round((DATA.significant / DATA.variablesTested) * 100)}% of the tested variables are significantly associated with how long people watch (p < 0.05).` },
        { icon: "brain", tone: "mint", h: "Behaviour beats demographics", p: "Feelings, focus and sleep items are linked to watch time; gender, age, religion and residence are not." },
      ]}
    />
  );
}

export function PredictorStats() {
  const p = DATA.predictors;
  return (
    <StatStrip
      items={[
        { label: "Top predictor", text: p[0].short, note: `LR χ² = ${p[0].chi2}`, icon: "filter", tone: "lav" },
        { label: "Lead over runner-up", value: p[0].chi2 / p[1].chi2, decimals: 1, suffix: "×", note: `${p[0].short} vs ${p[1].short}`, icon: "chart", tone: "pink" },
        { label: "Top-10 combined χ²", value: sum(p.map((x) => x.chi2)), decimals: 0, note: "Sum of the ten strongest predictors", icon: "layers", tone: "mint" },
        { label: "Predictors ranked", value: p.length, note: `of ${DATA.variablesTested} variables tested`, icon: "report", tone: "ink" },
      ]}
    />
  );
}

export function PredictorNotes() {
  const p = DATA.predictors;
  return (
    <FindingCards
      title="Reading the ranking"
      sub="How to interpret the likelihood-ratio χ² scores above"
      items={[
        { icon: "chart", tone: "lav", h: "Bigger means stronger", p: "A larger χ² means that factor improves the model's ability to tell watch-time groups apart more." },
        { icon: "filter", tone: "pink", h: "One factor stands out", p: `${p[0].short} scores ${p[0].chi2}, about ${(p[0].chi2 / p[1].chi2).toFixed(1)} times the next factor, then scores fall off gradually.` },
        { icon: "brain", tone: "mint", h: "Association, not cause", p: "These factors predict heavy use in this survey. They do not prove that one causes the other." },
      ]}
    />
  );
}

export function AssociationStats() {
  return (
    <StatStrip
      items={[
        { label: "Significant", value: DATA.significant, note: `of ${DATA.variablesTested} variables (p < 0.05)`, icon: "chart", tone: "lav" },
        { label: "Strongest evidence", value: strong, note: "variables with p < 0.0001", icon: "filter", tone: "pink" },
        { label: "Fully significant sections", value: fullSections.length, note: fullSections.map((s) => s.name).join(" · "), icon: "layers", tone: "mint" },
        { label: "Exact (Fisher) tests", value: fisher, note: `${DATA.variablesTested - fisher} chi-square tests, used when counts were small`, icon: "book", tone: "ink" },
      ]}
    />
  );
}

export function NotSignificant() {
  return (
    <Card className="flex flex-col gap-4">
      <CardHead title="No evidence of association" sub={`${offRows.length} variables where p ≥ 0.05, so no link to watch time was detected`} />
      <div className="flex flex-wrap gap-2">
        {offRows.map((r) => (
          <span key={r[0]} className="inline-flex items-center gap-2 rounded-lg border border-line bg-main px-3 py-1.5 text-[13px]">
            {r[0]}
            <small className="text-xs text-fg2 tabular-nums">p {r[3]}</small>
          </span>
        ))}
      </div>
    </Card>
  );
}

export function ModelStats() {
  return (
    <StatStrip
      items={[
        { label: "Overall accuracy", value: DATA.accuracy, decimals: 1, suffix: "%", note: "vs 20% by random guessing", icon: "brain", tone: "lav" },
        { label: "Nagelkerke R²", value: DATA.model.nagelkerke, decimals: 3, note: "Share of variation explained", icon: "chart", tone: "mint" },
        { label: "Best group", text: wt[bestIdx].short, note: `${DATA.correct[bestIdx]}% predicted correctly`, icon: "clock", tone: "mint" },
        { label: "Hardest group", text: wt[worstIdx].short, note: `${DATA.correct[worstIdx]}% predicted correctly`, icon: "filter", tone: "pink" },
      ]}
    />
  );
}

export function ModelNotes() {
  return (
    <FindingCards
      title="Reading the metrics"
      sub="What the fit numbers mean in plain language"
      items={[
        { icon: "chart", tone: "lav", h: "Nagelkerke vs McFadden", p: `Nagelkerke R² is ${DATA.model.nagelkerke} and McFadden's is ${DATA.model.mcfadden}. McFadden runs lower by design, and 0.2 to 0.4 already counts as a good fit.` },
        { icon: "brain", tone: "mint", h: "Extremes are easiest", p: `The lightest and heaviest groups are predicted best. Middle groups such as ${wt[3].short} blur into their neighbours.` },
        { icon: "report", tone: "pink", h: "Treat accuracy with care", p: "Accuracy was measured on the same data used to build the model, so a hold-out test would likely score lower." },
      ]}
    />
  );
}

export function ReportStats() {
  return (
    <StatStrip
      items={[
        { label: "Respondents", value: DATA.respondents, note: "Bangladesh · 2026", icon: "layers", tone: "lav" },
        { label: "Significant variables", value: DATA.significant, note: `${Math.round((DATA.significant / DATA.variablesTested) * 100)}% of those tested`, icon: "chart", tone: "mint" },
        { label: "Model accuracy", value: DATA.accuracy, decimals: 1, suffix: "%", note: "In-sample, 5 groups", icon: "brain", tone: "pink" },
        { label: "Top predictor", text: DATA.predictors[0].short, note: `LR χ² = ${DATA.predictors[0].chi2}`, icon: "filter", tone: "ink" },
      ]}
    />
  );
}
