import React, { createContext, useContext, useEffect, useState } from "react";

export type ExamMode = "jee" | "neet";

interface ExamModeContextType {
  mode: ExamMode;
  setMode: (mode: ExamMode) => void;
  toggleMode: () => void;
  isNeet: boolean;
  isJee: boolean;
}

const ExamModeContext = createContext<ExamModeContextType | undefined>(undefined);

const STORAGE_KEY = "counseling_platform_exam_mode";

export function ExamModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ExamMode>("jee");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ExamMode | null;
      if (saved === "jee" || saved === "neet") {
        setModeState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setMode = (newMode: ExamMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore
    }
  };

  const toggleMode = () => {
    setMode(mode === "jee" ? "neet" : "jee");
  };

  return (
    <ExamModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isNeet: mode === "neet",
        isJee: mode === "jee",
      }}
    >
      {children}
    </ExamModeContext.Provider>
  );
}

export function useExamMode() {
  const context = useContext(ExamModeContext);
  if (!context) {
    throw new Error("useExamMode must be used within an ExamModeProvider");
  }
  return context;
}


