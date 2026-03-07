import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import { getAuthSession } from "@/lib/auth"

// GET /api/auth/admin/users - Fetch all users (Admin only)
export async function GET() {
    try {
        const session = await getAuthSession()
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await dbConnect()
        const users = await User.find({}).sort({ role: 1, name: 1 })
        return NextResponse.json(users)
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST /api/auth/admin/reset-password - Reset a user's password (Admin only)
export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const { userId, newPassword } = await req.json()
        if (!userId || !newPassword) {
            return NextResponse.json({ error: "User ID and new password are required" }, { status: 400 })
        }

        await dbConnect()
        const user = await User.findById(userId)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.password = hashedPassword
        await user.save()

        return NextResponse.json({ message: "Password reset successfully" })
    } catch (error) {
        console.error("Failed to reset password:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
