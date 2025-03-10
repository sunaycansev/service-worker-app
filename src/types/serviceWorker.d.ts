interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: SyncManager;
}

declare global {
  interface Window {
    ServiceWorkerRegistration: ServiceWorkerRegistration;
  }
}
