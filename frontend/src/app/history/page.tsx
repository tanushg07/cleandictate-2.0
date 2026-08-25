"use client";

import { useState, useEffect } from "react";
import { getHistory, deleteDictation, Dictation } from "@/lib/history";
import { Copy, Trash2, Search, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [history, setHistory] = useState<Dictation[]>([]);
  const [search, setSearch] = useState("");
  const [isCopied, setIsCopied] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteDictation(id);
    setHistory(getHistory());
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.cleanedText.toLowerCase().includes(search.toLowerCase()) ||
    item.originalText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full pt-12 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-4">Dictation History</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dictations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring text-sm transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center p-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No dictations found.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-6 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString()}
                    {item.tone && <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase text-[10px]">{item.tone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.cleanedText)}
                    className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                    title="Copy cleaned text"
                  >
                    <Copy className={cn("w-4 h-4", isCopied === item.id && "text-green-500")} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete dictation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-background border border-border/50 text-sm text-foreground whitespace-pre-wrap">
                  {item.cleanedText}
                </div>
                <details className="text-sm">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">View Original</summary>
                  <div className="mt-2 p-4 rounded-lg bg-secondary/30 text-muted-foreground whitespace-pre-wrap">
                    {item.originalText}
                  </div>
                </details>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
