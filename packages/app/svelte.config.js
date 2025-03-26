import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import helmet from 'helmet';

import { ADDRESS, WSADDRESS, PROTO } from '@sciactive/sylphjs-server';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    csrf: {
      checkOrigin: false,
    },

    csp: {
      mode: 'auto',
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'default-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'img-src': ["'self'", 'data:'],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'data:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'", ADDRESS, WSADDRESS],
        ...(PROTO === 'https'
          ? {
              'block-all-mixed-content': true,
              'upgrade-insecure-requests': true,
            }
          : {
              'block-all-mixed-content': false,
              'upgrade-insecure-requests': false,
            }),
      },
    },
  },
};

export default config;
