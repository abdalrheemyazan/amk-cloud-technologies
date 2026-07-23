export const ACCESSIBILITY_STORAGE_KEY = "amk-accessibility-settings";
export const ACCESSIBILITY_SETTINGS_VERSION = 1;

export type TextSize = "small" | "normal" | "large" | "xlarge";

export type AccessibilitySettings = {
  textSize: TextSize;
  highContrast: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  reduceMotion: boolean;
  grayscale: boolean;
  keyboardFocus: boolean;
  lineSpacing: boolean;
  letterSpacing: boolean;
};

export type AccessibilityToggleKey = Exclude<keyof AccessibilitySettings, "textSize">;

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  textSize: "normal",
  highContrast: false,
  highlightLinks: false,
  readableFont: false,
  reduceMotion: false,
  grayscale: false,
  keyboardFocus: false,
  lineSpacing: false,
  letterSpacing: false,
};

export const TEXT_SIZE_PERCENT: Record<TextSize, string> = {
  small: "95%",
  normal: "100%",
  large: "112%",
  xlarge: "128%",
};

const ROOT_CLASSES = {
  smallText: "a11y-text-small",
  largeText: "a11y-text-large",
  xlargeText: "a11y-text-xlarge",
  highContrast: "a11y-high-contrast",
  highlightLinks: "a11y-highlight-links",
  readableFont: "a11y-readable-font",
  reduceMotion: "a11y-reduce-motion",
  grayscale: "a11y-grayscale",
  keyboardFocus: "a11y-keyboard-focus",
  lineSpacing: "a11y-line-spacing",
  letterSpacing: "a11y-letter-spacing",
} as const;

const ALL_ROOT_CLASSES = Object.values(ROOT_CLASSES);
const LEGACY_ROOT_CLASSES = [
  "accessibility-large-text",
  "accessibility-xlarge-text",
  "accessibility-high-contrast",
  "accessibility-highlight-links",
  "accessibility-readable-font",
  "accessibility-reduce-motion",
  "accessibility-grayscale",
  "accessibility-keyboard-focus",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeAccessibilitySettings(value: unknown): AccessibilitySettings {
  const parsedValue = isRecord(value) && isRecord(value.settings) ? value.settings : value;
  const source = isRecord(parsedValue) ? parsedValue : {};
  const textSize = source.textSize;

  return {
    textSize:
      textSize === "small" ||
      textSize === "large" ||
      textSize === "xlarge" ||
      textSize === "normal"
        ? textSize
        : "normal",
    highContrast: source.highContrast === true,
    highlightLinks: source.highlightLinks === true,
    readableFont: source.readableFont === true,
    reduceMotion: source.reduceMotion === true,
    grayscale: source.grayscale === true,
    keyboardFocus: source.keyboardFocus === true,
    lineSpacing: source.lineSpacing === true,
    letterSpacing: source.letterSpacing === true,
  };
}

export function readAccessibilitySettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY_SETTINGS;

  try {
    const storedValue = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    return storedValue
      ? normalizeAccessibilitySettings(JSON.parse(storedValue))
      : DEFAULT_ACCESSIBILITY_SETTINGS;
  } catch {
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

export function writeAccessibilitySettings(settings: AccessibilitySettings) {
  try {
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify({
        version: ACCESSIBILITY_SETTINGS_VERSION,
        settings,
      }),
    );
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export function removeStoredAccessibilitySettings() {
  try {
    window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export function applyAccessibilitySettings(settings: AccessibilitySettings) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const activeClasses: string[] = [];

  if (settings.textSize === "small") activeClasses.push(ROOT_CLASSES.smallText);
  if (settings.textSize === "large") activeClasses.push(ROOT_CLASSES.largeText);
  if (settings.textSize === "xlarge") activeClasses.push(ROOT_CLASSES.xlargeText);
  if (settings.highContrast) activeClasses.push(ROOT_CLASSES.highContrast);
  if (settings.highlightLinks) activeClasses.push(ROOT_CLASSES.highlightLinks);
  if (settings.readableFont) activeClasses.push(ROOT_CLASSES.readableFont);
  if (settings.reduceMotion) activeClasses.push(ROOT_CLASSES.reduceMotion);
  if (settings.grayscale) activeClasses.push(ROOT_CLASSES.grayscale);
  if (settings.keyboardFocus) activeClasses.push(ROOT_CLASSES.keyboardFocus);
  if (settings.lineSpacing) activeClasses.push(ROOT_CLASSES.lineSpacing);
  if (settings.letterSpacing) activeClasses.push(ROOT_CLASSES.letterSpacing);

  root.classList.remove(...ALL_ROOT_CLASSES, ...LEGACY_ROOT_CLASSES);
  root.classList.add(...activeClasses);
  root.dataset.accessibilityTextSize = settings.textSize;
}

const bootstrapClassMap = JSON.stringify(ROOT_CLASSES);
const bootstrapClassList = JSON.stringify(ALL_ROOT_CLASSES);
const bootstrapLegacyClassList = JSON.stringify(LEGACY_ROOT_CLASSES);
const bootstrapStorageKey = JSON.stringify(ACCESSIBILITY_STORAGE_KEY);

export const ACCESSIBILITY_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const raw = window.localStorage.getItem(${bootstrapStorageKey});
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const value = parsed && typeof parsed === "object" && parsed.settings ? parsed.settings : parsed;
    if (!value || typeof value !== "object") return;
    const root = document.documentElement;
    const classes = ${bootstrapClassMap};
    const allClasses = ${bootstrapClassList};
    const legacyClasses = ${bootstrapLegacyClassList};
    const active = [];
    const textSize = ["small", "normal", "large", "xlarge"].includes(value.textSize) ? value.textSize : "normal";
    if (textSize === "small") active.push(classes.smallText);
    if (textSize === "large") active.push(classes.largeText);
    if (textSize === "xlarge") active.push(classes.xlargeText);
    if (value.highContrast === true) active.push(classes.highContrast);
    if (value.highlightLinks === true) active.push(classes.highlightLinks);
    if (value.readableFont === true) active.push(classes.readableFont);
    if (value.reduceMotion === true) active.push(classes.reduceMotion);
    if (value.grayscale === true) active.push(classes.grayscale);
    if (value.keyboardFocus === true) active.push(classes.keyboardFocus);
    if (value.lineSpacing === true) active.push(classes.lineSpacing);
    if (value.letterSpacing === true) active.push(classes.letterSpacing);
    root.classList.remove(...allClasses, ...legacyClasses);
    root.classList.add(...active);
    root.dataset.accessibilityTextSize = textSize;
  } catch {}
})();`;
