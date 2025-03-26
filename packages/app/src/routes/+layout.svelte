<svelte:window onresize={setMiniWindow} />

<svelte:head>
  <!-- Combined SMUI and Site Styles -->
  <link
    rel="stylesheet"
    href="{assets}/smui.css"
    media="(prefers-color-scheme: light)"
  />
  <link
    rel="stylesheet"
    href="{assets}/smui-dark.css"
    media="screen and (prefers-color-scheme: dark)"
  />

  <meta name="robots" content="noindex" />
</svelte:head>

<div
  style="position: absolute; width: 100%; z-index: 10000; top: env(safe-area-inset-top, 0);"
>
  <LinearProgress indeterminate closed={!$navigating && !$loading} />
</div>

{#if $user === undefined}
  <div
    style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;"
  >
    <CircularProgress style="height: 120px; width: 120px;" indeterminate />
  </div>
{:else}
  <TopAppBar variant="static" class="app-top-app-bar">
    <Row>
      <Section style="flex-grow: 0;">
        {#if $drawerAvailable}
          <IconButton
            class="small-window"
            onclick={() => ($drawerOpen = !$drawerOpen)}
            aria-controls="sylphjs-drawer"
            aria-expanded={$drawerOpen ? 'true' : 'false'}
            aria-label="Toggle drawer"
          >
            <Icon tag="svg" viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiMenu} />
            </Icon>
          </IconButton>
        {/if}
        <Title
          tag="a"
          href="/"
          class={$drawerAvailable ? 'small-window-hide' : ''}
          style="color: unset; display: inline-flex; align-items: center; padding-left: 0;"
        >
          <Logo style="width: 32px; height: 32px; margin: 8px;" />
          <span
            class="sylphjs-logo small-window-hide"
            style="margin-right: 8px;"
          >
            Sylph.js
          </span>
        </Title>
      </Section>
      <Section class="app-top-app-bar-content" style="padding-left: 0;">
        {#if $user}
          <h6 style="margin: 0;">
            {parsedApp
              .split(/\s/)
              .map(
                (word) =>
                  word.substring(0, 1).toUpperCase() + word.substring(1),
              )
              .join(' ')}
          </h6>
        {/if}
      </Section>
      {#if $user}
        <Section
          class={$drawerAvailable ? 'mini-window-hide' : ''}
          align="end"
          toolbar
          style="padding-left: 0; flex-grow: 0; color: var(--mdc-on-surface, #000);"
        >
          <AccountMenu {stores} />
        </Section>
      {/if}
      {#if !$user}
        <Section
          align="end"
          toolbar
          style="padding-left: 0; flex-grow: 0; color: var(--mdc-on-surface, #000);"
        >
          <Button
            href="https://sylphjs.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Label>Home Page</Label>
          </Button>
          <Button
            href="https://github.com/sciactive/sylphjs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Label>GitHub</Label>
          </Button>
        </Section>
      {/if}
    </Row>
  </TopAppBar>

  {@render children?.()}
{/if}

<Kitchen bind:this={kitchen} dismiss$tag="svg" dismiss$viewBox="0 0 24 24">
  {#snippet dismiss()}
    <path fill="currentColor" d={mdiClose} />
  {/snippet}
</Kitchen>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext } from 'svelte';
  import { mdiMenu, mdiClose } from '@mdi/js';
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import LinearProgress from '@smui/linear-progress';
  import CircularProgress from '@smui/circular-progress';
  import IconButton from '@smui/icon-button';
  import Button from '@smui/button';
  import Kitchen from '@smui/snackbar/kitchen';
  import { Label, Icon } from '@smui/common';
  import { assets } from '$app/paths';
  import { navigating, page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import Logo from '$lib/components/Logo.svelte';
  import AccountMenu from '$lib/components/AccountMenu.svelte';
  import { parseApp } from '$lib/utils/parseApp';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
  let { stores } = data;
  let { loading, user, smallWindow, miniWindow, drawerAvailable, drawerOpen } =
    stores;

  const parsedApp = $derived(parseApp($page.url));

  let kitchen: Kitchen<undefined, 'svg'>;

  setContext(
    'kitchen',
    new Promise((resolve) => {
      onMount(() => {
        resolve(kitchen);
      });
    }),
  );

  let previousUser = $user;
  $effect(() => {
    (async () => {
      if (previousUser !== $user) {
        $loading = true;
        previousUser = $user;
        if (
          previousUser != $user &&
          previousUser !== undefined &&
          (!previousUser || !$user || previousUser.guid !== $user.guid)
        ) {
          // Invalidate if going from logged in to not or vice versa.
          await invalidate('/rest');
        }
        $loading = false;
      }
    })();
  });

  onMount(setMiniWindow);

  function setMiniWindow() {
    if (typeof window !== 'undefined') {
      $smallWindow = window.innerWidth < 1024;
      $miniWindow = window.innerWidth < 600;
    }
  }

  onMount(setSafariPWASizing);

  function setSafariPWASizing() {
    const html = document.getElementsByTagName('html')[0];
    const app = document.getElementById('sylphjs-app');

    if (
      html &&
      app &&
      window.matchMedia('(display-mode: standalone)') &&
      navigator.userAgent.match(/safari\/?\s*(\d+)/i) &&
      navigator.userAgent.match(/mobile/i)
    ) {
      html.style.height = '100vh';
      document.body.style.height = '100vh';

      app.style.height = '100vh';
      app.style.width = '100vw';
    }
  }
</script>
