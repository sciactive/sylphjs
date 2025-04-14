import {
  Entity,
  type Options,
  type Selector,
  type AbortableAsyncIterator,
} from '@nymphjs/client';

export type LogEntryData = {
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
  // The name of the server class
  public static class = 'LogEntry';

  constructor() {
    super();
  }

  static async getLogs(
    options: Options,
    ...selectors: Selector[]
  ): Promise<(LogEntry & LogEntryData)[]> {
    return await this.serverCallStatic('getLogs', [options, ...selectors]);
  }

  static async queryLogsTime(options: LogsTimeQuery): Promise<
    AbortableAsyncIterator<{
      begin: number;
      end: number;
      value: number;
    }>
  > {
    return await this.serverCallStaticIterator('queryLogsTime', [options]);
  }

  static async queryLogsChunks(options: LogsChunksQuery): Promise<
    AbortableAsyncIterator<{
      chunk: number;
      value: number;
    }>
  > {
    return await this.serverCallStaticIterator('queryLogsChunks', [options]);
  }
}
