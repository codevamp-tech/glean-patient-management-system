import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"
import Doctor from "@/lib/models/Doctor"

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        await dbConnect()

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "STAFF",
        })

        // If user is a Doctor, create a Doctor record
        if (user.role === "DOCTOR") {
            const count = await Doctor.countDocuments()
            await Doctor.create({
                id: `DR${String(count + 1).padStart(3, "0")}`,
                name: user.name,
                email: user.email,
                specialtyId: "General", // Default specialty
            })
        }

        return NextResponse.json(
            {
                message: "User created successfully",
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Signup error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
