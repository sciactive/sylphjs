import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const data = await parent();
  const { stores } = data;
  const { user } = stores;

  if (get(user) == null) {
    error(404, 'Not Found');
  }

  return {};
};
