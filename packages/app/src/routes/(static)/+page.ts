import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();
  const { stores } = data;
  const { readyPromise, user } = stores;
  await get(readyPromise);

  if (get(user) != null) {
    redirect(302, `/inspect/logs/`);
  }

  return {};
};
