import { useMemo, useState } from "react";
import DATA from "../data";
import { cx } from "../lib";
import Icon from "./Icon";
import { Card, Segmented, Select, pill } from "./ui";

const SECTION_OPTIONS = [{ value: "", label: "All sections", hint: `${DATA.significant}/${DATA.variablesTested}` }, ...DATA.sections.map((s) => ({ value: s.name, label: s.name, hint: `${s.sig}/${s.total}` }))];

// row = [variable, section, test, p text, p number, significant, original index]
const ROWS = DATA.associations.map((r, i) => [...r, i]);
const PAGE = 10;
const COLS = "md:grid-cols-[minmax(0,1fr)_190px_120px_170px_150px]";
/** Evidence strength on a 0–100 scale: -log10(p), capped at p = 0.0001. */
const strength = (p) => Math.min(100, Math.max(4, (-Math.log10(p) / 4) * 100));

const HEADERS = [
  { key: 0, label: "Variable", cls: "" },
  { key: 1, label: "Section", cls: "" },
  { key: 2, label: "Test", cls: "" },
  { key: 4, label: "p-value", cls: "" },
  { key: 5, label: "Significant", cls: "" },
];

function Badge({ ok }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-[#0f172a]",
        ok ? "bg-mint" : "bg-pink",
      )}
    >
      <i className="size-1.5 rounded-full bg-[#18181f]" />
      {ok ? "Significant" : "Not significant"}
    </span>
  );
}

export default function AssociationsTable({ q, setQ, section, setSection }) {
  const [sig, setSig] = useState("all");
  const [sort, setSort] = useState({ key: 4, dir: 1 });
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = ROWS.filter(
      (r) => (!section || r[1] === section) && (sig === "all" || (sig === "yes") === r[5]) && (!needle || `${r[0]} ${r[1]} ${r[2]}`.toLowerCase().includes(needle)),
    );
    out.sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      const c = typeof x === "string" ? x.localeCompare(y) : (x > y) - (x < y);
      return sort.dir * c || a[6] - b[6];
    });
    return out;
  }, [q, section, sig, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages - 1);
  const start = current * PAGE;
  const slice = rows.slice(start, start + PAGE);

  const onSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === 5 ? -1 : 1 }));
    setPage(0);
  };

  return (
    <Card as="section" id="assoc-table" pad={false} className="scroll-mt-5 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h3 className="text-[17px] font-semibold">All associations</h3>
          <p className="mt-0.5 text-xs text-fg2">Sortable and filterable · the bar beside each p-value shows the strength of evidence</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <Segmented
            label="Significance filter"
            value={sig}
            onChange={(v) => {
              setSig(v);
              setPage(0);
            }}
            options={[
              { value: "all", label: "All" },
              { value: "yes", label: "Significant" },
              { value: "no", label: "Not" },
            ]}
          />
          <Select
            label="Filter by section"
            value={section}
            onChange={(v) => {
              setSection(v);
              setPage(0);
            }}
            options={SECTION_OPTIONS}
            className="w-full sm:w-52"
          />
        </div>
      </header>

      <div role="table" aria-label="All associations">
        <div role="row" className={cx("hidden min-h-11 items-center gap-4 bg-main px-6 md:grid", COLS)}>
          {HEADERS.map((h) => (
            <button
              key={h.key}
              type="button"
              role="columnheader"
              onClick={() => onSort(h.key)}
              aria-sort={sort.key === h.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
              className={cx(
                "inline-flex items-center gap-1.5 text-left text-xs font-semibold tracking-[.06em] uppercase",
                sort.key === h.key ? "text-fg" : "text-fg2",
              )}
            >
              {h.label}
              <Icon name="sort" className="size-3" />
            </button>
          ))}
        </div>

        {slice.length === 0 && <div className="border-t border-line px-6 py-8 text-center text-fg2">No variables match your filters.</div>}
        {slice.map((r) => (
          <div
            key={r[0]}
            role="row"
            className={cx(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 border-t border-line px-4 py-3.5 transition-colors hover:bg-lav-soft/60 md:min-h-14 md:px-6 md:py-0",
              COLS,
            )}
          >
            <div className="font-semibold">{r[0]}</div>
            <div className="hidden font-medium text-fg2 md:block">{r[1]}</div>
            <div className="hidden md:block">{r[2]}</div>
            <div className="hidden items-center gap-2.5 md:flex" title={`Evidence strength (−log10 p): ${Math.round(strength(r[4]))}%`}>
              <span className="w-[66px] font-semibold tabular-nums">{r[3]}</span>
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-dot" aria-hidden="true">
                <span className={cx("block h-full rounded-full", r[5] ? "bg-lavd" : "bg-fg2/40")} style={{ width: `${strength(r[4])}%` }} />
              </span>
            </div>
            <div className="col-start-2 row-start-1 md:col-auto md:row-auto">
              <Badge ok={r[5]} />
            </div>
            <div className="col-span-2 flex flex-wrap gap-x-2.5 text-xs text-fg2 md:hidden">
              <span>{r[1]}</span>
              <span>{r[2]}</span>
              <span>p {r[3].startsWith("<") ? r[3] : `= ${r[3]}`}</span>
            </div>
          </div>
        ))}
      </div>

      <footer className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center border-t border-line px-5 py-4 text-xs text-fg2 sm:px-6">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {(q || section || sig !== "all") && (
            <button type="button" className="font-semibold text-lavd underline-offset-2 hover:underline" onClick={() => { setQ(""); setSection(""); setSig("all"); setPage(0); }}>
              Reset filters
            </button>
          )}
          {rows.length ? `Showing ${start + 1}–${start + slice.length} of ${rows.length} variables` : "0 variables"}
        </span>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={pill("outline")} disabled={current === 0} onClick={() => setPage(current - 1)}>
            Previous
          </button>
          <button type="button" className={pill("ink")} disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
            Next
          </button>
        </div>
      </footer>
    </Card>
  );
}
