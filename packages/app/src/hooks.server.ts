import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event }) => {
  console.error('Unexpected Error: ', error);
  console.error('Error Occurred from Event: ', event);
};
