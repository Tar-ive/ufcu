"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Check = { id: string; label: string; status: "pass" | "fail" | "attention"; detail: string };
type Prefill = Record<string, string | undefined>;

const FIELDS: { key: string; label: string; autofilled: boolean }[] = [
  { key: "firstName", label: "First name", autofilled: true },
  { key: "middleName", label: "Middle name", autofilled: true },
  { key: "lastName", label: "Last name", autofilled: true },
  { key: "dateOfBirth", label: "Date of birth", autofilled: true },
  { key: "addressStreet", label: "Street address", autofilled: true },
  { key: "addressCity", label: "City", autofilled: true },
  { key: "addressState", label: "State", autofilled: true },
  { key: "addressPostalCode", label: "ZIP", autofilled: true },
  { key: "idNumber", label: "Driver license number", autofilled: true },
  { key: "idExpirationDate", label: "License expires", autofilled: true },
  { key: "ssn", label: "SSN or ITIN", autofilled: false },
  { key: "email", label: "Email", autofilled: false },
  { key: "phone", label: "Mobile number", autofilled: false },
];

const STATUS_STYLE = {
  pass: "text-[var(--ufcu-success)]",
  fail: "text-destructive",
  attention: "text-[var(--ufcu-accent-darker)]",
} as const;

const MARK = { pass: "✓", fail: "✗", attention: "!" } as const;

export default function ApplyPage() {
  const [values, setValues] = useState<Prefill>({});
  const [checks, setChecks] = useState<Check[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/id-scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setValues(data.prefill);
      setChecks(data.checks);
      setScanned(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  function reset() {
    setValues({});
    setChecks([]);
    setScanned(false);
    setError(null);
  }

  return (
    <main className="mx-auto w-full max-w-(--spacing-measure) px-6 py-16">
      <p className="text-[13px] tracking-wide text-muted-foreground uppercase">
        Step 1 of 6 — Who you are
      </p>
      <h1 className="mt-8 font-display text-4xl leading-tight text-foreground">
        Scan your ID
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        We read the barcode on the back and fill in what it carries. Your SSN or ITIN is
        the only one you type.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={scan}
          disabled={scanning}
          className="h-12 rounded-lg bg-primary px-6 text-[15px] font-medium text-primary-foreground disabled:opacity-50"
        >
          {scanning ? "Reading barcode…" : scanned ? "Scan again" : "Scan your ID"}
        </button>
        {scanned ? (
          <button
            type="button"
            onClick={reset}
            className="h-12 rounded-lg border border-border px-6 text-[15px] text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-lg bg-[var(--ufcu-error-bg)] px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {checks.length > 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
            What we checked
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {checks.map((check) => (
              <li key={check.id} className="flex gap-3 text-sm">
                <span className={cn("font-semibold", STATUS_STYLE[check.status])}>
                  {MARK[check.status]}
                </span>
                <span>
                  <span className="text-foreground">{check.label}</span>
                  <span className="block text-muted-foreground">{check.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-5">
        {FIELDS.map((field) => {
          const filled = values[field.key];
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.key}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                {field.label}
                {filled ? (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] tracking-wide text-secondary-foreground uppercase">
                    From your ID
                  </span>
                ) : null}
              </label>
              <input
                id={field.key}
                value={filled ?? ""}
                readOnly={Boolean(filled)}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                placeholder={field.autofilled ? "Scan to fill" : "You'll type this"}
                className={cn(
                  "h-[54px] rounded-lg border px-4 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  filled
                    ? "border-border bg-secondary text-foreground"
                    : "border-input bg-card text-foreground placeholder:text-muted-foreground",
                )}
              />
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-[13px] leading-snug text-muted-foreground">
        Demo. The scan is simulated from a fixture — no camera, no network call to a
        vendor — but the AAMVA payload is parsed exactly as a real scanner&rsquo;s output
        would be.
      </p>
    </main>
  );
}
