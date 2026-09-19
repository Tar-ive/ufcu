/**
 * Deterministic ID-scan autofill.
 *
 * Simulates what the "Scan your ID" step in `figma-brief.md` hands the application:
 * takes the AAMVA PDF417 payload a scanner would emit, parses it, and prints the
 * fields it prefills. Same fixture in, same fields out, every run.
 *
 *   npm run autofill              # human-readable
 *   npm run autofill -- --json    # the exact payload POST /api/id-scan returns
 *   npm run autofill -- --barcode # the raw AAMVA string
 *   npm run autofill -- --as-of 2025-01-01
 */

import { fixtureToBarcode, loadFixture } from "../lib/id-scan/fixtures.ts";
import { scanToResult } from "../lib/id-scan/mapping.ts";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const value = (name: string) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

// Defaults to today, but pinnable so output can be byte-identical across runs.
const asOf = value("as-of") ?? new Date().toISOString().slice(0, 10);

const fixture = loadFixture();
const barcode = fixtureToBarcode(fixture);

if (flag("barcode")) {
  process.stdout.write(barcode);
  process.exit(0);
}

const result = scanToResult(barcode, asOf);

if (flag("json")) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const LABELS: Record<string, string> = {
  firstName: "First name",
  middleName: "Middle name",
  lastName: "Last name",
  dateOfBirth: "Date of birth",
  addressStreet: "Street",
  addressStreet2: "Street 2",
  addressCity: "City",
  addressState: "State",
  addressPostalCode: "ZIP",
  sex: "Sex",
  eyeColor: "Eyes",
  height: "Height",
  idNumber: "License number",
  idIssueDate: "Issued",
  idExpirationDate: "Expires",
  idDocumentDiscriminator: "Document discriminator",
  idCountry: "Country",
};

const MARK = { pass: "✓", fail: "✗", attention: "!" } as const;

console.log(`\n${fixture.label}`);
console.log(`as of ${asOf}\n`);

console.log("Autofilled fields");
for (const [key, label] of Object.entries(LABELS)) {
  const filled = result.prefill[key as keyof typeof result.prefill];
  if (filled) console.log(`  ${label.padEnd(26)}${filled}`);
}

console.log("\nChecks");
for (const check of result.checks) {
  console.log(`  ${MARK[check.status]} ${check.label.padEnd(26)}${check.detail}`);
}

console.log("\nStill needed from the applicant");
for (const item of result.stillNeeded) console.log(`  · ${item}`);
console.log();
