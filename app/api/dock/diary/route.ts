import DiaryModel from "@/models/Diary";
import UserModel from "@/models/User";
import connectDB from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user_email = searchParams.get('user_email');

    if (!user_email) {
        return NextResponse.json({ message: "User email is required" })
    }

    try {
        await connectDB()

        // check if the user with this email already exist or not
        const alreadyExist = await UserModel.findOne({email: user_email})

        if (!alreadyExist || alreadyExist == null) {
            return NextResponse.json({ message: "couldn't get data for this user, because user with this email doesn't exist", status: 404 })
        }
        const DiaryData = await DiaryModel.find({ user_email: user_email }).sort({ pinned: -1, createdAt: -1 })
        return NextResponse.json({ message: "List of all diaries", data: DiaryData })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error", status: 500 })
    }

}
export async function POST(request: NextRequest) {
    const diary = await request.json()
    if (!diary.user_email) {
        return NextResponse.json({ message: "required fields are missing", status: 400 })
    }

    try {
        await connectDB()
        // check if the user with this email already exist or not
        const alreadyExist = await UserModel.findOne({ email: diary.user_email })

        if (!alreadyExist || alreadyExist == null) {
            return NextResponse.json({ message: "this user doesn't exist, user must exist", status: 404 })
        }
        const newNote = new DiaryModel({
            user_email: diary.user_email,
            title: diary?.title,
            content: diary?.content,
        })

        await newNote.save()
        return NextResponse.json({ message: "diary created", diary: newNote, status: 201 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: error, status: 500 })
    }

}
export async function PUT(request: NextRequest) {
    const diary = await request.json()
    if (!diary._id) {
        return NextResponse.json({ message: "Diary ID is required" })
    }
    if (!diary.content && !diary.title && !diary.pinned) {
        return NextResponse.json({ message: "No fields provided to update" })
    }
    try {
        await connectDB()
        const UpdatedDiary = await DiaryModel.findByIdAndUpdate(diary._id, {
            title: diary?.title,
            content: diary?.content,
            pinned: diary?.pinned,
            modifiedAt: new Date()
        }, { new: true })

        return NextResponse.json({
            message: "Diary updated", data: UpdatedDiary, status: 200
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: error, status: 500
        })

    }
}
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('id');
    if (!_id) {
        return NextResponse.json({ message: "Diary ID is required" })
    }
    try {
        await connectDB()
        await DiaryModel.findByIdAndDelete(_id)
        return NextResponse.json({ message: "Diary Deleted", status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error", status: 500 })
    }


}

