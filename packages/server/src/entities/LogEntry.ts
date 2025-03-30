import type {
  EntityData,
  Nymph,
  Options,
  Selector,
  SerializedEntityData,
} from '@nymphjs/nymph';
import { Entity } from '@nymphjs/nymph';
import { HttpError } from '@nymphjs/server';

export type LogEntryData = {
  acUser: number;
  acGroup: number;
  acOther: number;
  [k: string]: any;
};

export class LogEntry extends Entity<LogEntryData> {
  static ETYPE = 'logentry';
  static class = 'LogEntry';

  static pubSubEnabled = false;

  static clientEnabledStaticMethods = ['getLogs'];

  private $savingFromBackend = false;
  private $skipAcWhenSaving = false;

  private $deletingFromBackend = false;
  private $skipAcWhenDeleting = false;

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

  constructor() {
    super();
  }

  public $setNymph(nymph: Nymph) {
    this.$nymph = nymph;
  }

  static async getLogs(options: Options, ...selectors: Selector[]) {
    if (!this.nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users to query.
      throw new HttpError('You are not logged in.', 401);
    }

    return await this.nymph.getEntities(
      {
        ...options,
        class: this.nymph.getEntityClass(LogEntry),
        skipAc: true,
        skipCache: true,
      },
      ...selectors,
    );
  }

  async $save() {
    if (!this.$savingFromBackend) {
      throw new HttpError('This should only be created by the backend.', 403);
    }
    this.$savingFromBackend = false;

    this.$data.acUser = 0;
    this.$data.acGroup = 0;
    this.$data.acOther = 0;

    return await super.$save();
  }

  /*
   * This should *never* be accessible on the client.
   */
  public async $saveSkipAC() {
    this.$skipAcWhenSaving = true;
    this.$savingFromBackend = true;
    return await this.$save();
  }

  public $tilmeldSaveSkipAC() {
    if (this.$skipAcWhenSaving) {
      this.$skipAcWhenSaving = false;
      return true;
    }
    return false;
  }

  async $delete() {
    if (!this.$deletingFromBackend) {
      throw new HttpError('This can only be deleted by the backend.', 403);
    }
    this.$deletingFromBackend = false;

    return await super.$delete();
  }

  /*
   * This should *never* be accessible on the client.
   */
  public async $deleteSkipAC() {
    this.$skipAcWhenDeleting = true;
    this.$deletingFromBackend = true;
    return await this.$delete();
  }

  public $tilmeldDeleteSkipAC() {
    if (this.$skipAcWhenDeleting) {
      this.$skipAcWhenDeleting = false;
      return true;
    }
    return false;
  }
}
