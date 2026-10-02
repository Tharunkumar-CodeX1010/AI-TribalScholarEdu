import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Eye, Globe } from 'lucide-react';

export const TopGovBanner: React.FC = () => {
  const { fontSize, setFontSize, highContrast, setHighContrast, language, setLanguage, t } =
    useAccessibility();

  const fontOptions: { key: 'normal' | 'large' | 'xlarge'; label: string; title: string }[] = [
    { key: 'normal', label: 'A', title: 'Normal font size' },
    { key: 'large', label: 'A+', title: 'Large font size' },
    { key: 'xlarge', label: 'A++', title: 'Extra large font size' }
  ];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50">
      {/* GoI Emblem Text */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-wide text-slate-100 flex items-center gap-1.5">
          <span className="text-amber-400" aria-hidden="true">
            🇮🇳
          </span>
          {t('banner.govt')}
        </span>
      </div>

      {/* Accessibility Toolbar */}
      <div className="flex items-center space-x-4">
        {/* Font Size Adjuster */}
        <div
          className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5"
          role="group"
          aria-label="Font size"
        >
          <span className="text-[10px] text-slate-400 mr-1 uppercase font-semibold">{t('banner.font')}</span>
          {fontOptions.map((o) => (
            <button
              key={o.key}
              onClick={() => setFontSize(o.key)}
              aria-pressed={fontSize === o.key}
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                fontSize === o.key ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
              }`}
              title={o.title}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* High Contrast Toggle */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition ${
            highContrast ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          aria-pressed={highContrast}
          title="Toggle high contrast mode"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">
            {highContrast ? t('banner.standardMode') : t('banner.highContrast')}
          </span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
          aria-label={language === 'EN' ? t('banner.switchToHindi') : t('banner.switchToEnglish')}
          lang={language === 'EN' ? 'hi' : 'en'}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs"
        >
          <Globe className="w-3 h-3 text-amber-400" />
          <span>{language === 'EN' ? t('banner.switchToHindi') : t('banner.switchToEnglish')}</span>
        </button>
      </div>
    </div>
  );
};
