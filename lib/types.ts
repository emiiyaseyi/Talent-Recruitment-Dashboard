export type OfferStatus = "Accepted" | "Declined" | "Pending" | "Withdrawn";

/** "Front Office" / "Back Office" — the org's own category, replacing the
 * generic technical/non-technical split. Free string (not a union) because
 * it's validated against Config!OfficeTypes, same as BU/Role. */
export type OfficeType = string;

/** One row from the `Hires` sheet tab, parsed into typed form. */
export interface HireRecord {
  id: string;
  candidateName: string;
  role: string;
  bu: string;
  officeType: OfficeType;
  hiringSource: string;
  requisitionStartDate: Date;
  offerStatus: OfferStatus;
  offerExtendedDate: Date | null;
  resumptionDate: Date | null;
  /** Manual entry, kept only for cross-reference against the computed value. */
  manualTimeToHireWeeks: number | null;
  medicalCost: number;
  airtimeCost: number;
  feedingCost: number;
  /** Manual entry, kept only for cross-reference against the computed value. */
  manualTotalCost: number | null;
}

/** One row from the `Pipeline` sheet tab — candidates still in progress, not
 * yet resolved to Accepted/Declined/Withdrawn on the Hires sheet. Kept as a
 * separate tab (per your call) rather than folded into Hires, since an
 * in-progress candidate doesn't have resumption/cost data yet and the two
 * sheets serve different questions (what's open vs. what's done). */
export interface PipelineRecord {
  id: string;
  candidateName: string;
  role: string;
  bu: string;
  officeType: OfficeType;
  hiringSource: string;
  requisitionStartDate: Date;
  /** Free string, validated against Config!PipelineStages — stages are
   * admin-editable, not a fixed set baked into the code. */
  currentStage: string;
}

/** Lookup lists from the `Config` tab — drives every dropdown/filter, never hardcoded. */
export interface ConfigLists {
  bus: string[];
  roles: string[];
  offerStatuses: OfferStatus[];
  officeTypes: string[];
  hiringSources: string[];
  pipelineStages: string[];
}

export interface DashboardData {
  records: HireRecord[];
  pipeline: PipelineRecord[];
  config: ConfigLists;
}

export interface Filters {
  from: Date | null;
  to: Date | null;
  bu: string | null;
  role: string | null;
  officeType: string | null;
}
