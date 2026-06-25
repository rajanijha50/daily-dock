export interface NoteType {
    user_email: string;
    title?: string;
    content?: string;
    category?: string;
    pinned?: boolean;
    createdAt: Date;
    modifiedAt: Date;
  }