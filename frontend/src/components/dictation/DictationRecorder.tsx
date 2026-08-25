"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RecordingState = "idle" | "requesting_permission" | "recording" | "processing" | "completed" | "error";

interface DictationRecorderProps {
  onTranscriptionResult: (result: { originalText: string; cleanedText: string }) => void;
  onError: (error: string) => void;
}

export function DictationRecorder({ onTranscriptionResult, onError }: DictationRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    setState("requesting_permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setState("recording");
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone permission denied", err);
      setState("error");
      onError("Microphone access is blocked. Allow microphone access in your browser settings and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && state === "recording") {
      mediaRecorder.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setState("processing");
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      // We'll use relative URL if the Next app rewrites, or hardcode localhost for dev.
      // Assuming Next.js runs on 3000 and FastAPI on 8000
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setState("completed");
      onTranscriptionResult(data);
      
      // Reset after a brief moment to allow another recording
      setTimeout(() => setState("idle"), 2000);
      
    } catch (err) {
      console.error(err);
      setState("error");
      onError("We couldn't process the recording. Check your connection and try again.");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-2xl shadow-sm transition-all duration-300">
      <div className="mb-8 text-center min-h-16">
        {state === "idle" && (
          <p className="text-muted-foreground">Ready to dictate</p>
        )}
        {state === "requesting_permission" && (
          <p className="text-muted-foreground">Requesting microphone access...</p>
        )}
        {state === "recording" && (
          <>
            <p className="text-primary font-medium flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Listening...
            </p>
            <p className="text-2xl font-light text-foreground mt-2">{formatTime(duration)}</p>
          </>
        )}
        {state === "processing" && (
          <p className="text-muted-foreground flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing your dictation...
          </p>
        )}
        {state === "completed" && (
          <p className="text-green-600 font-medium">Dictation processed successfully</p>
        )}
        {state === "error" && (
          <p className="text-destructive">An error occurred</p>
        )}
      </div>

      <button
        onClick={state === "recording" ? stopRecording : startRecording}
        disabled={state === "processing" || state === "requesting_permission"}
        className={cn(
          "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          state === "idle" || state === "completed" || state === "error"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25"
            : state === "recording"
            ? "bg-destructive/10 text-destructive animate-pulse-slow ring-4 ring-destructive/20"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {state === "recording" ? (
          <Square className="w-8 h-8 fill-current" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </button>

      <div className="mt-8 text-sm text-muted-foreground text-center">
        {state === "idle" ? "Click to start" : state === "recording" ? "Click to stop" : ""}
      </div>
    </div>
  );
}
