import DATA from "../data";
import { cx } from "../lib";
import Icon from "./Icon";
import { Card, CardHead, Tag } from "./ui";
import { StatStrip } from "./Insights";
import Footer from "./Footer";

/* Content is taken from analyssis_mindmap.md and the notebooks in this repository. */

const fisher = DATA.associations.filter((r) => r[2] === "Fisher").length;
const chi = DATA.associations.length - fisher;

const METHODS = [
  {
    icon: "chart",
    tone: "bg-lav-soft text-lavd dark:text-lav",
    name: "Chi-square test",
    use: `Used for ${chi} variables`,
    what: "Compares the counts you observe in a cross-tabulation with the counts you would expect if the variable and watch time were unrelated.",
    when: "Every cell has an expected count above 5.",
    out: "A p-value for each variable.",
  },
  {
    icon: "filter",
    tone: "bg-pink-soft text-rose-700 dark:text-pink",
    name: "Fisher–Freeman–Halton exact test",
    use: `Used for ${fisher} variables`,
    what: "An exact version of the test for tables larger than 2×2. It is estimated by Monte Carlo resampling with 100,000 resamples.",
    when: "Any expected count is 5 or less, where chi-square is unreliable.",
    out: "A p-value for each variable.",
  },
  {
    icon: "brain",
    tone: "bg-mint-soft text-emerald-700 dark:text-mint",
    name: "Multinomial logistic regression",
    use: `Fitted on ${DATA.significant} significant variables`,
    what: "Predicts which of the five watch-time groups a respondent falls in, comparing every group with “Less than 1 hour”.",
    when: "The outcome has more than two unordered or ordered categories.",
    out: "Model fit, a likelihood-ratio test per predictor, odds ratios with 95% intervals and a classification table.",
  },
];

const RULES = [
  ["Significance level", "p < 0.05", "A variable counts as associated with watch time below this."],
  ["Test choice", "Expected count ≤ 5", "Triggers the Fisher–Freeman–Halton exact test instead of chi-square."],
  ["Resampling", "100,000", "Monte Carlo resamples used for the exact test p-values."],
  ["Respondent removal", "3+ rule breaks", "A respondent is dropped after breaking three or more of seven consistency rules."],
  ["Missing answers", "Most common answer", "Missing or unclear answers are replaced with the most common one."],
  ["Reference outcome", "Less than 1 hour", "Every other watch-time group is compared with this one."],
  ["Reference predictor", "Most common answer", "Each predictor answer is compared with its most common category."],
];

const GLOSSARY = [
  ["p-value", "How surprising the pattern would be if the variable and watch time were unrelated. Smaller means stronger evidence of a link."],
  ["Likelihood-ratio χ²", "How much a predictor improves the model. It is used here to rank predictors; larger is stronger."],
  ["Nagelkerke R²", `A rough share of variation explained, scaled from 0 to 1. Here ${DATA.model.nagelkerke}, which is optimistic for this model size.`],
  ["McFadden R²", `A stricter fit measure that runs lower by design. Here ${DATA.model.mcfadden}; values of 0.2 to 0.4 are usually considered a good fit.`],
  ["Odds ratio", "How much more or less likely a group is, compared with the reference, when a predictor changes. Above 1 means more likely."],
  ["Degrees of freedom", `The number of free parameters in the model. Here ${DATA.model.df}.`],
  ["Confusion matrix", "A table of observed groups against predicted groups; the diagonal holds the correct predictions."],
  ["In-sample accuracy", "Accuracy measured on the same data used to build the model, so it is likely higher than on new data."],
];

const FILES = [
  ["1_finetune_dataset", "Load, rename and clean the survey", "dataset_v1.csv"],
  ["2_fix_group", "Order categories and set types", "dataset_v2.pkl"],
  ["3_check_outlier", "Consistency checks, drop rule breakers", "dataset_v3.pkl"],
  ["4_test_cross_tab", "Cross-tabulate and run chi-square", "cross_tabulation PDF"],
  ["05_fisher_test", "Exact tests where counts are small", "fisher_test PDF"],
  ["06_sep_sig_with_daily_watch_time", "Keep variables with p < 0.05", "dataset_v4_sig.pkl"],
  ["07_mlr_analysis", "Multinomial logistic regression", "mlr_analysis PDF"],
];

const ETHICS = [
  ["Aggregated only", "This dashboard shows totals and test results. No individual response is shown."],
  ["Anonymous survey", "Responses are analysed as groups, with no names or contact details in the results."],
  ["Self-reported", "Answers reflect what people say about themselves, which can differ from what they do."],
  ["Cross-sectional", "Everyone was asked once, so the data shows what goes together, not what causes what."],
];

function Methods() {
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="Statistical methods" sub="The three techniques behind every result in this dashboard" />
      <div className="grid gap-4 lg:grid-cols-3">
        {METHODS.map((m) => (
          <div key={m.name} className="flex flex-col gap-3 rounded-lg border border-line bg-main/60 p-5">
            <span className={cx("grid size-9 place-items-center rounded-lg", m.tone)}>
              <Icon name={m.icon} className="size-[18px]" />
            </span>
            <div>
              <h4 className="text-[15px] font-semibold">{m.name}</h4>
              <span className="text-xs font-medium text-lavd dark:text-lav">{m.use}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-fg2">{m.what}</p>
            <dl className="mt-auto flex flex-col gap-2 border-t border-line pt-3 text-[13px]">
              <div><dt className="text-xs font-semibold tracking-wide text-fg2 uppercase">When</dt><dd className="mt-0.5">{m.when}</dd></div>
              <div><dt className="text-xs font-semibold tracking-wide text-fg2 uppercase">Output</dt><dd className="mt-0.5">{m.out}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Rules() {
  return (
    <Card pad={false} className="overflow-hidden">
      <div className="p-5 sm:p-6">
        <CardHead title="Decision rules" sub="The thresholds and defaults applied throughout the analysis" />
      </div>
      <dl className="divide-y divide-line border-t border-line">
        {RULES.map(([k, v, d]) => (
          <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_170px_1fr] sm:items-center sm:gap-4 sm:px-6">
            <dt className="text-[13px] font-medium">{k}</dt>
            <dd><Tag tone="lav">{v}</Tag></dd>
            <dd className="text-[13px] text-fg2">{d}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Glossary() {
  return (
    <Card className="flex flex-col gap-4">
      <CardHead title="Glossary" sub="Plain-language meanings of the terms used in the dashboard" />
      <dl className="divide-y divide-line">
        {GLOSSARY.map(([t, d]) => (
          <div key={t} className="py-3 first:pt-0 last:pb-0">
            <dt className="text-[13px] font-semibold">{t}</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-fg2">{d}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Repo() {
  return (
    <Card className="flex flex-col gap-4">
      <CardHead title="Reproducibility" sub="Run the notebooks in order to rebuild every number here" />
      <ol className="flex flex-col divide-y divide-line">
        {FILES.map(([n, d, o], i) => (
          <li key={n} className="grid grid-cols-[24px_1fr] gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid size-6 place-items-center rounded-md bg-main text-xs font-semibold text-fg2 tabular-nums">{i + 1}</span>
            <div className="min-w-0">
              <b className="block truncate text-[13px] font-semibold">{n}.ipynb</b>
              <span className="block text-[13px] text-fg2">{d}</span>
              <span className="mt-1 inline-block rounded bg-main px-1.5 py-0.5 text-[11px] font-medium text-fg2">→ {o}</span>
            </div>
          </li>
        ))}
      </ol>
      <p className="border-t border-line pt-3 text-xs text-fg2">
        Built with Python: pandas for data handling, SciPy and statsmodels for the tests and regression. Dependencies are listed in requirements.txt.
      </p>
    </Card>
  );
}

function Ethics() {
  return (
    <Card className="flex flex-col gap-5">
      <CardHead title="Data, privacy and limits" sub="What the data can and cannot support" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ETHICS.map(([h, p]) => (
          <div key={h} className="flex flex-col gap-1.5 rounded-lg border border-line bg-main/60 p-4">
            <h4 className="text-sm font-semibold">{h}</h4>
            <p className="text-[13px] leading-relaxed text-fg2">{p}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Methodology() {
  return (
    <div className="flex flex-col gap-6">
      <StatStrip
        items={[
          { label: "Tests run", value: DATA.variablesTested, note: `${chi} chi-square · ${fisher} exact`, icon: "chart", tone: "lav" },
          { label: "Significance level", text: "p < 0.05", note: "Threshold for keeping a variable", icon: "filter", tone: "pink" },
          { label: "Monte Carlo resamples", text: "100,000", note: "For the exact-test p-values", icon: "layers", tone: "mint" },
          { label: "Reference group", text: "< 1 h", note: "Every watch-time group is compared with this", icon: "clock", tone: "ink" },
        ]}
      />
      <Methods />
      <Rules />
      <div className="grid gap-6 lg:grid-cols-2">
        <Glossary />
        <Repo />
      </div>
      <Ethics />
      <Footer />
    </div>
  );
}
