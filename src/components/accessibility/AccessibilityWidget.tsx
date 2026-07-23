"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Accessibility,
  AlignJustify,
  Check,
  Contrast,
  Link2,
  MousePointerClick,
  Palette,
  PauseCircle,
  RotateCcw,
  TextCursorInput,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  TEXT_SIZE_PERCENT,
  applyAccessibilitySettings,
  readAccessibilitySettings,
  removeStoredAccessibilitySettings,
  writeAccessibilitySettings,
  type AccessibilitySettings,
  type AccessibilityToggleKey,
  type TextSize,
} from "@/lib/accessibility-settings";

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; accessibleLabel: string }[] = [
  { value: "small", label: "A−", accessibleLabel: "טקסט קטן" },
  { value: "normal", label: "רגיל", accessibleLabel: "טקסט בגודל רגיל" },
  { value: "large", label: "A+", accessibleLabel: "טקסט גדול" },
  { value: "xlarge", label: "A++", accessibleLabel: "טקסט גדול מאוד" },
];

const TOGGLE_OPTIONS: {
  key: AccessibilityToggleKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "highContrast", label: "ניגודיות גבוהה", icon: Contrast },
  { key: "highlightLinks", label: "הדגשת קישורים", icon: Link2 },
  { key: "readableFont", label: "גופן קריא", icon: Type },
  { key: "reduceMotion", label: "עצירת אנימציות", icon: PauseCircle },
  { key: "grayscale", label: "גווני אפור", icon: Palette },
  { key: "keyboardFocus", label: "סימון פוקוס מקלדת", icon: MousePointerClick },
  { key: "lineSpacing", label: "ריווח שורות", icon: AlignJustify },
  { key: "letterSpacing", label: "ריווח אותיות", icon: TextCursorInput },
];

const CONTROL_FOCUS_STYLES =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

export default function AccessibilityWidget({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(readAccessibilitySettings);
  const settingsRef = useRef(settings);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    applyAccessibilitySettings(settings);
  }, [settings]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== ACCESSIBILITY_STORAGE_KEY) return;

      const storedSettings = readAccessibilitySettings();
      settingsRef.current = storedSettings;
      setSettings(storedSettings);
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function commitSettings(nextSettings: AccessibilitySettings) {
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    writeAccessibilitySettings(nextSettings);
  }

  function setTextSize(textSize: TextSize) {
    commitSettings({ ...settingsRef.current, textSize });
  }

  function toggle(key: AccessibilityToggleKey) {
    const currentSettings = settingsRef.current;
    commitSettings({ ...currentSettings, [key]: !currentSettings[key] });
  }

  function handleReset() {
    const defaultSettings = { ...DEFAULT_ACCESSIBILITY_SETTINGS };
    settingsRef.current = defaultSettings;
    setSettings(defaultSettings);
    applyAccessibilitySettings(defaultSettings);
    removeStoredAccessibilitySettings();
  }

  const panelTransition = settings.reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? "always" : "user"}>
      {children}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((isCurrentlyOpen) => !isCurrentlyOpen)}
        aria-label={isOpen ? "סגירת כלי נגישות" : "פתיחת כלי נגישות"}
        aria-expanded={isOpen}
        aria-controls="accessibility-tools-panel"
        className={`fixed bottom-5 left-5 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-[0_8px_24px_-4px_rgba(37,99,235,0.45)] transition-[transform,background-color,box-shadow] duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-[0_12px_28px_-4px_rgba(37,99,235,0.55)] ${CONTROL_FOCUS_STYLES}`}
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Accessibility className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={panelRef}
            id="accessibility-tools-panel"
            dir="rtl"
            role="dialog"
            aria-label="כלי נגישות"
            initial={
              settings.reduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={panelTransition}
            className="fixed bottom-20 left-5 z-[9999] max-h-[calc(100dvh-6.5rem)] w-[calc(100vw-2.5rem)] max-w-[350px] overflow-y-auto overscroll-contain rounded-[22px] border border-slate-200 bg-white shadow-[0_22px_60px_-18px_rgba(15,23,42,0.3)]"
          >
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-sm">
              <h2 className="text-base font-black text-slate-950">כלי נגישות</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                התאמת תצוגת האתר נשמרת באופן אוטומטי.
              </p>
            </div>

            <div className="space-y-3 p-4">
              <section aria-labelledby="accessibility-text-size-heading">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3
                    id="accessibility-text-size-heading"
                    className="text-xs font-extrabold text-slate-700"
                  >
                    גודל טקסט
                  </h3>
                  <output
                    aria-live="polite"
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700"
                  >
                    {TEXT_SIZE_PERCENT[settings.textSize]}
                  </output>
                </div>

                <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5">
                  {TEXT_SIZE_OPTIONS.map((option) => {
                    const active = settings.textSize === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={option.accessibleLabel}
                        aria-pressed={active}
                        onClick={() => setTextSize(option.value)}
                        className={`min-w-0 rounded-xl border px-1 py-2.5 text-xs font-black transition-colors duration-200 ${CONTROL_FOCUS_STYLES} ${
                          active
                            ? "border-blue-300 bg-white text-blue-700 shadow-[0_3px_10px_-6px_rgba(37,99,235,0.65)]"
                            : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white/80 hover:text-slate-800"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section aria-label="התאמות נוספות" className="space-y-2">
                {TOGGLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = settings[option.key];

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggle(option.key)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-extrabold transition-[color,background-color,border-color,box-shadow] duration-200 ${CONTROL_FOCUS_STYLES} ${
                        active
                          ? "border-blue-300 bg-blue-50 text-blue-700 shadow-[0_4px_14px_-10px_rgba(37,99,235,0.7)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                          active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>{option.label}</span>
                      <span
                        className={`me-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                        aria-hidden="true"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </section>

              <button
                type="button"
                onClick={handleReset}
                className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm font-extrabold text-rose-700 transition-colors duration-200 hover:border-rose-200 hover:bg-rose-100 ${CONTROL_FOCUS_STYLES}`}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                איפוס הגדרות
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
