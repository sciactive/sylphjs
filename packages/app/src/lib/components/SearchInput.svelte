<Textfield
  label="Query"
  type="text"
  bind:value
  style="width: 100%"
  onkeydown={(event) => {
    if (event.key === 'Enter') {
      onsubmit();
    }
  }}
/>

<script lang="ts">
  import Textfield from '@smui/textfield';
  import type { SessionStuff } from '$lib/nymph';

  let {
    value = $bindable(),
    onsubmit = () => {},
    stuff,
  }: { value: string; onsubmit?: () => void; stuff: SessionStuff } = $props();
</script>
