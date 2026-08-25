import { v4 as uuidv4 } from 'uuid';
import { Tone } from '@/components/dictation/ToneSelector';

export interface Dictation {
  id: string;
  title: string;
  originalText: string;
  cleanedText: string;
  createdAt: string;
  updatedAt: string;
  tone?: Tone;
}

const STORAGE_KEY = 'cleandictate_history';

export function getHistory(): Dictation[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveHistory(dictations: Dictation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dictations));
}

export function addDictation(data: Omit<Dictation, 'id' | 'title' | 'createdAt' | 'updatedAt'>) {
  const history = getHistory();
  const title = generateTitle(data.originalText);
  
  const newDictation: Dictation = {
    ...data,
    id: uuidv4(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveHistory([newDictation, ...history]);
  return newDictation;
}

export function deleteDictation(id: string) {
  const history = getHistory();
  const filtered = history.filter(d => d.id !== id);
  saveHistory(filtered);
}

function generateTitle(text: string): string {
  if (!text) return "Untitled dictation";
  const words = text.split(/\s+/).slice(0, 5);
  let title = words.join(" ");
  if (text.split(/\s+/).length > 5) {
    title += "...";
  }
  return title || "Untitled dictation";
}
