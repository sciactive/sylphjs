<svelte:head>
  <title>Notifications - Sylph.js</title>
</svelte:head>

{#key failureMessage}
  {#if failureMessage}
    <div class="app-failure" role="alert">
      {failureMessage}
    </div>
  {/if}
{/key}

<div class="page-content">
  <Paper class="settings-section">
    <Title>Push Notifications</Title>
    <Content>
      {#if $notificationPermission === null}
        <p>Loading browser push permission...</p>
      {:else if $notificationPermission === false}
        <p>Your browser doesn't support push notifications.</p>
      {:else if $notificationPermission === 'denied'}
        <p>
          You've chosen not to receive push notifications. You'll need to modify
          the site settings in your browser if you've changed your mind.
        </p>
      {:else if $notificationPermission === 'granted'}
        <p>You've enabled push notifications.</p>
      {:else}
        <p>
          If you'd like to enable push notifications so you get notified for the
          alerts you set up, you can grant permission.
        </p>

        <Button onclick={requestNotificationPermission}>
          <Label>Enable Notifications</Label>
        </Button>
      {/if}
    </Content>
  </Paper>

  <Paper class="settings-section">
    <Subtitle>
      These are the devices you've chosen to receive push notifications on. You
      can have up to 15 push notification subscriptions. You can delete the
      subscription to have it recreated when the device reconnects.
    </Subtitle>
    <Content>
      <List twoLine>
        {#each subscriptionsWithUA as entry, i (entry.subscription.guid)}
          {#if i > 0}
            <Separator />
          {/if}
          <Item nonInteractive>
            <Text>
              <PrimaryText
                >{entry.ua.browser.name || 'Unknown Browser'}
                {entry.ua.browser.version || ''} on {entry.ua.os.name ||
                  'Unknown OS'}
                {entry.ua.os.version ||
                  ''}{#if entry.subscription.$is($webPushSubscription)}
                  &nbsp;<span style="opacity: 0.7;">(this device)</span
                  >{/if}</PrimaryText
              >
              <SecondaryText>
                Created: <span
                  title={new Date(
                    entry.subscription.cdate || 0,
                  ).toLocaleString()}
                  ><RelativeDate date={entry.subscription.cdate} /></span
                >, Last Used:
                <span
                  title={new Date(
                    entry.subscription.mdate || 0,
                  ).toLocaleString()}
                  ><RelativeDate date={entry.subscription.mdate} /></span
                >
              </SecondaryText>
            </Text>
            <Meta style="white-space: nowrap;">
              <IconButton
                onclick={() => testNotification(entry.subscription)}
                disabled={$loading}
                title="Send a test notification."
                style="color: unset;"
              >
                <Icon tag="svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d={mdiMessageArrowRight} />
                </Icon>
              </IconButton>
              <IconButton
                onclick={() => deleteSubscription(entry.subscription)}
                disabled={$loading}
                title="Delete this push notification subscription."
                style="color: unset;"
              >
                <Icon tag="svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d={mdiDelete} />
                </Icon>
              </IconButton>
            </Meta>
          </Item>
        {:else}
          <Item nonInteractive>
            <Text>
              You don't have any notification subscriptions. You can add your
              current browser above.
            </Text>
          </Item>
        {/each}
      </List>
    </Content>
  </Paper>
</div>

<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { mdiMessageArrowRight, mdiDelete } from '@mdi/js';
  import Paper, { Title, Subtitle, Content } from '@smui/paper';
  import List, {
    Item,
    Meta,
    Text,
    Separator,
    PrimaryText,
    SecondaryText,
  } from '@smui/list';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';
  import type Kitchen from '@smui/snackbar/kitchen';
  import UAParser from 'ua-parser-js';
  import type {
    PushSubscriptionWeb as PushSubscriptionWebClass,
    PushSubscriptionWebData,
  } from '$lib/entities/PushSubscriptionWeb';
  import RelativeDate from '$lib/components/RelativeDate.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let { stores } = data;
  const subscriptions = $derived(data.subscriptions);
  let {
    notificationPermission,
    requestNotificationPermission,
    webPushSubscription,
    loading,
  } = stores;

  const subscriptionsWithUA = $derived(
    $subscriptions.map((subscription) => ({
      subscription,
      ua: UAParser(subscription.userAgentString ?? ''),
    })),
  );

  let failureMessage: string | undefined = $state();
  let kitchen = getContext<Promise<Kitchen>>('kitchen');

  onMount(() => {
    return webPushSubscription.subscribe((subscription) => {
      if (subscription && !subscription.$inArray($subscriptions)) {
        $subscriptions = [subscription, ...$subscriptions];
      }
    });
  });

  async function testNotification(
    subscription: PushSubscriptionWebClass & PushSubscriptionWebData,
  ) {
    $loading = true;
    failureMessage = undefined;

    try {
      if (!(await subscription.$sendTest())) {
        throw new Error('Sending test notification failed.');
      }

      (await kitchen).push({
        label: 'Test notification sent.',
      });
    } catch (e: any) {
      failureMessage = e?.message;
    }

    $loading = false;
  }

  async function deleteSubscription(
    subscription: PushSubscriptionWebClass & PushSubscriptionWebData,
  ) {
    $loading = true;
    failureMessage = undefined;

    try {
      const filtered = $subscriptions.filter((sub) => !subscription.$is(sub));
      if (await subscription.$delete()) {
        $subscriptions = filtered;

        (await kitchen).push({
          label: 'Push notification subscription deleted.',
        });
      } else {
        failureMessage = "Couldn't delete push notification subscription.";
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
</style>
