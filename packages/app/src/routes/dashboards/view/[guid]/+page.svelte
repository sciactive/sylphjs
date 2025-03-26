<svelte:head>
  <title>{$dashboard.name || 'Unnamed Dashboard'} - Sylph.js</title>
</svelte:head>

{#key $page.url.pathname}
  <DashboardView {dashboard} />
{/key}

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PubSubSubscription } from '@nymphjs/client';
  import { page } from '$app/stores';
  import type { Dashboard, DashboardData } from '$lib/entities/Dashboard';
  import DashboardView from '$lib/components/DashboardView.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const pubsub = $derived(data.pubsub);
  const dashboard = $derived(data.dashboard);

  let subscription: PubSubSubscription<Dashboard & DashboardData>;

  // svelte-ignore state_referenced_locally
  let previousDashboard = $dashboard;
  $effect(() => {
    if ($dashboard.guid !== previousDashboard.guid) {
      subscribe();
      previousDashboard = $dashboard;
    }
  });

  onMount(subscribe);
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  function subscribe() {
    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = pubsub.subscribeWith(
      $dashboard,
      async (updatedDashboard) => {
        await updatedDashboard.$wakeAll(1);
        $dashboard = updatedDashboard;
      },
    );
  }
</script>
