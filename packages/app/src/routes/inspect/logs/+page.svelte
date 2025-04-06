<svelte:head>
  <title>Logs - Sylph.js</title>
</svelte:head>

<div style="padding: 1em;">
  {#key $page.url.pathname}
    <div style="display: flex; align-items: end;">
      <SearchInput
        bind:queryType
        bind:query
        bind:aggregationType
        bind:aggregationAbsoluteTimeStart
        bind:aggregationAbsoluteTimeEnd
        bind:aggregationRelativeTimeStart
        bind:aggregationRelativeTimeEnd
        bind:aggregationTimeStep
        bind:aggregationChunksChunkLength
        bind:aggregationFormula
        onsubmit={() => search()}
        stuff={data}
      />
      <Button {disabled} onclick={() => search()}><Label>Search</Label></Button>
    </div>

    {#key failureMessage}
      {#if failureMessage}
        <div class="app-failure" role="alert">
          {failureMessage}
        </div>
      {/if}
    {/key}

    {#if entries != null}
      <pre>Found: {entries.length}
{JSON.stringify(entries, null, 2)}</pre>
    {:else if aggregateEntriesTime != null}
      <pre>{aggregateEntriesTimeIterator == null
          ? ''
          : 'Running...\n'}Found: {aggregateEntriesTime.length}
{JSON.stringify(aggregateEntriesTime, null, 2)}</pre>
    {:else if aggregateEntriesChunks != null}
      <pre>{aggregateEntriesChunksIterator == null
          ? ''
          : 'Running...\n'}Found: {aggregateEntriesChunks.length}
{JSON.stringify(aggregateEntriesChunks, null, 2)}</pre>
    {/if}
  {/key}
</div>

<script lang="ts">
  import { getContext } from 'svelte';
  import type { AbortableAsyncIterator } from '@nymphjs/client';
  import Button, { Label } from '@smui/button';
  import type Kitchen from '@smui/snackbar/kitchen';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import type {
    LogEntry as LogEntryClass,
    LogEntryData,
  } from '$lib/entities/LogEntry';
  import { parseLogEntrySearch } from '$lib/utils/parseSearch';
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let nymph = $derived(data.nymph);
  let LogEntry = $derived(data.LogEntry);

  let failureMessage: string | undefined = $state();
  let kitchen = getContext<Promise<Kitchen>>('kitchen');

  let queryType: 'aggregate' | 'select' = $state('aggregate');
  let query: string = $state(/*''*/ '<test>');
  let aggregationType: 'absolute-time' | 'relative-time' | 'chunks' =
    $state('absolute-time');
  let aggregationAbsoluteTimeStart: number = $state(
    (() => {
      return new Date('2025-03-31T08:00:00').getTime();
      // const date = new Date();
      // date.setHours(0, 0, 0);
      // return date.getTime();
    })(),
  );
  let aggregationAbsoluteTimeEnd: number = $state(
    (() => {
      return new Date('2025-03-31T09:00:00').getTime();
      // const date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
      // date.setHours(0, 0, 0);
      // return date.getTime();
    })(),
  );
  let aggregationRelativeTimeStart: string = $state('-1 day');
  let aggregationRelativeTimeEnd: string = $state('now');
  let aggregationTimeStep: number = $state(60 * 5);
  let aggregationChunksChunkLength: number = $state(10);
  let aggregationFormula: string = $state(
    /*'[entries.length]'*/ 'lo.sumBy(getEntries(), "rand")',
  );

  let disabled = $derived.by(() => {
    if (query === '') {
      return true;
    }
    // TODO: more disabled states
    return false;
  });

  let entries: (LogEntryClass & LogEntryData)[] | null = $state(null);
  let aggregateEntriesTimeIterator: AbortableAsyncIterator<{
    begin: number;
    end: number;
    value: number;
  }> | null = $state(null);
  let aggregateEntriesTime:
    | {
        begin: number;
        end: number;
        value: number;
      }[]
    | null = $state(null);
  let aggregateEntriesChunksIterator: AbortableAsyncIterator<{
    chunk: number;
    value: number;
  }> | null = $state(null);
  let aggregateEntriesChunks:
    | {
        chunk: number;
        value: number;
      }[]
    | null = $state(null);

  async function search() {
    if (disabled) {
      return;
    }

    // Clear current results.
    failureMessage = undefined;
    entries = null;
    if (aggregateEntriesTimeIterator) {
      aggregateEntriesTimeIterator.abortController.abort();
    }
    aggregateEntriesTimeIterator = null;
    aggregateEntriesTime = null;
    if (aggregateEntriesChunksIterator) {
      aggregateEntriesChunksIterator.abortController.abort();
    }
    aggregateEntriesChunksIterator = null;
    aggregateEntriesChunks = null;

    // Parse the search query.
    let [options, ...selectors] = parseLogEntrySearch(query, nymph);
    selectors = selectors.filter(
      (selector) => Object.keys(selector).length > 1,
    );

    // Run the query.
    if (queryType === 'select') {
      entries = await LogEntry.getLogs(options, ...selectors);
    } else if (queryType === 'aggregate') {
      if (aggregationType === 'absolute-time') {
        try {
          aggregateEntriesTimeIterator = await LogEntry.queryLogsTime({
            query: [options, ...selectors],
            formula: aggregationFormula,
            begin: aggregationAbsoluteTimeStart,
            end: aggregationAbsoluteTimeEnd,
            step: aggregationTimeStep,
          });

          aggregateEntriesTime = [];
          for await (let value of aggregateEntriesTimeIterator) {
            if (value instanceof Error) {
              throw value;
            }

            aggregateEntriesTime.push(value);
          }

          (await kitchen).push({
            label: `Query finished.`,
          });
        } catch (e: any) {
          failureMessage = e.message;
        }

        aggregateEntriesTimeIterator = null;
      } else if (aggregationType === 'relative-time') {
        try {
          aggregateEntriesTimeIterator = await LogEntry.queryLogsTime({
            query: [options, ...selectors],
            formula: aggregationFormula,
            begin: aggregationRelativeTimeStart,
            end: aggregationRelativeTimeEnd,
            step: aggregationTimeStep,
          });

          aggregateEntriesTime = [];
          for await (let value of aggregateEntriesTimeIterator) {
            if (value instanceof Error) {
              throw value;
            }

            aggregateEntriesTime.push(value);
          }

          (await kitchen).push({
            label: `Query finished.`,
          });
        } catch (e: any) {
          failureMessage = e.message;
        }

        aggregateEntriesTimeIterator = null;
      } else if (aggregationType === 'chunks') {
        try {
          aggregateEntriesChunksIterator = await LogEntry.queryLogsChunks({
            query: [options, ...selectors],
            formula: aggregationFormula,
            chunkLength: aggregationChunksChunkLength,
          });

          aggregateEntriesChunks = [];
          for await (let value of aggregateEntriesChunksIterator) {
            if (value instanceof Error) {
              throw value;
            }

            aggregateEntriesChunks.push(value);
          }

          (await kitchen).push({
            label: `Query finished.`,
          });
        } catch (e: any) {
          failureMessage = e.message;
        }

        aggregateEntriesChunksIterator = null;
      }
    }
  }
</script>
