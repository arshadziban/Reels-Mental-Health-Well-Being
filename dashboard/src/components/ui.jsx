import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "../lib";
import { useCountUp } from "../hooks";

/** A number that counts up on load. */
export function CountUp({ value, decimals = 0, suffix = "", delay = 0 }) {
  const v = useCountUp(value, { delay });
  return (
    <>
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
}

/** Label above a block of cards inside a view. */
export function GroupHeading({ title, hint }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pt-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {hint && <p className="text-xs text-fg2">{hint}</p>}
    </div>
  );
}

/** Two- or three-option switch. */
export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-10 max-w-full items-center overflow-x-auto rounded-lg bg-main p-1 no-scrollbar">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "h-8 shrink-0 rounded-md px-3.5 text-[13px] font-medium transition-colors",
            value === o.value ? "bg-card text-fg shadow-sm ring-1 ring-line" : "text-fg2 hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** `tone`: plain cards get the hairline ring; colored cards (ink, lavender) are solid and take none. */
export function Card({ as: Tag = "article", className = "", pad = true, tone = "plain", children, ...rest }) {
  return (
    <Tag
      className={cx(
        "rounded-xl",
        tone === "plain" && "border border-line bg-card shadow-[0_1px_2px_rgb(11_18_32/.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgb(11_18_32/.14)]",
        pad && "p-5 sm:p-6",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHead({ title, sub, children }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {sub && <p className="mt-1 text-[13px] leading-snug text-fg2">{sub}</p>}
      </div>
      {children}
    </header>
  );
}

const TONES = {
  mint: "bg-mint-soft text-emerald-800 dark:text-mint",
  pink: "bg-pink-soft text-rose-800 dark:text-pink",
  lav: "bg-lav-soft text-lavd dark:text-lav",
  ink: "bg-ink text-on-ink",
  soft: "bg-main font-medium text-fg2",
};

export function Tag({ tone = "mint", className = "", children }) {
  return (
    <span className={cx("inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>
      {children}
    </span>
  );
}

/*
 * Control system — every button, input and chip follows these rules:
 *   shape   fully rounded (cards are 28px, nested tiles 20px, controls are pills)
 *   height  44px in the top bar and navigation, 40px inside cards
 *   edge    top-bar controls carry the same 1px ring as cards; in-card controls sit on the page tone
 */
const BASE =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition active:scale-[.96] disabled:pointer-events-none disabled:opacity-45";

/** `variant`: toolbar (44px, on the page), soft (40px, inside a card), ink (40px, primary action). */
export const pill = (variant = "toolbar") =>
  cx(
    BASE,
    variant === "toolbar" && "h-11 bg-card px-5 text-sm ring-1 ring-line/60 hover:bg-lav-soft",
    variant === "soft" && "h-10 bg-main px-4 text-[13px] hover:bg-lav-soft",
    variant === "ink" && "h-10 bg-lavd px-4 text-[13px] text-white hover:bg-ink",
    variant === "outline" && "h-10 px-4 text-[13px] ring-1 ring-line hover:bg-lav-soft",
  );

/**
 * Custom dropdown (replaces the native select). The menu renders in a portal so cards with overflow-hidden never clip it.
 * `options`: [{ value, label, hint? }]. Arrow keys, Home/End, Enter, Escape and type-to-close-on-blur are supported.
 */
export function Select({ value, onChange, options, label, className = "" }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btn = useRef(null);
  const menu = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];

  const show = () => {
    const r = btn.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    setPos({ left: Math.max(8, Math.min(r.left, window.innerWidth - 248)), width: Math.max(r.width, 220), ...(below < 320 && r.top > below ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
    setI(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (o) => {
    onChange(o.value);
    setOpen(false);
    btn.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => !menu.current?.contains(e.target) && !btn.current?.contains(e.target) && setOpen(false);
    const close = () => setOpen(false);
    // page scroll closes the menu; scrolling the menu's own list must not
    const onScroll = (e) => !menu.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", away);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    menu.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);
  useEffect(() => {
    if (open) menu.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [i, open]);

  const onKey = (e) => {
    if (e.key === "Escape") (e.preventDefault(), setOpen(false), btn.current?.focus());
    else if (e.key === "ArrowDown") (e.preventDefault(), setI((v) => Math.min(v + 1, options.length - 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setI((v) => Math.max(v - 1, 0)));
    else if (e.key === "Home") (e.preventDefault(), setI(0));
    else if (e.key === "End") (e.preventDefault(), setI(options.length - 1));
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), pick(options[i]));
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => (e.key === "ArrowDown" || e.key === "ArrowUp") && !open && (e.preventDefault(), show())}
        className={cx(
          "inline-flex h-10 items-center justify-between gap-3 rounded-lg border bg-card px-3.5 text-[13px] font-medium transition hover:bg-main",
          open ? "border-lavd ring-2 ring-lavd/20" : "border-line",
          className,
        )}
      >
        <span className="truncate">{current?.label}</span>
        <svg viewBox="0 0 20 20" className={cx("size-4 shrink-0 text-fg2 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            onKeyDown={onKey}
            style={pos}
            className="fixed z-50 max-h-80 animate-fade overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-[0_16px_40px_-12px_rgb(11_18_32/.3)] outline-none"
          >
            {options.map((o, n) => {
              const on = o.value === value;
              return (
                <div
                  key={o.value}
                  role="option"
                  aria-selected={on}
                  data-active={n === i}
                  onPointerEnter={() => setI(n)}
                  onClick={() => pick(o)}
                  className={cx("flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]", n === i && "bg-main", on ? "font-semibold text-lavd dark:text-lav" : "font-medium")}
                >
                  <svg viewBox="0 0 20 20" className={cx("size-4 shrink-0", !on && "opacity-0")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                  </svg>
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {o.hint && <small className="text-xs font-normal text-fg2 tabular-nums">{o.hint}</small>}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
