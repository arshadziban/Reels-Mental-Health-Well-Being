import { useCallback, useEffect, useState } from "react";
import { NAV } from "./lib";
import DATA from "./data";
import { useTheme } from "./hooks";
import { FocusProvider } from "./focus";
import { TooltipProvider } from "./components/Tooltip";
import Sidebar from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import TopRow, { OverviewRow } from "./components/TopRow";
import Predictors from "./components/ModelRow";
import SectionsCard from "./components/SectionsCard";
import AssociationsTable from "./components/AssociationsTable";
import Performance from "./components/Performance";
import Study from "./components/Study";
import Report from "./components/Report";
import { OverviewStats, OverviewFindings, PredictorStats, PredictorNotes, AssociationStats, NotSignificant, ModelStats, ModelNotes, ReportStats } from "./components/Insights";
import CommandPalette from "./components/CommandPalette";
import Methodology from "./components/Methodology";
import { Card, CardHead, GroupHeading, Select } from "./components/ui";
import { EvidenceScatter } from "./components/Charts";

const SECTION_OPTIONS = [{ value: "", label: "All sections", hint: `${DATA.significant}/${DATA.variablesTested}` }, ...DATA.sections.map((s) => ({ value: s.name, label: s.name, hint: `${s.sig}/${s.total}` }))];
const VIEWS = NAV.map((n) => n.id);
const fromHash = () => {
  const h = window.location.hash.slice(1);
  return VIEWS.includes(h) ? h : "overview";
};

/** Current view, kept in the URL hash so links and the back button work. */
function useView() {
  const [view, setView] = useState(fromHash);
  useEffect(() => {
    const on = () => setView(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = useCallback((id) => {
    window.location.hash = id;
    setView(id);
  }, []);
  return [view, go];
}

export default function App() {
  const [q, setQ] = useState("");
  const [palette, setPalette] = useState(false);
  const [section, setSection] = useState("");
  const [view, go] = useView();
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  // every view opens at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const pick = (name) => {
    setQ(name);
    go("associations");
    setTimeout(() => document.getElementById("assoc-table")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <TooltipProvider>
      <FocusProvider>
        <div className="flex min-h-screen">
          <Sidebar view={view} onNavigate={go} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar view={view} theme={theme} onToggleTheme={toggleTheme} onSearch={() => setPalette(true)} onNavigate={go} />
            <CommandPalette open={palette} onClose={() => setPalette(false)} onVariable={pick} onGo={go} />
            <main key={view} className="flex w-full flex-1 animate-fade flex-col gap-6 p-4 sm:p-5 lg:px-6 lg:py-6">
              {view === "overview" && (
                <>
                  <OverviewRow />
                  <OverviewStats />
                  <GroupHeading title="Who watches how much" hint="How the 503 respondents split by daily Reels hours" />
                  <TopRow />
                  <OverviewFindings />
                </>
              )}
              {view === "predictors" && (
                <>
                  <PredictorStats />
                  <Predictors />
                  <PredictorNotes />
                </>
              )}
              {view === "associations" && (
                <>
                  <AssociationStats />
                  <SectionsCard />
                  <Card className="flex flex-col gap-4">
                    <CardHead title="Evidence landscape" sub="Every variable at a glance · click a point to find it in the table, pick a section to isolate it">
                      <Select label="Highlight a section" value={section} onChange={setSection} options={SECTION_OPTIONS} className="w-48" />
                    </CardHead>
                    <EvidenceScatter section={section} picked={q} onPick={pick} />
                    <div className="flex flex-wrap gap-4 text-xs text-fg2">
                      <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-lavd" />Significant (28)</span>
                      <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-pink" />Not significant (12)</span>
                    </div>
                  </Card>
                  <AssociationsTable q={q} setQ={setQ} section={section} setSection={setSection} />
                  <NotSignificant />
                </>
              )}
              {view === "model" && (
                <>
                  <ModelStats />
                  <Performance />
                  <ModelNotes />
                </>
              )}
              {view === "report" && (
                <>
                  <ReportStats />
                  <Report />
                </>
              )}
              {view === "study" && <Study />}
              {view === "methodology" && <Methodology />}
            </main>
          </div>
        </div>
      </FocusProvider>
    </TooltipProvider>
  );
}
