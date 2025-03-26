<List class="app-drawer-list">
  {#each tabs as tab}
    {#if 'separator' in tab}
      <Separator />
    {:else if 'text' in tab}
      <Item nonInteractive>
        <Text>{tab.text}</Text>
      </Item>
    {:else}
      <Item
        href="{routePrefix}{tab.route}"
        activated={active != null &&
          'route' in active &&
          tab.route === active.route}
      >
        <Graphic>
          <Icon tag="svg" viewBox="0 0 24 24">
            <path fill="currentColor" d={tab.icon} />
          </Icon>
        </Graphic>
        <Text>{tab.label}</Text>
      </Item>
    {/if}
  {/each}
</List>

<script lang="ts">
  import List, { Item, Text, Graphic, Separator } from '@smui/list';
  import { Icon } from '@smui/common';
  import { page, navigating } from '$app/stores';

  export type Tab =
    | { separator: true }
    | { text: string }
    | { route: string; label: string; icon: string };

  let {
    routePrefix,
    tabs,
  }: {
    routePrefix: string;
    tabs: Tab[];
  } = $props();

  // svelte-ignore state_referenced_locally
  let active = $state(
    tabs.find(
      (tab) =>
        !('separator' in tab) &&
        !('text' in tab) &&
        $page.url.pathname.startsWith(routePrefix + tab.route),
    ),
  );

  $effect(() => {
    if ($navigating) {
      active = tabs.find(
        (tab) =>
          !('separator' in tab) &&
          !('text' in tab) &&
          $navigating?.to?.url.pathname.startsWith(routePrefix + tab.route),
      );
    }
  });
</script>
