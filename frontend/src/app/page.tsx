"use client";

import { useState } from "react";
import { DictationRecorder } from "@/components/dictation/DictationRecorder";
import { ResultEditor } from "@/components/dictation/ResultEditor";
import { addDictation } from "@/lib/history";
import { Tone } from "@/components/dictation/ToneSelector";

export default function DictationWorkspace() {
  const [result, setResult] = useState<{ originalText: string; cleanedText: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResult = (newResult: { originalText: string; cleanedText: string }) => {
    setResult(newResult);
    setError(null);
  };

  const handleError = (errMsg: string) => {
    setError(errMsg);
    setResult(null);
  };

  const handleSaveHistory = (data: { originalText: string; cleanedText: string; tone: Tone }) => {
    addDictation({
      originalText: data.originalText,
      cleanedText: data.cleanedText,
      tone: data.tone
    });
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full pt-12 pb-24">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
          Speak naturally. Write clearly.
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          Turn natural speech into polished writing.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-center text-sm font-medium animate-in fade-in">
          {error}
        </div>
      )}

      <DictationRecorder onTranscriptionResult={handleResult} onError={handleError} />

      {result && (
        <ResultEditor
          originalText={result.originalText}
          cleanedText={result.cleanedText}
          onClear={() => setResult(null)}
          onSaveHistory={handleSaveHistory}
        />
      )}
    </div>
  );
}
