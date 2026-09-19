import { fixtureToBarcode, loadFixture } from "@/lib/id-scan/fixtures";
import { scanToResult } from "@/lib/id-scan/mapping";

/**
 * Simulated ID scan.
 *
 * Stands in for a real scanner SDK. POST with no body and it reads the configured
 * fixture; POST `{ "barcode": "@\n..." }` and it parses that AAMVA payload instead,
 * which is the path a real integration would use unchanged.
 */
export async function POST(req: Request) {
  let barcode: string | undefined;
  let asOf: string | undefined;

  try {
    const body = (await req.json()) as { barcode?: string; asOf?: string };
    barcode = body?.barcode;
    asOf = body?.asOf;
  } catch {
    // No body is fine — fall through to the fixture.
  }

  const asOfIso = asOf ?? new Date().toISOString().slice(0, 10);

  try {
    if (barcode) {
      return Response.json({ source: "barcode", ...scanToResult(barcode, asOfIso) });
    }
    const fixture = loadFixture();
    return Response.json({
      source: "fixture",
      label: fixture.label,
      ...scanToResult(fixtureToBarcode(fixture), asOfIso),
    });
  } catch (error) {
    console.error("[id-scan] parse failed", error);
    return Response.json(
      { error: "Could not read that ID. Try again, or enter your details by hand." },
      { status: 422 },
    );
  }
}
