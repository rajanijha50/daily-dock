import { DiaryType } from "@/types/database";
import mongoose, { Model } from "mongoose";


const DiarySchema = new mongoose.Schema<DiaryType>({
    user_email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },
    pinned: {
        type: Boolean,
        required: false,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

const DiaryModel: Model<DiaryType> = mongoose.models.diaries || mongoose.model<DiaryType>('diaries',DiarySchema);

export default DiaryModel;