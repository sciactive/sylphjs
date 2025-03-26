<IconButton
  title="Account"
  onclick={() => $user != null && (accountMenuOpen = !accountMenuOpen)}
  aria-controls="sylphjs-account-menu"
  aria-expanded={accountMenuOpen ? 'true' : 'false'}
  disabled={$user == null}
  class={[...Object.keys(anchorClasses), className].join(' ')}
  use={[
    [
      Anchor,
      {
        addClass,
        removeClass,
      },
    ],
  ]}
  bind:this={anchor}
>
  <Icon tag="svg" viewBox="0 0 24 24" class="avatar">
    <path fill="currentColor" d={mdiAccount} />
  </Icon>
</IconButton>

<Portal>
  <Menu
    bind:this={accountMenu}
    bind:open={accountMenuOpen}
    anchorCorner="BOTTOM_LEFT"
    anchor={false}
    bind:anchorElement
    id="sylphjs-account-menu"
    role="menu"
  >
    {#if $user}
      <List>
        <Item tag="a" href="/settings/general" role="menuitem">
          <Text>Account Settings {$tilmeldAdmin}</Text>
        </Item>
        {#if $tilmeldAdmin}
          <Item tag="a" href="{base}/user/" rel="external" role="menuitem">
            <Text>Admin App</Text>
          </Item>
        {/if}
        <Separator />
        <Item onSMUIAction={logout} role="menuitem">
          <Text>Logout</Text>
        </Item>
      </List>
    {/if}
  </Menu>
</Portal>

<script lang="ts">
  import { mdiAccount } from '@mdi/js';
  import { onMount } from 'svelte';
  import Portal from 'svelte-portal';
  import IconButton from '@smui/icon-button';
  import List, { Item, Text, Separator } from '@smui/list';
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import { Icon } from '@smui/common';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import type { SessionStuff } from '$lib/nymph';

  let {
    class: className = '',
    stores,
  }: {
    class?: string;
    stores: SessionStuff['stores'];
  } = $props();
  let { tilmeldAdmin, user } = stores;

  let accountMenu: Menu;
  let accountMenuOpen = $state(false);
  let anchor: IconButton;
  let anchorElement: HTMLElement | undefined = $state();
  let anchorClasses: { [k: string]: boolean } = $state({});

  onMount(() => {
    // This tells the menu surface to position itself relative to the body
    // instead of the anchor. Now the menu will position itself next to the
    // anchor, even though the menu itself is located in a portal.
    accountMenu.getMenuSurface().setIsHoisted(true);
    anchorElement = anchor.getElement();
  });

  function addClass(className: string) {
    if (!anchorClasses[className]) {
      anchorClasses[className] = true;
    }
  }

  function removeClass(className: string) {
    if (anchorClasses[className]) {
      delete anchorClasses[className];
      anchorClasses = anchorClasses;
    }
  }

  async function logout() {
    if ($user == null) {
      return;
    }

    await $user.$logout();
    goto('/');
  }
</script>
