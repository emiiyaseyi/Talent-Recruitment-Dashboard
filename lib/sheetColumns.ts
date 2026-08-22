// Shared column-name mapping for both reading and writing the sheet — one
// place defines what each field is called, so read and write never drift
// apart on header spelling.

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Maps normalized header text -> column index so row order in the sheet can
 * change without breaking the parser. */
export function headerIndex(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((h, i) => map.set(normalizeHeader(String(h ?? "")), i));
  return map;
}

export type SheetField =
  | "id"
  | "candidateName"
  | "role"
  | "bu"
  | "requisitionStartDate"
  | "offerStatus"
  | "offerExtendedDate"
  | "resumptionDate"
  | "manualTimeToHireWeeks"
  | "medicalCost"
  | "airtime"
  | "feeding"
  | "manualTotalCost"
  | "officeType"
  | "hiringSource"
  | "currentStage";

/** Each field accepts several header spellings — the "clean" name from
 * docs/01-data-schema.md and the literal text real sheets tend to already
 * have (typos, casing, abbreviations included) — so sheet owners never have
 * to rename existing columns just to match this code. The FIRST alias is
 * the one used when writing a brand-new column header (e.g. appending a
 * value into a sheet that has that column blank isn't a thing we do, but if
 * this list is ever used to create a header row, first-alias-wins). */
export const HEADER_ALIASES: Record<SheetField, string[]> = {
  id: ["id"],
  candidateName: ["candidate name", "name"],
  role: ["role"],
  bu: ["bu"],
  requisitionStartDate: ["requisition start date", "requsition start date"],
  offerStatus: ["offer status"],
  offerExtendedDate: ["offer extended date"],
  resumptionDate: ["resumption date"],
  manualTimeToHireWeeks: [
    "time to hire (week)",
    "time to hire(week)",
    "time to hire (weeks)",
    "time to hire(weeks)",
  ],
  medicalCost: ["pre-employment medical test", "pre-employment medical test cost", "medical cost"],
  airtime: ["airtime"],
  feeding: ["feeding"],
  manualTotalCost: ["total cost"],
  officeType: ["office type"],
  hiringSource: ["hiring source", "source"],
  currentStage: ["current stage", "pipeline stage", "stage"],
};

export function findColumn(idx: Map<string, number>, field: SheetField): number | undefined {
  for (const alias of HEADER_ALIASES[field]) {
    const i = idx.get(alias);
    if (i != null) return i;
  }
  return undefined;
}
