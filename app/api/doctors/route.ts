import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Doctor from "@/lib/models/Doctor"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export async function GET() {
    try {
        await dbConnect()

        const doctors = await Doctor.find({}).sort({ name: 1 })
        return NextResponse.json(doctors)
    } catch (error) {
        console.error("Failed to fetch doctors:", error)
        return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect()
        const body = await req.json()
        const { name, specialtyId, phone, email, password } = body

        if (!name || !specialtyId) {
            return NextResponse.json({ error: "Name and Specialty are required" }, { status: 400 })
        }

        const doctorId = `DOC-${Math.floor(1000 + Math.random() * 9000)}`

        // 1. Create User record for login if password and email are provided
        if (email && password) {
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            await User.create({
                name,
                email,
                password: hashedPassword,
                role: "DOCTOR"
            })
        }

        // 2. Create Doctor record
        const newDoctor = new Doctor({
            id: doctorId,
            name,
            specialtyId,
            phone,
            email
        })

        await newDoctor.save()
        return NextResponse.json(newDoctor, { status: 201 })
    } catch (error) {
        console.error("Failed to create doctor:", error)
        return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 })
    }
}

