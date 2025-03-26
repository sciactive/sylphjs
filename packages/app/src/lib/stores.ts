import type {
  ClientConfig,
  CurrentUserData,
  User as UserClass,
} from '@nymphjs/tilmeld-client';
import type { PubSubSubscription } from '@nymphjs/client';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { SessionStuff } from '$lib/nymph';
import type {
  PushSubscriptionWeb as PushSubscriptionWebClass,
  PushSubscriptionWebData,
} from '$lib/entities/PushSubscriptionWeb';

export type Stores = {
  readyPromise: Writable<Promise<void>>;
  readonly readyPromiseResolve: () => void;
  readonly readyPromiseReject: (reason?: any) => void;
  user: Writable<(UserClass & CurrentUserData) | null | undefined>;
  clientConfig: Writable<ClientConfig>;
  tilmeldAdmin: Writable<boolean | undefined>;
  systemAdmin: Writable<boolean | undefined>;
  loading: Writable<boolean>;
  smallWindow: Writable<boolean>;
  miniWindow: Writable<boolean>;
  drawerAvailable: Writable<boolean>;
  drawerOpen: Writable<boolean>;
  notificationPermission: Writable<NotificationPermission | null | false>;
  readonly requestNotificationPermission: () => void;
  webPushSubscription: Writable<
    (PushSubscriptionWebClass & PushSubscriptionWebData) | null
  >;
};

export default function stores(stuff: Pick<SessionStuff, 'pubsub'>): Stores {
  const { pubsub } = stuff;

  let readyPromiseResolve: () => void;
  let readyPromiseReject: (reason?: any) => void;
  const readyPromise = writable<Promise<void>>(
    new Promise<void>((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    }),
  );
  const user = writable<(UserClass & CurrentUserData) | null | undefined>(
    undefined,
  );
  const clientConfig = writable<ClientConfig>({
    // Default values should be the most restrictive.
    allowRegistration: false,
    allowUsernameChange: false,
    emailUsernames: false,
    pwRecovery: false,
    regFields: [],
    unverifiedAccess: false,
    userFields: [],
    verifyEmail: false,
  });

  const tilmeldAdmin = writable<boolean | undefined>(undefined);
  const systemAdmin = writable<boolean | undefined>(undefined);

  // Global

  const loading = writable<boolean>(false);
  const smallWindow = writable<boolean>(false);
  const miniWindow = writable<boolean>(false);
  const drawerAvailable = writable<boolean>(true);
  const drawerOpen = writable<boolean>(false);

  let notificationPermission = writable<NotificationPermission | null | false>(
    typeof Notification !== 'undefined' ? Notification.permission : null,
  );
  let requestNotificationPermission = async () => {
    const promise = Notification.requestPermission((result) => {
      if (!promise) {
        notificationPermission.set(result);
      }
    });
    if (promise) {
      notificationPermission.set(await promise);
    }
  };

  let webPushSubscription = writable<
    (PushSubscriptionWebClass & PushSubscriptionWebData) | null
  >(null);

  let previousUser: (UserClass & CurrentUserData) | null | undefined =
    undefined;
  let userSubscription: PubSubSubscription<UserClass & CurrentUserData> | null =
    null;
  let firstStart = true;
  user.subscribe((userValue) => {
    if (userValue && !userValue.$is(previousUser)) {
      if (userSubscription) {
        userSubscription.unsubscribe();
      }
      userSubscription = pubsub.subscribeWith(userValue, (updatedUser) => {
        // Update the store to notify and re-render the Svelte components.
        user.set(updatedUser);
      });

      userValue
        .$gatekeeper('tilmeld/admin')
        .then((value) => tilmeldAdmin.set(value))
        .catch((e) => {
          console.error(e);
          tilmeldAdmin.set(false);
        });
      userValue
        .$gatekeeper('system/admin')
        .then((value) => systemAdmin.set(value))
        .catch((e) => {
          console.error(e);
          systemAdmin.set(false);
        });
    } else if (!userValue && (previousUser || firstStart)) {
      tilmeldAdmin.set(undefined);
      systemAdmin.set(undefined);
      webPushSubscription.set(null);

      if (userSubscription) {
        userSubscription.unsubscribe();
        userSubscription = null;
      }

      // As a last resort for the bug where logging out then logging in causes
      // strange issues, refresh the page on log out.
      if (!firstStart && typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    firstStart = false;
    previousUser = userValue;
  });

  return {
    readyPromise,
    get readyPromiseResolve() {
      return readyPromiseResolve;
    },
    get readyPromiseReject() {
      return readyPromiseReject;
    },
    user,
    clientConfig,
    tilmeldAdmin,
    systemAdmin,
    loading,
    smallWindow,
    miniWindow,
    drawerAvailable,
    drawerOpen,
    notificationPermission,
    requestNotificationPermission,
    webPushSubscription,
  };
}
