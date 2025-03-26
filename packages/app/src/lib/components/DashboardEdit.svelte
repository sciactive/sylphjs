{#key failureMessage}
  {#if failureMessage}
    <div class="app-failure" role="alert">
      {failureMessage}
    </div>
  {/if}
{/key}

<div class="page-content">
  <Paper class="paper-demo">
    <div
      style="display: flex; justify-content: space-between; align-items: flex-start;"
    >
      <Title>
        {$dashboard.guid == null ? 'New Dashboard' : name}
      </Title>
    </div>
    <Content>
      <div class="field">
        <Textfield
          bind:value={$dashboard.name}
          input$emptyValueUndefined
          label="Name"
          style="max-width: 200px;"
          input$maxlength={64}
        />
      </div>

      <div class="actions">
        <Button
          onclick={save}
          variant="raised"
          disabled={$loading || $dashboard.name === ''}
        >
          <Label>Save</Label>
        </Button>
        {#if $dashboard.guid}
          <Button
            onclick={() => (deleteDialogOpen = true)}
            color="secondary"
            disabled={$loading}
          >
            <Label>Delete</Label>
          </Button>
        {/if}
      </div>
    </Content>
  </Paper>
</div>

<Dialog
  bind:open={deleteDialogOpen}
  aria-labelledby="dashboard-delete-dialog-title"
  aria-describedby="dashboard-delete-dialog-content"
>
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <DialogTitle id="dashboard-delete-dialog-title">Delete Dashboard</DialogTitle>
  <DialogContent id="dashboard-delete-dialog-content">
    This cannot be undone!
  </DialogContent>
  <Actions>
    <Button onclick={() => (deleteDialogOpen = false)}>
      <Label>Cancel</Label>
    </Button>
    <Button
      onclick={() => {
        deleteDashboard();
        deleteDialogOpen = false;
      }}
    >
      <Label>Delete</Label>
    </Button>
  </Actions>
</Dialog>

<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import Paper, { Title, Content } from '@smui/paper';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import Dialog, {
    Title as DialogTitle,
    Content as DialogContent,
    Actions,
  } from '@smui/dialog';
  import type Kitchen from '@smui/snackbar/kitchen';
  import { goto } from '$app/navigation';
  import type { SessionStuff } from '$lib/nymph';
  import type {
    Dashboard as DashboardClass,
    DashboardData,
  } from '$lib/entities/Dashboard';

  let {
    dashboard,
    stuff,
  }: {
    dashboard: Writable<DashboardClass & DashboardData>;
    stuff: SessionStuff;
  } = $props();
  let { stores } = stuff;
  let { loading } = stores;

  let failureMessage: string | undefined = $state();
  let kitchen = getContext<Promise<Kitchen>>('kitchen');
  let deleteDialogOpen = $state(false);
  let name = $state($dashboard.name);

  async function save() {
    $loading = true;
    failureMessage = undefined;
    try {
      if (await $dashboard.$save()) {
        name = $dashboard.name;

        (await kitchen).push({
          label: 'Dashboard saved.',
        });

        goto(`/dashboards/view/${encodeURIComponent($dashboard.guid || '')}`);
      } else {
        failureMessage = 'Failed to save dashboard.';
      }
    } catch (e: any) {
      failureMessage = e?.message;
    }
    $loading = false;
    return !failureMessage;
  }

  async function deleteDashboard() {
    $loading = true;
    try {
      if (await $dashboard.$delete()) {
        (await kitchen).push({
          label: 'Dashboard deleted.',
        });

        goto(`/dashboards/`);
      } else {
        failureMessage = 'Failed to delete dashboard.';
      }
    } catch (e: any) {
      failureMessage = e?.message;
    }
    $loading = false;
  }
</script>

<style>
  .field {
    margin-bottom: 1.5rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 1.5rem;
    gap: 1rem;
  }
</style>
