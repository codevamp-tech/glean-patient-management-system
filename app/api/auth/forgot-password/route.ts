import { NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({ email })
        if (!user) {
            // To prevent email enumeration, we return success even if user doesn't exist
            return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        // Set token and expiry (1 hour)
        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour

        await user.save()

        // In a real app, you would send an email here.
        // For this demo/testing, we return the token (in a real app, NEVER do this!)
        return NextResponse.json({
            message: "Reset link generated.",
            resetToken // Returning token for user to "simulate" email link
        })
    } catch (error: any) {
        console.error("Forgot password error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
