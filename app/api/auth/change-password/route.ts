import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"
import { getAuthSession } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { currentPassword, newPassword } = await req.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findById(session.id).select("+password")
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 })
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)

        await user.save()

        return NextResponse.json({ message: "Password updated successfully" })
    } catch (error: any) {
        console.error("Change password error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
