# Reels & Mental Health: Survey Insights (dashboard)

React 19 + Tailwind CSS 4 (Vite). It shows aggregated results only (no individual responses) from the notebooks
in this repository, and follows the Figma bento design in the project palette.

## Run

```bash
cd dashboard
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## Structure

| Path | Purpose |
|---|---|
| `src/data.js` | Every number shown on the page |
| `src/index.css` | Tailwind import, light / dark colour tokens, animations |
| `src/lib.js` | Navigation list, fill classes, CSV export |
| `src/hooks.js` | `useTheme` (light / dark), `useActiveSection` (scroll highlight) |
| `src/components/` | `Sidebar`, `Topbar` (+ `SectionTabs`), `TopRow`, `ModelRow` (predictors + the model-fit gauge card), `SectionsCard`, `AssociationsTable`, `Performance`, `Footer`, `Tooltip`, `ui`, `Icon` |

## Interface notes

- One control per job: a single sidebar on desktop (replaced by a tab bar below 1024 px, never both), one Export CSV
  button, one theme switch, and the repository link only in the footer.
- Light and dark mode follow the system setting and are remembered in `localStorage`.
- The associations table has search, a section filter, sortable columns and pagination.
- Hover tooltips on the watch-time rows, predictor bars, section tiles and heatmap cells.

## Updating the numbers

Edit `src/data.js`. The values come from `06_sep_sig_with_daily_watch_time.ipynb` (tests and p-values) and
`07_mlr_analysis.ipynb` (model fit, per-predictor likelihood-ratio χ², classification table). Accuracy (67.2%) is
measured on the training data, so it is likely optimistic.

Palette: lavender `#9B87F5`, pink `#EE9BC0`, mint `#BFF0DA`, ink `#18181F`. Font: Inter (Google Fonts).
