"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import RecordingInterface from "@/components/RecordingInterface";
import { useRecording } from "@/context/RecordingContext";
import { processConsultation } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { setAudioBlob, setPanelStatus, setSummaryData, setFormattedSummary } = useRecording();

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      setAudioBlob(blob);
      setPanelStatus("processing");

      // Navigate to summary page immediately
      router.push("/summary");

      try {
        const response = await processConsultation(blob);
        const { summary, formattedSummary } = response.data;
        
        setSummaryData(summary);
        setFormattedSummary(formattedSummary);
        setPanelStatus("ready");
      } catch (error) {
        console.error("Failed to process consultation:", error);
        alert("Sorry, there was an error processing your consultation. Please try again.");
        setPanelStatus("idle");
      }
    },
    [router, setAudioBlob, setPanelStatus, setSummaryData, setFormattedSummary]
  );

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <RecordingInterface onRecordingComplete={handleRecordingComplete} />
      </div>
    </div>
  );
}
