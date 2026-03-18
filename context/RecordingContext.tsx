"use client";

import { SummaryData } from "@/components/SummaryPanel";
import { createContext, useContext, useState, type ReactNode } from "react";

type PanelStatus = "idle" | "processing" | "ready";

interface RecordingContextType {
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
  panelStatus: PanelStatus;
  setPanelStatus: (status: PanelStatus) => void;
  summaryData: SummaryData | null;
  setSummaryData: (data: SummaryData | null) => void;
  formattedSummary: string | null;
  setFormattedSummary: (data: string | null) => void;
  formattedHtml: string | null;
  setFormattedHtml: (data: string | null) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [panelStatus, setPanelStatus] = useState<PanelStatus>("idle");
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [formattedSummary, setFormattedSummary] = useState<string | null>(null);
  const [formattedHtml, setFormattedHtml] = useState<string | null>(null);

  return (
    <RecordingContext.Provider
      value={{
        audioBlob,
        setAudioBlob,
        panelStatus,
        setPanelStatus,
        summaryData,
        setSummaryData,
        formattedSummary,
        setFormattedSummary,
        formattedHtml,
        setFormattedHtml,
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
