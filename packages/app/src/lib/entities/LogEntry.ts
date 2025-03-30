import { Entity, type Options, type Selector } from '@nymphjs/client';

export type LogEntryData = {
  [k: string]: any;
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
}
