"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import RecordingInterface from "@/components/RecordingInterface";
import { useRecording } from "@/context/RecordingContext";
import { processConsultation } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { setAudioBlob, setPanelStatus, setSummaryData } = useRecording();

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      setAudioBlob(blob);
      setPanelStatus("processing");

      // Navigate to summary page immediately
      router.push("/summary");

      try {
        const response = await processConsultation(blob);
        const { summary } = response.data;
        
        setSummaryData(summary);
        setPanelStatus("ready");
      } catch (error) {
        console.error("Failed to process consultation:", error);
        alert("Sorry, there was an error processing your consultation. Please try again.");
        setPanelStatus("idle");
      }
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
