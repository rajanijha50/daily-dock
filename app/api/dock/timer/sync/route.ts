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
        let timer = await TimerModel.findOne({ user_email, status: { $ne: "completed" } });
        if (!timer) {
            timer = await TimerModel.create({
                user_email,
                status: "not-started",
                started_at: new Date(),
                duration: 25 * 60,
                paused_at: null,
                maxCycles: 1,
                currentCycle: 1
            });
        }
        return NextResponse.json(timer, { status: 200 });
    } catch (error) {
        console.error("GET Timer error:", error);
        return NextResponse.json({ error: "Failed to get timer" }, { status: 500 });
    }
}

export const POST = async (request: NextRequest) => {
    const { user_email, status, started_at, duration, paused_at, maxCycles, currentCycle } = await request.json();

    if (!user_email || !status) {
        return NextResponse.json({ error: "Please provide user_email and status" }, { status: 400 });
    }

    try {
        await connectDB();
        const existing = await TimerModel.findOne({ user_email, status: { $ne: "completed" } });
        if (existing) return NextResponse.json({ error: "The timer is already running" }, { status: 400 });

        const timer = await TimerModel.create({
            user_email,
            status,
            started_at: started_at || new Date(),
            duration: duration || 25 * 60,
            paused_at: paused_at || null,
            maxCycles: maxCycles !== undefined ? maxCycles : 1,
            currentCycle: currentCycle !== undefined ? currentCycle : 1
        });
        return NextResponse.json(timer, { status: 200 });
    } catch (error) {
        console.error("POST Timer error:", error);
        return NextResponse.json({ error: "Failed to create timer" }, { status: 500 });
    }
}

export const PUT = async (request: NextRequest) => {
    const { user_email, status, started_at, duration, paused_at, maxCycles, currentCycle } = await request.json();

    if (!user_email || !status) {
        return NextResponse.json({ error: "Please provide user_email and status" }, { status: 400 });
    }

    try {
        await connectDB();
        let timer = await TimerModel.findOne({ user_email, status: { $ne: "completed" } });
        
        const updateData: any = { status };
        if (duration !== undefined) updateData.duration = duration;
        if (started_at !== undefined) updateData.started_at = started_at;
        if (paused_at !== undefined) updateData.paused_at = paused_at;
        if (maxCycles !== undefined) updateData.maxCycles = maxCycles;
        if (currentCycle !== undefined) updateData.currentCycle = currentCycle;

        if (!timer) {
            timer = await TimerModel.create({
                user_email,
                status,
                started_at: started_at || new Date(),
                duration: duration || 25 * 60,
                paused_at: paused_at || null,
                maxCycles: maxCycles !== undefined ? maxCycles : 1,
                currentCycle: currentCycle !== undefined ? currentCycle : 1
            });
        } else {
            await TimerModel.updateOne({ user_email, status: { $ne: "completed" } }, updateData);
            timer = await TimerModel.findOne({ user_email, status: { $ne: "completed" } });
        }

        return NextResponse.json(timer, { status: 200 });
    } catch (error) {
        console.error("PUT Timer error:", error);
        return NextResponse.json({ error: "Failed to update timer" }, { status: 500 });
    }
}


    