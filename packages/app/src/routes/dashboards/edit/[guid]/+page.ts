import { error } from '@sveltejs/kit';
import { writable } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { nymph, Dashboard } = await parent();

  try {
    if (params.guid === '+' || params.guid === ' ' || params.guid === '%20') {
      return { dashboard: writable(Dashboard.factorySync()) };
    }

    const dashboard = await nymph.getEntity(
      { class: Dashboard },
      { type: '&', guid: params.guid },
    );

    if (!dashboard) {
      error(404, 'Dashboard not found.');
    }

    await dashboard.$wakeAll(1);

    return { dashboard: writable(dashboard) };
  } catch (e: any) {
    error(e?.status ?? 500, e?.body ?? e?.message ?? 'Internal server error');
  }
};
