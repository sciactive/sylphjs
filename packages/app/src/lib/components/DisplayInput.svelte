<div style="display: flex; flex-direction: column; width: 100%; gap: 1em;">
  <div>
    <Textfield
      label="Title"
      type="text"
      bind:value={display.title}
      style="width: 100%"
    />
  </div>

  <div>
    <div style="display: flex; align-items: center; gap: 1em;">
      <span>Display Type:</span>
      <SegmentedButton
        segments={['text', 'chart']}
        singleSelect
        bind:selected={display.displayType}
      >
        {#snippet segment(segment: 'text' | 'chart')}
          <!-- Note: the `segment` property is required! -->
          <Segment {segment}>
            <Label>{segment}</Label>
          </Segment>
        {/snippet}
      </SegmentedButton>
    </div>
    <p class="mdc-typography--caption">
      {#if display.displayType === 'text'}
        Results will be displayed in plain text.
      {:else if display.displayType === 'chart'}
        Results will be graphed in a chart.
      {/if}
    </p>
  </div>

  {#if display.displayType === 'chart'}
    <div>
      <Select bind:value={display.chartType} label="Chart Type">
        {#each ['line'] as curType}
          <Option value={curType}>{capitalize(curType)}</Option>
        {/each}
        {#snippet helperText()}
          {#if display.chartType === 'line'}
            A simple line chart that supports multiple results per query.
          {/if}
        {/snippet}
      </Select>
    </div>

    {#if display.chartType === 'line'}
      <div
        style="display: flex; flex-direction: row; gap: 1em; flex-wrap: wrap;"
      >
        <div>input</div>
      </div>
    {/if}
  {/if}
</div>

<script lang="ts">
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import { Label } from '@smui/common';
  import type { ResultDisplay } from '$lib/ResultDisplay';
  import type { SessionStuff } from '$lib/nymph';

  let {
    display = $bindable(),
    stuff,
  }: {
    display: ResultDisplay;
    stuff: SessionStuff;
  } = $props();

  $effect.pre(() => {
    // Delete unnecessary keys and fill in newly needed ones.

    if (display.displayType === 'text') {
      // @ts-ignore
      delete display.chartType;
    } else if (display.displayType === 'chart') {
      if (!('chartType' in (display as ResultDisplay))) {
        display.chartType = 'line';
      }
      if (display.chartType === 'line') {
        // TODO
      }
    }
  });

  function capitalize(str: string) {
    return str
      .split('-')
      .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
      .join(' ');
  }
</script>
