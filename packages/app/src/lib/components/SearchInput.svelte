Search:
<input type="text" />

<pre>{JSON.stringify(Object.keys(stuff), null, 2)}</pre>

<script lang="ts">
  import type { SessionStuff } from '$lib/nymph';

  let { stuff }: { stuff: SessionStuff } = $props();
</script>
