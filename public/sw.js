/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2015" />

const CACHE_NAME = "todo-app-cache-v1";

const urlsToCache = ["/", "/manifest.json"];

const shouldCache = (url) => {
  if (!url.protocol.startsWith("http")) {
    return false;
  }

  if (url.origin !== self.location.origin) {
    return false;
  }

  return urlsToCache.includes(url.pathname);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  try {
    if (event.request.method !== "GET") {
      return;
    }

    const url = new URL(event.request.url);

    if (!shouldCache(url)) {
      return;
    }

    if (event.request.mode === "navigate") {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match("/") || Promise.reject("offline");
        })
      );
      return;
    }

    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((fetchResponse) => {
          if (
            !fetchResponse ||
            fetchResponse.status !== 200 ||
            fetchResponse.type !== "basic"
          ) {
            return fetchResponse;
          }

          const responseToCache = fetchResponse.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => {
              try {
                cache
                  .put(event.request, responseToCache)
                  .catch((err) => console.error("Cache put error:", err));
              } catch (err) {
                console.error("Cache error:", err);
              }
            })
            .catch((err) => console.error("Cache open error:", err));

          return fetchResponse;
        });
      })
    );
  } catch (error) {
    console.error("Service worker fetch error:", error);
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-todos") {
    event.waitUntil(syncTodos());
  }
});

self.addEventListener("push", (event) => {
  const options = {
    body: event?.data?.text() ?? "New todo notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  };

  event.waitUntil(self.registration.showNotification("Todo App", options));
});

async function syncTodos() {
  try {
    const todosToSync = await getTodosToSync();
    await Promise.all(
      todosToSync.map(async (todo) => {
        await fetch("/api/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(todo),
        });
      })
    );
  } catch (error) {
    console.error("Error syncing todos:", error);
  }
}

async function getTodosToSync() {
  return [];
}
