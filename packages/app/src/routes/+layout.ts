import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { browser, building } from '$app/environment';
import type { SessionStuff } from '$lib/nymph';
import { buildSessionStuff } from '$lib/nymph';
import type { LayoutLoad } from './$types';

export const prerender = false;

export const load: LayoutLoad = async ({ data, fetch }) => {
  let stuff =
    browser && !building
      ? (window as unknown as { sylphjs: SessionStuff | null }).sylphjs
      : null;

  const { PORT, DOMAIN, PROTO, WSPORT, WSDOMAIN, WSPROTO } = data;

  if (stuff == null) {
    const authCookiePattern = /(?:(?:^|.*;\s*)TILMELDAUTH\s*=\s*([^;]*).*$)/;
    const switchCookiePattern =
      /(?:(?:^|.*;\s*)TILMELDSWITCH\s*=\s*([^;]*).*$)/;

    let tokens: { xsrfToken?: string; token?: string; switchToken?: string } =
      data.tokens || {};

    if (
      !building &&
      typeof document !== 'undefined' &&
      document.cookie &&
      document.cookie.match(authCookiePattern)
    ) {
      const token = document.cookie.replace(authCookiePattern, '$1');
      if (token) {
        tokens.token = token;

        if (document.cookie.match(switchCookiePattern)) {
          const switchToken = document.cookie.replace(
            switchCookiePattern,
            '$1',
          );
          if (switchToken) {
            tokens.switchToken = switchToken;
          }
        }

        try {
          const base64Url = tokens.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const json =
            typeof atob === 'undefined'
              ? Buffer.from(base64, 'base64').toString('binary') // node
              : atob(base64); // browser
          const jwt = JSON.parse(json);

          tokens.xsrfToken = jwt.xsrfToken;
        } catch (e: any) {
          tokens = {};
        }
      }
    }

    stuff = buildSessionStuff(
      fetch,
      tokens,
      {
        PORT,
        DOMAIN,
        PROTO,
        WSPORT,
        WSDOMAIN,
        WSPROTO,
      },
      browser && !building,
    );

    if (browser && !building) {
      (window as unknown as { sylphjs: SessionStuff | null }).sylphjs = stuff;
    }
  }

  const { readyPromise, drawerAvailable } = stuff.stores;

  drawerAvailable.set(true);

  try {
    await get(readyPromise);
  } catch (e: any) {
    error(e?.status ?? 500, e?.body ?? e?.message ?? 'Internal server error');
  }

  return { ...stuff };
};
