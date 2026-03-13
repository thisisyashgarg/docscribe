"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SummaryData } from "@/components/SummaryPanel";

type PanelStatus = "idle" | "processing" | "ready";

interface RecordingContextType {
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
  panelStatus: PanelStatus;
  setPanelStatus: (status: PanelStatus) => void;
  summaryData: SummaryData | null;
  setSummaryData: (data: SummaryData | null) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [panelStatus, setPanelStatus] = useState<PanelStatus>("idle");
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  return (
    <RecordingContext.Provider
      value={{
        audioBlob,
        setAudioBlob,
        panelStatus,
        setPanelStatus,
        summaryData,
        setSummaryData,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}
