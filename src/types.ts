export interface ColorSettings {
  colors: string[];
  flashDuration: number;
  intervalDuration: number;
  sessionDuration: number | null;
  isInfinite: boolean;
}

export const DEFAULT_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"]; // Green, Blue, Yellow, Red

export const DEFAULT_SETTINGS: ColorSettings = {
  colors: DEFAULT_COLORS,
  flashDuration: 1000, // 1 second
  intervalDuration: 500, // 0.5 seconds
  sessionDuration: null,
  isInfinite: true,
};
