import { ColorSettings } from "./types";

const STORAGE_KEY = "color-flash-history";
const CURRENT_SETTINGS_KEY = "color-flash-current-settings";
const MAX_HISTORY = 10;

export const saveToHistory = (settings: ColorSettings): void => {
  try {
    const history = getHistory();
    const settingsString = JSON.stringify(settings);

    // Remove if already exists
    const filtered = history.filter((item) => JSON.stringify(item) !== settingsString);

    // Add to beginning
    const newHistory = [settings, ...filtered].slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

export const getHistory = (): ColorSettings[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
  }
  return [];
};

export const encodeSettings = (settings: ColorSettings): string => {
  const encoded = btoa(JSON.stringify(settings));
  return encoded;
};

export const decodeSettings = (encoded: string): ColorSettings | null => {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Failed to decode settings:", error);
    return null;
  }
};

// New query parameter functions
export const settingsToQueryParams = (settings: ColorSettings): string => {
  const params = new URLSearchParams();

  // Colors as letters: g=green, b=blue, y=yellow, r=red, p=purple, k=pink, o=orange, c=cyan
  const colorMap: { [key: string]: string } = {
    "#22c55e": "g", // green
    "#3b82f6": "b", // blue
    "#eab308": "y", // yellow
    "#ef4444": "r", // red
    "#a855f7": "p", // purple
    "#ec4899": "k", // pink
    "#f97316": "o", // orange
    "#06b6d4": "c", // cyan
  };

  const colorLetters = settings.colors
    .map((color) => colorMap[color] || "")
    .filter(Boolean)
    .join("");
  if (colorLetters) params.set("c", colorLetters);

  params.set("f", settings.flashDuration.toString());

  if (settings.intervalDuration > 0) {
    params.set("i", settings.intervalDuration.toString());
  }

  params.set("inf", settings.isInfinite.toString());

  if (!settings.isInfinite && settings.sessionDuration) {
    params.set("dur", settings.sessionDuration.toString());
  }

  return params.toString();
};

export const queryParamsToSettings = (queryString: string): ColorSettings | null => {
  try {
    const params = new URLSearchParams(queryString);

    // Color mapping
    const colorMap: { [key: string]: string } = {
      g: "#22c55e", // green
      b: "#3b82f6", // blue
      y: "#eab308", // yellow
      r: "#ef4444", // red
      p: "#a855f7", // purple
      k: "#ec4899", // pink
      o: "#f97316", // orange
      c: "#06b6d4", // cyan
    };

    const colorLetters = params.get("c") || "";
    const colors = colorLetters
      .split("")
      .map((letter) => colorMap[letter])
      .filter(Boolean);

    if (colors.length === 0) {
      return null; // Invalid if no colors
    }

    const flashDuration = parseInt(params.get("f") || "1000");
    const intervalDuration = parseInt(params.get("i") || "0");
    const isInfinite = params.get("inf") === "true";
    const sessionDuration = parseInt(params.get("dur") || "60");

    return {
      colors,
      flashDuration,
      intervalDuration,
      isInfinite,
      sessionDuration: isInfinite ? null : sessionDuration,
    };
  } catch (error) {
    console.warn("Failed to parse query parameters:", error);
    return null;
  }
};

export const saveCurrentSettings = (settings: ColorSettings): void => {
  try {
    localStorage.setItem(CURRENT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save current settings:", error);
  }
};

export const getCurrentSettings = (): ColorSettings | null => {
  try {
    const stored = localStorage.getItem(CURRENT_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load current settings:", error);
  }
  return null;
};
