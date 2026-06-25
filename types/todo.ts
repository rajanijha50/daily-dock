export interface TodoType {
    user_email: string;
    content: string;
    category?: string;
    status: "not-started" | "in-progress" | "completed";
    createdAt: Date;
    modifiedAt: Date;
  }