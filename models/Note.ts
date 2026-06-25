import { NoteType } from "@/types/note";
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

const NoteModel: Model<NoteType> = mongoose.models.notes || mongoose.model<NoteType>('notes',NoteSchema);

export default NoteModel;