import type { Nymph } from '@nymphjs/nymph';
import {
  Entity,
  EntityUniqueConstraintError,
  nymphJoiProps,
} from '@nymphjs/nymph';
import type { AccessControlData } from '@nymphjs/tilmeld';
import { tilmeldJoiProps } from '@nymphjs/tilmeld';
import { HttpError } from '@nymphjs/server';
import Joi from 'joi';

export type DashboardData = {
  name: string;
} & AccessControlData;

export class Dashboard extends Entity<DashboardData> {
  static ETYPE = 'dashboard';
  static class = 'Dashboard';

  private $skipAcWhenSaving = false;

  async $getUniques() {
    return [`${this.$data.user?.guid}:${this.$data.name}`];
  }

  constructor() {
    super();
  }

  public $setNymph(nymph: Nymph) {
    this.$nymph = nymph;
  }

  async $save() {
    if (!this.$skipAcWhenSaving && !this.$nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to save.
      throw new HttpError('You are not logged in.', 401);
    }

    // Validate the entity's data.
    try {
      Joi.attempt(
        this.$getValidatable(),
        Joi.object().keys({
          ...nymphJoiProps,
          ...tilmeldJoiProps,

          name: Joi.string().max(64).required(),
        }),
        'Invalid Settings: ',
      );
    } catch (e: any) {
      throw new HttpError(e.message, 400);
    }

    try {
      return await super.$save();
    } catch (e: any) {
      if (e instanceof EntityUniqueConstraintError) {
        throw new HttpError(
          'There is already a dashboard with that name.',
          409,
        );
      }
      throw e;
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
