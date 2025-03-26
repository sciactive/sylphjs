<div class="app-buttons">
  <Button
    title="Inspect"
    variant={parsedApp === 'inspect' ? 'raised' : 'text'}
    style="height: 56px;"
    {...parsedApp === 'inspect' ? { disabled: true } : { href: '/inspect/' }}
  >
    <Icon
      tag="svg"
      viewBox="0 0 24 24"
      style="height: 28px; width: 28px; margin: 0;"
    >
      <path fill="currentColor" d={mdiChartLine} />
    </Icon>
  </Button>
  <Button
    title="Dashboards"
    variant={parsedApp === 'dashboards' ? 'raised' : 'text'}
    style="height: 56px;"
    {...parsedApp === 'dashboards'
      ? { disabled: true }
      : { href: '/dashboards/' }}
  >
    <Icon
      tag="svg"
      viewBox="0 0 24 24"
      style="height: 28px; width: 28px; margin: 0;"
    >
      <path fill="currentColor" d={mdiViewDashboard} />
    </Icon>
  </Button>
  <Button
    title="Settings"
    variant={parsedApp === 'settings' ? 'raised' : 'text'}
    style="height: 56px;"
    {...parsedApp === 'settings'
      ? { disabled: true }
      : { href: '/settings/general' }}
  >
    <Icon
      tag="svg"
      viewBox="0 0 24 24"
      style="height: 28px; width: 28px; margin: 0;"
    >
      <path fill="currentColor" d={mdiCog} />
    </Icon>
  </Button>
</div>

<script lang="ts">
  import { mdiChartLine, mdiViewDashboard, mdiCog } from '@mdi/js';
  import Button, { Icon } from '@smui/button';
  import { page } from '$app/stores';
  import { parseApp } from '$lib/utils/parseApp';

  const parsedApp = $derived(parseApp($page.url));
</script>

<style>
  .app-buttons {
    display: flex;
    align-content: center;
  }

  .app-buttons > :global(*) {
    margin: 10px 0 10px 10px;
    padding: 0;
    flex-grow: 1;
  }

  .app-buttons > :global(*:last-child) {
    margin-right: 10px;
  }
</style>
