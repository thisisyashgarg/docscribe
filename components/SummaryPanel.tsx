"use client";

import { useState, useMemo, useEffect } from "react";
import { sendEmailSummary } from "@/lib/api";

function SummarySection({
  icon,
  title,
  items,
  selected,
  onToggle,
  onEdit,
}: {
  icon: string;
  title: string;
  items: string;
  selected: boolean;
  onToggle: () => void;
  onEdit: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(items);

  useEffect(() => {
    setEditValue(items);
  }, [items]);

  const itemList = items.split("\n").map(i => i.trim()).filter(i => i.length > 0);

  const handleSave = () => {
    onEdit(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(items);
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ease-out
        ${selected
          ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(80,66,189,0.08)] ring-1 ring-eka-primary/20"
          : "bg-gray-50/80 shadow-none ring-1 ring-gray-200/60 opacity-60 hover:opacity-80"
        }`}
    >
      {/* Accent bar on the left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300
          ${selected ? "bg-eka-primary" : "bg-gray-300"}`}
      />

      <div className="pl-5 pr-5 py-5 sm:pl-6 sm:pr-6 sm:py-6">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">{icon}</span>
          <h3 className={`text-[13px] font-semibold uppercase tracking-[0.08em] flex-1 transition-colors duration-200
            ${selected ? "text-eka-dark" : "text-gray-400"}`}>
            {title}
          </h3>

          {/* Action buttons — edit or save/cancel */}
          {!isEditing ? (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="opacity-0 group-hover:opacity-100 text-eka-text-secondary hover:text-eka-primary transition-all duration-200 p-1.5 rounded-lg hover:bg-eka-primary/8"
              title="Edit"
            >
              <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleSave(); }}
                className="text-[12px] font-semibold text-white bg-eka-primary hover:bg-eka-primary/90 px-3.5 py-1.5 rounded-lg transition-all duration-150 shadow-sm"
              >
                Save
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                className="text-[12px] font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Toggle switch */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none
              ${selected ? "bg-eka-primary" : "bg-gray-300"}`}
            role="switch"
            aria-checked={selected}
          >
            <span
              className={`pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] ring-0 transition-transform duration-300 ease-in-out transform
                ${selected ? "translate-x-[20px]" : "translate-x-[2px]"}`}
              style={{ marginTop: "2px" }}
            />
          </button>
        </div>

        {/* Content */}
        {isEditing ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            rows={Math.max(3, editValue.split("\n").length + 1)}
            className="w-full px-4 py-3 rounded-xl border border-eka-primary/20 focus:border-eka-primary focus:ring-2 focus:ring-eka-primary/10 outline-none transition-all text-[14px] leading-relaxed text-eka-text-primary bg-eka-background/50 resize-y"
            autoFocus
          />
        ) : (
          <ul className="space-y-2.5 ml-0.5">
            {itemList.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-eka-text-primary">
                <span className={`mt-[7px] w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-200
                  ${selected ? "bg-eka-primary/70" : "bg-gray-300"}`} />
                <span className="text-[14px] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
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

  // Editable content — initialized from summaryData, user can override
  const [editedSymptoms, setEditedSymptoms] = useState<string>("");
  const [editedDiagnosis, setEditedDiagnosis] = useState<string>("");
  const [editedPrescription, setEditedPrescription] = useState<string>("");

  // Sync edited values when new summaryData arrives
  useEffect(() => {
    if (summaryData) {
      setEditedSymptoms(summaryData.symptoms);
      setEditedDiagnosis(summaryData.diagnosis);
      setEditedPrescription(
        Array.isArray(summaryData.prescription) && summaryData.prescription.length > 0
          ? summaryData.prescription.map(p => `${p.name} - ${p.dosage} (${p.instructions})`).join("\n")
          : "Not discussed"
      );
    }
  }, [summaryData]);

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
      textLines.push("🔹 Symptoms:", editedSymptoms, "");
    }
    if (selectedSections.diagnosis) {
      textLines.push("🔹 Diagnosis:", editedDiagnosis, "");
    }
    if (selectedSections.prescription) {
      textLines.push("🔹 Prescription:", editedPrescription, "");
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
          <p style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0;">${editedSymptoms.replace(/\n/g, "<br/>")}</p>
        </div>`
      : "";

    const diagnosisBlock = selectedSections.diagnosis
      ? `<div style="margin-bottom: 20px;">
          <h3 style="color: #4a5568; margin-bottom: 8px; font-size: 1.1em; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔹</span> Diagnosis
          </h3>
          <p style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0;">${editedDiagnosis.replace(/\n/g, "<br/>")}</p>
        </div>`
      : "";

    const prescriptionBlock = selectedSections.prescription
      ? `<div style="margin-bottom: 24px;">
          <h3 style="color: #4a5568; margin-bottom: 8px; font-size: 1.1em; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔹</span> Prescription
          </h3>
          <div style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 0;">
            <ul style="margin: 0; padding-left: 20px;">
              ${editedPrescription.split("\n").filter(l => l.trim()).map(l => `<li style="margin-bottom: 4px;">${l}</li>`).join("")}
            </ul>
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
            <SummarySection
              icon="🩺"
              title="Symptoms"
              items={editedSymptoms}
              selected={selectedSections.symptoms}
              onToggle={() => toggleSection("symptoms")}
              onEdit={setEditedSymptoms}
            />
            <SummarySection
              icon="🔬"
              title="Diagnosis"
              items={editedDiagnosis}
              selected={selectedSections.diagnosis}
              onToggle={() => toggleSection("diagnosis")}
              onEdit={setEditedDiagnosis}
            />
            <SummarySection
              icon="💊"
              title="Prescription"
              items={editedPrescription}
              selected={selectedSections.prescription}
              onToggle={() => toggleSection("prescription")}
              onEdit={setEditedPrescription}
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
