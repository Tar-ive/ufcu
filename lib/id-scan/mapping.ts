import {
  formatHeight,
  parseAamva,
  parseAamvaDate,
  parseHeightInches,
  parseSex,
  type AamvaRecord,
} from "./aamva.ts";

/**
 * The fields a scanned ID can prefill in the UFCU application.
 *
 * `figma-brief.md` step 01 promises "Scan your ID" with prefill and "SSN or ITIN — the
 * only one to type". That is the contract this type encodes: everything here comes off
 * the barcode, and SSN/ITIN, email and phone deliberately do not — an ID does not carry
 * them, and pretending otherwise would be the wrong demo.
 */
export type ApplicationPrefill = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO yyyy-mm-dd
  addressStreet?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  sex?: string;
  eyeColor?: string;
  height?: string;
  idNumber?: string;
  idIssueDate?: string;
  idExpirationDate?: string;
  idDocumentDiscriminator?: string;
  idCountry?: string;
};

export type PrefillCheck = {
  id: string;
  label: string;
  status: "pass" | "fail" | "attention";
  detail: string;
};

export type ScanResult = {
  prefill: ApplicationPrefill;
  checks: PrefillCheck[];
  /** Fields the applicant still has to supply — an ID barcode carries none of these. */
  stillNeeded: string[];
};

/**
 * Title-case text that AAMVA stores in caps, keeping O'BRIEN and SMITH-JONES intact.
 * Tokens mixing digits and letters (unit "5B", "101ST") stay uppercase — lowercasing
 * them produces "Apt 5b", which looks like a typo on a prefilled form.
 */
function toTitleCase(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .split(" ")
    .map((token) =>
      /\d/.test(token) && /[A-Za-z]/.test(token)
        ? token.toUpperCase()
        : token
            .toLowerCase()
            .replace(/(^|['\-])([a-z])/g, (_, boundary, letter) => boundary + letter.toUpperCase()),
    )
    .join(" ");
}

function yearsBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00Z`);
  const to = new Date(`${toIso}T00:00:00Z`);
  let age = to.getUTCFullYear() - from.getUTCFullYear();
  const monthDelta = to.getUTCMonth() - from.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && to.getUTCDate() < from.getUTCDate())) age--;
  return age;
}

export function recordToPrefill(record: AamvaRecord): ApplicationPrefill {
  return {
    firstName: toTitleCase(record.firstName),
    middleName: toTitleCase(record.middleName),
    lastName: toTitleCase(record.familyName),
    dateOfBirth: parseAamvaDate(record.dateOfBirth),
    addressStreet: toTitleCase(record.addressStreet),
    addressStreet2: toTitleCase(record.addressStreet2),
    addressCity: toTitleCase(record.addressCity),
    addressState: record.addressState,
    // AAMVA pads ZIPs to 9 characters; show the 5-digit form unless a full ZIP+4 is present.
    addressPostalCode: record.addressPostalCode?.replace(/^(\d{5})0000$/, "$1"),
    sex: parseSex(record.sex),
    eyeColor: record.eyeColor,
    height: formatHeight(parseHeightInches(record.height)),
    idNumber: record.licenseNumber,
    idIssueDate: parseAamvaDate(record.issueDate),
    idExpirationDate: parseAamvaDate(record.expirationDate),
    idDocumentDiscriminator: record.documentDiscriminator,
    idCountry: record.country,
  };
}

/**
 * Derive the checks the identity panel shows. These are real conclusions drawn from the
 * barcode — not decoration. The expiry check in particular is the one that matters: a
 * scanner that silently prefills from an expired ID sets the applicant up to be declined
 * later with no explanation, which is exactly the failure `gap-analysis.md` calls F1.
 */
export function buildChecks(prefill: ApplicationPrefill, asOfIso: string): PrefillCheck[] {
  const checks: PrefillCheck[] = [];

  checks.push({
    id: "barcode",
    label: "Barcode read",
    status: prefill.idNumber ? "pass" : "fail",
    detail: prefill.idNumber
      ? "PDF417 decoded and the data elements are present."
      : "Could not read a license number from the barcode.",
  });

  if (prefill.dateOfBirth) {
    const age = yearsBetween(prefill.dateOfBirth, asOfIso);
    checks.push({
      id: "age",
      label: "18 or older",
      status: age >= 18 ? "pass" : "fail",
      detail:
        age >= 18
          ? `Date of birth on the ID puts the applicant at ${age}.`
          : `Applicant is ${age}. UFCU membership requires 18 or older.`,
    });
  }

  if (prefill.idExpirationDate) {
    const expired = prefill.idExpirationDate < asOfIso;
    checks.push({
      id: "expiry",
      label: "ID unexpired",
      status: expired ? "attention" : "pass",
      detail: expired
        ? `This ID expired on ${prefill.idExpirationDate}. Prefill still works, but a current ID is needed to finish.`
        : `Valid through ${prefill.idExpirationDate}.`,
    });
  }

  if (prefill.addressState) {
    const inFootprint = prefill.addressState === "TX";
    checks.push({
      id: "footprint",
      label: "Address in service area",
      status: inFootprint ? "pass" : "attention",
      detail: inFootprint
        ? `Address on the ID is in ${prefill.addressState}.`
        : `Address is in ${prefill.addressState}. Eligibility may run through an employer, school or the American Consumer Council instead.`,
    });
  }

  return checks;
}

/** An ID barcode carries none of these. Naming them keeps the demo honest. */
export const STILL_NEEDED = [
  "Social Security Number or ITIN",
  "Email address",
  "Mobile number",
  "Mailing address, if different from the ID",
];

export function scanToResult(payload: string, asOfIso: string): ScanResult {
  const record = parseAamva(payload);
  const prefill = recordToPrefill(record);
  return {
    prefill,
    checks: buildChecks(prefill, asOfIso),
    stillNeeded: STILL_NEEDED,
  };
}
