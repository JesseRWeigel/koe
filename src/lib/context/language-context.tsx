"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { type LanguageCode, LANGUAGE_CODES } from "@/lib/languages";

const STORAGE_KEY = "koe-language";
const DEFAULT_LANGUAGE: LanguageCode = "ja";

function isValidLanguageCode(value: string): value is LanguageCode {
  return (LANGUAGE_CODES as readonly string[]).includes(value);
}

function readStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLanguageCode(stored)) return stored;
  } catch {
    // localStorage may be unavailable
  }
  return DEFAULT_LANGUAGE;
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  return (
    <LanguageContext value={{ language, setLanguage }}>
      {children}
    </LanguageContext>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
