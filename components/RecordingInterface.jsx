"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function RecordingInterface({ onRecordingComplete }) {
  const [status, setStatus] = useState("idle"); // idle | recording | stopped
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Timer tick
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const formatTime = (s) => {
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

      mr.ondataavailable = (e) => {
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
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-bento)] border border-border bg-card p-8 shadow-[var(--shadow-bento)] lg:p-12 min-h-[480px]">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-indigo-deep">
          Consultation Recorder
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Capture and transcribe doctor-patient conversations
        </p>
      </div>

      {/* Microphone Button */}
      <div className="relative mb-8">
        {/* Outer decorative rings */}
        {status === "recording" && (
          <>
            <div className="absolute inset-0 -m-4 rounded-full border-2 border-red-glow/20 animate-ping" />
            <div className="absolute inset-0 -m-8 rounded-full border border-red-glow/10" />
          </>
        )}

        <button
          onClick={handleClick}
          className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 cursor-pointer
          ${
            status === "recording"
              ? "bg-red-glow/10 border-2 border-red-glow animate-pulse-glow"
              : "border-2 border-indigo-deep/20 bg-paper-warm hover:border-saffron hover:bg-saffron-light hover:shadow-lg"
          }`}
          aria-label={status === "recording" ? "Stop recording" : "Start recording"}
        >
          {status === "recording" ? (
            /* Stop icon */
            <div className="h-8 w-8 rounded-sm bg-red-glow" />
          ) : (
            /* Microphone icon */
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-deep"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer / Status */}
      {status === "recording" ? (
        <div className="mb-6 flex flex-col items-center gap-3 animate-fade-in-up">
          <span className="text-3xl font-semibold tabular-nums text-red-glow">
            {formatTime(timer)}
          </span>

          {/* Audio wave bars */}
          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-red-glow/60"
                style={{
                  height: "100%",
                  animation: `wave-bar 0.8s ease-in-out ${i * 0.07}s infinite`,
                  transformOrigin: "bottom",
                }}
              />
            ))}
          </div>

          <span className="text-xs font-medium text-red-glow/80 uppercase tracking-wider">
            Recording in progress
          </span>
        </div>
      ) : (
        <div className="mb-6 text-center animate-fade-in-up">
          <p className="text-sm text-text-muted">
            {status === "stopped"
              ? "Recording complete. Tap to start a new session."
              : "Tap the microphone to begin"}
          </p>
        </div>
      )}

      {/* Subtle footer */}
      <div className="mt-auto flex items-center gap-2 rounded-2xl bg-paper-warm px-5 py-3">
        <span className="text-lg">🗣️</span>
        <p className="text-xs text-text-secondary">
          Speak naturally in <b>Hindi</b> or <b>English</b>
        </p>
      </div>
    </div>
  );
}
