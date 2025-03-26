import { error } from '@sveltejs/kit';
import { writable } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { nymph, PushSubscriptionWeb } = await parent();

  try {
    return {
      subscriptions: writable(
        await nymph.getEntities({
          class: PushSubscriptionWeb,
          sort: 'mdate',
          reverse: true,
        }),
      ),
    };
  } catch (e: any) {
    error(e?.status ?? 500, e?.body ?? e?.message ?? 'Internal server error');
  }
};
