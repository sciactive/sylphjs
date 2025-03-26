import http from 'node:http';
import https from 'node:https';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';

import { PORT } from '@sciactive/sylphjs-server';

import './certs.js';

import { handler } from './build/handler.js';
import {
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
} from './middleware.js';

console.log('Loading server...');

const app = express();

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

if (process.env.CERT) {
  app.use(
    helmet({
      // CSP is handled by SvelteKit.
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
}

app.use(compression());

app.use('/rest', corsMiddleware);
app.use('/rest', restMiddleware);
app.use('/user', tilmeldSetupMiddleware);

app.use(handler);

let server;

if (process.env.CERT) {
  const cert = process.env.CERT;
  const key = process.env.KEY;
  const redirectPort = process.env.REDIRECT_PORT;

  server = https.createServer({ cert, key }, app);

  if (redirectPort) {
    const redirectApp = express();

    redirectApp.use((req, res, next) => {
      if (req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1') {
        // Skip redirection for local requests.
        return next();
      }

      // For remote requests, redirect to the secure app.
      return res.redirect('https://' + req.headers.host + req.url);
    });

    // Handle the request like normal for SSR connections.
    redirectApp.use(app);

    redirectApp.listen(Number(redirectPort));
  }
} else {
  server = http.createServer(app);
}

server.listen(PORT, () => {
  console.log('Listening on ', PORT);
});
