import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import createServer from '@nymphjs/pubsub';
import type { PubSub } from '@nymphjs/pubsub';

import { pubSubConfig, WSPORT } from '@sciactive/sylphjs-server';

import {
  nymph,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
} from './middleware.js';

const nymphApp = (): Plugin => {
  let pubSubServer: PubSub | null = null;
  return {
    name: 'nymph-middleware',
    configureServer(server) {
      server.middlewares.use('/rest', corsMiddleware);
      server.middlewares.use('/rest', restMiddleware);
      server.middlewares.use('/user', tilmeldSetupMiddleware);
      if (pubSubServer) {
        pubSubServer.close();
      }
      pubSubServer = createServer(WSPORT, pubSubConfig, nymph);
    },
  };
};

export default defineConfig({
  server: {
    host: process.env.DOMAIN || 'localhost',
  },

  plugins: [nymphApp(), sveltekit()],
});
