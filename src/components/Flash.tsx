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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

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

  // Wake Lock management (no automatic fullscreen)
  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

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

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Only request wake lock when component mounts (no automatic fullscreen)
    requestWakeLock();

    // Cleanup on unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      
      // Exit fullscreen if active
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(console.warn);
      }

      // Release wake lock
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
    };
  }, []);

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

  const handleExit = useCallback((e: React.MouseEvent) => {
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
  }, [navigate, settings, wakeLock]);

  const toggleFullscreen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to the screen tap handler
    
    if (isIOS) {
      // iOS fallback: Toggle CSS-based pseudo-fullscreen
      setIsFullscreen(prev => !prev);
      
      // On iOS, we can encourage users to use "Add to Home Screen" for better fullscreen experience
      if (!isFullscreen) {
        // Show a brief instruction for iOS users
        console.log("iOS detected: For best fullscreen experience, add this page to your home screen");
      }
    } else {
      // Standard fullscreen API for other browsers
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen toggle failed:", error);
        // Fallback to CSS-based fullscreen if standard API fails
        setIsFullscreen(prev => !prev);
      }
    }
  }, [isIOS, isFullscreen]);

  if (!settings) {
    return null;
  }

  const currentColor = settings.colors[currentColorIndex] || "#000000";
  const backgroundColor = isFlashing ? currentColor : "#000000";

  return (
    <div 
      className={`flash-screen ${isFullscreen ? 'pseudo-fullscreen' : ''}`} 
      style={{ backgroundColor }} 
      onClick={handleScreenTap} 
      onTouchStart={handleScreenTap}
    >
      {timeRemaining !== null && <div className="timer">{Math.max(0, timeRemaining)}s</div>}

      {showExit && (
        <div className="controls-overlay">
          <button
            className="control-button fullscreen-button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          >
            {isIOS ? (isFullscreen ? "↶" : "⛶") : (isFullscreen ? "⤓" : "⤢")}
          </button>
          <button className="control-button exit-button" onClick={handleExit} aria-label="Exit flash session">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
