import { TodoType } from "@/types/todo";
import mongoose, { Model } from "mongoose";


const TodoSchema = new mongoose.Schema<TodoType>({
    user_email: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
        default: "not-started"
    },
    category: {
        type: String,
        required: false,
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

const TodoModel: Model<TodoType> = mongoose.models.todos || mongoose.model<TodoType>('todos',TodoSchema);

export default TodoModel;