<svelte:head>
  <title>Login - Sylph.js</title>
</svelte:head>

{#if $loading || $user}
  <div
    style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px 0;"
  >
    <CircularProgress indeterminate style="height: 80px; width: 80px;" />
    Loading...
  </div>
{:else}
  <section
    style="display: flex; width: 100%; height: max-content; align-self: center; justify-content: center;"
  >
    <Paper elevation={10} style="max-width: 360px; width: 100%; ">
      <Title tag="h1">
        {#if loginMode === 'login'}
          Log in
        {:else}
          Sign up
        {/if}
      </Title>
      <Content>
        <Login {User} {clientConfig} bind:mode={loginMode} width="100%"></Login>
      </Content>
    </Paper>
  </section>
{/if}

<script lang="ts">
  import { Login } from '@nymphjs/tilmeld-components';
  import Paper, { Title, Content } from '@smui/paper';
  import CircularProgress from '@smui/circular-progress';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let { User, stores } = data;
  let { loading, user, clientConfig } = stores;

  let loginMode: 'login' | 'register' = $state('login');

  $effect(() => {
    if ($user != null) {
      goto(`/inspect/logs/`);
    }
  });
</script>
