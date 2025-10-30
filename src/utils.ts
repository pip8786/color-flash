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
