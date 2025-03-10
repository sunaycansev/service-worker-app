export const registerServiceWorker = async (): Promise<void> => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      await navigator.serviceWorker.ready;

      if (registration.installing) {
        await new Promise<void>((resolve) => {
          registration.installing?.addEventListener("statechange", (e) => {
            if ((e.target as ServiceWorker).state === "activated") {
              resolve();
            }
          });
        });
      }

      console.log("Service worker active");

      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
      }

      if ("sync" in registration) {
        try {
          const syncRegistration = registration as ServiceWorkerRegistration;
          if (syncRegistration.sync) {
            await syncRegistration.sync.register("sync-todos");
            console.log("Background sync registered");
          }
        } catch (error) {
          console.error("Background sync registration failed:", error);
        }
      }
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  }
};
