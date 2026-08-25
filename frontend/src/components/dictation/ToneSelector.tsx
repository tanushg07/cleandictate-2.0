"use client";

import { cn } from "@/lib/utils";

export type Tone = "original" | "professional" | "casual" | "concise";

interface ToneSelectorProps {
  currentTone: Tone;
  onToneChange: (tone: Tone) => void;
  isProcessing: boolean;
}

export function ToneSelector({ currentTone, onToneChange, isProcessing }: ToneSelectorProps) {
  const tones: { id: Tone; label: string }[] = [
    { id: "original", label: "Original" },
    { id: "professional", label: "Professional" },
    { id: "casual", label: "Casual" },
    { id: "concise", label: "Concise" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Writing Style
      </span>
      <div className="inline-flex items-center p-1 bg-secondary/50 rounded-lg border border-border w-fit">
        {tones.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onToneChange(tone.id)}
            disabled={isProcessing}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
              currentTone === tone.id
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {tone.label}
          </button>
        ))}
      </div>
    </div>
  );
}
