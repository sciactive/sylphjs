<div style="display: flex; flex-direction: column; width: 100%; gap: 1em;">
  <div>
    <Textfield
      label="Label"
      type="text"
      bind:value={query.label}
      style="width: 100%"
    />
  </div>

  <div>
    <div style="display: flex; align-items: center; gap: 1em;">
      <span>Query Type:</span>
      <SegmentedButton
        segments={['aggregate', 'select']}
        singleSelect
        bind:selected={query.queryType}
      >
        {#snippet segment(segment: 'aggregate' | 'select')}
          <!-- Note: the `segment` property is required! -->
          <Segment {segment}>
            <Label>{segment}</Label>
          </Segment>
        {/snippet}
      </SegmentedButton>
    </div>
    <p class="mdc-typography--caption">
      {#if query.queryType === 'aggregate'}
        Aggregate entries into a value that can be displayed on charts.
      {:else if query.queryType === 'select'}
        Select entries to be viewed individually.
      {/if}
    </p>
  </div>

  <div>
    <Textfield
      label="Query"
      type="text"
      bind:value={query.query}
      style="width: 100%"
    />
  </div>

  {#if query.queryType === 'aggregate'}
    <div>
      <Select bind:value={query.aggregationType} label="Aggregation Type">
        {#each ['absolute-time', 'relative-time', 'chunks'] as curType}
          <Option value={curType}>{capitalize(curType)}</Option>
        {/each}
        {#snippet helperText()}
          {#if query.aggregationType === 'absolute-time'}
            Aggregate entries from a specific window of time in smaller time
            spans.
          {:else if query.aggregationType === 'relative-time'}
            Aggregate entries from a relative window of time in smaller time
            spans.
          {:else if query.aggregationType === 'chunks'}
            Aggregate entries in chunks of a given length.
          {/if}
        {/snippet}
      </Select>
    </div>

    {#if query.aggregationType === 'absolute-time'}
      <div
        style="display: flex; flex-direction: row; gap: 1em; flex-wrap: wrap;"
      >
        <div>
          <Textfield
            bind:value={aggregationAbsoluteTimeStartValue}
            label="Start"
            type="datetime-local"
            input$step={1}
            input$onfocus={(e) =>
              (e.currentTarget as HTMLInputElement).showPicker()}
            input$max={aggregationAbsoluteTimeEndValue}
            required
          >
            {#snippet helper()}
              <HelperText>The start time of the query</HelperText>
            {/snippet}
          </Textfield>
        </div>
        <div>
          <Textfield
            bind:value={aggregationAbsoluteTimeEndValue}
            label="End"
            type="datetime-local"
            input$step={1}
            input$onfocus={(e) =>
              (e.currentTarget as HTMLInputElement).showPicker()}
            input$min={aggregationAbsoluteTimeStartValue}
            required
          >
            {#snippet helper()}
              <HelperText>The end time of the query</HelperText>
            {/snippet}
          </Textfield>
        </div>
        <div>
          <Textfield
            bind:value={query.aggregationTimeStep}
            label="Step"
            type="number"
            input$min={1}
            required
          >
            {#snippet helper()}
              <HelperText>The number of seconds for each time step.</HelperText>
            {/snippet}
          </Textfield>
        </div>
      </div>
    {:else if query.aggregationType === 'relative-time'}
      <div
        style="display: flex; flex-direction: row; gap: 1em; flex-wrap: wrap;"
      >
        <div>
          <Textfield
            bind:value={query.aggregationRelativeTimeStart}
            label="Start"
            type="text"
            required
          >
            {#snippet helper()}
              <HelperText>The start time of the query</HelperText>
            {/snippet}
          </Textfield>
          <div class="mdc-typography--caption">
            {new Date(aggregateRelativeTimeStartValue * 1000).toLocaleString()}
          </div>
        </div>
        <div>
          <Textfield
            bind:value={query.aggregationRelativeTimeEnd}
            label="End"
            type="text"
            required
          >
            {#snippet helper()}
              <HelperText>The end time of the query</HelperText>
            {/snippet}
          </Textfield>
          <div class="mdc-typography--caption">
            {new Date(aggregateRelativeTimeEndValue * 1000).toLocaleString()}
          </div>
        </div>
        <div>
          <Textfield
            bind:value={query.aggregationTimeStep}
            label="Step"
            type="number"
            input$min={1}
            required
          >
            {#snippet helper()}
              <HelperText>The number of seconds for each time step.</HelperText>
            {/snippet}
          </Textfield>
        </div>
      </div>
    {:else if query.aggregationType === 'chunks'}
      <div>
        <Textfield
          bind:value={query.aggregationChunksChunkLength}
          label="Chunk Length"
          type="number"
          input$min={1}
          required
        >
          {#snippet helper()}
            <HelperText
              >The number of entries to process in each chunk. Once a chunk has
              zero entries, the query stops running.</HelperText
            >
          {/snippet}
        </Textfield>
      </div>
    {/if}

    <div>
      <Textfield
        label="Aggregation Formula"
        type="text"
        bind:value={query.aggregationFormula}
        style="width: 100%"
      />
    </div>
  {/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import { Label } from '@smui/common';
  import strtotime from 'locutus/php/datetime/strtotime.js';
  import type { LogQuery } from '$lib/LogQuery';
  import type { SessionStuff } from '$lib/nymph';

  let {
    query = $bindable(),
    stuff,
  }: {
    query: LogQuery;
    stuff: SessionStuff;
  } = $props();

  $effect.pre(() => {
    // Delete unnecessary keys and fill in newly needed ones.

    if (query.queryType === 'select') {
      // @ts-ignore
      delete query.aggregationType;
      // @ts-ignore
      delete query.aggregationAbsoluteTimeStart;
      // @ts-ignore
      delete query.aggregationAbsoluteTimeEnd;
      // @ts-ignore
      delete query.aggregationRelativeTimeStart;
      // @ts-ignore
      delete query.aggregationRelativeTimeEnd;
      // @ts-ignore
      delete query.aggregationTimeStep;
      // @ts-ignore
      delete query.aggregationChunksChunkLength;
      // @ts-ignore
      delete query.aggregationFormula;
    } else if (query.queryType === 'aggregate') {
      if (!('aggregationFormula' in (query as LogQuery))) {
        query.aggregationFormula = '[entries.length]';
      }
      if (query.aggregationType === 'absolute-time') {
        // @ts-ignore
        delete (query as LogQuery).aggregationRelativeTimeStart;
        // @ts-ignore
        delete (query as LogQuery).aggregationRelativeTimeEnd;
        // @ts-ignore
        delete (query as LogQuery).aggregationChunksChunkLength;
        if (!('aggregationAbsoluteTimeStart' in (query as LogQuery))) {
          query.aggregationAbsoluteTimeStart = (() => {
            const date = new Date();
            date.setHours(0, 0, 0);
            return date.getTime();
          })();
        }
        if (!('aggregationAbsoluteTimeEnd' in (query as LogQuery))) {
          query.aggregationAbsoluteTimeEnd = (() => {
            const date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
            date.setHours(0, 0, 0);
            return date.getTime();
          })();
        }
        if (!('aggregationTimeStep' in (query as LogQuery))) {
          query.aggregationTimeStep = 60 * 5;
        }
      } else if (query.aggregationType === 'relative-time') {
        // @ts-ignore
        delete (query as LogQuery).aggregationAbsoluteTimeStart;
        // @ts-ignore
        delete (query as LogQuery).aggregationAbsoluteTimeEnd;
        // @ts-ignore
        delete (query as LogQuery).aggregationChunksChunkLength;
        if (!('aggregationRelativeTimeStart' in (query as LogQuery))) {
          query.aggregationRelativeTimeStart = '-1 day';
        }
        if (!('aggregationRelativeTimeEnd' in (query as LogQuery))) {
          query.aggregationRelativeTimeEnd = 'now';
        }
        if (!('aggregationTimeStep' in (query as LogQuery))) {
          query.aggregationTimeStep = 60 * 5;
        }
      } else if (query.aggregationType === 'chunks') {
        // @ts-ignore
        delete (query as LogQuery).aggregationAbsoluteTimeStart;
        // @ts-ignore
        delete (query as LogQuery).aggregationAbsoluteTimeEnd;
        // @ts-ignore
        delete (query as LogQuery).aggregationRelativeTimeStart;
        // @ts-ignore
        delete (query as LogQuery).aggregationRelativeTimeEnd;
        // @ts-ignore
        delete (query as LogQuery).aggregationTimeStep;
        if (!('aggregationChunksChunkLength' in (query as LogQuery))) {
          query.aggregationChunksChunkLength = 10;
        }
      }
    }
  });

  let aggregationAbsoluteTimeStartValue = $state(
    query.queryType === 'aggregate' && query.aggregationType === 'absolute-time'
      ? dateToDateTimeLocalString(new Date(query.aggregationAbsoluteTimeStart))
      : '',
  );
  $effect(() => {
    if (
      query.queryType === 'aggregate' &&
      query.aggregationType === 'absolute-time'
    ) {
      query.aggregationAbsoluteTimeStart = new Date(
        aggregationAbsoluteTimeStartValue,
      ).getTime();
    }
  });
  let aggregationAbsoluteTimeEndValue = $state(
    query.queryType === 'aggregate' && query.aggregationType === 'absolute-time'
      ? dateToDateTimeLocalString(new Date(query.aggregationAbsoluteTimeEnd))
      : 0,
  );
  $effect(() => {
    if (
      query.queryType === 'aggregate' &&
      query.aggregationType === 'absolute-time'
    ) {
      query.aggregationAbsoluteTimeEnd = new Date(
        aggregationAbsoluteTimeEndValue,
      ).getTime();
    }
  });

  let aggregateRelativeTimeStartValue = $state(
    query.queryType === 'aggregate' && query.aggregationType === 'relative-time'
      ? strtotime(query.aggregationRelativeTimeStart)
      : 0,
  );
  let aggregateRelativeTimeEndValue = $state(
    query.queryType === 'aggregate' && query.aggregationType === 'relative-time'
      ? strtotime(query.aggregationRelativeTimeEnd)
      : 0,
  );
  onMount(() => {
    const interval = setInterval(() => {
      if (
        query.queryType === 'aggregate' &&
        query.aggregationType === 'relative-time'
      ) {
        aggregateRelativeTimeStartValue = strtotime(
          query.aggregationRelativeTimeStart,
        );
        aggregateRelativeTimeEndValue = strtotime(
          query.aggregationRelativeTimeEnd,
        );
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  });

  function dateToDateTimeLocalString(date: Date) {
    return [
      [
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, '0'),
        `${date.getDate()}`.padStart(2, '0'),
      ].join('-'),
      [
        `${date.getHours()}`.padStart(2, '0'),
        `${date.getMinutes()}`.padStart(2, '0'),
        `${date.getSeconds()}`.padStart(2, '0'),
      ].join(':'),
    ].join('T');
  }

  function capitalize(str: string) {
    return str
      .split('-')
      .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
      .join(' ');
  }
</script>
