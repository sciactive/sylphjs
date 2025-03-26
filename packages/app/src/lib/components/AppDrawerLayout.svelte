<div class="drawer-container">
  <Drawer
    variant={$smallWindow ? 'modal' : undefined}
    bind:open={$drawerOpen}
    class="app-drawer {$smallWindow
      ? 'app-drawer-adjust'
      : 'small-window-hide'}"
    id="sylphjs-drawer"
  >
    <Header
      class="small-window"
      style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; min-height: auto; padding: 16px;"
    >
      <Title
        tag="a"
        href="/"
        style="color: unset; display: flex; align-items: center; margin: 0;"
      >
        <Logo style="width: 32px; height: 32px;" />
        <span class="sylphjs-logo" style="margin-left: .125em;">
          Sylph.js
        </span>
      </Title>
      <AccountMenu class="mini-window" {stores} />
    </Header>
    <Content class="app-drawer-content">
      {@render drawer?.()}

      <AppButtons />
    </Content>
  </Drawer>

  {#if $smallWindow}
    <Scrim />
  {/if}
  <AppContent class="app-app-content">
    <main class="app-main-content" bind:this={mainContent}>
      {@render children?.()}
    </main>
  </AppContent>
</div>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import Drawer, {
    Content,
    Scrim,
    AppContent,
    Header,
    Title,
  } from '@smui/drawer';
  import { navigating } from '$app/stores';
  import type { SessionStuff } from '$lib/nymph';
  import AppButtons from '$lib/components/AppButtons.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import AccountMenu from '$lib/components/AccountMenu.svelte';

  let {
    stores,
    drawer,
    children,
  }: { stores: SessionStuff['stores']; drawer: Snippet; children: Snippet } =
    $props();
  let { smallWindow, drawerAvailable, drawerOpen } = stores;

  let mainContent: HTMLElement;

  $drawerAvailable = true;

  $effect(() => {
    if (mainContent && $navigating == null) {
      mainContent.scrollTop = 0;
    }
  });

  $effect(() => {
    if ($navigating != null) {
      $drawerOpen = false;
    }
  });

  onDestroy(() => {
    $drawerAvailable = false;
  });
</script>
