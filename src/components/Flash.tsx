import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ColorSettings } from "../types";
import { decodeSettings, saveCurrentSettings } from "../utils";
import "./Flash.css";

export default function Flash() {
  const { settings: encodedSettings } = useParams<{ settings: string }>();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<ColorSettings | null>(null);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Initialize settings
  useEffect(() => {
    if (encodedSettings) {
      const decodedSettings = decodeSettings(encodedSettings);
      if (decodedSettings) {
        setSettings(decodedSettings);
        if (!decodedSettings.isInfinite && decodedSettings.sessionDuration) {
          setTimeRemaining(decodedSettings.sessionDuration);
        }
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [encodedSettings, navigate]);

  // Session timer
  useEffect(() => {
    if (!settings || settings.isInfinite || timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Save current settings before navigating back
          saveCurrentSettings(settings);
          navigate("/");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, timeRemaining, navigate]);

  // Color flashing logic
  useEffect(() => {
    if (!settings || settings.colors.length === 0) return;

    const flashCycle = () => {
      // Flash phase
      setIsFlashing(true);

      setTimeout(() => {
        // Interval phase (black screen or immediate next color if interval is 0)
        if (settings.intervalDuration > 0) {
          setIsFlashing(false);
          setTimeout(() => {
            // Move to next color after interval
            setCurrentColorIndex((prev) => (prev + 1) % settings.colors.length);
          }, settings.intervalDuration);
        } else {
          // No interval, immediately move to next color
          setCurrentColorIndex((prev) => (prev + 1) % settings.colors.length);
        }
      }, settings.flashDuration);
    };

    // Start first flash immediately
    flashCycle();

    // Continue flashing
    const interval = setInterval(flashCycle, settings.flashDuration + settings.intervalDuration);

    return () => clearInterval(interval);
  }, [settings]);

  const handleScreenTap = useCallback(() => {
    setShowExit(true);

    // Hide exit button after 3 seconds if not clicked
    setTimeout(() => {
      setShowExit(false);
    }, 3000);
  }, []);

  const handleExit = useCallback(() => {
    // Save current settings before navigating back
    if (settings) {
      saveCurrentSettings(settings);
    }
    navigate("/");
  }, [navigate, settings]);

  if (!settings) {
    return null;
  }

  const currentColor = settings.colors[currentColorIndex] || "#000000";
  const backgroundColor = isFlashing ? currentColor : "#000000";

  return (
    <div className="flash-screen" style={{ backgroundColor }} onClick={handleScreenTap} onTouchStart={handleScreenTap}>
      {timeRemaining !== null && <div className="timer">{Math.max(0, timeRemaining)}s</div>}

      {showExit && (
        <button className="exit-button" onClick={handleExit} aria-label="Exit flash session">
          ✕
        </button>
      )}
    </div>
  );
}
