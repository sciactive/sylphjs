import { error } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import { Sorter } from '@nymphjs/sorter';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const data = await parent();
  const { nymph, pubsub, Dashboard, stores } = data;
  const { user } = stores;

  if (get(user) == null) {
    error(404, 'Not Found');
  }

  try {
    const subscribable = pubsub.subscribeEntities({ class: Dashboard });
    const dashboards = await nymph.getEntities({ class: Dashboard });
    const sorter = new Sorter(dashboards);
    sorter.sort('name');

    return {
      dashboards: writable(dashboards),
      subscribable,
    };
  } catch (e: any) {
    error(e?.status ?? 500, e?.body ?? e?.message ?? 'Internal server error');
  }
};
