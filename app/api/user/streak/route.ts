import UserModel from "@/models/User";
import connectDB from "@/utils/db";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const emailId = searchParams.get("emailId");

        if (!emailId) {
            return Response.json({
                success: false,
                message: "User ID is required"
            }, { status: 400 });
        }

        const user = await UserModel.findOne({email: emailId});
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            data: {
                currentStreak: user.currentStreak || 0,
                maxStreak: user.maxStreak || 0,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error("Streak GET Error:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { emailId } = await req.json();
        
        if (!emailId) {
            return Response.json({
                success: false,
                message: "User ID is required"
            }, { status: 400 });
        }

        await connectDB();
        const user = await UserModel.findOne({email: emailId});
        
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Use provided date or current server date
        const dateToUse = new Date();
        
        // Normalize to YYYY-MM-DD to ignore time part
        const today = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), dateToUse.getDate());
        
        const lastLoginVal = user.lastLogin;
        
        if (!lastLoginVal) {
            // Should not happen with default: Date.now, but good for safety
            user.currentStreak = 1;
            user.lastLogin = today;
            await user.save();
        } else {
            const lastLogin = new Date(lastLoginVal.getFullYear(), lastLoginVal.getMonth(), lastLoginVal.getDate());
            
            const diffTime = today.getTime() - lastLogin.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Already logged in today, check if we need to initialize streak
                if ((user.currentStreak || 0) === 0) {
                    user.currentStreak = 1;
                    user.lastLogin = today;
                    await user.save();
                }
                // Otherwise no update as per user instruction
            } else if (diffDays === 1) {
                // Consecutive day: increment streak
                user.currentStreak = (user.currentStreak || 0) + 1;
                user.lastLogin = today;
                await user.save();
            } else if (diffDays > 1) {
                // Streak broken: reset to 1
                user.currentStreak = 1;
                user.lastLogin = today;
                await user.save();
            } else if (diffDays < 0) {
                // Date is in the past, ignore
            }
        }

        return Response.json({
            success: true,
            message: "Streak updated successfully",
            data: {
                currentStreak: user.currentStreak,
                maxStreak: user.maxStreak
            }
        });

    } catch (error) {
        console.error("Streak PUT Error:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}