/**
 * Parser tests for the ID scan. No server, no network, no fixtures beyond the
 * committed sample — so this passes for anyone who clones the repo.
 *
 *   npm run test:id
 */

import { encodeAamva, parseAamva, parseAamvaDate, parseHeightInches } from "../lib/id-scan/aamva.ts";
import { scanToResult } from "../lib/id-scan/mapping.ts";
import { fixtureToBarcode } from "../lib/id-scan/fixtures.ts";
import { readFileSync } from "node:fs";

let failed = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}\n      expected ${e}\n      actual   ${a}`);
  }
}

console.log("\nAAMVA primitives");
check("date MMDDCCYY → ISO", parseAamvaDate("07041976"), "1976-07-04");
check("rejects a malformed date", parseAamvaDate("3/2/04"), undefined);
check("height in inches", parseHeightInches("070 IN"), 70);
check("height in centimetres", parseHeightInches("178 CM"), 70);

console.log("\nEncode → parse round trip");
const payload = encodeAamva({ DAQ: "X1", DCS: "DOE", DAC: "JANE", DBB: "01011990" });
const parsed = parseAamva(payload);
check("license number survives", parsed.licenseNumber, "X1");
check("family name survives", parsed.familyName, "DOE");
check("first name survives", parsed.firstName, "JANE");
check("date of birth survives", parsed.dateOfBirth, "01011990");

console.log("\nRejects non-AAMVA input");
for (const [name, bad] of [["empty string", ""], ["plain text", "hello world"], ["missing ANSI", "@\nnope"]] as const) {
  let threw = false;
  try { parseAamva(bad); } catch { threw = true; }
  check(name, threw, true);
}

console.log("\nCommitted sample fixture → prefill");
const fixture = JSON.parse(readFileSync("fixtures/id-scan.example.json", "utf8"));
const result = scanToResult(fixtureToBarcode(fixture), "2026-09-19");
check("first name title-cased", result.prefill.firstName, "Jordan");
check("last name title-cased", result.prefill.lastName, "Rivera");
check("unit designator stays uppercase", result.prefill.addressStreet, "2100 Guadalupe St Apt 5B");
check("ZIP trimmed to five digits", result.prefill.addressPostalCode, "78705");
check("height formatted", result.prefill.height, `5'5"`);
check("sex code decoded", result.prefill.sex, "F");
check("SSN is never prefilled", "ssn" in result.prefill, false);

console.log("\nDerived checks");
const byId = Object.fromEntries(result.checks.map((c) => [c.id, c.status]));
check("barcode read", byId.barcode, "pass");
check("adult", byId.age, "pass");
check("unexpired ID passes", byId.expiry, "pass");
check("Texas address in footprint", byId.footprint, "pass");

const expired = scanToResult(fixtureToBarcode(fixture), "2031-01-01");
check("expired ID flagged", expired.checks.find((c) => c.id === "expiry")?.status, "attention");
const minor = scanToResult(fixtureToBarcode(fixture), "2010-01-01");
check("under 18 flagged", minor.checks.find((c) => c.id === "age")?.status, "fail");

console.log("\nDeterminism");
const a = JSON.stringify(scanToResult(fixtureToBarcode(fixture), "2026-09-19"));
const b = JSON.stringify(scanToResult(fixtureToBarcode(fixture), "2026-09-19"));
check("same input yields same output", a === b, true);

console.log(failed === 0 ? "\nall passed\n" : `\n${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
