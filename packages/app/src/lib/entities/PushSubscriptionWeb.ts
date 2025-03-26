import { Entity } from '@nymphjs/client';

export type PushSubscriptionWebData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgentString?: string;
};

export class PushSubscriptionWeb extends Entity<PushSubscriptionWebData> {
  // The name of the server class
  public static class = 'PushSubscriptionWeb';

  constructor() {
    super();

    this.$data.endpoint = '';
    this.$data.keys = {
      p256dh: '',
      auth: '',
    };
  }

  static async getVapidPublicKey(): Promise<string> {
    return await this.serverCallStatic('getVapidPublicKey', []);
  }

  async $sendTest(): Promise<boolean> {
    return await this.$serverCall('$sendTest', [], true);
  }
}
