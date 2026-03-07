import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const decoded: any = jwt.verify(token, JWT_SECRET)

        await dbConnect()
        const user = await User.findById(decoded.id).select("-password")

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Auth Me error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
