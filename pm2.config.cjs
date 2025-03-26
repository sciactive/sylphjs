require('dotenv').config();
const fs = require('fs');
const path = require('path');

const vars = {
  DOMAIN: process.env.DOMAIN,
  ORIGIN: process.env.ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET,
  WEB_PUSH_VAPID_PUBLIC_KEY: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
  WEB_PUSH_VAPID_PRIVATE_KEY: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
  SERVER_PORT: process.env.SERVER_PORT,
  PROD_PORT: process.env.PROD_PORT,
  PORT: process.env.PORT,
  REDIRECT_PORT: process.env.REDIRECT_PORT,
  WSPORT: process.env.WSPORT,
  PUBSUB_ENTRIES: process.env.PUBSUB_ENTRIES,
  PUBSUB_RELAYS: process.env.PUBSUB_RELAYS,
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_CA_CERT: process.env.MYSQL_CA_CERT_FILE
    ? fs.readFileSync(process.env.MYSQL_CA_CERT_FILE, 'utf8')
    : null,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
};

const apps = [];

if (process.env.SYLPHJS_APP) {
  apps.push({
    name: 'app',
    cwd: path.resolve(__dirname, 'packages', 'app'),
    script: 'server.js',
    exec_mode: 'cluster',
    instances: 24,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      CERT: fs.readFileSync(process.env.CERT_FILE, 'utf8'),
      KEY: fs.readFileSync(process.env.KEY_FILE, 'utf8'),
      ...vars,
    },
  });
}

if (process.env.SYLPHJS_PUBSUB) {
  apps.push({
    name: 'pubsub',
    cwd: path.resolve(__dirname, 'packages', 'app'),
    script: 'pubsub.js',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      CERT: fs.readFileSync(process.env.CERT_FILE, 'utf8'),
      KEY: fs.readFileSync(process.env.KEY_FILE, 'utf8'),
      ...vars,
    },
  });
}

if (process.env.SYLPHJS_SERVER) {
  apps.push({
    name: 'server',
    cwd: path.resolve(__dirname, 'packages', 'server'),
    script: 'dist/server.js',
    exec_mode: 'cluster',
    instances: 24,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      ...vars,
    },
  });
}

module.exports = {
  apps,
};
