import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Patient from "@/lib/models/Patient"
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
            // Doctor sees only assigned patients. Use robust regex to ignore trailing/leading spaces.
            query.doctor = { $regex: new RegExp(`^\\s*${session.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*$`, "i") }
        }
        // Admin and Staff see all patients, so query remains {}

        const patients = await Patient.find(query).sort({ createdAt: -1 })
        return NextResponse.json(patients)
    } catch (error) {
        console.error("Failed to fetch patients:", error)
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAuthSession()
        if (!hasRole(session, ["ADMIN", "STAFF"])) {
            return NextResponse.json({ error: "Forbidden: Only Admin or Staff can create patients" }, { status: 403 })
        }

        await dbConnect()
        const body = await request.json()

        const patientData = {
            ...body,
            createdBy: session.id,
        }

        const patient = await Patient.create(patientData)
        return NextResponse.json(patient, { status: 201 })
    } catch (error) {
        console.error("Failed to create patient:", error)
        return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
    }
}
