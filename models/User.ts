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
    createdAt: {
        type: Date,
        default: Date.now,
        required: false,
    },
});

const UserModel: Model<UserType> = mongoose.models.user || mongoose.model<UserType>('user', UserSchema);
export default UserModel;