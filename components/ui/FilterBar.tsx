"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FilterBarProps {
  bus: string[];
  roles: string[];
  officeTypes?: string[];
}

export function FilterBar({ bus, roles, officeTypes = [] }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <FilterSelect
        label="Business Unit"
        value={searchParams.get("bu") ?? ""}
        options={bus}
        onChange={(v) => setParam("bu", v)}
      />
      <FilterSelect
        label="Role"
        value={searchParams.get("role") ?? ""}
        options={roles}
        onChange={(v) => setParam("role", v)}
      />
      {officeTypes.length > 0 && (
        <FilterSelect
          label="Office"
          value={searchParams.get("officeType") ?? ""}
          options={officeTypes}
          onChange={(v) => setParam("officeType", v)}
        />
      )}
      <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        From
        <input
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => setParam("from", e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--page)] px-2 py-1 text-sm text-[var(--text-primary)]"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        To
        <input
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => setParam("to", e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--page)] px-2 py-1 text-sm text-[var(--text-primary)]"
        />
      </label>
      {(searchParams.get("bu") ||
        searchParams.get("role") ||
        searchParams.get("officeType") ||
        searchParams.get("from") ||
        searchParams.get("to")) && (
        <button
          onClick={() => router.push("?")}
          className="text-sm text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[var(--border)] bg-[var(--page)] px-2 py-1 text-sm text-[var(--text-primary)]"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
