import { NextRequest, NextResponse } from "next/server";
import TimerModel from "@/models/Timer";
import connectDB from "@/utils/db";

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const user_email = searchParams.get('user_email');

    if (!user_email) {
        return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    try {
        await connectDB();
        const timer = await TimerModel.find({ user_email, status: "completed" }).sort({ createdAt: -1 });
        if (!timer || timer.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(timer, { status: 200 });
    } catch (error) {
        console.error("GET Timer error:", error);
        return NextResponse.json({ error: "Failed to get timer" }, { status: 500 });
    }
}


export const DELETE = async (request: NextRequest) => {
    const { user_email, timer_id } = await request.json();

    if (!user_email || !timer_id) {
        return NextResponse.json({ error: "Please provide user_email and timer_id" }, { status: 400 });
    }

    try {
        await connectDB();
        await TimerModel.deleteOne({ user_email, _id: timer_id });
        return NextResponse.json({ message: "Timer deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete timer from history" }, { status: 500 });
    }
}

    