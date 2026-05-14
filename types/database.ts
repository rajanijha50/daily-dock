export type UserType = {
    // _id: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    currentStreak?: number;
    maxStreak?: number;
    lastLogin?: Date;
    createdAt: Date;
}

export interface NoteType {
    user_email: string;
    title?: string;
    content?: string;
    category?: string;
    createdAt: Date;
    modifiedAt: Date;
}

export interface DiaryType {
    user_email: string;
    title?: string;
    content?: string;
    createdAt: Date;
    modifiedAt: Date;
}

export interface TodoType {
    // user_id: ObjectId;
    user_email: string;
    content: string;
    category?: string;
    status: "not-started" | "in-progress" | "completed";
    createdAt: Date;
    modifiedAt: Date;
}