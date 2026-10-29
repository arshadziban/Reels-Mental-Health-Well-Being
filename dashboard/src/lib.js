export const cx = (...a) => a.filter(Boolean).join(" ");

/** Fill classes for the five watch-time groups (static strings so Tailwind can see them). */
export const FILL = {
  mint: "bg-mint",
  lav: "bg-lav",
  lavd: "bg-lavd",
  pink: "bg-pink",
  ink: "bg-ink dark:bg-[#f5f4fa]",
};

/** Dashboard views, one per sidebar item. */
export const NAV = [
  { id: "overview", label: "Overview", icon: "home", hint: "Headline finding, key numbers and who watches how much" },
  { id: "predictors", label: "Predictors", icon: "filter", hint: "Which survey factors predict longer daily watch time" },
  { id: "associations", label: "Associations", icon: "chart", hint: "All 40 variables tested against daily watch time" },
  { id: "model", label: "Model", icon: "brain", hint: "Model fit, and where it classifies respondents right or wrong" },
  { id: "report", label: "Report", icon: "report", hint: "What the results add up to, and what they cannot tell us" },
  { id: "study", label: "Study design", icon: "layers", hint: "How the data was collected, cleaned and analysed" },
  { id: "methodology", label: "Methodology", icon: "book", hint: "Tests used and how to read the results" },
];
