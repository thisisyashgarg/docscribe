"use client";

import { useRouter } from "next/navigation";
import SummaryPanel from "@/components/SummaryPanel";
import { useRecording } from "@/context/RecordingContext";

export default function SummaryPage() {
  const router = useRouter();
  const { panelStatus, summaryData, formattedSummary } = useRecording();

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)]">
      {/* Back to recording button */}
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-indigo-deep transition-colors cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Recording
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <SummaryPanel status={panelStatus} summaryData={summaryData} formattedSummary={formattedSummary} />
      </div>
    </div>
  );
}
