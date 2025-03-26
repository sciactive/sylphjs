import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { stores } = await parent();
  const { user } = stores;

  return {
    hasTOTPSecret: (await get(user)?.$hasTOTPSecret()) as boolean | null,
  };
};
