# Analysis Mindmap

**Reels & Mental Health: survey analysis.** How daily Reels watch time relates to mental health and well-being, based on 503 cleaned survey responses.

```
Google Sheet (raw survey)
 └─ 1  Clean & recode            → dataset_v1.csv
     └─ 2  Ordered categories      → dataset_v2.pkl
         └─ 3  Outlier checks         → dataset_v3.pkl      (503 × 41)
             ├─ 4  Chi-square            → cross_tabulation PDF
             ├─ 5  Chi-square / Fisher   → fisher_test PDF
             └─ 6  Keep p < 0.05         → dataset_v4_sig.pkl (503 × 29)
                 └─ 7  Multinomial logistic regression → mlr_analysis PDF
```

---

## 1. Study design

| | |
|---|---|
| **Sample** | 503 respondents after cleaning |
| **Outcome** | `D2_daily_watch_time`, ordinal, 5 levels |
| **Predictors** | 40 categorical survey variables |
| **Method** | Bivariate screening → multinomial logistic regression |

**Outcome distribution**

| Less than 1 hour | 1 hour | 2 hours | 3 hours | More than that |
|:---:|:---:|:---:|:---:|:---:|
| 108 | 108 | 134 | 58 | 95 |

**Questionnaire sections.** Columns are named `<code>_<label>`, e.g. `G8_addictive_watching`.

| Code | Section | Code | Section |
|:---:|---|:---:|---|
| A | Demographics | E | Lifestyle & sleep |
| B | Family | F | Cognitive effects |
| C | Physical health | G | Mental health |
| D | Reels usage | H | Perceived effects of Reels |

---

## 2. Pipeline

| Step | Notebook | Output | Purpose |
|:---:|---|---|---|
| 1 | `1_finetune_dataset.ipynb` | `dataset/dataset_v1.csv` | Load the Google Sheet, rename columns, strip Bangla text, clean values (missing/unclear → mode), merge Hindu + Christian, bin numeric answers into `*_group` columns |
| 2 | `2_fix_group.ipynb` | `dataset/dataset_v2.pkl` | Order the `*_group` columns, replace their numeric sources, cast all columns to `category` |
| 3 | `3_check_outlier.ipynb` | `dataset/dataset_v3.pkl` | Rare-category, allowed-value, missing and duplicate checks plus consistency rules R1–R7; merge B3 `Very Bad` → `Bad`; drop respondents breaking 3+ rules and duplicates |
| 4 | `4_test_cross_tab.ipynb` | `cross_tabulation/…pdf` | Cross-tab and chi-square test of every variable against the outcome |
| 5 | `05_fisher_test.ipynb` | `fisher_test/…pdf` | Fisher–Freeman–Halton (Monte Carlo, 100,000 resamples, seed 42) when any expected count ≤ 5, otherwise chi-square |
| 6 | `06_sep_sig_with_daily_watch_time.ipynb` | `dataset/dataset_v4_sig.pkl` | Repeat the step 5 tests (identical p-values); keep the outcome plus variables with p < 0.05 |
| 7 | `07_mlr_analysis.ipynb` | `mlr_analysis/…pdf` | Multinomial logistic regression (`statsmodels` `MNLogit`): model fit, LR test per predictor, B / SE / Wald / OR / 95% CI, classification table, thesis-style PDF table |

`check_old_.ipynb` is an old scratch notebook and is not part of the pipeline.

---

## 3. Results

### Bivariate screening (step 6)

| | Variables |
|---|---|
| **Significant (28)** | A4, B2, B3, B4, C2, C3, C4, D3, E2, E3, F1–F4, G1–G6, G8, H1–H7 |
| **Not significant (12)** | A1 age, A2 gender, A3 religion, A5 residence, A6 occupation, B1 family type, C1 height, D1 years watching, D4 multitasking, E1 sleep hours, E4 substance use, G7 behavior type |

### Multinomial logistic regression (step 7)

**Reference categories:** the outcome is compared with *Less than 1 hour*; each predictor is compared with its most frequent answer.

| Measure | Value |
|---|---|
| Likelihood ratio χ² | 776.53 (df = 344, p < 0.0001) |
| Nagelkerke R² | 0.822 |
| McFadden R² | 0.490 |
| Classification accuracy | 67.2% (in-sample) |
| Unstable estimates (SE > 10) | 11 of 348, shown as `NE†` |

**Significant in the per-predictor LR tests (10):** A4 marital status, B4 in-person feeling, C2 weight, **C3 sitting duration** (strongest, χ² = 206), D3 peak watch time, G1 mood swings, G2 FOMO anxiety, G8 addictive watching, H1 mental state change, H7 curiosity-driven rewatch.

---

## 4. Known issues

| Issue | Effect | Fix |
|---|---|---|
| **Model too large:** 86 parameters per equation vs. 58 cases in the smallest outcome group (≈ 0.7 events per parameter; minimum 10) | Inflated R², accuracy and odds ratios | Reduced model with the 10 LR-significant predictors |
| **Sparse categories (n < 20):** A4 Divorced 5, B3 Bad 5, B4 Very Uncomfortable 7, D3 Morning 11, D3 Before Study 15, F4 Very positive 13 | Separation, `NE†`, very wide CIs; the `SE > 10` flag misses some (B3 Bad: CI 0.006–388) | Merge into neighbouring categories |
| **Likert variables stored unordered:** B3, B4, C3, C4, E2, E3, F1–F4, G1–G4, G6, G8, H3, H4, H6, H7 | Rows listed alphabetically ("Always, Never, Often…"); results unaffected | Add their orders to `group_order` in notebook 2 |
| **"Not Sure" answers:** G5, H1, H2, H5 | Not a point on the scale | Treat as nominal; list "Not Sure" last |
| **Outcome wording:** "More than that" means > 3 hours; "1 hour" and "2 hours" are points, not ranges | Ambiguous categories | Relabel in reports; note as a questionnaire limitation |

**Write-up notes:** predictors were selected by bivariate p < 0.05; multinomial regression ignores the outcome's order (ordinal logistic regression is the alternative); F1–F3 are the most correlated predictors (Cramér's V up to 0.55).

---

## 5. Running the project

**Setup**

```bash
python3.13 -m venv venv        # only if venv/ doesn't exist yet
venv/bin/pip install -r requirements.txt
```

- Python 3.13 virtualenv in `venv/` (macOS, Homebrew Python). Use the `venv (3.13.15)` kernel; some notebooks still show an old `venv (3.11.0)` name in their metadata.
- `.env` must define `GOOGLE_SHEET_URL` (the raw survey). Never print or commit it.

**Run everything:** open and run `0_run_all.ipynb`. It executes steps 1–7 in order, saves each notebook's outputs, and stops at the first error. Step 1 re-downloads the sheet, so every dataset and output is rebuilt.

**Run one step** (from the repo root, which all paths are relative to):

```bash
venv/bin/python -c "import nbformat; from nbclient import NotebookClient as C; p='07_mlr_analysis.ipynb'; nb=nbformat.read(p, 4); C(nb, kernel_name='python3').execute(); nbformat.write(nb, p)"
```

**Runtimes:** steps 1–6 take a few seconds each; step 7 takes about 45 s because it refits the model once per predictor.

**Console encoding:** if Bangla or en-dash text prints as `�` (e.g. on a Windows console), set `PYTHONIOENCODING=utf-8`. It is an encoding artifact, not bad data.

---

## 6. Conventions

- **Category orders** live in `group_order` (notebook 2), `allowed` (notebook 3) and `ORDER` (outcome, notebooks 4–7). Keep them in sync after any merge.
- **P-values** below 0.0001 from the Fisher Monte Carlo test bottom out near 1e-05; report them as `< 0.0001`.
- **New steps** take the next numeric prefix, read the latest `dataset/dataset_v*.pkl`, and get a `run_notebook(...)` cell in `0_run_all.ipynb`.
- **Git:** the whole `dataset/` folder, PDFs and `.pkl` files are gitignored, so reports and datasets stay local. Notebooks are committed with their outputs.
