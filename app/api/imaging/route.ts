import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ImagingStudy from "@/lib/models/ImagingStudy"
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

        const studies = await ImagingStudy.find(query).sort({ date: -1 })
        return NextResponse.json(studies)
    } catch (error) {
        console.error("Failed to fetch imaging studies:", error)
        return NextResponse.json({ error: "Failed to fetch imaging studies" }, { status: 500 })
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
            const count = await ImagingStudy.countDocuments()
            body.id = `IMG${String(count + 1).padStart(3, "0")}`
        }

        // Derive month and year from date if not provided
        if (body.date && (!body.month || !body.year)) {
            const d = new Date(body.date)
            body.month = d.toLocaleString("en-US", { month: "short" })
            body.year = String(d.getFullYear())
        }

        const study = await ImagingStudy.create(body)
        return NextResponse.json(study, { status: 201 })
    } catch (error) {
        console.error("Failed to create imaging study:", error)
        return NextResponse.json({ error: "Failed to create imaging study" }, { status: 500 })
    }
}
