const REPO = "https://github.com/arshadziban/Reels-Mental-Health-Well-Being-Report";

/** The one place the repository is linked from. */
export default function Footer() {
  return (
    <footer id="methodology" className="flex flex-col gap-5 rounded-2xl bg-ink p-6 text-on-ink sm:p-7">
      <div>
        <span className="text-[11px] font-semibold tracking-widest text-mint uppercase">Methodology</span>
        <p className="mt-2.5 max-w-[760px] text-sm leading-relaxed opacity-90">
          Bivariate chi-square / Fisher–Freeman–Halton tests, then multinomial logistic regression (reference: less than 1 hour). Results are
          associations, not causation. Only aggregated results are shown; no individual responses.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-[13px]">
        <a href={REPO} target="_blank" rel="noopener noreferrer" className="font-semibold break-all text-lav hover:underline">
          github.com/arshadziban/Reels-Mental-Health-Well-Being-Report
        </a>
        <span className="opacity-75">Author · arshadziban</span>
      </div>
    </footer>
  );
}
