import { NoteType } from "@/types/database";
import mongoose, { Model } from "mongoose";


const NoteSchema = new mongoose.Schema<NoteType>({
    user_email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
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

const NoteModel: Model<NoteType> = mongoose.models.notes || mongoose.model<NoteType>('notes',NoteSchema);

export default NoteModel;