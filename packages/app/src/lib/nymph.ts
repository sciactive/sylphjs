import { get } from 'svelte/store';
import type { NymphOptions } from '@nymphjs/client';
import { Nymph, PubSub } from '@nymphjs/client';
import {
  User as UserClass,
  Group as GroupClass,
} from '@nymphjs/tilmeld-client';
import websocket from 'websocket';
import type { Stores } from '$lib/stores';
import stores from '$lib/stores';
import { Dashboard as DashboardClass } from '$lib/entities/Dashboard';
import { LogEntry as LogEntryClass } from '$lib/entities/LogEntry';
import { PushSubscriptionWeb as PushSubscriptionWebClass } from '$lib/entities/PushSubscriptionWeb';
import { StateObject as StateObjectClass } from '$lib/entities/StateObject';
import { urlBase64ToBuffer } from '$lib/utils/urlBase64';

export type SessionStuff = {
  nymph: Nymph;
  pubsub: PubSub;
  stores: Stores;
  DOMAIN: string;
  ADDRESS: string;
  User: typeof UserClass;
  Group: typeof GroupClass;
  Dashboard: typeof DashboardClass;
  LogEntry: typeof LogEntryClass;
  PushSubscriptionWeb: typeof PushSubscriptionWebClass;
  StateObject: typeof StateObjectClass;
};

const { w3cwebsocket } = websocket;

const nymphBuilder = (
  fetch: WindowOrWorkerGlobalScope['fetch'],
  {
    PORT = 5173,
    DOMAIN = 'localhost',
    PROTO = 'http',
    WSPORT = 8080,
    WSDOMAIN = 'localhost',
    WSPROTO = 'ws',
  }: {
    PORT?: number;
    DOMAIN?: string;
    PROTO?: string;
    WSPORT?: number;
    WSDOMAIN?: string;
    WSPROTO?: string;
  },
  browser: boolean = false,
) => {
  const EXT =
    (PROTO === 'https' && PORT === 443) || (PROTO === 'http' && PORT === 80)
      ? ''
      : `:${PORT}`;
  const WSEXT =
    (WSPROTO === 'wss' && WSPORT === 443) || (WSPROTO === 'ws' && WSPORT === 80)
      ? ''
      : `:${WSPORT}`;

  const ADDRESS = `${PROTO}://${DOMAIN}${EXT}`;
  const WSADDRESS = `${WSPROTO}://${WSDOMAIN}${WSEXT}`;

  const nymphOptions: NymphOptions = {
    restUrl: `${ADDRESS}/rest`,
    weakCache: true,
    pubsubUrl: WSADDRESS,
    WebSocket:
      typeof window !== 'undefined'
        ? window.WebSocket
        : (w3cwebsocket as unknown as typeof WebSocket),
    fetch,
    noAutoconnect: !browser,
    renewTokens: browser,
  };

  const nymph = new Nymph(nymphOptions);
  const pubsub = new PubSub(nymphOptions, nymph);

  const User = nymph.addEntityClass(UserClass);
  User.init(nymph);
  const Group = nymph.addEntityClass(GroupClass);
  const Dashboard = nymph.addEntityClass(DashboardClass);
  const LogEntry = nymph.addEntityClass(LogEntryClass);
  const PushSubscriptionWeb = nymph.addEntityClass(PushSubscriptionWebClass);
  const StateObject = nymph.addEntityClass(StateObjectClass);

  if (browser && typeof document !== 'undefined') {
    // Disconnect from PubSub if the browser window is minimized. This saves
    // resources, and push notifications are better for this anyway.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pubsub.close();
      } else {
        pubsub.connect();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange, false);
  }

  return {
    nymph,
    pubsub,
    User,
    Group,
    Dashboard,
    LogEntry,
    PushSubscriptionWeb,
    StateObject,
  };
};

export let buildSessionStuff = (
  fetch: WindowOrWorkerGlobalScope['fetch'],
  tokens: { xsrfToken?: string; token?: string; switchToken?: string },
  {
    PORT,
    DOMAIN,
    PROTO,
    WSPORT,
    WSDOMAIN,
    WSPROTO,
  }: {
    PORT?: number;
    DOMAIN?: string;
    PROTO?: string;
    WSPORT?: number;
    WSDOMAIN?: string;
    WSPROTO?: string;
  } = {},
  browser?: boolean,
): SessionStuff => {
  const {
    nymph,
    pubsub,
    User,
    Group,
    Dashboard,
    LogEntry,
    PushSubscriptionWeb,
    StateObject,
  } = nymphBuilder(
    fetch,
    { PORT, DOMAIN, PROTO, WSPORT, WSDOMAIN, WSPROTO },
    browser,
  );

  const EXT =
    (PROTO === 'https' && PORT === 443) || (PROTO === 'http' && PORT === 80)
      ? ''
      : `:${PORT}`;
  const ADDRESS = `${PROTO}://${DOMAIN}${EXT}`;

  if (tokens.xsrfToken && tokens.token) {
    nymph.headers['X-Xsrf-Token'] = tokens.xsrfToken;
    pubsub.authenticate(tokens.token, tokens.switchToken);
  }

  const myStores = stores({ pubsub });
  const {
    user,
    clientConfig,
    readyPromiseResolve,
    readyPromiseReject,
    notificationPermission,
    webPushSubscription,
  } = myStores;

  User.on('login', (currentUser) => {
    user.set(currentUser);
    setupSubscription(get(notificationPermission));
  });
  User.on('logout', () => {
    user.set(null);
  });
  Promise.all([
    User.getClientConfig().then((config) => clientConfig.set(config)),
    User.current().then((currentUser) => {
      user.set(currentUser);
      setupSubscription(get(notificationPermission));
    }),
  ])
    .then(() => readyPromiseResolve())
    .catch((e) => readyPromiseReject(e));

  // When notification permission is granted or determined, set up subscription.
  const setupSubscription = async (
    permission: NotificationPermission | null | false,
  ) => {
    if (
      !browser ||
      !('PushManager' in window) ||
      typeof ServiceWorkerRegistration === 'undefined' ||
      !('showNotification' in ServiceWorkerRegistration.prototype) ||
      !get(user) ||
      get(webPushSubscription) ||
      !permission ||
      permission !== 'granted'
    ) {
      return;
    }

    // Get service worker registration.
    const registration = await navigator.serviceWorker.ready;

    if (registration == null) {
      return null;
    }

    const getSubscription = async () => {
      return await registration.pushManager.getSubscription();
    };

    const pushSubscribe = async (
      subscriptionOptions: PushSubscriptionOptionsInit,
    ) => {
      try {
        const serviceWorker = registration.active;

        if (serviceWorker == null) {
          throw new Error('No active service worker!');
        }

        return await registration.pushManager.subscribe(subscriptionOptions);
      } catch (error: any) {
        throw new Error('Subscription failed: ' + error.message);
      }
    };

    // See if there is a subscription already.
    let subscription = await getSubscription();

    if (subscription) {
      try {
        const webPushSubscriptionServerCheck = await nymph.getEntity(
          {
            class: PushSubscriptionWeb,
          },
          {
            type: '&',
            equal: ['endpoint', subscription.endpoint],
          },
        );

        if (webPushSubscriptionServerCheck != null) {
          webPushSubscription.set(webPushSubscriptionServerCheck);
          return;
        }
      } catch (e: any) {
        if (e.status !== 404) {
          webPushSubscription.set(null);
          return;
        }
      }
    } else {
      try {
        // The vapid key from the server.
        const vapidPublicKey = await PushSubscriptionWeb.getVapidPublicKey();
        if (!vapidPublicKey) {
          throw new Error('VAPID key not returned by server!');
        }
        const convertedVapidKey = urlBase64ToBuffer(vapidPublicKey);

        // Make the subscription.
        subscription = await pushSubscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      } catch (e) {
        console.error('Push subscription failed: ' + e);
        webPushSubscription.set(null);
        return;
      }
    }

    if (subscription == null) {
      return;
    }

    // And push it up to the server.
    const subscriptionEntity = PushSubscriptionWeb.factorySync();
    const subscriptionData = JSON.parse(JSON.stringify(subscription));
    subscriptionEntity.endpoint = subscriptionData.endpoint;
    subscriptionEntity.keys = {
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth,
    };
    try {
      if (await subscriptionEntity.$save()) {
        webPushSubscription.set(subscriptionEntity);
      } else {
        webPushSubscription.set(null);
      }
    } catch (e: any) {
      webPushSubscription.set(null);
    }
  };
  notificationPermission.subscribe(setupSubscription);
  // Determine notification permission.
  if (browser) {
    if (
      !('PushManager' in window) ||
      !window.Notification ||
      typeof Notification.permission !== 'string' ||
      typeof ServiceWorkerRegistration === 'undefined' ||
      !('showNotification' in ServiceWorkerRegistration.prototype)
    ) {
      notificationPermission.set(false);
    } else {
      notificationPermission.set(Notification.permission);
    }
  }

  return {
    nymph,
    pubsub,
    stores: myStores,
    DOMAIN: DOMAIN || 'localhost',
    ADDRESS: ADDRESS || 'http://localhost:5173',
    User,
    Group,
    Dashboard,
    LogEntry,
    PushSubscriptionWeb,
    StateObject,
  };
};
