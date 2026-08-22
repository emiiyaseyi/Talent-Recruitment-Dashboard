"use client";

import { useActionState } from "react";
import { addPipelineCandidateAction, type ActionResult } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

const initialState: ActionResult | null = null;

export function AddPipelineCandidateForm({
  roles,
  bus,
  officeTypes,
  hiringSources,
  pipelineStages,
}: {
  roles: string[];
  bus: string[];
  officeTypes: string[];
  hiringSources: string[];
  pipelineStages: string[];
}) {
  const [state, formAction] = useActionState(addPipelineCandidateAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Candidate Name">
          <input name="candidateName" required className={inputClass} />
        </Field>
        <Field label="Requisition Start Date">
          <input name="requisitionStartDate" type="date" required className={inputClass} />
        </Field>
        <Field label="Role">
          <input name="role" required list="admin-roles" className={inputClass} />
          <datalist id="admin-roles">
            {roles.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>
        <Field label="BU">
          <input name="bu" required list="admin-bus" className={inputClass} />
          <datalist id="admin-bus">
            {bus.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </Field>
        <Field label="Office Type">
          <select name="officeType" className={inputClass} defaultValue="">
            <option value="">—</option>
            {officeTypes.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Hiring Source">
          <select name="hiringSource" className={inputClass} defaultValue="">
            <option value="">—</option>
            {hiringSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Current Stage">
          <select name="currentStage" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a stage
            </option>
            {pipelineStages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>Add to Pipeline</SubmitButton>
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
