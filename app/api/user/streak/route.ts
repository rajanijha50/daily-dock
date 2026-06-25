import UserModel from "@/models/User";
import connectDB from "@/utils/db";

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
            user.currentStreak = 1;
        } else {
            const lastLogin = new Date(lastLoginVal.getFullYear(), lastLoginVal.getMonth(), lastLoginVal.getDate());
            
            const diffTime = today.getTime() - lastLogin.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0 && (user.currentStreak || 0) === 0) {
                user.currentStreak = 1;
            } else if (diffDays === 1) {
                user.currentStreak = (user.currentStreak || 0) + 1;
            } else if (diffDays > 1) {
                user.currentStreak = 1;
            }
        }
        user.lastLogin = today;
        await user.save();

        return Response.json({
            success: true,
            message: "Streak updated successfully",
            data: {
                currentStreak: user.currentStreak,
                maxStreak: user.maxStreak,
                lastLogin: user.lastLogin
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