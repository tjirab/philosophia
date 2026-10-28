'use client';

import React, { useState } from 'react';
import { Sun, Moon, Laptop, Type, Check } from 'lucide-react';
import { useTheme, ThemeMode, FontSize } from '../../lib/theme-context';

export function AppearanceSettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  const themeOptions: Array<{ id: ThemeMode; label: string; icon: any }> = [
    { id: 'light', label: 'Parchment (Light)', icon: Sun },
    { id: 'dark', label: 'Antique Ink (Dark)', icon: Moon },
    { id: 'system', label: 'System Automatic', icon: Laptop },
  ];

  const fontSizeOptions: Array<{ id: FontSize; label: string; preview: string }> = [
    { id: 'normal', label: 'Standard', preview: '16px' },
    { id: 'large', label: 'Large (Classic)', preview: '18px' },
    { id: 'xlarge', label: 'Extra Large', preview: '20px' },
  ];

  return (
    <div className="relative font-serif">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border-[var(--border-main)] text-[var(--text-main)]"
        title="Adjust Theme & Typography Size"
      >
        <span className="flex items-center gap-1">
          {theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
          ) : theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
          )}
          <Type className="w-3 h-3 text-[var(--text-muted)]" />
        </span>
        <span className="hidden lg:inline">Appearance</span>
        <span className="text-[10px] text-[var(--text-dim)]">▾</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-4 text-[var(--text-main)] backdrop-blur-xl">
          {/* Theme Section */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold-accent)] mb-2 flex items-center justify-between">
              <span>Folio Theme</span>
            </div>
            <div className="space-y-1">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border border-[var(--gold-border)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Section */}
          <div className="pt-3 border-t border-[var(--border-main)]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold-accent)] mb-2 flex items-center justify-between">
              <span>Text Scale</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {fontSizeOptions.map((opt) => {
                const isSelected = fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={`p-2 rounded-xl text-center text-xs transition border ${
                      isSelected
                        ? 'bg-[var(--gold-bg)] text-[var(--gold-accent)] font-semibold border-[var(--gold-border)]'
                        : 'border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-[var(--text-dim)] font-mono">{opt.preview}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
