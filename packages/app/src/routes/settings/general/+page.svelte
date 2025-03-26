<svelte:head>
  <title>General Settings - Sylph.js</title>
</svelte:head>

{#key failureMessage}
  {#if failureMessage}
    <div class="app-failure" role="alert">
      {failureMessage}
    </div>
  {/if}
{/key}

<div class="page-content">
  {#if $user}
    <Paper class="settings-section">
      <Content>
        <div>
          <Textfield
            bind:value={nameFirst}
            label="First Name"
            type="text"
            style="width: 100%; max-width: 250px;"
            input$autocomplete="given-name"
            input$emptyValueUndefined
          />
        </div>

        <div>
          <Textfield
            bind:value={nameMiddle}
            label="Middle Name"
            type="text"
            style="width: 100%; max-width: 250px;"
            input$autocomplete="additional-name"
            input$emptyValueUndefined
          />
        </div>

        <div>
          <Textfield
            bind:value={nameLast}
            label="Last Name"
            type="text"
            style="width: 100%; max-width: 250px;"
            input$autocomplete="family-name"
            input$emptyValueUndefined
          />
        </div>

        <div class="actions">
          <Button
            onclick={save}
            variant="raised"
            disabled={$loading || !userDetailsChanged}
          >
            <Label>Save</Label>
          </Button>
        </div>
      </Content>
    </Paper>

    <Paper class="settings-section">
      <div>
        <a
          href={'javascript:void(0);'}
          onclick={() => {
            changePasswordOpen = true;
          }}
        >
          Change your password.
        </a>
      </div>

      <div style="margin-top: 1em;">
        <a
          href={'javascript:void(0);'}
          onclick={() => {
            revokeTokensOpen = true;
          }}
        >
          Log out of all other sessions.
        </a>
      </div>
    </Paper>

    <ChangePassword {User} bind:open={changePasswordOpen} {user} />

    <RevokeTokens {User} bind:open={revokeTokensOpen} {user} />

    <Paper class="settings-section">
      <Title>Two Factor Authentication</Title>
      <Content>
        <p>
          Two factor authentication adds an extra layer of security on your
          account.
        </p>

        <div style="margin-top: 1em;">
          <a
            href={'javascript:void(0);'}
            onclick={() => {
              twoFactorOpen = true;
            }}
          >
            {#if hasTOTPSecret === false}
              Enable two factor authentication (2FA).
            {:else}
              Manage two factor authentication (2FA).
            {/if}
          </a>
        </div>
      </Content>
    </Paper>

    <TwoFactor {User} bind:open={twoFactorOpen} {user} bind:hasTOTPSecret />
  {/if}

  <Paper class="settings-section">
    <Title>License</Title>
    <Content>
      <p>
        Sylph.js is licensed under the <a
          href="https://www.gnu.org/licenses/agpl-3.0.en.html"
          target="_blank"
          rel="noopener noreferrer">GNU Affero General Public License (AGPL)</a
        >. Under this license, you have the following rights:
      </p>

      <ul>
        <li>
          <strong>Freedom to Use:</strong> You may freely use this application for
          any purpose.
        </li>

        <li>
          <strong>Access to Source Code:</strong> You have the right to access, view,
          and modify the source code.
        </li>

        <li>
          <strong>Redistribution:</strong> You can share the software with others,
          as long as you also provide access to the source code.
        </li>

        <li>
          <strong>Modifications and Contributions:</strong> If you modify this application
          and make it available to others over a network, you must also share your
          modified source code under the same AGPL license.
        </li>
      </ul>

      <p>
        If you are using a modified version of Sylph.js provided by another
        party, you have the right to receive the source code for that modified
        version.
      </p>

      <p>
        The AGPL ensures transparency, security, and user freedom by requiring
        that all modifications remain open and accessible. By using this
        software, you benefit from a community-driven approach to development,
        fostering collaboration and innovation.
      </p>
    </Content>
  </Paper>
</div>

<script lang="ts">
  import { getContext } from 'svelte';
  import Paper, { Title, Content } from '@smui/paper';
  import Textfield from '@smui/textfield';
  import Button from '@smui/button';
  import type Kitchen from '@smui/snackbar/kitchen';
  import { Label } from '@smui/common';
  import {
    ChangePassword,
    RevokeTokens,
    TwoFactor,
  } from '@nymphjs/tilmeld-components';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let { User, stores } = data;
  let hasTOTPSecret = $state(data.hasTOTPSecret);
  $effect(() => {
    hasTOTPSecret = data.hasTOTPSecret;
  });
  let { user, loading } = stores;

  let failureMessage: string | undefined = $state();
  let kitchen = getContext<Promise<Kitchen>>('kitchen');
  let changePasswordOpen = $state(false);
  let revokeTokensOpen = $state(false);
  let twoFactorOpen = $state(false);

  let nameFirst = $state($user?.nameFirst);
  let nameMiddle = $state($user?.nameMiddle);
  let nameLast = $state($user?.nameLast);

  const userDetailsChanged = $derived(
    $user &&
      (nameFirst !== $user.nameFirst ||
        nameMiddle !== $user.nameMiddle ||
        nameLast !== $user.nameLast),
  );

  async function save() {
    if ($user == null) {
      return;
    }

    $loading = true;
    failureMessage = undefined;

    try {
      $user.nameFirst = nameFirst;
      if (nameFirst == null) {
        delete $user.nameFirst;
      }
      $user.nameMiddle = nameMiddle;
      if (nameMiddle == null) {
        delete $user.nameMiddle;
      }
      $user.nameLast = nameLast;
      if (nameLast == null) {
        delete $user.nameLast;
      }
      if (await $user.$patch()) {
        nameFirst = $user?.nameFirst;
        nameMiddle = $user?.nameMiddle;
        nameLast = $user?.nameLast;

        (await kitchen).push({
          label: 'Account changes saved.',
        });
      } else {
        failureMessage = 'Error saving account changes.';
      }
    } catch (e: any) {
      failureMessage = e?.message;
    }

    $loading = false;
  }
</script>

<style>
  * :global(.settings-section) {
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 1.5rem;
    gap: 1rem;
  }
</style>
