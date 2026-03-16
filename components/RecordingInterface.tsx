"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface RecordingInterfaceProps {
  onRecordingComplete?: (blob: Blob) => void;
}

export default function RecordingInterface({ onRecordingComplete }: RecordingInterfaceProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer tick
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete?.(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setTimer(0);
      setStatus("recording");
    } catch {
      alert("Microphone access is required to record consultations.");
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setStatus("stopped");
  }, []);

  const handleClick = () => {
    if (status === "idle" || status === "stopped") startRecording();
    else if (status === "recording") stopRecording();
  };

  return (
    <div className="bg-white rounded-[var(--radius-eka-lg)] shadow-[var(--shadow-eka)] p-10 flex flex-col items-center animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-eka-dark mb-3">Consultation Scribe</h2>
        <p className="text-eka-text-secondary">Capture your patient conversation seamlessly</p>
      </div>

      {/* Main Action Area */}
      <div className="relative mb-12">
        {status === "recording" && (
          <div className="absolute inset-0 -m-6 rounded-full border-4 border-eka-primary/10 animate-ping" />
        )}
        
        <button
          onClick={handleClick}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95
          ${status === "recording" 
            ? "bg-white border-4 border-eka-primary" 
            : "bg-eka-primary hover:bg-eka-primary/90"}`}
        >
          {status === "recording" ? (
            <div className="w-8 h-8 bg-eka-primary rounded-sm" />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer & Status */}
      <div className="text-center h-20">
        {status === "recording" ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-bold text-eka-primary tabular-nums">
              {formatTime(timer)}
            </span>
            <span className="text-xs uppercase tracking-widest font-semibold text-eka-primary animate-pulse">
              Recording in progress...
            </span>
          </div>
        ) : (
          <p className="text-eka-text-secondary mt-4">
            {status === "stopped" 
              ? "Recording captured. Redirecting..." 
              : "Tap the button above to start your session"}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-4 my-8">
        <div className="h-px bg-gray-100 flex-1" />
        <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
        <div className="h-px bg-gray-100 flex-1" />
      </div>

      {/* File Upload */}
      <div>
        <input
          type="file"
          id="audio-upload"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onRecordingComplete?.(file);
          }}
        />
        <label
          htmlFor="audio-upload"
          className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-eka-secondary/30 bg-eka-secondary/5 text-eka-primary font-bold transition-all hover:bg-eka-secondary/10 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          Upload Consultation Audio
        </label>
      </div>

      {/* Footer Info */}
      <div className="mt-10 flex items-center gap-3 text-eka-text-secondary text-sm bg-eka-background px-4 py-2 rounded-full">
        <span className="text-lg">🤖</span>
        <span>Summaries are processed locally for your privacy</span>
      </div>
    </div>
  );
}
