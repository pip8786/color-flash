import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColorSettings, DEFAULT_SETTINGS } from "../types";
import { encodeSettings, getCurrentSettings, getHistory, saveCurrentSettings, saveToHistory } from "../utils";
import "./Home.css";

const PREDEFINED_COLORS = [
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Yellow", value: "#eab308" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
];

export default function Home() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ColorSettings>(() => {
    // Load saved settings or use defaults
    const saved = getCurrentSettings();
    return saved || DEFAULT_SETTINGS;
  });
  const [history, setHistory] = useState<ColorSettings[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleColorToggle = (color: string) => {
    const newSettings = {
      ...settings,
      colors: settings.colors.includes(color)
        ? settings.colors.filter((c) => c !== color)
        : [...settings.colors, color],
    };
    setSettings(newSettings);
    saveCurrentSettings(newSettings);
  };

  const handleDurationChange = (field: keyof ColorSettings, value: number) => {
    let newSettings;
    if (field === "sessionDuration") {
      newSettings = {
        ...settings,
        [field]: value,
        isInfinite: false,
      };
    } else {
      newSettings = {
        ...settings,
        [field]: value,
      };
    }
    setSettings(newSettings);
    saveCurrentSettings(newSettings);
  };

  const handleInfiniteToggle = () => {
    const newSettings = {
      ...settings,
      isInfinite: !settings.isInfinite,
      sessionDuration: settings.isInfinite ? 60 : null,
    };
    setSettings(newSettings);
    saveCurrentSettings(newSettings);
  };

  const handleStart = () => {
    if (settings.colors.length === 0) {
      alert("Please select at least one color");
      return;
    }

    saveToHistory(settings);
    const encoded = encodeSettings(settings);
    navigate(`/flash/${encoded}`);
  };

  const loadFromHistory = (historicalSettings: ColorSettings) => {
    setSettings(historicalSettings);
    saveCurrentSettings(historicalSettings);
  };

  const startFromHistory = (historicalSettings: ColorSettings) => {
    saveToHistory(historicalSettings);
    const encoded = encodeSettings(historicalSettings);
    navigate(`/flash/${encoded}`);
  };

  return (
    <div className="home">
      <div className="container">
        <h1>Color Flash</h1>

        <div className="settings-section">
          <h2>Colors</h2>
          <div className="color-grid">
            {PREDEFINED_COLORS.map((color) => (
              <button
                key={color.value}
                className={`color-button ${settings.colors.includes(color.value) ? "selected" : ""}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorToggle(color.value)}
                aria-label={`Toggle ${color.name}`}
              >
                <span className="color-name">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h2>Timing</h2>
          <div className="timing-controls">
            <div className="control-group">
              <label htmlFor="flash-duration">Flash Duration (ms)</label>
              <input
                id="flash-duration"
                type="number"
                min="100"
                max="10000"
                step="100"
                value={settings.flashDuration}
                onChange={(e) => handleDurationChange("flashDuration", parseInt(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label htmlFor="interval-duration">Interval Duration (ms)</label>
              <input
                id="interval-duration"
                type="number"
                min="0"
                max="5000"
                step="100"
                value={settings.intervalDuration}
                onChange={(e) => handleDurationChange("intervalDuration", parseInt(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={settings.isInfinite} onChange={handleInfiniteToggle} />
                Infinite Session
              </label>
            </div>

            {!settings.isInfinite && (
              <div className="control-group">
                <label htmlFor="session-duration">Session Duration (seconds)</label>
                <input
                  id="session-duration"
                  type="number"
                  min="5"
                  max="3600"
                  step="5"
                  value={settings.sessionDuration || 60}
                  onChange={(e) => handleDurationChange("sessionDuration", parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        <button className="start-button" onClick={handleStart}>
          Start Flash Session
        </button>

        {history.length > 0 && (
          <div className="settings-section">
            <h2>Recent Sessions</h2>
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item-container">
                  <button className="history-item" onClick={() => startFromHistory(item)}>
                    <div className="history-colors">
                      {item.colors.map((color, colorIndex) => (
                        <div key={colorIndex} className="history-color" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="history-details">
                      <span>{item.colors.length} colors</span>
                      <span>{item.flashDuration}ms flash</span>
                      <span>{item.intervalDuration}ms interval</span>
                      <span>{item.isInfinite ? "Infinite" : `${item.sessionDuration}s`}</span>
                    </div>
                  </button>
                  <button
                    className="load-settings-button"
                    onClick={() => loadFromHistory(item)}
                    title="Load settings without starting"
                  >
                    ⚙️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
