import type { EntityData, Nymph, SerializedEntityData } from '@nymphjs/nymph';
import { Entity, nymphJoiProps } from '@nymphjs/nymph';
import { nanoid } from '@nymphjs/guid';
import type { AccessControlData } from '@nymphjs/tilmeld';
import { enforceTilmeld, tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';
import webpush from 'web-push';

import {
  VAPID_SUBJECT,
  WEB_PUSH_VAPID_PUBLIC_KEY,
  WEB_PUSH_VAPID_PRIVATE_KEY,
} from '../environment.js';

export type PushSubscriptionWebData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgentString?: string;
} & AccessControlData;

export class PushSubscriptionWeb extends Entity<PushSubscriptionWebData> {
  static ETYPE = 'pushsubscriptionweb';
  static class = 'PushSubscriptionWeb';

  static clientEnabledStaticMethods = ['getVapidPublicKey'];
  protected $clientEnabledMethods = ['$sendTest'];
  protected $allowlistData = ['endpoint', 'keys'];
  protected $protectedTags: string[] = [];
  protected $allowlistTags: string[] = [];

  private $skipAcWhenSaving = false;

  public static async getUniques(_data: {
    guid?: string;
    cdate?: number;
    mdate?: number;
    tags: string[];
    data: EntityData;
    sdata?: SerializedEntityData;
  }): Promise<string[]> {
    return [];
  }

  public static getVapidPublicKey() {
    if (!this.nymph.tilmeld?.gatekeeper()) {
      throw new HttpError('You are not logged in.', 401);
    }
    return WEB_PUSH_VAPID_PUBLIC_KEY;
  }

  constructor() {
    super();
  }

  public $setNymph(nymph: Nymph) {
    this.$nymph = nymph;
    if (!this.$asleep()) {
      if (this.$data.user) {
        this.$data.user.$nymph = nymph;
      }
      if (this.$data.group) {
        this.$data.group.$nymph = nymph;
      }
    }
  }

  async $sendTest() {
    if (!this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to send tests.
      throw new HttpError('You are not logged in.', 401);
    }

    const pushSubscription = {
      endpoint: this.$data.endpoint,
      keys: {
        auth: this.$data.keys.auth,
        p256dh: this.$data.keys.p256dh,
      },
    };

    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: 'Test Notification',
        body: 'This is your requested test notification.',
        tag: 'system/test',
        timestamp: Date.now(),
      }),
      {
        vapidDetails: {
          subject: VAPID_SUBJECT,
          publicKey: WEB_PUSH_VAPID_PUBLIC_KEY,
          privateKey: WEB_PUSH_VAPID_PRIVATE_KEY,
        },
      },
    );

    const success = result.statusCode >= 200 && result.statusCode < 300;

    if (success) {
      try {
        // Update this entity to reflect when it was last used.
        await this.$saveSkipAC();
      } catch (e: any) {
        // Ignore errors.
      }
    }

    return success;
  }

  async $sendNotification(text: string) {
    const pushSubscription = {
      endpoint: this.$data.endpoint,
      keys: {
        auth: this.$data.keys.auth,
        p256dh: this.$data.keys.p256dh,
      },
    };

    let success = false;

    try {
      const result = await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: `Notification`,
          body: text,
          timestamp: Date.now(),
        }),
        {
          vapidDetails: {
            subject: VAPID_SUBJECT,
            publicKey: WEB_PUSH_VAPID_PUBLIC_KEY,
            privateKey: WEB_PUSH_VAPID_PRIVATE_KEY,
          },
        },
      );

      success = result.statusCode >= 200 && result.statusCode < 300;

      if (success) {
        // Update this entity to reflect when it was last used.
        await this.$saveSkipAC();
      }
    } catch (e: any) {
      success = false;
      console.error(e);
    }

    return success;
  }

  async $save() {
    if (!this.$skipAcWhenSaving && !this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    if (this.guid != null) {
      // Look for an entity with the same endpoint.
      const currentEntity = await this.$nymph.getEntity(
        {
          class: this.$nymph.getEntityClass(PushSubscriptionWeb),
        },
        { type: '&', equal: ['endpoint', this.$data.endpoint] },
      );
      if (currentEntity != null) {
        // Update the existing subscription...
        const keys = this.$data.keys;
        this.guid = currentEntity.guid;
        this.tags = currentEntity.tags;
        this.cdate = currentEntity.cdate;
        this.mdate = currentEntity.mdate;
        this.$putData(
          currentEntity.$getData(),
          currentEntity.$getSData(),
          'server',
        );
        // with the new keys.
        this.$data.keys = keys;
      }
    }

    if (!this.$skipAcWhenSaving) {
      const tilmeld = enforceTilmeld(this);
      const ua = tilmeld.request?.get('User-Agent');

      if (ua) {
        this.$data.userAgentString = ua;
      }
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          endpoint: Joi.string().trim(false).min(1).max(1024).required(),
          keys: Joi.object().keys({
            p256dh: Joi.string().trim(false).min(1).max(1024).required(),
            auth: Joi.string().trim(false).min(1).max(1024).required(),
          }),
          userAgentString: Joi.string().trim(false).max(1024),
        }),
        'Invalid PushSubscriptionWeb: ',
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    if (this.guid == null) {
      const transaction = 'pushsubscriptionweb-save-' + nanoid();
      const nymph = this.$nymph;
      const tnymph = await nymph.startTransaction(transaction);
      this.$setNymph(tnymph);

      try {
        // Allow no more than 15 subscriptions per user.
        const subscriptions = await tnymph.getEntities({
          class: tnymph.getEntityClass(PushSubscriptionWeb),
          sort: 'mdate',
        });
        // Delete all but 14. (This will be the 15th.)
        if (subscriptions.length > 14) {
          for (let i = 0; i < subscriptions.length - 14; i++) {
            await subscriptions[i].$delete();
          }
        }

        let success = await super.$save();
        if (success) {
          success = await tnymph.commit(transaction);
        } else {
          await tnymph.rollback(transaction);
        }
        this.$setNymph(nymph);
        return success;
      } catch (e: any) {
        await tnymph.rollback(transaction);
        this.$setNymph(nymph);
        throw e;
      }
    } else {
      return await super.$save();
    }
  }

  /*
   * This should *never* be accessible on the client.
   */
  public async $saveSkipAC() {
    this.$skipAcWhenSaving = true;
    return await this.$save();
  }

  public $tilmeldSaveSkipAC() {
    if (this.$skipAcWhenSaving) {
      this.$skipAcWhenSaving = false;
      return true;
    }
    return false;
  }
}
