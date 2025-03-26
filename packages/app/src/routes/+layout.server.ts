import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ cookies, route }) => {
  if (route.id == null) {
    error(404, 'Not found.');
  }

  if (env.MAINTENANCE_MODE) {
    error(503, env.MAINTENANCE_MODE);
  }

  const PORT = Number(env.PORT ?? env.PROD_PORT ?? 5173);
  const DOMAIN = env.DOMAIN ?? 'localhost';
  const PROTO = env.CERT || PORT === 443 ? 'https' : 'http';
  const WSPORT = Number(env.WSPORT ?? env.PORT ?? env.PROD_PORT ?? 8080);
  const WSDOMAIN = env.WSDOMAIN ?? DOMAIN;
  const WSPROTO = env.CERT || WSPORT === 443 ? 'wss' : 'ws';

  const EXT =
    (PROTO === 'https' && PORT === 443) || (PROTO === 'http' && PORT === 80)
      ? ''
      : `:${PORT}`;
  const ADDRESS = `${PROTO}://${DOMAIN}${EXT}`;

  const authCookie = cookies.get('TILMELDAUTH');
  let tokens: { xsrfToken?: string; token?: string } = {};

  if (authCookie) {
    tokens.token = authCookie;

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

  return {
    tokens,
    PORT,
    DOMAIN,
    PROTO,
    WSPORT,
    WSDOMAIN,
    WSPROTO,
    ADDRESS,
  };
};
