"use client";

import { useActionState } from "react";
import { addConfigValueAction, type ActionResult } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

const initialState: ActionResult | null = null;

const LIST_OPTIONS = ["BUs", "Roles", "OfficeTypes", "HiringSources", "PipelineStages"] as const;

export function AddConfigValueForm() {
  const [state, formAction] = useActionState(addConfigValueAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="List">
          <select name="listName" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a list
            </option>
            {LIST_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="New Value">
          <input name="value" required className={inputClass} placeholder="e.g. Marketing" />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>Add Value</SubmitButton>
        {state && (
          <span className={`text-sm ${state.ok ? "text-[var(--status-good)]" : "text-[var(--status-critical)]"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--page)] px-3 py-1.5 text-sm text-[var(--text-primary)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
