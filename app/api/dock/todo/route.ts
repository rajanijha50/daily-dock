import TodoModel from "@/models/Todo";
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

        if (!alreadyExist || alreadyExist == null){
            return NextResponse.json({message: "couldn't get data for this user, because user with this email doesn't exist", status: 404})
        }

        const TodoData = await TodoModel.find({ user_email: user_email })
        return NextResponse.json({ message: "List of all todos", data: TodoData })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error", status: 500 })
    }

}
export async function POST(request: NextRequest) {
    const todo = await request.json()
    if (!todo.user_email) {
        return NextResponse.json({ message: "required fields are missing" })
    }

    try {
        await connectDB()

        // check if the user with this email already exist or not
        const alreadyExist = await UserModel.findOne({
            email: todo.user_email
        })

        if (!alreadyExist || alreadyExist == null){
            return NextResponse.json({message: "this user doesn't exist, user must exist", status: 404})
        }

        const newTodo = new TodoModel({
            user_email: todo.user_email,
            content: todo?.content,
            status: todo?.status,
        })

        await newTodo.save()

        return NextResponse.json({ message: "todo created", todo: newTodo, status: 201 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: error, status: 500 })
    }

}
export async function PUT(request: NextRequest) {
    const todo = await request.json()
    if (!todo._id) {
        return NextResponse.json({ message: "Todo ID is required" })
    }
    if (!todo.content && !todo.status && !todo.category) {
        return NextResponse.json({ message: "No fields provided to update" })
    }
    try {
        await connectDB()
        const UpdatedTodo = await TodoModel.findByIdAndUpdate(todo._id, {
            content: todo?.content,
            category: todo?.category,
            status: todo?.status,
            modifiedAt: new Date()
        }, { new: true })

        return NextResponse.json({
            message: "Todo updated", data: UpdatedTodo, status: 200
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
        return NextResponse.json({ message: "Todo ID is required" })
    }
    try {
        await connectDB()
        await TodoModel.findByIdAndDelete(_id)
        return NextResponse.json({ message: "Todo Deleted", status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Internal server error", status: 500 })
    }


}
