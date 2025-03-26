import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { dashboards } = await parent();

  const dashboardsValue = get(dashboards);
  if (dashboardsValue.length) {
    redirect(307, `/dashboards/view/${dashboardsValue[0].guid}`);
  }

  redirect(307, `/dashboards/edit/+`);
};
