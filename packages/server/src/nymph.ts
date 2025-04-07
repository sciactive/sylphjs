import type { NymphDriver } from '@nymphjs/nymph';
import { Nymph } from '@nymphjs/nymph';
import { PubSub } from '@nymphjs/pubsub';
import { MySQLDriver } from '@nymphjs/driver-mysql';
import { PostgreSQLDriver } from '@nymphjs/driver-postgresql';
import { SQLite3Driver } from '@nymphjs/driver-sqlite3';
import {
  Tilmeld,
  User as UserClass,
  Group as GroupClass,
} from '@nymphjs/tilmeld';
import createServer from '@nymphjs/server';
import setup from '@nymphjs/tilmeld-setup';
import type { Express } from 'express';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';

import { Dashboard as DashboardClass } from './entities/Dashboard.js';
import { LogEntry as LogEntryClass } from './entities/LogEntry.js';
import { StateObject as StateObjectClass } from './entities/StateObject.js';
import { PushSubscriptionWeb as PushSubscriptionWebClass } from './entities/PushSubscriptionWeb.js';

import './certs.js';

import {
  EXT,
  WEB_PUSH_VAPID_PUBLIC_KEY,
  WEB_PUSH_VAPID_PRIVATE_KEY,
  JWT_SECRET,
  ADDRESS,
  WSADDRESS,
  COOKIE_DOMAIN,
} from './environment.js';

export * from './environment.js';

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = Number(process.env.MYSQL_PORT ?? 3306);
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? 'sylphjs';
const MYSQL_USER = process.env.MYSQL_USER ?? 'sylphjs';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_CA_CERT = process.env.MYSQL_CA_CERT;

const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT ?? 5432);
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE ?? 'sylphjs';
const POSTGRES_USER = process.env.POSTGRES_USER ?? 'sylphjs';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;

const SQLITE_FILENAME = process.env.SQLITE_FILENAME;

export type NymphInstance = {
  nymph: Nymph;
  tilmeld: Tilmeld;
  User: typeof UserClass;
  Group: typeof GroupClass;
  Dashboard: typeof DashboardClass;
  LogEntry: typeof LogEntryClass;
  StateObject: typeof StateObjectClass;
  PushSubscriptionWeb: typeof PushSubscriptionWebClass;
  restMiddleware: Express;
  tilmeldSetupMiddleware: Express;
  corsMiddleware: Express;
};

const FLATPAK_IDE_ENV = process.env.FLATPAK_IDE_ENV == '1';

const PUBSUB_ENTRIES = process.env.PUBSUB_ENTRIES || WSADDRESS;
const PUBSUB_RELAYS = process.env.PUBSUB_RELAYS || '';

// Allow all local connections.
const allowlist = [
  ADDRESS,
  `http://127.0.0.1${EXT}`,
  `https://127.0.0.1${EXT}`,
  `http://localhost${EXT}`,
  `https://localhost${EXT}`,
  `http://[::1]${EXT}`,
  `https://[::1]${EXT}`,
  `http://[0:0:0:0:0:0:0:1]${EXT}`,
  `https://[0:0:0:0:0:0:0:1]${EXT}`,
];
const corsOptions: CorsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (
      !origin ||
      allowlist.indexOf(origin) !== -1 ||
      origin.startsWith('http://127.') ||
      origin.startsWith('https://127.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('https://10.') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('https://192.168.')
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
};

if (
  !FLATPAK_IDE_ENV &&
  process.env.NODE_ENV === 'production' &&
  process.env.npm_lifecycle_event !== 'build' &&
  (!WEB_PUSH_VAPID_PUBLIC_KEY || !WEB_PUSH_VAPID_PRIVATE_KEY)
) {
  console.error('VAPID keys not set!');
  process.exit(1);
}

export const pubSubConfig = {
  originIsAllowed: (origin?: string) => {
    const allowed =
      !origin || // Happens when accessing from Node.js during SSR.
      origin === ADDRESS ||
      origin.startsWith(ADDRESS + (ADDRESS.endsWith('/') ? '' : '/'));

    if (!allowed) {
      console.info(`PubSub origin disallowed: ${origin}`);
    }

    return allowed;
  },
  entries: PUBSUB_ENTRIES.split(',').filter((s) => !!s),
  relays: PUBSUB_RELAYS.split(',').filter((s) => !!s),
};

export function getNymphInstance(): NymphInstance {
  let nymph: Nymph = null as unknown as Nymph;
  let tilmeld: Tilmeld = null as unknown as Tilmeld;
  let driver: NymphDriver = null as unknown as NymphDriver;
  let User = UserClass;
  let Group = GroupClass;
  let Dashboard = DashboardClass;
  let LogEntry = LogEntryClass;
  let StateObject = StateObjectClass;
  let PushSubscriptionWeb = PushSubscriptionWebClass;
  let restMiddleware: Express = express();
  let tilmeldSetupMiddleware: Express = express();
  let corsMiddleware = cors(corsOptions) as unknown as Express;

  if (!FLATPAK_IDE_ENV) {
    if (MYSQL_HOST != null && MYSQL_PASSWORD != null) {
      driver = new MySQLDriver({
        customPoolConfig: {
          host: MYSQL_HOST,
          port: MYSQL_PORT,
          user: MYSQL_USER,
          password: MYSQL_PASSWORD,
          database: MYSQL_DATABASE,
          ssl: {
            minVersion: 'TLSv1.2',
            ...(MYSQL_CA_CERT ? { ca: MYSQL_CA_CERT } : {}),
          },
          connectionLimit: 100,
          connectTimeout: 60 * 60 * 1000,
          enableKeepAlive: true,
        },
      });
    } else if (POSTGRES_HOST != null && POSTGRES_PASSWORD != null) {
      driver = new PostgreSQLDriver({
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DATABASE,

        customPoolConfig: {
          host: POSTGRES_HOST,
          port: POSTGRES_PORT,
          user: POSTGRES_USER,
          password: POSTGRES_PASSWORD,
          database: POSTGRES_DATABASE,
          max: 100,
          connectionTimeoutMillis: 2 * 60 * 1000,
        },
      });
    } else if (SQLITE_FILENAME != null) {
      driver = new SQLite3Driver({
        filename: SQLITE_FILENAME,
        wal: true,
        timeout: 30000,
      });
    } else {
      console.error('No DB configured.');
      process.exit(1);
    }

    tilmeld = new Tilmeld({
      appName: 'Sylph.js',
      appUrl: ADDRESS,
      cookieDomain: COOKIE_DOMAIN,
      cookiePath: '/',
      setupPath: '/user',
      emailUsernames: false,
      allowUsernameChange: false,
      userFields: ['name'],
      regFields: ['name'],
      verifyEmail: false,
      jwtSecret: JWT_SECRET,
      allowRegistration: false,
    });

    nymph = new Nymph(
      {
        cache: false,
      },
      driver,
      tilmeld,
    );
    PubSub.initPublisher(pubSubConfig, nymph);

    Dashboard = nymph.addEntityClass(DashboardClass);
    LogEntry = nymph.addEntityClass(LogEntryClass);
    StateObject = nymph.addEntityClass(StateObjectClass);
    PushSubscriptionWeb = nymph.addEntityClass(PushSubscriptionWebClass);

    User = tilmeld.User;
    Group = tilmeld.Group;

    nymph.getEntity({ class: User }).then(async (user) => {
      if (user != null) {
        return;
      }
      user = await User.factory();
      user.enabled = true;
      user.username = 'admin';
      user.nameFirst = 'Admin';
      user.nameLast = 'User';
      user.abilities = ['system/admin'];
      user.$password('password');

      if (await user.$saveSkipAC()) {
        console.log('Created admin user.');
      }
    });

    restMiddleware = createServer(nymph, { jsonOptions: { limit: '25mb' } });
    tilmeldSetupMiddleware = setup(
      {
        restUrl: `${ADDRESS}/rest`,
      },
      nymph,
    );
  }

  return {
    nymph,
    tilmeld,
    User,
    Group,
    Dashboard,
    LogEntry,
    StateObject,
    PushSubscriptionWeb,
    restMiddleware,
    tilmeldSetupMiddleware,
    corsMiddleware,
  };
}
