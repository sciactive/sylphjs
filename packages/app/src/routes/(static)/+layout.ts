import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const data = await parent();
  const { stores } = data;
  const { drawerAvailable } = stores;

  drawerAvailable.set(false);

  return {};
};
