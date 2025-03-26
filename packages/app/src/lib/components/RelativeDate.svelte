{text}

<script lang="ts">
  import { onMount } from 'svelte';
  import { DateFormatter } from '$lib/utils/DateFormatter';

  let {
    date,
    dateStyle = 'auto',
    timeStyle = 'auto',
    length = 'auto',
  }: {
    date: number | null | undefined;
    /**
     * Either all are auto, or none. Setting only one won't work.
     */
    dateStyle?: 'wymd' | 'wmd' | 'w' | '' | 'ago' | 'auto';
    /**
     * Either all are auto, or none. Setting only one won't work.
     */
    timeStyle?: 'hms' | 'hm' | 'h' | '' | 'auto';
    /**
     * Either all are auto, or none. Setting only one won't work.
     */
    length?: 'short' | 'long' | 'auto';
  } = $props();

  let text: string | undefined = $state();
  let interval: number | NodeJS.Timeout;

  updateTime();

  onMount(() => {
    interval = setInterval(updateTime, 10000);

    return () => {
      clearInterval(interval);
    };
  });

  function updateTime() {
    if (date == null) {
      text = 'Pending';
      return;
    }
    const now = Date.now();
    const dateFormatter = new DateFormatter(date);

    if (dateStyle === 'auto' || timeStyle === 'auto' || length === 'auto') {
      if (now - date > 10 * 30 * 24 * 60 * 60 * 1000) {
        // More than 10 months ago.
        text = dateFormatter.format('wymd', '', 'short');
      } else if (now - date > 6 * 24 * 60 * 60 * 1000) {
        // More than 6 days ago.
        text = dateFormatter.format('wmd', '', 'short');
      } else if (now - date > 24 * 60 * 60 * 1000) {
        // More than 1 day ago.
        text = dateFormatter.format('w', 'h', 'short');
      } else {
        text = dateFormatter.format('ago', '', 'long');
      }
    } else {
      text = dateFormatter.format(dateStyle, timeStyle, length);
    }
  }
</script>
