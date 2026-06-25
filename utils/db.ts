import mongoose from "mongoose";

export default async function connectDB(){
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI!)
        console.log('CONNECTED TO DB ✅✅')
    } catch(error){
        console.log(error)
    }
}