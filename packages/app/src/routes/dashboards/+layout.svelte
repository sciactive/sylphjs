<AppDrawerLayout {stores}>
  {#snippet drawer()}
    <List class="app-drawer-list">
      <Item href="/dashboards/edit/+">
        <Graphic>
          <Icon tag="svg" viewBox="0 0 24 24">
            <path fill="currentColor" d={mdiPlus} />
          </Icon>
        </Graphic>
        <Text class="mdc-typography--body2">New Dashboard</Text>
      </Item>
      <Separator />

      {#each $dashboards as dashboard (dashboard.guid)}
        <Item
          href="/dashboards/view/{encodeURIComponent(dashboard.guid || '')}"
          activated={$page.url.pathname.startsWith(
            `/dashboards/view/${encodeURIComponent(dashboard.guid || '')}`,
          ) ||
            $page.url.pathname.startsWith(
              `/dashboards/edit/${encodeURIComponent(dashboard.guid || '')}`,
            )}
        >
          <Text>{dashboard.name}</Text>
          {#if $page.url.pathname.startsWith(`/dashboards/view/${encodeURIComponent(dashboard.guid || '')}`)}
            <Meta>
              <IconButton
                onclick={(event) => {
                  event.preventDefault();
                  goto(
                    `/dashboards/edit/${encodeURIComponent(dashboard.guid || '')}`,
                  );
                }}
                title="Edit dashboard"
                size="button"
              >
                <Icon tag="svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d={mdiPencil} />
                </Icon>
              </IconButton>
            </Meta>
          {/if}
        </Item>
      {:else}
        <Item nonInteractive>
          <Text>You don't have any dashboards.</Text>
        </Item>
      {/each}
      {#key failureMessage}
        {#if failureMessage}
          <Item nonInteractive role="alert">
            <Text class="app-failure">
              {failureMessage}
            </Text>
          </Item>
        {/if}
      {/key}
    </List>
  {/snippet}

  {@render children?.()}
</AppDrawerLayout>

<script lang="ts">
  import { mdiPlus, mdiPencil } from '@mdi/js';
  import type { Snippet } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import IconButton from '@smui/icon-button';
  import List, { Item, Text, Graphic, Meta, Separator } from '@smui/list';
  import { Icon } from '@smui/common';
  import type { PubSubSubscription, PubSubUpdate } from '@nymphjs/client';
  import { Sorter } from '@nymphjs/sorter';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type {
    Dashboard as DashboardClass,
    DashboardData,
  } from '$lib/entities/Dashboard';
  import AppDrawerLayout from '$lib/components/AppDrawerLayout.svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  let { pubsub, stores } = data;
  const dashboards = $derived(data.dashboards);
  const subscribable = $derived(data.subscribable);

  let subscription: PubSubSubscription<
    PubSubUpdate<(DashboardClass & DashboardData)[]>
  >;
  let failureMessage: string | undefined = $state();

  // svelte-ignore state_referenced_locally
  let previousSubscribable = subscribable;
  $effect(() => {
    if (subscribable !== previousSubscribable) {
      subscribe();
      previousSubscribable = subscribable;
    }
  });

  onMount(subscribe);
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  function subscribe() {
    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = subscribable(
      (update) => {
        pubsub.updateArray($dashboards, update);
        const sorter = new Sorter($dashboards);
        sorter.sort('name');
        $dashboards = $dashboards;
        failureMessage = undefined;
      },
      (err) => {
        failureMessage = err?.message;
      },
    );
  }
</script>
