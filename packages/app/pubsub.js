import http from 'node:http';
import https from 'node:https';
import express from 'express';
import helmet from 'helmet';
import { server as WebSocketServer } from 'websocket';
import { PubSub } from '@nymphjs/pubsub';

import { pubSubConfig, WSPORT } from '@sciactive/sylphjs-server';

import './certs.js';

import { nymph } from './middleware.js';

if (process.env.MAINTENANCE_MODE) {
  console.log('Not loading pubsub, because of maintenance mode.');
} else {
  console.log('Loading pubsub...');

  const app = express();

  if (process.env.CERT) {
    app.use(
      helmet({
        // CSP is handled by SvelteKit.
        contentSecurityPolicy: false,
      }),
    );
  }

  let server;

  function createPubSub(server) {
    const wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false,
    });
    new PubSub(pubSubConfig, nymph, wsServer);
  }

  if (process.env.CERT) {
    const cert = process.env.CERT;
    const key = process.env.KEY;

    server = https.createServer({ cert, key }, app);
  } else {
    server = http.createServer(app);
  }

  createPubSub(
    server.listen(WSPORT, () => {
      console.log('Listening on ', WSPORT);
    }),
  );
}
