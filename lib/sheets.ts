import { google } from "googleapis";
import type { ConfigLists, DashboardData, HireRecord, OfferStatus } from "./types";
import { isOfferStatus } from "./metrics";
import { getSampleDashboardData } from "./sampleData";

const HIRES_RANGE = "Hires!A1:M";
const CONFIG_RANGE = "Config!A1:C";

/** Google Sheets serial date (days since 1899-12-30) -> JS Date, timezone-safe. */
function serialToDate(serial: number): Date {
  const epoch = Date.UTC(1899, 11, 30);
  return new Date(epoch + serial * 86400000);
}

function parseDateCell(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return serialToDate(value);
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseNumberCell(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function parseOptionalNumberCell(value: unknown): number | null {
  if (value == null || value === "") return null;
  return parseNumberCell(value);
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Maps normalized header text -> column index so row order in the sheet can
 * change without breaking the parser. */
function headerIndex(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((h, i) => map.set(normalizeHeader(String(h ?? "")), i));
  return map;
}

/** Each field accepts several header spellings — the "clean" name from
 * docs/01-data-schema.md and the literal text real sheets tend to already
 * have (typos, casing, abbreviations included) — so sheet owners never have
 * to rename existing columns just to match this code. */
const HEADER_ALIASES: Record<string, string[]> = {
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
};

function findColumn(idx: Map<string, number>, field: keyof typeof HEADER_ALIASES): number | undefined {
  for (const alias of HEADER_ALIASES[field]) {
    const i = idx.get(alias);
    if (i != null) return i;
  }
  return undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function hasSheetsCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
  );
}

async function getSheetsClient() {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

function parseHiresRows(rows: unknown[][]): HireRecord[] {
  if (rows.length === 0) return [];
  const [header, ...body] = rows as string[][];
  const idx = headerIndex(header);

  const iId = findColumn(idx, "id");
  const iName = findColumn(idx, "candidateName");
  const iRole = findColumn(idx, "role");
  const iBU = findColumn(idx, "bu");
  const iReqStart = findColumn(idx, "requisitionStartDate");
  const iOfferStatus = findColumn(idx, "offerStatus");
  const iOfferExtended = findColumn(idx, "offerExtendedDate");
  const iResumption = findColumn(idx, "resumptionDate");
  const iManualWeeks = findColumn(idx, "manualTimeToHireWeeks");
  const iMedical = findColumn(idx, "medicalCost");
  const iAirtime = findColumn(idx, "airtime");
  const iFeeding = findColumn(idx, "feeding");
  const iManualTotal = findColumn(idx, "manualTotalCost");

  return body
    .filter((row) => row.some((cell) => cell != null && cell !== ""))
    .map((row, i): HireRecord | null => {
      const get = (index: number | undefined) => (index == null ? undefined : row[index]);

      const requisitionStartDate = parseDateCell(get(iReqStart));
      if (!requisitionStartDate) return null; // required field, unusable without it

      const rawStatus = String(get(iOfferStatus) ?? "").trim();
      const offerStatus: OfferStatus = isOfferStatus(rawStatus) ? rawStatus : "Pending";

      return {
        id: String(get(iId) ?? `row-${i}`),
        candidateName: String(get(iName) ?? ""),
        role: String(get(iRole) ?? ""),
        bu: String(get(iBU) ?? ""),
        requisitionStartDate,
        offerStatus,
        offerExtendedDate: parseDateCell(get(iOfferExtended)),
        resumptionDate: parseDateCell(get(iResumption)),
        manualTimeToHireWeeks: parseOptionalNumberCell(get(iManualWeeks)),
        medicalCost: parseNumberCell(get(iMedical)),
        airtimeCost: parseNumberCell(get(iAirtime)),
        feedingCost: parseNumberCell(get(iFeeding)),
        manualTotalCost: parseOptionalNumberCell(get(iManualTotal)),
      };
    })
    .filter((r): r is HireRecord => r !== null);
}

function parseConfigColumns(rows: unknown[][]): ConfigLists {
  if (rows.length === 0) return { bus: [], roles: [], offerStatuses: [] };
  const [header, ...body] = rows as string[][];
  const idx = headerIndex(header);
  const colValues = (name: string): string[] => {
    const i = idx.get(normalizeHeader(name));
    if (i == null) return [];
    return body.map((row) => row[i]).filter((v): v is string => Boolean(v && String(v).trim()));
  };

  return {
    bus: colValues("BUs"),
    roles: colValues("Roles"),
    offerStatuses: colValues("OfferStatuses").filter(isOfferStatus),
  };
}

/**
 * Fetches and parses both sheet tabs. Falls back to bundled sample data in
 * non-production environments when Sheets credentials aren't configured yet,
 * so the UI can be built and reviewed before the live sheet is wired up —
 * never used in production (see lib/sampleData.ts).
 */
export async function getDashboardData(): Promise<DashboardData> {
  if (!hasSheetsCredentials()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Google Sheets credentials are not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID."
      );
    }
    console.warn(
      "[sheets] No Google Sheets credentials found — using bundled sample data for local development."
    );
    return getSampleDashboardData();
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");

  const [hiresRes, configRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: HIRES_RANGE,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "SERIAL_NUMBER",
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: CONFIG_RANGE,
      valueRenderOption: "UNFORMATTED_VALUE",
    }),
  ]);

  const records = parseHiresRows((hiresRes.data.values ?? []) as unknown[][]);
  const config = parseConfigColumns((configRes.data.values ?? []) as unknown[][]);

  return { records, config };
}
