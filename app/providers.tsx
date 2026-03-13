"use client";

import { RecordingProvider } from "@/context/RecordingContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <RecordingProvider>{children}</RecordingProvider>;
}
