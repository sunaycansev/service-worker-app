import { useState, useEffect } from "react";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setHasInitialized(true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return hasInitialized ? isOnline : true;
};
