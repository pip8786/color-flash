export interface ColorSettings {
  colors: string[];
  flashDuration: number;
  intervalDuration: number;
  sessionDuration: number | null;
  isInfinite: boolean;
}

export const DEFAULT_COLORS = ["#3b82f6", "#ffffff", "#ef4444", "#eab308"]; // Blue, White, Red, Yellow

export const DEFAULT_SETTINGS: ColorSettings = {
  colors: DEFAULT_COLORS,
  flashDuration: 1000, // 1 second
  intervalDuration: 500, // 0.5 seconds
  sessionDuration: null,
  isInfinite: true,
};
