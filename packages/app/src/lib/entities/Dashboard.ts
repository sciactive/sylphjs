import { Entity } from '@nymphjs/client';

export type DashboardData = {
  name: string;
};

export class Dashboard extends Entity<DashboardData> {
  // The name of the server class
  public static class = 'Dashboard';

  constructor() {
    super();

    this.$data.name = '';
  }
}
