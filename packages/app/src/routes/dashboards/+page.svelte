<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  // @ts-ignore
  const { dashboards } = $derived(data.dashboards);

  onMount(() => {
    if ($dashboards.length) {
      return goto(`/dashboards/view/${$dashboards[0].guid}`);
    }

    return goto(`/dashboards/edit/+`);
  });
</script>
