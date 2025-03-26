/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files, // everything in `static`
];

self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname);
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      return cache.match(event.request);
    }
  }

  event.respondWith(respond());
});

// Web push notifications

self.addEventListener('push', (event) => {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const payload = event.data.json();

  const promiseChain = isClientFocused().then((clientIsFocused) => {
    if (clientIsFocused && !payload.tag.startsWith('system/')) {
      // No need to show a notification.
      return;
    }

    return sendNotification(
      payload.title,
      payload.body,
      !!payload.guid,
      payload.guid
        ? '' + payload.guid + '/' + (payload.labels || []).join('/')
        : payload.tag,
      payload.timestamp,
    );
  });
  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  if (notification.tag.startsWith('system/')) {
    return;
  }

  const [guid, ...labels] = notification.tag.split('/');

  event.waitUntil(openDashboard(guid));
});

// Utility functions

function isClientFocused() {
  return clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let clientIsFocused = false;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.focused) {
          clientIsFocused = true;
          break;
        }
      }

      return clientIsFocused;
    });
}

function sendNotification(title, body, renotify, tag, timestamp) {
  return self.registration.showNotification(title, {
    body,
    badge: '/icon/badge-72x72.png?v=8347g3f5',
    icon: '/icon/android-icon-192x192.png?v=8347g3f5',
    renotify,
    tag,
    timestamp: timestamp || Date.now(),
  });
}

function openDashboard(guid) {
  const urlsToLookFor = [];

  urlsToLookFor.push(
    new URL(
      `/dashboards/view/${encodeURIComponent(guid)}`,
      self.location.origin,
    ).href,
  );

  return clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (urlsToLookFor.indexOf(windowClient.url) !== -1) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlsToLookFor[0]);
      }
    });
}
