export const SERVER_PORT = Number(process.env.SERVER_PORT ?? 80);
export const PORT = Number(process.env.PORT ?? process.env.PROD_PORT ?? 5173);
export const DOMAIN = process.env.DOMAIN ?? 'localhost';
export const PROTO =
  process.env.CERT || process.env.CERT_FILE || PORT === 443 ? 'https' : 'http';
export const WSPORT = Number(
  process.env.WSPORT ?? process.env.PORT ?? process.env.PROD_PORT ?? 8080,
);
export const WSDOMAIN = process.env.WSDOMAIN ?? DOMAIN;
export const WSPROTO =
  process.env.CERT || process.env.CERT_FILE || WSPORT === 443 ? 'wss' : 'ws';

export const EXT =
  (PROTO === 'https' && PORT === 443) || (PROTO === 'http' && PORT === 80)
    ? ''
    : `:${PORT}`;
export const WSEXT =
  (WSPROTO === 'wss' && WSPORT === 443) || (WSPROTO === 'ws' && WSPORT === 80)
    ? ''
    : `:${WSPORT}`;

export const WEB_PUSH_VAPID_PUBLIC_KEY =
  process.env.WEB_PUSH_VAPID_PUBLIC_KEY ?? '';
export const WEB_PUSH_VAPID_PRIVATE_KEY =
  process.env.WEB_PUSH_VAPID_PRIVATE_KEY ?? '';

export const JWT_SECRET = process.env.JWT_SECRET ?? '';

export const ADDRESS = `${PROTO}://${DOMAIN}${EXT}`;
export const VAPID_SUBJECT =
  DOMAIN === 'localhost' || DOMAIN === '127.0.0.1'
    ? 'mailto:root@localhost'
    : ADDRESS;
export const WSADDRESS = `${WSPROTO}://${WSDOMAIN}${WSEXT}`;
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || DOMAIN;
