import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import MedicalRecord from "@/lib/models/MedicalRecord"
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
            query.doctor = { $regex: new RegExp(`^${session.name}$`, "i") }
        }

        const records = await MedicalRecord.find(query).sort({ createdAt: -1 })
        return NextResponse.json(records)
    } catch (error) {
        console.error("Failed to fetch medical records:", error)
        return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 })
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

        // Auto-generate ID if not provided
        if (!body.id) {
            const count = await MedicalRecord.countDocuments()
            body.id = `MR${String(count + 1).padStart(3, "0")}`
        }

        // Set date if not provided
        if (!body.date) {
            body.date = new Date().toISOString().split("T")[0]
        }

        const record = await MedicalRecord.create(body)
        return NextResponse.json(record, { status: 201 })
    } catch (error) {
        console.error("Failed to create medical record:", error)
        return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 })
    }
}
