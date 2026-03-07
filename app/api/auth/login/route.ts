import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        )

        const cookieStore = await cookies()
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        })

        return NextResponse.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        })
    } catch (error: any) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
