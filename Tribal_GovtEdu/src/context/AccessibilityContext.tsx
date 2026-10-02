import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, translate } from '../lib/i18n';

type FontSize = 'normal' | 'large' | 'xlarge';

const STORAGE_KEY = 'mota_accessibility';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_REM: Record<FontSize, string> = {
  normal: '16px',
  large: '18px',
  xlarge: '20px'
};

const readStored = (): { fontSize: FontSize; highContrast: boolean; language: Language } => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fontSize: 'normal', highContrast: false, language: 'EN' };
    const parsed = JSON.parse(raw);
    return {
      fontSize: parsed.fontSize ?? 'normal',
      highContrast: Boolean(parsed.highContrast),
      language: parsed.language === 'HI' ? 'HI' : 'EN'
    };
  } catch {
    return { fontSize: 'normal', highContrast: false, language: 'EN' };
  }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(readStored, []);
  const [fontSize, setFontSize] = useState<FontSize>(initial.fontSize);
  const [highContrast, setHighContrast] = useState<boolean>(initial.highContrast);
  const [language, setLanguage] = useState<Language>(initial.language);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_REM[fontSize];
  }, [fontSize]);

  /* `contrast-125` / `grayscale-25` were not real Tailwind utilities, so the
     toggle previously did nothing. `hc` is a defined rule in index.css. */
  useEffect(() => {
    document.documentElement.classList.toggle('hc', highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.lang = language === 'HI' ? 'hi' : 'en';
  }, [language]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize, highContrast, language }));
    } catch {
      /* storage unavailable: accessibility settings simply do not persist */
    }
  }, [fontSize, highContrast, language]);

  const t = useCallback((key: string) => translate(language, key), [language]);

  return (
    <AccessibilityContext.Provider
      value={{ fontSize, setFontSize, highContrast, setHighContrast, language, setLanguage, t }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
