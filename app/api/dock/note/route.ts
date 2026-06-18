import NoteModel from "@/models/Note";
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
        const NoteData = await NoteModel.find({ user_email: user_email }).sort({ pinned: -1, createdAt: -1 })
        return NextResponse.json({ message: "List of all notes", data: NoteData })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error", status: 500 })
    }

}
export async function POST(request: NextRequest) {
    const note = await request.json()
    if (!note.user_email) {
        return NextResponse.json({ message: "required fields are missing" })
    }

    try {
        await connectDB()
        // check if the user with this email already exist or not
        const alreadyExist = await UserModel.findOne({ email: note.user_email })

        if (!alreadyExist || alreadyExist == null) {
            return NextResponse.json({ message: "this user doesn't exist, user must exist", status: 404 })
        }
        const newNote = new NoteModel({
            user_email: note.user_email,
            title: note?.title,
            content: note?.content,
            category: note?.category,
        })

        await newNote.save()
        return NextResponse.json({ message: "note created", note: newNote, status: 201 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: error, status: 500 })
    }

}
export async function PUT(request: NextRequest) {
    const note = await request.json()
    if (!note._id) {
        return NextResponse.json({ message: "Note ID is required" })
    }
    if (!note.title && !note.content && !note.category && !note.pinned) {
        return NextResponse.json({ message: "No fields provided to update" })
    }
    try {
        await connectDB()
        const UpdatedNote = await NoteModel.findByIdAndUpdate(note._id, {
            title: note?.title,
            content: note?.content,
            category: note?.category,
            pinned: note?.pinned,
            modifiedAt: new Date()
        }, { new: true })

        return NextResponse.json({
            message: "Note updated", data: UpdatedNote, status: 200
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: error, status: 500
        })

    }
}
export async function DELETE(request: NextRequest) {
    const {searchParams} = new URL(request.url)
    const _id = searchParams.get('id')
    if (!_id) {
        return NextResponse.json({ message: "Note ID is required" })
    }
    try {
        await connectDB()
        await NoteModel.findByIdAndDelete(_id)
        return NextResponse.json({ message: "Note Deleted", status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error", status: 500 })
    }


}

