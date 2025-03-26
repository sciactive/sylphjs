import { getNymphInstance } from '@sciactive/sylphjs-server';

const {
  nymph,
  tilmeld,
  User,
  Group,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
} = getNymphInstance();

export {
  nymph,
  tilmeld,
  User,
  Group,
  restMiddleware,
  tilmeldSetupMiddleware,
  corsMiddleware,
};
