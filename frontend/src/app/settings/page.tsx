"use client";

import { Monitor, Moon, Sun, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [autoCopy, setAutoCopy] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme || "system";
    const savedAutoCopy = localStorage.getItem("autoCopy") === "true";
    setTheme(savedTheme);
    setAutoCopy(savedAutoCopy);
  }, []);

  const handleSave = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("autoCopy", String(autoCopy));
    
    if (theme === "dark") document.documentElement.classList.add("dark");
    else if (theme === "light") document.documentElement.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full pt-12 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your dictation preferences and app appearance.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground border-b border-border pb-2">Appearance</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                theme === "light" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
              )}
            >
              <Sun className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                theme === "dark" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
              )}
            >
              <Moon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                theme === "system" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
              )}
            >
              <Monitor className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground border-b border-border pb-2">Preferences</h2>
          
          <label className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors">
            <div>
              <div className="font-medium">Auto-copy to clipboard</div>
              <div className="text-sm text-muted-foreground">Automatically copy the cleaned text when processing finishes.</div>
            </div>
            <div className="relative inline-block w-12 h-6 rounded-full bg-secondary border border-border">
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={autoCopy}
                onChange={(e) => setAutoCopy(e.target.checked)}
              />
              <span className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform bg-foreground",
                autoCopy ? "translate-x-6 bg-primary" : ""
              )} />
            </div>
          </label>
        </section>

        <div className="pt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
