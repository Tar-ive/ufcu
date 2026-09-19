/**
 * AAMVA PDF417 encode/decode.
 *
 * The barcode on the back of a US driver license carries an AAMVA-standard payload.
 * A real scanner SDK hands you that raw string; this module is what turns it into
 * fields. Encoding it too means fixtures are built the same way a scanner would emit
 * them, so the parser is exercised for real rather than fed a hand-written object.
 *
 * Reference: AAMVA DL/ID Card Design Standard, data element IDs (DAQ, DCS, DBB, ...).
 */

export const COMPLIANCE = "@";
export const RECORD_SEPARATOR = "\u001e";
export const SEGMENT_TERMINATOR = "\r";
export const LINE_FEED = "\n";

/** Issuer Identification Numbers for the jurisdictions this demo cares about. */
export const IIN = {
  TX: "636015",
} as const;

/** The AAMVA element IDs we read. Anything else in the payload is preserved but unused. */
export const ELEMENTS = {
  DAQ: "licenseNumber",
  DCS: "familyName",
  DAC: "firstName",
  DAD: "middleName",
  DBB: "dateOfBirth",
  DBA: "expirationDate",
  DBD: "issueDate",
  DBC: "sex",
  DAY: "eyeColor",
  DAU: "height",
  DAG: "addressStreet",
  DAH: "addressStreet2",
  DAI: "addressCity",
  DAJ: "addressState",
  DAK: "addressPostalCode",
  DCF: "documentDiscriminator",
  DCG: "country",
  DCA: "vehicleClass",
  DCB: "restrictions",
  DCD: "endorsements",
  DDB: "cardRevisionDate",
  DDK: "organDonor",
} as const;

export type ElementId = keyof typeof ELEMENTS;

export type AamvaRecord = {
  [K in (typeof ELEMENTS)[ElementId]]?: string;
} & { raw: Record<string, string> };

/** AAMVA dates are MMDDCCYY. */
export function parseAamvaDate(value: string | undefined): string | undefined {
  if (!value || !/^\d{8}$/.test(value)) return undefined;
  const month = value.slice(0, 2);
  const day = value.slice(2, 4);
  const year = value.slice(4, 8);
  return `${year}-${month}-${day}`;
}

export function toAamvaDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}${day}${year}`;
}

/** DAU is `072 IN` — inches, zero padded. */
export function parseHeightInches(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{3})\s*(IN|CM)$/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  return match[2].toUpperCase() === "CM" ? Math.round(amount / 2.54) : amount;
}

export function formatHeight(inches: number | undefined): string | undefined {
  if (inches === undefined) return undefined;
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

const SEX = { "1": "M", "2": "F", "9": "X" } as const;

export function parseSex(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return SEX[code as keyof typeof SEX] ?? undefined;
}

/**
 * Build an AAMVA payload. Offsets in the subfile designator are computed from the
 * assembled body, which is why this is code rather than a stored string.
 */
export function encodeAamva(
  fields: Record<string, string>,
  options: { iin?: string; aamvaVersion?: string; jurisdictionVersion?: string } = {},
): string {
  const iin = options.iin ?? IIN.TX;
  const aamvaVersion = options.aamvaVersion ?? "09";
  const jurisdictionVersion = options.jurisdictionVersion ?? "00";

  const body =
    "DL" +
    Object.entries(fields)
      .map(([id, value]) => `${id}${value}${LINE_FEED}`)
      .join("") +
    SEGMENT_TERMINATOR;

  const header =
    COMPLIANCE +
    LINE_FEED +
    RECORD_SEPARATOR +
    SEGMENT_TERMINATOR +
    "ANSI " +
    iin +
    aamvaVersion +
    jurisdictionVersion +
    "01";

  const designatorLength = 10; // "DL" + 4-digit offset + 4-digit length
  const offset = header.length + designatorLength;
  const designator =
    "DL" + String(offset).padStart(4, "0") + String(body.length).padStart(4, "0");

  return header + designator + body;
}

export class AamvaParseError extends Error {}

export function parseAamva(payload: string): AamvaRecord {
  if (!payload.startsWith(COMPLIANCE)) {
    throw new AamvaParseError(
      "Not an AAMVA payload — expected it to start with the compliance indicator '@'.",
    );
  }
  if (!payload.includes("ANSI ")) {
    throw new AamvaParseError("Not an AAMVA payload — missing the 'ANSI ' file type.");
  }

  const raw: Record<string, string> = {};

  // The header carries a subfile designator that also begins "DL" — but followed by
  // digits (offset and length), not an element ID. Anchoring on the subfile type
  // followed by three letters skips the designator and lands on the real body.
  // Getting this wrong silently drops whatever element happens to be first.
  const bodyStart = payload.search(/(DL|ID)[A-Z]{3}/);
  const body = (bodyStart === -1 ? payload : payload.slice(bodyStart)).replace(
    /^(DL|ID)/,
    "",
  );

  // Element IDs are three characters; values run to the next line feed or terminator.
  for (const line of body.split(/[\n\r\u001e]/)) {
    if (line.length < 3) continue;
    const id = line.slice(0, 3);
    if (!/^[A-Z]{3}$/.test(id)) continue;
    const value = line.slice(3).trim();
    if (value) raw[id] = value;
  }

  if (Object.keys(raw).length === 0) {
    throw new AamvaParseError("AAMVA payload contained no readable data elements.");
  }

  const record: AamvaRecord = { raw };
  for (const [id, key] of Object.entries(ELEMENTS)) {
    const value = raw[id];
    if (value) (record as Record<string, unknown>)[key] = value;
  }
  return record;
}
