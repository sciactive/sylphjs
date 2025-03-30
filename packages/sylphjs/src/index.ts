import { SYLPHJS_URL } from './environment.js';

interface BaseData {
  guid?: never;
  cdate?: never;
  mdate?: never;
  user?: never;
  group?: never;
  acUser?: never;
  acGroup?: never;
  acOther?: never;
  acRead?: never;
  acWrite?: never;
  acFull?: never;

  tags?: string[];
  [k: string]: any;
}

export type LogEntry = BaseData;
export type StateObject = BaseData & {
  id: string;
};

export type Result = {
  success: boolean;
  status: number | null;
  response: string | null;
  error?: Error;
};

export class Logger {
  url: string;

  constructor(url?: string) {
    const sylphUrl = url == null ? `${SYLPHJS_URL}` : url;
    this.url = sylphUrl.replace(/\/$/, () => '');
  }

  async sendRequest(
    endpoint: string,
    data: LogEntry | StateObject,
  ): Promise<Result> {
    try {
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        redirect: 'follow',
      });

      if (result.ok) {
        return {
          success: true,
          status: result.status,
          response: await result.text(),
        };
      }

      return {
        success: false,
        status: result.status,
        response: await result.text(),
      };
    } catch (e: any) {
      return {
        success: false,
        status: null,
        response: null,
        error: e,
      };
    }
  }

  async logAsync(entry: LogEntry): Promise<Result> {
    const endpoint = `${this.url}/log`;
    return await this.sendRequest(endpoint, entry);
  }

  log(entry: LogEntry) {
    process.nextTick(async () => {
      try {
        const result = await this.logAsync(entry);

        if (!result.success) {
          if (result.error) {
            console.warn(`Sylph.js Log Error: ${result.error}`);
          } else {
            console.warn(
              `Sylph.js Log Failed: ${result.status} ${result.response}`,
            );
          }
        }
      } catch (e: any) {
        console.log('Sylph.js Log Error: ', e);
      }
    });
  }

  async stateAsync(state: StateObject): Promise<Result> {
    const endpoint = `${this.url}/state`;
    return await this.sendRequest(endpoint, state);
  }

  state(state: StateObject) {
    process.nextTick(async () => {
      try {
        const result = await this.stateAsync(state);

        if (!result.success) {
          if (result.error) {
            console.warn(`Sylph.js State Error: ${result.error}`);
          } else {
            console.warn(
              `Sylph.js State Failed: ${result.status} ${result.response}`,
            );
          }
        }
      } catch (e: any) {
        console.log('Sylph.js State Error: ', e);
      }
    });
  }
}

export async function logAsync(entry: LogEntry) {
  return await new Logger().logAsync(entry);
}
export function log(entry: LogEntry) {
  return new Logger().log(entry);
}

export async function stateAsync(state: StateObject) {
  return await new Logger().stateAsync(state);
}
export function state(state: StateObject) {
  return new Logger().state(state);
}
