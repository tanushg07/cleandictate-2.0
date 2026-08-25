"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Edit2, Save, Trash2, Loader2 } from "lucide-react";
import { ToneSelector, Tone } from "./ToneSelector";
import { cn } from "@/lib/utils";

interface ResultEditorProps {
  originalText: string;
  cleanedText: string;
  onClear: () => void;
  onSaveHistory: (data: { originalText: string; cleanedText: string; tone: Tone }) => void;
}

export function ResultEditor({ originalText, cleanedText: initialCleaned, onClear, onSaveHistory }: ResultEditorProps) {
  const [currentTone, setCurrentTone] = useState<Tone>("original");
  const [displayedText, setDisplayedText] = useState(initialCleaned);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessingTone, setIsProcessingTone] = useState(false);
  const [toneCache, setToneCache] = useState<Record<string, string>>({
    original: initialCleaned,
  });

  // Save to history on mount
  useEffect(() => {
    onSaveHistory({
      originalText,
      cleanedText: initialCleaned,
      tone: "original"
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToneChange = async (tone: Tone) => {
    setCurrentTone(tone);
    
    if (tone === "original") {
      setDisplayedText(toneCache.original);
      return;
    }

    if (toneCache[tone]) {
      setDisplayedText(toneCache[tone]);
      return;
    }

    setIsProcessingTone(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/style`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: toneCache.original, // Always base on the original cleaned text
          tone: tone,
        }),
      });

      if (!response.ok) throw new Error("Style API failed");
      const data = await response.json();
      
      setToneCache(prev => ({ ...prev, [tone]: data.styledText }));
      setDisplayedText(data.styledText);
      
      // Optionally update history with the new tone variation
      onSaveHistory({
        originalText,
        cleanedText: data.styledText,
        tone: tone
      });
      
    } catch (err) {
      console.error(err);
      // Fallback
      setDisplayedText(toneCache.original);
      setCurrentTone("original");
    } finally {
      setIsProcessingTone(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <ToneSelector 
          currentTone={currentTone} 
          onToneChange={handleToneChange} 
          isProcessing={isProcessingTone} 
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {isCopied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => {
              if (isEditing) {
                setDisplayedText(editedText);
                setIsEditing(false);
              } else {
                setEditedText(displayedText);
                setIsEditing(true);
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete this dictation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden min-h-[200px]">
        {isProcessingTone && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {isEditing ? (
          <textarea
            className="w-full h-full min-h-[200px] p-6 bg-transparent resize-y outline-none focus:ring-2 focus:ring-ring text-lg leading-relaxed text-foreground"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="p-6 text-lg leading-relaxed text-foreground whitespace-pre-wrap">
            {displayedText}
          </div>
        )}
      </div>

      <details className="group cursor-pointer">
        <summary className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none list-none inline-flex items-center gap-2">
          <span className="w-4 h-4 border border-border rounded-sm flex items-center justify-center group-open:bg-secondary">
            <span className="w-2 h-0.5 bg-current rounded-full group-open:block hidden" />
            <span className="w-2 h-2 border-b-2 border-r-2 border-current transform rotate-45 -translate-y-0.5 group-open:hidden block" />
          </span>
          View Original Transcript
        </summary>
        <div className="mt-4 p-4 rounded-lg bg-secondary/30 text-sm text-muted-foreground whitespace-pre-wrap border border-border/50">
          {originalText}
        </div>
      </details>
    </div>
  );
}
