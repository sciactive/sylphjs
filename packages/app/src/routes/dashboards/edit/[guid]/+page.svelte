<svelte:head>
  <title>{$dashboard.name || 'Unnamed Dashboard'} - Sylph.js</title>
</svelte:head>

{#key $page.url.pathname}
  <DashboardEdit {dashboard} stuff={data} />
{/key}

<script lang="ts">
  import { page } from '$app/stores';
  import DashboardEdit from '$lib/components/DashboardEdit.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const dashboard = $derived(data.dashboard);
</script>
