"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";

type Preset = "all" | "ytd" | "year" | "month-range";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function lastDayOfMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

/** A single "Period" trigger button + popover with quick presets, replacing
 * raw From/To date inputs on the executive summary — writes the same
 * `from`/`to` search params the rest of the filter system already reads
 * (lib/filters.ts), so nothing downstream needed to change. */
export function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>("all");
  const [monthFrom, setMonthFrom] = useState("");
  const [monthTo, setMonthTo] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function apply() {
    const now = new Date();
    const year = now.getFullYear();
    const params = new URLSearchParams(searchParams.toString());

    if (preset === "all") {
      params.delete("from");
      params.delete("to");
    } else if (preset === "ytd") {
      params.set("from", isoDate(year, 1, 1));
      params.set("to", isoDate(year, now.getMonth() + 1, now.getDate()));
    } else if (preset === "year") {
      params.set("from", isoDate(year, 1, 1));
      params.set("to", isoDate(year, 12, 31));
    } else if (preset === "month-range" && monthFrom && monthTo) {
      const [fy, fm] = monthFrom.split("-").map(Number);
      const [ty, tm] = monthTo.split("-").map(Number);
      params.set("from", isoDate(fy, fm, 1));
      params.set("to", isoDate(ty, tm, lastDayOfMonth(ty, tm)));
    }

    router.push(`?${params.toString()}`);
    setOpen(false);
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`?${params.toString()}`);
    setPreset("all");
    setOpen(false);
  }

  const label = !from && !to ? "All Time" : `${from ?? "…"} → ${to ?? "…"}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] shadow-sm"
      >
        <Calendar size={14} className="text-[var(--text-muted)]" />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Period
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PresetButton active={preset === "all"} onClick={() => setPreset("all")}>
              All Time
            </PresetButton>
            <PresetButton active={preset === "ytd"} onClick={() => setPreset("ytd")}>
              Year to Date
            </PresetButton>
            <PresetButton active={preset === "year"} onClick={() => setPreset("year")}>
              Full Year
            </PresetButton>
            <PresetButton active={preset === "month-range"} onClick={() => setPreset("month-range")}>
              Month Range
            </PresetButton>
          </div>

          {preset === "month-range" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="month"
                value={monthFrom}
                onChange={(e) => setMonthFrom(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--page)] px-2 py-1 text-sm text-[var(--text-primary)]"
              />
              <input
                type="month"
                value={monthTo}
                onChange={(e) => setMonthTo(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--page)] px-2 py-1 text-sm text-[var(--text-primary)]"
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={apply}
              className="flex-1 rounded-md bg-[var(--series-1)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PresetButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--series-1)] text-white"
          : "bg-[var(--page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}
