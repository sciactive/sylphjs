<svelte:head>
  <title>Logs - Sylph.js</title>
</svelte:head>

<div style="padding: 1em;">
  {#key $page.url.pathname}
    <div style="display: flex; align-items: end;">
      <SearchInput
        bind:value={searchInput}
        onsubmit={() => search()}
        stuff={data}
      />
      <Button onclick={() => search()}><Label>Search</Label></Button>
    </div>

    <pre>{entries ? `Found: ${entries.length}\n` : ''}{JSON.stringify(
        entries,
        null,
        2,
      )}</pre>
  {/key}
</div>

<script lang="ts">
  import { page } from '$app/stores';
  import Button, { Label } from '@smui/button';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import type {
    LogEntry as LogEntryClass,
    LogEntryData,
  } from '$lib/entities/LogEntry';
  import { parseLogEntrySearch } from '$lib/utils/parseSearch';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let nymph = $derived(data.nymph);
  let LogEntry = $derived(data.LogEntry);

  let searchInput = $state('');
  let entries: (LogEntryClass & LogEntryData)[] | null = $state(null);

  async function search() {
    let [options, ...selectors] = parseLogEntrySearch(searchInput, nymph);
    selectors = selectors.filter(
      (selector) => Object.keys(selector).length > 1,
    );

    entries = await LogEntry.getLogs(options, ...selectors);
  }
</script>
