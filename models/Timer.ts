import mongoose, { Model } from "mongoose";
import { TimerType } from "@/types/timer";


const TimerSchema = new mongoose.Schema<TimerType>({
    user_email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "not-started",
        required: true
    },
    started_at: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    paused_at: {
        type: Date,
        required: false
    },
    maxCycles:{
        type: Number,
        required: true
    },
    currentCycle:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    modifiedAt:{
        type: Date,
        default: Date.now
    }
});

const TimerModel: Model<TimerType> = mongoose.models.timer || mongoose.model<TimerType>('timer', TimerSchema);

export default TimerModel;