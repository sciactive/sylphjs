import { Entity } from '@nymphjs/client';

export type StateObjectData = {
  id: string;
  [k: string]: any;
};

export class StateObject extends Entity<StateObjectData> {
  // The name of the server class
  public static class = 'StateObject';

  constructor() {
    super();

    this.$data.id = '';
  }
}
