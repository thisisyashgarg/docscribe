"use client";

import { useState } from "react";
import { sendEmailSummary } from "@/lib/api";

function SummarySection({ icon, title, items }: { icon: string; title: string; items: string }) {
  const itemList = items.split("\n").map(i => i.trim()).filter(i => i.length > 0);

  return (
    <div className="bg-eka-background/50 rounded-[var(--radius-eka)] p-6 border border-eka-secondary/20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-sm font-bold uppercase tracking-widest text-eka-primary">{title}</h3>
      </div>
      <ul className="space-y-3">
        {itemList.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-eka-text-primary">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-eka-primary shrink-0" />
            <span className="text-[15px] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  instructions: string;
}

export interface SummaryData {
  doctorName?: string;
  patientName?: string;
  patientAge?: string;
  patientWeight?: string;
  symptoms: string;
  diagnosis: string;
  prescription: PrescriptionItem[];
}

export interface SummaryPanelProps {
  status: "idle" | "processing" | "ready";
  summaryData: SummaryData | null;
  formattedSummary: string | null;
  formattedHtml: string | null;
}

export default function SummaryPanel({ status, summaryData, formattedSummary, formattedHtml }: SummaryPanelProps) {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const validateAndSend = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    
    if (!formattedSummary) return;

    setIsSending(true);
    try {
      await sendEmailSummary(email, formattedSummary, formattedHtml || undefined);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error("Failed to send email:", error);
      setEmailError("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-[var(--radius-eka-lg)] shadow-[var(--shadow-eka)] p-8 lg:p-12 animate-fade-in-up">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-eka-dark mb-2">Medical Highlights</h2>
        <p className="text-eka-text-secondary">AI-distilled insights from your consultation</p>
      </div>

      {status === "idle" && (
        <div className="py-20 text-center">
          <p className="text-eka-text-secondary max-w-xs mx-auto text-lg">
            No active session. Please start a recording to see findings here.
          </p>
        </div>
      )}

      {status === "processing" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-eka-primary font-bold">
            <div className="w-5 h-5 border-2 border-eka-primary border-t-transparent rounded-full animate-spin" />
            Synthesizing clinical notes...
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 h-32 rounded-[var(--radius-eka)] animate-pulse" />
          ))}
        </div>
      )}

      {status === "ready" && summaryData && (
        <div className="space-y-8">
          {(summaryData.doctorName || summaryData.patientName || summaryData.patientAge || summaryData.patientWeight) && (
            <div className="bg-eka-primary/5 rounded-[var(--radius-eka)] p-6">
              <h3 className="text-eka-dark font-bold mb-4 flex items-center gap-2">
                <span className="text-lg">📋</span> Consultation Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {summaryData.doctorName && (
                  <div>
                    <span className="text-xs text-eka-text-secondary uppercase tracking-wider font-bold block mb-1">Doctor</span>
                    <span className="font-semibold text-eka-text-primary text-[15px]">{summaryData.doctorName.startsWith("Dr.") ? summaryData.doctorName : `Dr. ${summaryData.doctorName}`}</span>
                  </div>
                )}
                {summaryData.patientName && (
                  <div>
                    <span className="text-xs text-eka-text-secondary uppercase tracking-wider font-bold block mb-1">Patient</span>
                    <span className="font-semibold text-eka-text-primary text-[15px]">{summaryData.patientName}</span>
                  </div>
                )}
                {summaryData.patientAge && (
                  <div>
                    <span className="text-xs text-eka-text-secondary uppercase tracking-wider font-bold block mb-1">Age</span>
                    <span className="font-semibold text-eka-text-primary text-[15px]">{summaryData.patientAge}</span>
                  </div>
                )}
                {summaryData.patientWeight && (
                  <div>
                    <span className="text-xs text-eka-text-secondary uppercase tracking-wider font-bold block mb-1">Weight</span>
                    <span className="font-semibold text-eka-text-primary text-[15px]">{summaryData.patientWeight}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-6">
            <SummarySection icon="🩺" title="Symptoms" items={summaryData.symptoms} />
            <SummarySection icon="🔬" title="Diagnosis" items={summaryData.diagnosis} />
            <SummarySection 
              icon="💊" 
              title="Prescription" 
              items={Array.isArray(summaryData.prescription) && summaryData.prescription.length > 0 
                ? summaryData.prescription.map(p => `${p.name} - ${p.dosage} (${p.instructions})`).join("\n") 
                : "Not discussed"} 
            />
          </div>

          <div className="h-px bg-gray-100 my-8" />

          {/* Email Action */}
          <div className="bg-eka-primary/5 rounded-[var(--radius-eka)] p-6">
            <h3 className="text-eka-dark font-bold mb-4 flex items-center gap-2">
              <span className="text-lg">📧</span> Share with Patient
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Patient's Email Address"
                className="h-12 flex-1 px-4 rounded-xl border-2 border-eka-secondary/30 focus:border-eka-primary focus:ring-4 focus:ring-eka-primary/10 outline-none transition-all font-medium"
              />

              <button 
                onClick={validateAndSend} 
                disabled={sent || isSending}
                className={`h-12 px-8 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95
                  ${sent ? "bg-eka-success" : "bg-eka-primary hover:bg-eka-primary/90"}
                  ${isSending ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSending ? "Sending..." : sent ? "✓ Sent" : "Send via Email"}
              </button>
            </div>
            {emailError && <p className="mt-3 text-red-500 text-sm font-medium">{emailError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
