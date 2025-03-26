<AppDrawerLayout {stores}>
  {#snippet drawer()}
    <AppDrawerTabs routePrefix="/settings/" {tabs} />
  {/snippet}

  {@render children?.()}
</AppDrawerLayout>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { mdiTuneVerticalVariant, mdiBell } from '@mdi/js';
  import AppDrawerLayout from '$lib/components/AppDrawerLayout.svelte';
  import AppDrawerTabs, {
    type Tab,
  } from '$lib/components/AppDrawerTabs.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  let { stores } = data;

  const tabs: Tab[] = [
    {
      route: 'general',
      label: 'General',
      icon: mdiTuneVerticalVariant,
    },
    {
      route: 'notifications',
      label: 'Notifications',
      icon: mdiBell,
    },
  ];
</script>
