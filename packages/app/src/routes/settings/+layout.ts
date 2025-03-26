import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const { stores } = await parent();
  const { user } = stores;
  const userVal = get(user);

  if (userVal == null) {
    error(404, 'Not Found');
  }

  return {};
};
