import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ColorSettings } from "../types";
import { queryParamsToSettings, saveCurrentSettings } from "../utils";
import "./Flash.css";

export default function Flash() {
  const navigate = useNavigate();
  const location = useLocation();

  const [settings, setSettings] = useState<ColorSettings | null>(null);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [wakeLock, setWakeLock] = useState<any>(null);

  // Initialize settings from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const decodedSettings = queryParamsToSettings(params.toString());

    if (decodedSettings) {
      setSettings(decodedSettings);
      if (!decodedSettings.isInfinite && decodedSettings.sessionDuration) {
        setTimeRemaining(decodedSettings.sessionDuration);
      }
    } else {
      // If no valid params, go back to home
      navigate("/");
    }
  }, [location.search, navigate]);

  // Wake Lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        // Request wake lock only
        if ("wakeLock" in navigator) {
          const lock = await (navigator as any).wakeLock.request("screen");
          setWakeLock(lock);

          // Listen for wake lock release
          lock.addEventListener("release", () => {
            console.log("Screen Wake Lock was released");
          });
        }
      } catch (error) {
        console.warn("Wake Lock not supported or failed:", error);
      }
    };

    // Only request wake lock when component mounts
    requestWakeLock();

    // Cleanup on unmount
    return () => {
      // Release wake lock
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
    };
  }, []); // Session timer
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

  const handleExit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling to the screen tap handler

      // Release wake lock before exit
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }

      // Exit fullscreen before navigation
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(console.warn);
      }

      // Save current settings before navigating back
      if (settings) {
        saveCurrentSettings(settings);
      }
      navigate("/");
    },
    [navigate, settings, wakeLock]
  );

  if (!settings) {
    return null;
  }

  const currentColor = settings.colors[currentColorIndex] || "#000000";
  const backgroundColor = isFlashing ? currentColor : "#000000";

  return (
    <div className="flash-screen" style={{ backgroundColor }} onClick={handleScreenTap} onTouchStart={handleScreenTap}>
      {timeRemaining !== null && <div className="timer">{Math.max(0, timeRemaining)}s</div>}

      {showExit && (
        <div className="controls-overlay">
          <button className="control-button exit-button" onClick={handleExit} aria-label="Exit flash session">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
