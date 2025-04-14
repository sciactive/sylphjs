<svelte:head>
  <title>Logs - Sylph.js</title>
</svelte:head>

<div style="padding: 1em;">
  {#key $page.url.pathname}
    <div style="display: flex; flex-direction: column; gap: 1em;">
      <div
        style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em;"
      >
        <div class="mdc-typography--headline6" style="padding: 0; margin: 0;">
          Queries:
        </div>
        <div>
          <IconButton onclick={addQuery}>
            <Icon tag="svg" viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiPlus} />
            </Icon>
          </IconButton>
        </div>
      </div>
      <div>
        {#if queries.length}
          <Accordion>
            {#each queries as query, i}
              <Panel>
                <Header>{query.label}</Header>
                <Content>
                  <div style="display: flex; flex-direction: column; gap: 1em;">
                    <SearchInput bind:query={queries[i]} stuff={data} />
                    <div style="text-align: end;">
                      <Button onclick={() => removeQuery(i)}>
                        <Label>Remove Query</Label>
                      </Button>
                    </div>
                  </div>
                </Content>
              </Panel>
            {/each}
          </Accordion>
        {:else}
          No queries defined yet.
        {/if}
      </div>
      <div class="mdc-typography--headline6" style="padding: 0; margin: 0;">
        Display:
      </div>
      <div>
        <Accordion>
          <Panel>
            <Header>{display.title}</Header>
            <Content>
              <div style="display: flex; flex-direction: column; gap: 1em;">
                <DisplayInput bind:display stuff={data} />
              </div>
            </Content>
          </Panel>
        </Accordion>
      </div>
      <div
        style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1em;"
      >
        <div>
          {#if problems.length}
            <ul class="mdc-typography--caption">
              {#each problems as problem}
                <li>{problem}</li>
              {/each}
            </ul>
          {/if}
        </div>
        <Button disabled={!!problems.length} onclick={() => run()}>
          <Label>Run</Label>
        </Button>
      </div>
    </div>

    {#key failureMessage}
      {#if failureMessage}
        <div class="app-failure" role="alert">
          {failureMessage}
        </div>
      {/if}
    {/key}

    {#if loading}
      <div>Running queries....</div>
    {/if}

    {#if results}
      {#each Object.entries(results) as [label, result] (label)}
        <div>
          {result.label}
          {#if result.type === 'select'}
            <pre>Found: {result.results.length}
          {JSON.stringify(result.results, null, 2)}</pre>
          {:else if result.type === 'aggregate-time'}
            <pre>Time Spans: {result.results.length}
{JSON.stringify(result.results, null, 2)}</pre>
          {:else if result.type === 'aggregate-chunks'}
            <pre>Chunks: {result.results.length}
{JSON.stringify(result.results, null, 2)}</pre>
          {/if}
        </div>
      {/each}
    {/if}
  {/key}
</div>

<script lang="ts">
  import { getContext } from 'svelte';
  import { mdiPlus } from '@mdi/js';
  import { uniq } from 'lodash-es';
  import type { AbortableAsyncIterator } from '@nymphjs/client';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
  import type Kitchen from '@smui/snackbar/kitchen';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import DisplayInput from '$lib/components/DisplayInput.svelte';
  import { parseLogEntrySearch } from '$lib/utils/parseSearch';
  import type {
    LogQuery,
    LogResults,
    LogResultAggregateTime,
    LogResultAggregateChunks,
  } from '$lib/LogQuery';
  import type { ResultDisplay } from '$lib/ResultDisplay';
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let nymph = $derived(data.nymph);
  let LogEntry = $derived(data.LogEntry);

  let failureMessage: string | undefined = $state();
  let kitchen = getContext<Promise<Kitchen>>('kitchen');

  let queries: LogQuery[] = $state([
    {
      label: 'Test Logs',
      queryType: 'aggregate',
      query: '<test>',
      aggregationType: 'absolute-time',
      aggregationAbsoluteTimeStart: new Date('2025-03-31T08:00:00').getTime(),
      aggregationAbsoluteTimeEnd: new Date('2025-03-31T09:00:00').getTime(),
      aggregationTimeStep: 60 * 5,
      aggregationFormula: 'lo.sumBy(getEntries(), "rand")',
    },
  ]);

  let problems = $derived.by(() => {
    const problems = [];

    if (!queries.length) {
      problems.push('Add a query to begin.');
    }

    const labels = queries.map((query) => query.label);
    if (uniq(labels).length !== labels.length) {
      problems.push('All labels must be unique.');
    }

    if (queries.find((query) => !query.query || query.query === '')) {
      problems.push('All queries must be filled in.');
    }

    // TODO: more disabled states

    return problems;
  });

  let iterators:
    | (
        | null
        | AbortableAsyncIterator<LogResultAggregateTime>
        | AbortableAsyncIterator<LogResultAggregateChunks>
      )[]
    | null = $state(null);
  let results: LogResults | null = $state(null);

  let display: ResultDisplay = $state({
    title: 'Results',
    displayType: 'text',
  });

  let loading = $derived.by(
    () => !!iterators?.find((iterator) => iterator != null),
  );

  async function run() {
    if (problems.length) {
      return;
    }

    // Clear current results.
    failureMessage = undefined;
    iterators?.forEach((iterator) => iterator?.abortController.abort());
    iterators = [];
    results = {};

    for (let i = 0; i < queries.length; i++) {
      const curQuery = queries[i];
      const { label, queryType, query } = curQuery;
      // Parse the search query.
      let [options, ...selectors] = parseLogEntrySearch(query, nymph);
      selectors = selectors.filter(
        (selector) => Object.keys(selector).length > 1,
      );

      // Run the query.
      if (queryType === 'select') {
        iterators[i] = null;
        results[label] = {
          label,
          type: 'select',
          results: await LogEntry.getLogs(options, ...selectors),
        };
      } else if (queryType === 'aggregate') {
        const { aggregationType, aggregationFormula } = curQuery;
        if (aggregationType === 'absolute-time') {
          const {
            aggregationAbsoluteTimeStart,
            aggregationAbsoluteTimeEnd,
            aggregationTimeStep,
          } = curQuery;
          try {
            const iterator = await LogEntry.queryLogsTime({
              query: [options, ...selectors],
              formula: aggregationFormula,
              begin: aggregationAbsoluteTimeStart,
              end: aggregationAbsoluteTimeEnd,
              step: aggregationTimeStep,
            });
            iterators[i] = iterator;

            results[label] = {
              label,
              type: 'aggregate-time',
              results: [],
            };
            for await (let value of iterator) {
              if (value instanceof Error) {
                throw value;
              }

              results[label].results.push(value);
            }

            (await kitchen).push({
              label: `Query finished.`,
            });
          } catch (e: any) {
            failureMessage = e.message;
          }

          iterators[i] = null;
        } else if (aggregationType === 'relative-time') {
          const {
            aggregationRelativeTimeStart,
            aggregationRelativeTimeEnd,
            aggregationTimeStep,
          } = curQuery;
          try {
            const iterator = await LogEntry.queryLogsTime({
              query: [options, ...selectors],
              formula: aggregationFormula,
              begin: aggregationRelativeTimeStart,
              end: aggregationRelativeTimeEnd,
              step: aggregationTimeStep,
            });
            iterators[i] = iterator;

            results[label] = {
              label,
              type: 'aggregate-time',
              results: [],
            };
            for await (let value of iterator) {
              if (value instanceof Error) {
                throw value;
              }

              results[label].results.push(value);
            }

            (await kitchen).push({
              label: `Query finished.`,
            });
          } catch (e: any) {
            failureMessage = e.message;
          }

          iterators[i] = null;
        } else if (aggregationType === 'chunks') {
          const { aggregationChunksChunkLength } = curQuery;
          try {
            const iterator = await LogEntry.queryLogsChunks({
              query: [options, ...selectors],
              formula: aggregationFormula,
              chunkLength: aggregationChunksChunkLength,
            });
            iterators[i] = iterator;

            results[label] = {
              label,
              type: 'aggregate-chunks',
              results: [],
            };
            for await (let value of iterator) {
              if (value instanceof Error) {
                throw value;
              }

              results[label].results.push(value);
            }

            (await kitchen).push({
              label: `Query finished.`,
            });
          } catch (e: any) {
            failureMessage = e.message;
          }

          iterators[i] = null;
        }
      }
    }
  }

  function addQuery() {
    queries.push({
      label: 'Query ' + queries.length,
      query: '',
      queryType: 'aggregate',
      aggregationType: 'relative-time',
      aggregationRelativeTimeStart: '-1 day',
      aggregationRelativeTimeEnd: 'now',
      aggregationTimeStep: 60 * 5,
      aggregationFormula: '[entries.length]',
    });
  }

  function removeQuery(i: number) {
    queries.splice(i, 1);
  }
</script>
