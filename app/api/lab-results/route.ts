import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import LabResult from "@/lib/models/LabResult"
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

        const labResults = await LabResult.find(query).sort({ date: -1 })
        return NextResponse.json(labResults)
    } catch (error) {
        console.error("Failed to fetch lab results:", error)
        return NextResponse.json({ error: "Failed to fetch lab results" }, { status: 500 })
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
            const count = await LabResult.countDocuments()
            body.id = `LAB${String(count + 1).padStart(3, "0")}`
        }

        // Set date if not provided
        if (!body.date) {
            body.date = new Date().toISOString().split("T")[0]
        }

        const labResult = await LabResult.create(body)
        return NextResponse.json(labResult, { status: 201 })
    } catch (error) {
        console.error("Failed to create lab result:", error)
        return NextResponse.json({ error: "Failed to create lab result" }, { status: 500 })
    }
}
