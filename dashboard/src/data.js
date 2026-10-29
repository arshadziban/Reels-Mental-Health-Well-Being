/* Aggregated results only (no individual responses).
 * Source: dataset_v3 / dataset_v4_sig and the notebooks 05, 06, 07 in this repository. */
const DATA = {
  respondents: 503,
  variablesTested: 40,
  significant: 28,
  accuracy: 67.2,

  watchTime: [
    { label: "Less than 1 hour", short: "< 1 h", count: 108, pct: 21.5, color: "mint" },
    { label: "1 hour", short: "1 h", count: 108, pct: 21.5, color: "lav" },
    { label: "2 hours", short: "2 h", count: 134, pct: 26.6, color: "lavd" },
    { label: "3 hours", short: "3 h", count: 58, pct: 11.5, color: "pink" },
    { label: "More than 3 hours", short: "> 3 h", count: 95, pct: 18.9, color: "ink" }
  ],

  predictors: [
    { name: "Sitting duration", short: "Sitting duration", chi2: 206.34 },
    { name: "In-person feeling", short: "In‑person feeling", chi2: 51.26 },
    { name: "Weight", short: "Weight", chi2: 49.19 },
    { name: "Addictive watching", short: "Addictive watching", chi2: 47.05 },
    { name: "Curiosity-driven rewatch", short: "Curiosity rewatch", chi2: 41.56 },
    { name: "Peak watch time", short: "Peak watch time", chi2: 34.65 },
    { name: "FOMO anxiety", short: "FOMO anxiety", chi2: 25.83 },
    { name: "Mood swings", short: "Mood swings", chi2: 25.48 },
    { name: "Mental state change", short: "Mental state change", chi2: 21.83 },
    { name: "Marital status", short: "Marital status", chi2: 20.01 }
  ],

  sections: [
    { name: "Demographics", sig: 1, total: 6 },
    { name: "Family", sig: 3, total: 4 },
    { name: "Physical health", sig: 3, total: 4 },
    { name: "Reels usage", sig: 1, total: 3 },
    { name: "Lifestyle & sleep", sig: 2, total: 4 },
    { name: "Cognitive effects", sig: 4, total: 4 },
    { name: "Mental health", sig: 7, total: 8 },
    { name: "Perceived effects", sig: 7, total: 7 }
  ],

  model: { nagelkerke: 0.822, mcfadden: 0.49, lrChi2: 776.53, df: 344 },

  // rows = observed group, columns = predicted group (counts)
  confusion: [
    [88, 9, 7, 2, 2],
    [16, 64, 22, 2, 4],
    [9, 17, 88, 7, 13],
    [2, 5, 13, 30, 8],
    [3, 5, 15, 4, 68]
  ],
  correct: [81.5, 59.3, 65.7, 51.7, 71.6],

  // [variable, section, test, p-value text, p numeric, significant]
  associations: [
    ["Sitting duration", "Physical health", "Chi-square", "< 0.0001", 0.00001, true],
    ["Addictive watching", "Mental health", "Chi-square", "< 0.0001", 0.00001, true],
    ["Curiosity-driven rewatch", "Perceived effects", "Chi-square", "< 0.0001", 0.00001, true],
    ["Emotional Reels focus loss", "Perceived effects", "Chi-square", "< 0.0001", 0.00001, true],
    ["Performance affected", "Cognitive effects", "Fisher", "< 0.0001", 0.00001, true],
    ["Memory reduced", "Cognitive effects", "Fisher", "< 0.0001", 0.00001, true],
    ["Attention decreased", "Cognitive effects", "Fisher", "< 0.0001", 0.00001, true],
    ["Physical problems", "Physical health", "Chi-square", "< 0.0001", 0.00001, true],
    ["Distraction after viral Reels", "Perceived effects", "Chi-square", "< 0.0001", 0.00001, true],
    ["Social comparison", "Mental health", "Chi-square", "< 0.0001", 0.00001, true],
    ["Social isolation", "Mental health", "Fisher", "< 0.0001", 0.00001, true],
    ["Content type effect", "Perceived effects", "Chi-square", "0.0001", 0.0001, true],
    ["Learning interest decreased", "Cognitive effects", "Chi-square", "0.0002", 0.0002, true],
    ["Exercise involvement", "Lifestyle & sleep", "Chi-square", "0.0003", 0.0003, true],
    ["Mental state change", "Perceived effects", "Fisher", "0.0006", 0.0006, true],
    ["Sleep quality change", "Perceived effects", "Chi-square", "0.0010", 0.001, true],
    ["Mental stress", "Mental health", "Chi-square", "0.0017", 0.0017, true],
    ["FOMO anxiety", "Mental health", "Fisher", "0.0020", 0.002, true],
    ["Mood swings", "Mental health", "Chi-square", "0.0033", 0.0033, true],
    ["In-person feeling", "Family", "Fisher", "0.0051", 0.0051, true],
    ["Sleep trouble", "Lifestyle & sleep", "Chi-square", "0.0063", 0.0063, true],
    ["Marital status", "Demographics", "Fisher", "0.0072", 0.0072, true],
    ["Family relationship", "Family", "Fisher", "0.0124", 0.0124, true],
    ["Family time", "Family", "Chi-square", "0.0181", 0.0181, true],
    ["Brain pressure", "Perceived effects", "Fisher", "0.0250", 0.025, true],
    ["Peak watch time", "Reels usage", "Fisher", "0.0252", 0.0252, true],
    ["Weight group", "Physical health", "Fisher", "0.0331", 0.0331, true],
    ["Panic attacks", "Mental health", "Fisher", "0.0362", 0.0362, true],
    ["Substance use", "Lifestyle & sleep", "Fisher", "0.1124", 0.1124, false],
    ["Gender", "Demographics", "Chi-square", "0.1130", 0.113, false],
    ["Occupation", "Demographics", "Chi-square", "0.2314", 0.2314, false],
    ["Behavior type", "Mental health", "Chi-square", "0.2354", 0.2354, false],
    ["Age group", "Demographics", "Fisher", "0.2879", 0.2879, false],
    ["Years watching Reels", "Reels usage", "Chi-square", "0.2977", 0.2977, false],
    ["Family type", "Family", "Fisher", "0.3127", 0.3127, false],
    ["Multitasking while watching", "Reels usage", "Chi-square", "0.3416", 0.3416, false],
    ["Religion", "Demographics", "Fisher", "0.4332", 0.4332, false],
    ["Residence", "Demographics", "Chi-square", "0.4474", 0.4474, false],
    ["Sleep hours", "Lifestyle & sleep", "Chi-square", "0.7074", 0.7074, false],
    ["Height group", "Physical health", "Chi-square", "0.7848", 0.7848, false]
  ]
};

export default DATA;
