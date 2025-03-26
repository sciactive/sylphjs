<svelte:head>
  <title>State - Sylph.js</title>
</svelte:head>

{#key $page.url.pathname}
  <SearchInput stuff={data} />
{/key}

<script lang="ts">
  import { page } from '$app/stores';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import type {
    StateObject as StateObjectClass,
    StateObjectData,
  } from '$lib/entities/StateObject';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>
