import { UserType } from "@/types/database";
import mongoose, { Model } from "mongoose";


const UserSchema = new mongoose.Schema<UserType>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    currentStreak: {
        type: Number,
        default: 0,
        required: false,
    },
    maxStreak: {
        type: Number,
        default: 0,
        required: false,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: false,
    },
});

UserSchema.pre('save', async function () {
    const current = this.currentStreak || 0;
    const max = this.maxStreak || 0;
    if (current > max) {
        this.maxStreak = current;
    }
});

const UserModel: Model<UserType> = mongoose.models.user || mongoose.model<UserType>('user', UserSchema);
export default UserModel;