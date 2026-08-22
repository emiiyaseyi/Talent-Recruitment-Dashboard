"use client";

import { useActionState, useState } from "react";
import { resolveCandidateAction, type ActionResult } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import type { PipelineRecord } from "@/lib/types";

const initialState: ActionResult | null = null;

export function ResolveCandidateForm({ pipeline }: { pipeline: PipelineRecord[] }) {
  const [state, formAction] = useActionState(resolveCandidateAction, initialState);
  const [offerStatus, setOfferStatus] = useState("Accepted");

  if (pipeline.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No one is currently in the pipeline.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Candidate">
          <select name="pipelineId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a candidate
            </option>
            {pipeline.map((p) => (
              <option key={p.id} value={p.id}>
                {p.candidateName} — {p.role} ({p.currentStage})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Outcome">
          <select
            name="offerStatus"
            required
            className={inputClass}
            value={offerStatus}
            onChange={(e) => setOfferStatus(e.target.value)}
          >
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </Field>
        <Field label="Offer Extended Date (optional)">
          <input name="offerExtendedDate" type="date" className={inputClass} />
        </Field>
        {offerStatus === "Accepted" && (
          <>
            <Field label="Resumption Date">
              <input name="resumptionDate" type="date" required className={inputClass} />
            </Field>
            <Field label="Medical Cost (₦)">
              <input name="medicalCost" type="number" min="0" className={inputClass} />
            </Field>
            <Field label="Airtime (₦)">
              <input name="airtime" type="number" min="0" className={inputClass} />
            </Field>
            <Field label="Feeding (₦)">
              <input name="feeding" type="number" min="0" className={inputClass} />
            </Field>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>Move to Hires</SubmitButton>
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
