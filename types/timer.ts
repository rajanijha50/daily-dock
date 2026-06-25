export interface TimerType {
    user_email: string;
    status: "running" | "paused" | "not-started" | "completed";
    started_at: Date;
    duration: number;
    paused_at: Date | null;
    maxCycles: number;
    currentCycle: number;
    createdAt: Date;
    modifiedAt: Date;
  }