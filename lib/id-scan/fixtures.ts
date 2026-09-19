import { readFileSync } from "node:fs";
import { join } from "node:path";

import { encodeAamva } from "./aamva.ts";

export type ScanFixture = {
  label: string;
  note?: string;
  iin?: string;
  fields: Record<string, string>;
};

const FIXTURE_DIR = join(process.cwd(), "fixtures");

/**
 * A real card's data, when present, wins over the shipped sample.
 *
 * `fixtures/id-scan.local.json` is gitignored. That split is deliberate: a driver
 * license number, document discriminator, date of birth and home address together are
 * everything someone needs to impersonate the holder, and this repo is public. The demo
 * behaves identically either way.
 */
export function loadFixture(): ScanFixture {
  for (const name of ["id-scan.local.json", "id-scan.example.json"]) {
    try {
      return JSON.parse(readFileSync(join(FIXTURE_DIR, name), "utf8")) as ScanFixture;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
  }
  throw new Error("No ID scan fixture found in fixtures/.");
}

/** The raw string a scanner SDK would hand back for this fixture. Deterministic. */
export function fixtureToBarcode(fixture: ScanFixture): string {
  const fields = Object.fromEntries(
    Object.entries(fixture.fields).filter(([, value]) => value !== ""),
  );
  return encodeAamva(fields, { iin: fixture.iin });
}
