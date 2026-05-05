"use client";

import { useState, useMemo } from "react";
import { sendEmailSummary } from "@/lib/api";

function SummarySection({ icon, title, items, selected, onToggle }: { icon: string; title: string; items: string; selected: boolean; onToggle: () => void }) {
  const itemList = items.split("\n").map(i => i.trim()).filter(i => i.length > 0);

  return (
    <div
      onClick={onToggle}
      className={`bg-eka-background/50 rounded-[var(--radius-eka)] p-6 border-2 cursor-pointer transition-all duration-200
        ${selected ? "border-eka-primary shadow-[0_0_0_1px_rgba(var(--color-eka-primary-rgb,59,130,246),0.15)]" : "border-eka-secondary/20 hover:border-eka-secondary/40"}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0
          ${selected ? "bg-eka-primary border-eka-primary" : "border-gray-300 bg-white"}`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
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
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    symptoms: true,
    diagnosis: true,
    prescription: true,
  });

  const toggleSection = (section: string) => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const anySelected = useMemo(
    () => Object.values(selectedSections).some(Boolean),
    [selectedSections]
  );

  const buildFilteredContent = () => {
    if (!summaryData) return { text: "", html: "" };

    // ── Plain-text version ──
    const textLines: (string | undefined)[] = [
      "🏥 Medical Consultation Summary",
      "",
      summaryData.doctorName ? `👨‍⚕️ Doctor: ${summaryData.doctorName}` : undefined,
      summaryData.patientName ? `👤 Patient: ${summaryData.patientName}` : undefined,
      summaryData.patientAge ? `⏳ Age: ${summaryData.patientAge}` : undefined,
      summaryData.patientWeight ? `⚖️ Weight: ${summaryData.patientWeight}` : undefined,
      (summaryData.doctorName || summaryData.patientName || summaryData.patientAge || summaryData.patientWeight) ? "" : undefined,
    ];

    if (selectedSections.symptoms) {
      textLines.push("🔹 Symptoms:", summaryData.symptoms, "");
    }
    if (selectedSections.diagnosis) {
      textLines.push("🔹 Diagnosis:", summaryData.diagnosis, "");
    }
    if (selectedSections.prescription) {
      const rxText = Array.isArray(summaryData.prescription) && summaryData.prescription.length > 0
        ? summaryData.prescription.map(p => `• ${p.name} - ${p.dosage} (${p.instructions})`).join("\n")
        : "Not discussed";
      textLines.push("🔹 Prescription:", rxText, "");
    }

    textLines.push("---", "This summary was generated automatically. Please consult your doctor for any clarifications.");
    const text = textLines.filter(l => l !== undefined).join("\n");

    // ── Styled HTML version (matches backend formatter) ──
    const detailsBlock = (summaryData.doctorName || summaryData.patientName || summaryData.patientAge || summaryData.patientWeight)
      ? `<div style="margin-bottom: 20px; background-color: #f0f4f8; padding: 12px; border-radius: 6px; border-left: 4px solid #3182ce;">
          ${summaryData.doctorName ? `<p style="margin: 0 0 8px 0; font-weight: 500; display: flex; align-items: center;"><span style="margin-right: 8px;">👨‍⚕️</span> <strong>Doctor:</strong>&nbsp;${summaryData.doctorName}</p>` : ""}
          ${summaryData.patientName ? `<p style="margin: 0 0 8px 0; font-weight: 500; display: flex; align-items: center;"><span style="margin-right: 8px;">👤</span> <strong>Patient:</strong>&nbsp;${summaryData.patientName}</p>` : ""}
          ${summaryData.patientAge ? `<p style="margin: 0 0 8px 0; font-weight: 500; display: flex; align-items: center;"><span style="margin-right: 8px;">⏳</span> <strong>Age:</strong>&nbsp;${summaryData.patientAge}</p>` : ""}
          ${summaryData.patientWeight ? `<p style="margin: 0; font-weight: 500; display: flex; align-items: center;"><span style="margin-right: 8px;">⚖️</span> <strong>Weight:</strong>&nbsp;${summaryData.patientWeight}</p>` : ""}
        </div>`
      : "";

    const symptomsBlock = selectedSections.symptoms
      ? `<div style="margin-bottom: 20px;">
          <h3 style="color: #4a5568; margin-bottom: 8px; font-size: 1.1em; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔹</span> Symptoms
          </h3>
          <p style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0;">${summaryData.symptoms}</p>
        </div>`
      : "";

    const diagnosisBlock = selectedSections.diagnosis
      ? `<div style="margin-bottom: 20px;">
          <h3 style="color: #4a5568; margin-bottom: 8px; font-size: 1.1em; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔹</span> Diagnosis
          </h3>
          <p style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0;">${summaryData.diagnosis}</p>
        </div>`
      : "";

    const prescriptionBlock = selectedSections.prescription
      ? `<div style="margin-bottom: 24px;">
          <h3 style="color: #4a5568; margin-bottom: 8px; font-size: 1.1em; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔹</span> Prescription
          </h3>
          <div style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0;">
            ${Array.isArray(summaryData.prescription) && summaryData.prescription.length > 0
              ? `<ul style="margin: 0; padding-left: 20px;">
                  ${summaryData.prescription.map(p => `<li style="margin-bottom: 4px;"><strong>${p.name}</strong> – ${p.dosage} <em>(${p.instructions})</em></li>`).join("")}
                </ul>`
              : `<p style="margin: 0;">Not discussed</p>`}
          </div>
        </div>`
      : "";

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; line-height: 1.6; color: #1a202c;">
        <h2 style="color: #2b6cb0; border-bottom: 2px solid #3182ce; padding-bottom: 12px; margin-top: 0; display: flex; align-items: center;">
          <span style="margin-right: 8px;">🏥</span> Medical Consultation Summary
        </h2>
        ${detailsBlock}
        ${symptomsBlock}
        ${diagnosisBlock}
        ${prescriptionBlock}
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-style: italic; color: #718096; font-size: 0.85em; text-align: center; margin: 0;">
          This summary was generated automatically. Please consult your doctor for any clarifications.
        </p>
      </div>
    `;

    return { text, html };
  };

  const validateAndSend = async () => {
    if (!anySelected) {
      setEmailError("Please select at least one section to send.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");

    const { text, html } = buildFilteredContent();
    if (!text) return;

    setIsSending(true);
    try {
      await sendEmailSummary(email, text, html || undefined);
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
            <SummarySection icon="🩺" title="Symptoms" items={summaryData.symptoms} selected={selectedSections.symptoms} onToggle={() => toggleSection("symptoms")} />
            <SummarySection icon="🔬" title="Diagnosis" items={summaryData.diagnosis} selected={selectedSections.diagnosis} onToggle={() => toggleSection("diagnosis")} />
            <SummarySection 
              icon="💊" 
              title="Prescription" 
              items={Array.isArray(summaryData.prescription) && summaryData.prescription.length > 0 
                ? summaryData.prescription.map(p => `${p.name} - ${p.dosage} (${p.instructions})`).join("\n") 
                : "Not discussed"}
              selected={selectedSections.prescription}
              onToggle={() => toggleSection("prescription")}
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
                disabled={sent || isSending || !anySelected}
                className={`h-12 px-8 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95
                  ${sent ? "bg-eka-success" : !anySelected ? "bg-gray-300 cursor-not-allowed" : "bg-eka-primary hover:bg-eka-primary/90"}
                  ${isSending ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSending ? "Sending..." : sent ? "✓ Sent" : !anySelected ? "Select sections" : "Send via Email"}
              </button>
            </div>
            {emailError && <p className="mt-3 text-red-500 text-sm font-medium">{emailError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
