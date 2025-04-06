<div style="display: flex; flex-direction: column; width: 100%; gap: 1em;">
  <div>
    <div style="display: flex; align-items: center; gap: 1em;">
      <span>Query Type:</span>
      <SegmentedButton
        segments={['aggregate', 'select']}
        singleSelect
        bind:selected={queryType}
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
      {#if queryType === 'aggregate'}
        Aggregate entries into a value that can be displayed on charts.
      {:else if queryType === 'select'}
        Select entries to be viewed individually.
      {/if}
    </p>
  </div>

  <div>
    <Textfield
      label="Query"
      type="text"
      bind:value={query}
      style="width: 100%"
      onkeydown={(event) => {
        if (event.key === 'Enter') {
          onsubmit();
        }
      }}
    />
  </div>

  {#if queryType === 'aggregate'}
    <div>
      <Select bind:value={aggregationType} label="Aggregation Type">
        {#each ['absolute-time', 'relative-time', 'chunks'] as curType}
          <Option value={curType}>{capitalize(curType)}</Option>
        {/each}
        {#snippet helperText()}
          {#if aggregationType === 'absolute-time'}
            Aggregate entries from a specific window of time in smaller time
            spans.
          {:else if aggregationType === 'relative-time'}
            Aggregate entries from a relative window of time in smaller time
            spans.
          {:else if aggregationType === 'chunks'}
            Aggregate entries in chunks of a given length.
          {/if}
        {/snippet}
      </Select>
    </div>

    {#if aggregationType === 'absolute-time'}
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
            bind:value={aggregationTimeStep}
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
    {:else if aggregationType === 'relative-time'}
      <div
        style="display: flex; flex-direction: row; gap: 1em; flex-wrap: wrap;"
      >
        <div>
          <Textfield
            bind:value={aggregationRelativeTimeStart}
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
            bind:value={aggregationRelativeTimeEnd}
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
            bind:value={aggregationTimeStep}
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
    {:else if aggregationType === 'chunks'}
      <div>
        <Textfield
          bind:value={aggregationChunksChunkLength}
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
        bind:value={aggregationFormula}
        style="width: 100%"
        onkeydown={(event) => {
          if (event.key === 'Enter') {
            onsubmit();
          }
        }}
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
  import type { SessionStuff } from '$lib/nymph';

  let {
    queryType = $bindable(),
    query = $bindable(),
    aggregationType = $bindable(),
    aggregationAbsoluteTimeStart = $bindable(),
    aggregationAbsoluteTimeEnd = $bindable(),
    aggregationRelativeTimeStart = $bindable(),
    aggregationRelativeTimeEnd = $bindable(),
    aggregationTimeStep = $bindable(),
    aggregationChunksChunkLength = $bindable(),
    aggregationFormula = $bindable(),
    onsubmit = () => {},
    stuff,
  }: {
    queryType: 'aggregate' | 'select';
    query: string;
    aggregationType: 'absolute-time' | 'relative-time' | 'chunks';
    aggregationAbsoluteTimeStart: number;
    aggregationAbsoluteTimeEnd: number;
    aggregationRelativeTimeStart: string;
    aggregationRelativeTimeEnd: string;
    aggregationTimeStep: number;
    aggregationChunksChunkLength: number;
    aggregationFormula: string;
    onsubmit?: () => void;
    stuff: SessionStuff;
  } = $props();

  let aggregationAbsoluteTimeStartValue = $state(
    dateToDateTimeLocalString(new Date(aggregationAbsoluteTimeStart)),
  );
  $effect(() => {
    aggregationAbsoluteTimeStart = new Date(
      aggregationAbsoluteTimeStartValue,
    ).getTime();
  });
  let aggregationAbsoluteTimeEndValue = $state(
    dateToDateTimeLocalString(new Date(aggregationAbsoluteTimeEnd)),
  );
  $effect(() => {
    aggregationAbsoluteTimeEnd = new Date(
      aggregationAbsoluteTimeEndValue,
    ).getTime();
  });

  let aggregateRelativeTimeStartValue = $state(
    strtotime(aggregationRelativeTimeStart),
  );
  let aggregateRelativeTimeEndValue = $state(
    strtotime(aggregationRelativeTimeEnd),
  );
  onMount(() => {
    const interval = setInterval(() => {
      if (aggregationType === 'relative-time') {
        aggregateRelativeTimeStartValue = strtotime(
          aggregationRelativeTimeStart,
        );
        aggregateRelativeTimeEndValue = strtotime(aggregationRelativeTimeEnd);
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
