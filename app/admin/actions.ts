"use server";

import { revalidatePath } from "next/cache";
import { getDashboardData } from "@/lib/sheets";
import {
  addConfigValue,
  addPipelineCandidate,
  resolveCandidate,
  type ConfigListName,
} from "@/lib/sheetsWrite";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function revalidateDashboard() {
  for (const path of [
    "/executive-summary",
    "/financial-insights",
    "/bu-role-demographics",
    "/efficiency-velocity",
    "/admin",
  ]) {
    revalidatePath(path);
  }
}

function requiredField(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`"${key}" is required.`);
  return value;
}

export async function addPipelineCandidateAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const candidateName = requiredField(formData, "candidateName");
    const role = requiredField(formData, "role");
    const bu = requiredField(formData, "bu");
    const currentStage = requiredField(formData, "currentStage");
    const requisitionStartDate = requiredField(formData, "requisitionStartDate");
    const officeType = String(formData.get("officeType") ?? "").trim();
    const hiringSource = String(formData.get("hiringSource") ?? "").trim();

    await addPipelineCandidate({
      candidateName,
      role,
      bu,
      officeType,
      hiringSource,
      requisitionStartDate: new Date(requisitionStartDate),
      currentStage,
    });

    revalidateDashboard();
    return { ok: true, message: `Added "${candidateName}" to the pipeline.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function resolveCandidateAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const pipelineId = requiredField(formData, "pipelineId");
    const offerStatus = requiredField(formData, "offerStatus") as "Accepted" | "Declined" | "Withdrawn";
    const resumptionDateRaw = String(formData.get("resumptionDate") ?? "").trim();
    const offerExtendedDateRaw = String(formData.get("offerExtendedDate") ?? "").trim();

    if (offerStatus === "Accepted" && !resumptionDateRaw) {
      return { ok: false, message: "Resumption date is required when marking a candidate Accepted." };
    }

    const { pipeline } = await getDashboardData();
    const candidate = pipeline.find((p) => p.id === pipelineId);
    if (!candidate) {
      return { ok: false, message: "That candidate is no longer in the pipeline (already resolved?)." };
    }

    const parseNum = (key: string) => {
      const raw = String(formData.get(key) ?? "").trim();
      return raw ? Number(raw) : undefined;
    };

    await resolveCandidate({
      pipelineId,
      candidateName: candidate.candidateName,
      role: candidate.role,
      bu: candidate.bu,
      officeType: candidate.officeType,
      hiringSource: candidate.hiringSource,
      requisitionStartDate: candidate.requisitionStartDate,
      offerStatus,
      offerExtendedDate: offerExtendedDateRaw ? new Date(offerExtendedDateRaw) : undefined,
      resumptionDate: resumptionDateRaw ? new Date(resumptionDateRaw) : undefined,
      medicalCost: parseNum("medicalCost"),
      airtime: parseNum("airtime"),
      feeding: parseNum("feeding"),
    });

    revalidateDashboard();
    return { ok: true, message: `Marked "${candidate.candidateName}" as ${offerStatus} and moved to Hires.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

const CONFIG_LIST_NAMES: ConfigListName[] = ["BUs", "Roles", "OfficeTypes", "HiringSources", "PipelineStages"];

export async function addConfigValueAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const listName = requiredField(formData, "listName") as ConfigListName;
    const value = requiredField(formData, "value");

    if (!CONFIG_LIST_NAMES.includes(listName)) {
      return { ok: false, message: "Unknown list." };
    }

    await addConfigValue(listName, value);
    revalidateDashboard();
    return { ok: true, message: `Added "${value}" to ${listName}.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
