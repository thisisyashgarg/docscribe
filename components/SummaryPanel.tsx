"use client";

import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
];

/* ---------- Skeleton Loader ---------- */
function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded-lg animate-skeleton"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

interface SummarySectionProps {
  icon: string;
  title: string;
  items: string[];
  delay: number;
}

/* ---------- Summary Section Card ---------- */
function SummarySection({ icon, title, items, delay }: { icon: string; title: string; items: string; delay: number }) {
  // Split the string into items by newline or comma
  const itemList = items.split("\n").map(i => i.trim()).filter(i => i.length > 0);

  return (
    <div
      className="rounded-2xl border border-border-light bg-paper p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-deep">
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {itemList.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface SummaryData {
  symptoms: string;
  diagnosis: string;
  prescription: string;
}

export interface SummaryPanelProps {
  status: "idle" | "processing" | "ready";
  summaryData: SummaryData | null;
}

import { sendWhatsAppSummary } from "@/lib/api";

/* ---------- Main Component ---------- */
export default function SummaryPanel({ status, summaryData }: SummaryPanelProps) {
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [phone, setPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  const validateAndSend = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^\d{10}$/.test(cleaned)) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }
    setPhoneError("");
    
    if (!summaryData) return;

    setIsSending(true);
    try {
      await sendWhatsAppSummary(countryCode + cleaned, summaryData);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      setPhoneError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col rounded-[var(--radius-bento)] border border-border bg-card p-8 shadow-[var(--shadow-bento)] lg:p-10 min-h-[480px]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-indigo-deep">
          Clinical Summary
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          AI-generated consultation notes
        </p>
      </div>

      {/* ---- IDLE state ---- */}
      {status === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-warm">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">
            Start a recording to generate<br />a clinical summary
          </p>
        </div>
      )}

      {/* ---- PROCESSING state ---- */}
      {status === "processing" && (
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 w-5 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-saffron">
              Analysing consultation…
            </span>
          </div>

          {/* Skeleton sections */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-border-light bg-paper p-5">
              <div className="mb-3 h-4 w-24 rounded-md animate-skeleton" />
              <SkeletonBlock lines={3} />
            </div>
            <div className="rounded-2xl border border-border-light bg-paper p-5">
              <div className="mb-3 h-4 w-20 rounded-md animate-skeleton" />
              <SkeletonBlock lines={2} />
            </div>
            <div className="rounded-2xl border border-border-light bg-paper p-5">
              <div className="mb-3 h-4 w-28 rounded-md animate-skeleton" />
              <SkeletonBlock lines={4} />
            </div>
          </div>
        </div>
      )}

      {/* ---- READY state ---- */}
      {status === "ready" && summaryData && (
        <div className="flex flex-1 flex-col">
          {/* Summary sections */}
          <div className="space-y-4 mb-8">
            <SummarySection
              icon="🩺"
              title="Symptoms"
              items={summaryData.symptoms}
              delay={0}
            />
            <SummarySection
              icon="🔬"
              title="Diagnosis"
              items={summaryData.diagnosis}
              delay={120}
            />
            <SummarySection
              icon="💊"
              title="Action Items / Prescription"
              items={summaryData.prescription}
              delay={240}
            />
          </div>

          {/* ---- WhatsApp Delivery ---- */}
          <div className="mt-auto rounded-2xl border border-border bg-paper-warm p-5">
            <h3 className="mb-3 text-sm font-semibold text-indigo-deep flex items-center gap-2">
              <span className="text-base">📲</span> Send via WhatsApp
            </h3>

            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-11 items-center gap-1 rounded-xl border border-border bg-card px-3 text-sm font-medium text-text-primary transition-colors hover:border-saffron cursor-pointer"
                >
                  <span>{selectedCountry?.flag}</span>
                  <span>{countryCode}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="ml-0.5 text-text-muted"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCountryCode(c.code);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-paper-warm cursor-pointer
                          ${c.code === countryCode ? "bg-saffron-light font-medium" : ""}`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.label}</span>
                        <span className="ml-auto text-text-muted">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Input */}
              <input
                type="tel"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPhone(e.target.value);
                  setPhoneError("");
                  setSent(false);
                }}
                placeholder="10-digit number"
                className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-saffron focus:ring-2 focus:ring-saffron/20"
              />

              {/* Send Button */}
              <button
                onClick={validateAndSend}
                disabled={sent || isSending}
                className={`h-11 rounded-xl px-5 text-sm font-semibold text-white transition-all cursor-pointer
                  ${
                    sent
                      ? "bg-green-500"
                      : "bg-saffron hover:bg-saffron-dark shadow-sm hover:shadow-md active:scale-[0.97]"
                  } ${isSending ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending...
                  </div>
                ) : sent ? (
                  "✓ Sent"
                ) : (
                  "Send Summary"
                )}
              </button>
            </div>

            {/* Error */}
            {phoneError && (
              <p className="mt-2 text-xs text-red-glow">{phoneError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
