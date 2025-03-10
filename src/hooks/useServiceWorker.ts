import { useEffect, useState } from "react";
import {
  registerServiceWorker,
  unregisterServiceWorker,
} from "@/utils/serviceWorker";

export const useServiceWorker = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (
        typeof window !== "undefined" &&
        window.navigator &&
        "serviceWorker" in navigator
      ) {
        try {
          await registerServiceWorker();
          setIsReady(true);
        } catch (error) {
          console.error("Service worker registration failed:", error);
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    };

    init();

    return () => {
      if (isReady && typeof window !== "undefined") {
        unregisterServiceWorker();
      }
    };
  }, []);

  return isReady;
};
