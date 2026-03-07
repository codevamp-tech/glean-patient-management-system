import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Prescription from "@/lib/models/Prescription"
import { getAuthSession, hasRole } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getAuthSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        let query: any = {}
        if (session.role === "DOCTOR") {
            // Match by ID or Name for better flexibility
            query = {
                $or: [
                    { doctorId: session.id },
                    { doctorName: { $regex: new RegExp(`^${session.name}$`, "i") } }
                ]
            }
        }

        const prescriptions = await Prescription.find(query).sort({ issued: -1 })
        return NextResponse.json(prescriptions)
    } catch (error) {
        console.error("Failed to fetch prescriptions:", error)
        return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAuthSession()
        if (!hasRole(session, ["DOCTOR", "ADMIN"])) {
            return NextResponse.json({ error: "Forbidden: Only Doctors can create prescriptions" }, { status: 403 })
        }

        await dbConnect()
        const body = await request.json()

        // Auto-generate robust ID if not provided
        if (!body.id) {
            const timestamp = Date.now().toString().slice(-4)
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
            body.id = `RX-${timestamp}-${random}`
        }

        // Set issued date if not provided
        if (!body.issued) {
            body.issued = new Date().toISOString().split("T")[0]
        }

        const patientData = {
            ...body,
            doctorId: session.id,
            doctorName: session.role === "DOCTOR" ? body.doctorName : body.doctorName, // Should ideally come from user profile
        }

        const prescription = await Prescription.create(patientData)
        return NextResponse.json(prescription, { status: 201 })
    } catch (error: any) {
        console.error("CRITICAL: Failed to create prescription:", error)
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
    }
}
