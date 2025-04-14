import type { Nymph } from '@nymphjs/nymph';
import { Entity } from '@nymphjs/nymph';
import { HttpError } from '@nymphjs/server';

export type StateObjectData = {
  acOther: number;
  id: string;
  [k: string]: any;
};

export class StateObject extends Entity<StateObjectData> {
  static ETYPE = 'stateobject';
  static class = 'StateObject';

  private $savingFromBackend = false;
  private $skipAcWhenSaving = false;

  private $deletingFromBackend = false;
  private $skipAcWhenDeleting = false;

  static async factoryId(id?: string): Promise<StateObject & StateObjectData> {
    const entity = await this.factory();
    if (id != null) {
      const entity = await this.nymph.getEntity(
        {
          class: this,
        },
        {
          type: '&',
          equal: ['id', id],
        },
      );
      if (entity != null) {
        return entity;
      }
    }
    return entity;
  }

  async $getUniques() {
    return [`${this.$data.id}`];
  }

  constructor() {
    super();
  }

  public $setNymph(nymph: Nymph) {
    this.$nymph = nymph;
  }

  async $save() {
    if (!this.$savingFromBackend) {
      throw new HttpError('This should only be created by the backend.', 403);
    }
    this.$savingFromBackend = false;

    delete this.$data.user;
    delete this.$data.group;
    delete this.$data.acUser;
    delete this.$data.acGroup;
    this.$data.acOther = 0;
    delete this.$data.acRead;
    delete this.$data.acWrite;
    delete this.$data.acFull;

    if (
      this.$data.id == null ||
      typeof this.$data.id !== 'string' ||
      this.$data.id === ''
    ) {
      throw new HttpError('ID is a required field.', 400);
    }

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
