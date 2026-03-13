"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import RecordingInterface from "@/components/RecordingInterface";
import { useRecording } from "@/context/RecordingContext";
import type { SummaryData } from "@/components/SummaryPanel";

const MOCK_SUMMARY: SummaryData = {
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
  const router = useRouter();
  const { setAudioBlob, setPanelStatus, setSummaryData } = useRecording();

  const handleRecordingComplete = useCallback(
    (blob: Blob) => {
      setAudioBlob(blob);
      setPanelStatus("processing");

      // Navigate to summary page immediately
      router.push("/summary");

      // Simulate AI processing, then set ready
      setTimeout(() => {
        setSummaryData(MOCK_SUMMARY);
        setPanelStatus("ready");
      }, 3000);
    },
    [router, setAudioBlob, setPanelStatus, setSummaryData]
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-xl">
        <RecordingInterface onRecordingComplete={handleRecordingComplete} />
      </div>
    </div>
  );
}
