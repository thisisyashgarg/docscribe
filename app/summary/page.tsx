"use client";

import { useRouter } from "next/navigation";
import SummaryPanel from "@/components/SummaryPanel";
import { useRecording } from "@/context/RecordingContext";

export default function SummaryPage() {
  const router = useRouter();
  const { panelStatus, summaryData, formattedSummary } = useRecording();

  return (
    <div className="flex flex-col items-center">
      {/* Navigation */}
      <div className="w-full max-w-3xl mb-8">
        <button 
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 text-eka-primary font-bold hover:translate-x-[-4px] transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          New Session
        </button>
      </div>

      <div className="w-full max-w-4xl">
        <SummaryPanel status={panelStatus} summaryData={summaryData} formattedSummary={formattedSummary} />
      </div>

      <div className="mt-12 text-center text-eka-text-secondary/60 text-xs">
        Ensure patient consent before recording or sharing clinical summaries.
      </div>
    </div>
  );
}
