"use client";

import { useState, useCallback } from "react";
import RecordingInterface from "@/components/RecordingInterface";
import SummaryPanel from "@/components/SummaryPanel";

const MOCK_SUMMARY = {
  symptoms: [
    "Persistent dry cough for the last 5 days",
    "Low-grade fever (99.2°F) in the evenings",
    "Mild fatigue and body aches",
    "No sore throat or nasal congestion reported",
  ],
  diagnosis: [
    "Upper respiratory tract infection (viral origin likely)",
    "Rule out early bronchitis if cough worsens",
  ],
  prescription: [
    "Tab. Paracetamol 500 mg — 1 tablet SOS for fever (max 3/day)",
    "Syp. Dextromethorphan 10 ml — twice daily for cough",
    "Steam inhalation — 10 mins, three times a day",
    "Increase fluid intake, rest for 2–3 days",
    "Follow-up in 5 days if symptoms persist or worsen",
  ],
};

export default function Home() {
  const [panelStatus, setPanelStatus] = useState("idle"); // idle | processing | ready
  const [summaryData, setSummaryData] = useState(null);

  const handleRecordingComplete = useCallback(() => {
    // Simulate processing
    setPanelStatus("processing");

    setTimeout(() => {
      setSummaryData(MOCK_SUMMARY);
      setPanelStatus("ready");
    }, 3000);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <RecordingInterface onRecordingComplete={handleRecordingComplete} />
      <SummaryPanel status={panelStatus} summaryData={summaryData} />
    </div>
  );
}
