import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/lib/models/Appointment"
import { getAuthSession } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getAuthSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        let query: any = {}
        if (session.role === "DOCTOR") {
            query.doctor = { $regex: new RegExp(`^\\s*${session.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*$`, "i") }
        }

        const appointments = await Appointment.find(query).sort({ createdAt: -1 })
        return NextResponse.json(appointments)
    } catch (error) {
        console.error("Failed to fetch appointments:", error)
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAuthSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const body = await request.json()
        const appointment = await Appointment.create(body)
        return NextResponse.json(appointment, { status: 201 })
    } catch (error) {
        console.error("Failed to create appointment:", error)
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect()
        const { _id, ...updateData } = await request.json()
        if (!_id) {
            return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 })
        }
        const updatedAppointment = await Appointment.findByIdAndUpdate(_id, updateData, { new: true })
        if (!updatedAppointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
        }
        return NextResponse.json(updatedAppointment)
    } catch (error) {
        console.error("Failed to update appointment:", error)
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
    }
}
