import { Entity } from '@nymphjs/client';

export type LogEntryData = {
  [k: string]: any;
};

export class LogEntry extends Entity<LogEntryData> {
  // The name of the server class
  public static class = 'LogEntry';

  constructor() {
    super();
  }
}
