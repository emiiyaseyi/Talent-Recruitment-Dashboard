import { randomUUID } from "crypto";
import {
  CONFIG_RANGE,
  getSheetsClient,
  HIRES_RANGE,
  PIPELINE_RANGE,
  requireEnv,
} from "./sheets";
import { findColumn, headerIndex, type SheetField } from "./sheetColumns";

function columnIndexToLetter(index: number): string {
  let letter = "";
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

async function getHeaderRow(sheets: Awaited<ReturnType<typeof getSheetsClient>>, spreadsheetId: string, range: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows[0] ?? [];
}

/**
 * Appends one row to a tab, placing each field at whatever column that
 * field's header actually lives in — same alias-tolerant lookup the reader
 * uses (lib/sheetColumns.ts), so writes land correctly regardless of the
 * sheet's real column order. Fields with no matching header are silently
 * skipped (nothing to write them into) rather than failing the whole row.
 */
async function appendRowByFields(
  tabName: "Hires" | "Pipeline",
  headerRange: string,
  fields: Partial<Record<SheetField, string | number>>
): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");

  const header = await getHeaderRow(sheets, spreadsheetId, headerRange);
  const idx = headerIndex(header);

  const row: (string | number)[] = new Array(header.length).fill("");
  for (const [field, value] of Object.entries(fields)) {
    if (value == null) continue;
    const colIndex = findColumn(idx, field as SheetField);
    if (colIndex != null) row[colIndex] = value;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

function toSheetDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface NewPipelineCandidateInput {
  candidateName: string;
  role: string;
  bu: string;
  officeType: string;
  hiringSource: string;
  requisitionStartDate: Date;
  currentStage: string;
}

export async function addPipelineCandidate(input: NewPipelineCandidateInput): Promise<string> {
  const id = randomUUID();
  await appendRowByFields("Pipeline", PIPELINE_RANGE, {
    id,
    candidateName: input.candidateName,
    role: input.role,
    bu: input.bu,
    officeType: input.officeType,
    hiringSource: input.hiringSource,
    requisitionStartDate: toSheetDate(input.requisitionStartDate),
    currentStage: input.currentStage,
  });
  return id;
}

export interface ResolveCandidateInput {
  pipelineId: string;
  candidateName: string;
  role: string;
  bu: string;
  officeType: string;
  hiringSource: string;
  requisitionStartDate: Date;
  offerStatus: "Accepted" | "Declined" | "Withdrawn";
  offerExtendedDate?: Date;
  resumptionDate?: Date;
  medicalCost?: number;
  airtime?: number;
  feeding?: number;
}

/**
 * Moves a candidate out of the open pipeline into the historical Hires
 * record: appends the resolved outcome to Hires, then removes the row from
 * Pipeline. Not a single atomic operation (Sheets API has no cross-range
 * transaction) — the Hires append happens first, so a failure deleting the
 * Pipeline row leaves a harmless duplicate rather than losing the record.
 */
export async function resolveCandidate(input: ResolveCandidateInput): Promise<void> {
  await appendRowByFields("Hires", HIRES_RANGE, {
    id: randomUUID(),
    candidateName: input.candidateName,
    role: input.role,
    bu: input.bu,
    officeType: input.officeType,
    hiringSource: input.hiringSource,
    requisitionStartDate: toSheetDate(input.requisitionStartDate),
    offerStatus: input.offerStatus,
    offerExtendedDate: input.offerExtendedDate ? toSheetDate(input.offerExtendedDate) : undefined,
    resumptionDate: input.resumptionDate ? toSheetDate(input.resumptionDate) : undefined,
    medicalCost: input.medicalCost,
    airtime: input.airtime,
    feeding: input.feeding,
  });

  await deleteRowById("Pipeline", PIPELINE_RANGE, input.pipelineId);
}

/** Finds the row with the given ID in the given tab and deletes it entirely
 * (shifts rows below up), via a real Sheets deleteDimension request rather
 * than just blanking the cells. */
async function deleteRowById(tabName: "Hires" | "Pipeline", headerRange: string, id: string): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");

  const [valuesRes, metaRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange, valueRenderOption: "UNFORMATTED_VALUE" }),
    sheets.spreadsheets.get({ spreadsheetId }),
  ]);

  const rows = (valuesRes.data.values ?? []) as string[][];
  const [header, ...body] = rows;
  const idx = headerIndex(header ?? []);
  const idCol = findColumn(idx, "id");
  if (idCol == null) return;

  const rowOffset = body.findIndex((row) => String(row[idCol] ?? "") === id);
  if (rowOffset === -1) return; // already gone — nothing to do

  // Tab-name matching for A1-notation ranges (values.get/append) is
  // case-insensitive, but this metadata lookup for the numeric sheetId is an
  // exact string compare — real sheets can have lowercase tab titles
  // ("hires") even though every range in this codebase writes "Hires", so
  // match case-insensitively here too.
  const sheetId = metaRes.data.sheets?.find(
    (s) => s.properties?.title?.toLowerCase() === tabName.toLowerCase()
  )?.properties?.sheetId;
  if (sheetId == null) return;

  const gridRowIndex = rowOffset + 1; // +1 for the header row, 0-based for the API

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: gridRowIndex,
              endIndex: gridRowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

export type ConfigListName = "BUs" | "Roles" | "OfficeTypes" | "HiringSources" | "PipelineStages";

/** Appends a value to the first empty row of a Config column. Config is
 * column-oriented (independent lists of different lengths), not
 * row-records, so this can't reuse appendRowByFields — it writes a single
 * cell at the end of the target column instead. */
export async function addConfigValue(listName: ConfigListName, value: string): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: CONFIG_RANGE,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = (res.data.values ?? []) as string[][];
  const [header, ...body] = rows;
  const idx = headerIndex(header ?? []);
  const colIndex = idx.get(listName.toLowerCase());
  if (colIndex == null) {
    throw new Error(`Config tab has no "${listName}" column.`);
  }

  const existingCount = body.filter((row) => row[colIndex] != null && String(row[colIndex]).trim() !== "").length;
  const targetRow = existingCount + 2; // +1 header, +1 for 1-based rows
  const colLetter = columnIndexToLetter(colIndex);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Config!${colLetter}${targetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[value]] },
  });
}
