
export enum ActivityStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
}

export type ActivityType = 'activity' | 'h1' | 'h2' | 'h3';

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  plannedDuration: number; // in seconds
  actualDuration: number | null;
  startTime: Date | null;
  endTime: Date | null;
  status: ActivityStatus;
}