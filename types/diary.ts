export interface DiaryType {
    user_email: string;
    title?: string;
    content?: string;
    pinned?: boolean;
    createdAt: Date;
    modifiedAt: Date;
  }