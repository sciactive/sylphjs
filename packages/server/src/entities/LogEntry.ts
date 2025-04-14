import type {
  EntityData,
  Nymph,
  Options,
  Selector,
  SerializedEntityData,
} from '@nymphjs/nymph';
import { Entity } from '@nymphjs/nymph';
import { HttpError } from '@nymphjs/server';
import Formula from 'fparser';
import * as lodash from 'lodash-es';
import strtotime from 'locutus/php/datetime/strtotime.js';

export type LogEntryData = {
  acOther: number;
  [k: string]: any;
};

export type LogsTimeQuery = {
  query: [Options, ...Selector[]];
  formula: string;
  begin: number | string;
  end: number | string;
  step: number;
};

export type LogsChunksQuery = {
  query: [Options, ...Selector[]];
  formula: string;
  chunkLength: number;
};

export class LogEntry extends Entity<LogEntryData> {
  static ETYPE = 'logentry';
  static class = 'LogEntry';

  static pubSubEnabled = false;

  static clientEnabledStaticMethods = [
    'getLogs',
    'queryLogsTime',
    'queryLogsChunks',
  ];

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

  static async *queryLogsTime({
    query,
    formula,
    begin,
    end,
    step,
  }: LogsTimeQuery): AsyncIterator<
    { begin: number; end: number; value: number },
    void,
    boolean
  > {
    if (!this.nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users.
      throw new HttpError('You are not logged in.', 401);
    }

    const beginDate =
      typeof begin === 'string' ? strtotime(begin) * 1000 : begin;
    const endDate = typeof end === 'string' ? strtotime(end) * 1000 : end;

    let aborted = false;
    let cdate = beginDate;
    let cdateEnd = beginDate + step * 1000;

    const fObj = new Formula(formula, {});
    fObj.lo = lodash;

    while (!aborted) {
      const [options, ...selectors] = query;
      const entries = await this.nymph.getEntities(
        {
          ...options,
          class: this.nymph.getEntityClass(LogEntry),
          return: 'object',
          skipAc: true,
          skipCache: true,
        },
        ...selectors,
        { type: '&', gte: ['cdate', cdate], lt: ['cdate', cdateEnd] },
      );

      const value = {
        begin: cdate,
        end: cdateEnd,
        value: fObj.evaluate({
          // @ts-ignore
          entries,
          getEntries: () => entries,
        }) as number,
      };

      aborted = yield value;

      cdate += step * 1000;
      cdateEnd += step * 1000;
      if (cdate >= endDate) {
        break;
      }
      if (cdateEnd > endDate) {
        cdateEnd = endDate;
      }
    }
  }

  static async *queryLogsChunks({
    query,
    formula,
    chunkLength,
  }: LogsChunksQuery): AsyncIterator<
    { chunk: number; value: number },
    void,
    boolean
  > {
    if (!this.nymph.tilmeld?.gatekeeper()) {
      // Only allow logged in users.
      throw new HttpError('You are not logged in.', 401);
    }

    let aborted = false;
    let offset = 0;

    const fObj = new Formula(formula, {});
    fObj.lo = lodash;

    while (!aborted) {
      const [options, ...selectors] = query;
      const entries = await this.nymph.getEntities(
        {
          ...options,
          class: this.nymph.getEntityClass(LogEntry),
          return: 'object',
          offset,
          limit: chunkLength,
          skipAc: true,
          skipCache: true,
        },
        ...selectors,
      );

      if (entries.length === 0) {
        break;
      }

      const value = {
        chunk: offset / chunkLength,
        value: fObj.evaluate({
          // @ts-ignore
          entries,
          getEntries: () => entries,
        }) as number,
      };

      aborted = yield value;

      offset += chunkLength;
    }
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
