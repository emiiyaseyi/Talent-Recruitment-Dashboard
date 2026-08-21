import type { DashboardData, HireRecord, OfferStatus } from "./types";

/**
 * DEV-ONLY sample data, used solely so the dashboard UI can be built and
 * reviewed before real Google Sheets credentials are configured (see
 * lib/sheets.ts). Never used in production — getDashboardData() throws
 * instead of falling back when NODE_ENV === "production". Deterministically
 * generated (seeded PRNG) so local dev sessions are reproducible.
 */

const BUS = ["Engineering", "Sales", "Operations", "Customer Success", "Finance"];
const ROLES = [
  "Software Engineer",
  "Sales Executive",
  "Operations Analyst",
  "Customer Success Rep",
  "Financial Analyst",
  "Product Manager",
  "QA Engineer",
];
const STATUSES: OfferStatus[] = ["Accepted", "Accepted", "Accepted", "Declined", "Pending"];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function daysAgo(from: Date, days: number): Date {
  return new Date(from.getTime() - days * 86400000);
}

function generateRecords(count: number): HireRecord[] {
  const rng = mulberry32(42);
  const now = new Date();
  const records: HireRecord[] = [];

  for (let i = 0; i < count; i++) {
    const requisitionStartDate = daysAgo(now, Math.floor(rng() * 210) + 5);
    const offerStatus = pick(rng, STATUSES);
    const isAccepted = offerStatus === "Accepted";
    const isPending = offerStatus === "Pending";

    const cycleDays = Math.floor(rng() * 45) + 5;
    const resumptionDate =
      isAccepted && !isPending ? daysAgo(requisitionStartDate, -cycleDays) : null;

    const medicalCost = isAccepted ? Math.round((rng() * 8000 + 4000) / 100) * 100 : 0;
    const airtimeCost = isAccepted ? Math.round((rng() * 2000 + 500) / 100) * 100 : 0;
    const feedingCost = isAccepted ? Math.round((rng() * 5000 + 1000) / 100) * 100 : 0;

    records.push({
      id: `sample-${i}`,
      candidateName: `Sample Candidate ${i + 1}`,
      role: pick(rng, ROLES),
      bu: pick(rng, BUS),
      requisitionStartDate,
      offerStatus,
      offerExtendedDate: daysAgo(requisitionStartDate, -Math.floor(rng() * 10 + 2)),
      resumptionDate,
      manualTimeToHireWeeks: isAccepted ? Math.round((cycleDays / 7) * 10) / 10 : null,
      medicalCost,
      airtimeCost,
      feedingCost,
      manualTotalCost: isAccepted ? medicalCost + airtimeCost + feedingCost : null,
    });
  }

  return records.sort(
    (a, b) => a.requisitionStartDate.getTime() - b.requisitionStartDate.getTime()
  );
}

export function getSampleDashboardData(): DashboardData {
  return {
    records: generateRecords(60),
    config: {
      bus: BUS,
      roles: ROLES,
      offerStatuses: ["Accepted", "Declined", "Pending", "Withdrawn"],
    },
  };
}
