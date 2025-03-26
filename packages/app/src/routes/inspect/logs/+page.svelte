<svelte:head>
  <title>Logs - Sylph.js</title>
</svelte:head>

{#key $page.url.pathname}
  <SearchInput stuff={data} />
{/key}

<script lang="ts">
  import { page } from '$app/stores';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import type {
    LogEntry as LogEntryClass,
    LogEntryData,
  } from '$lib/entities/LogEntry';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>
