import { NextResponse } from \"next/server\"
import crypto from \"crypto\"
import bcrypt from \"bcryptjs\"
import dbConnect from \"@/lib/dbConnect\"
import User from \"@/lib/models/User\"

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json()

        if (!token || !password) {
            return NextResponse.json({
                error: \"Token and password are required\" }, { status: 400 })
        }

        await dbConnect()

        // Hash the token from the URL to compare with hashed token in DB
        const hashedToken = crypto.createHash(\"sha256\").update(token).digest(\"hex\")

        const user = await User.findOne({
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: { $gt: Date.now() }
                })

            if (!user) {
                return NextResponse.json({
                    error: \"Invalid or expired reset token\" }, { status: 400 })
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10)
                user.password = await bcrypt.hash(password, salt)

                // Clear reset fields
                user.resetPasswordToken = undefined
                user.resetPasswordExpires = undefined

                await user.save()

                return NextResponse.json({
                    message: \"Password reset successful\" })
    } catch (error: any) {
                    console.error(\"Reset password error:\", error)
        return NextResponse.json({
                        error: \"Internal server error\" }, { status: 500 })
    }
}
