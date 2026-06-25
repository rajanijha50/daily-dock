export type UserType = {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    currentStreak?: number;
    maxStreak?: number;
    lastLogin?: Date;
    createdAt: Date;
  };