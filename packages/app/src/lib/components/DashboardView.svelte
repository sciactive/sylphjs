<div class="container">
  <Paper>
    <Title
      style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;"
    >
      <span>{$dashboard.name}</span>
    </Title>
    <Content>
      <div class="field">
        <div class="label">Name</div>
        <div class="value">{$dashboard.name}</div>
      </div>
      <div class="field">
        <div class="label">Created</div>
        <div
          class="value"
          title={new Date($dashboard.cdate || 0).toLocaleString()}
        >
          <RelativeDate date={$dashboard.cdate} />
        </div>
      </div>
      <div class="field">
        <div class="label">Modified</div>
        <div
          class="value"
          title={new Date($dashboard.mdate || 0).toLocaleString()}
        >
          <RelativeDate date={$dashboard.mdate} />
        </div>
      </div>

      <div class="actions">
        <Button variant="raised" href="/dashboards/edit/{$dashboard.guid}">
          <Label>Edit</Label>
        </Button>
      </div>
    </Content>
  </Paper>
</div>

<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Paper, { Title, Content } from '@smui/paper';
  import Button, { Label } from '@smui/button';
  import type {
    Dashboard as DashboardClass,
    DashboardData,
  } from '$lib/entities/Dashboard';
  import RelativeDate from '$lib/components/RelativeDate.svelte';

  let { dashboard }: { dashboard: Writable<DashboardClass & DashboardData> } =
    $props();
</script>

<style>
  .container {
    margin: var(--responsive-1rem, 1rem) var(--responsive-1rem, 1rem) 0;
  }

  .field {
    display: flex;
    margin-bottom: 1rem;
  }

  .field > .label {
    width: 140px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 1.5rem;
    gap: 1rem;
  }
</style>
