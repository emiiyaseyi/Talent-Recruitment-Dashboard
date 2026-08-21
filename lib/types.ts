export type OfferStatus = "Accepted" | "Declined" | "Pending" | "Withdrawn";

/** One row from the `Hires` sheet tab, parsed into typed form. */
export interface HireRecord {
  id: string;
  candidateName: string;
  role: string;
  bu: string;
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

/** Lookup lists from the `Config` tab — drives every dropdown/filter, never hardcoded. */
export interface ConfigLists {
  bus: string[];
  roles: string[];
  offerStatuses: OfferStatus[];
}

export interface DashboardData {
  records: HireRecord[];
  config: ConfigLists;
}

export interface Filters {
  from: Date | null;
  to: Date | null;
  bu: string | null;
  role: string | null;
}
