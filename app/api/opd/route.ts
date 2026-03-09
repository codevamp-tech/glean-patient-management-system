import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import OPD from "@/lib/models/OPD"
import { getAuthSession } from "@/lib/auth"

export async function GET() {
    try {
        await dbConnect()
        const registrations = await OPD.find({}).sort({ createdAt: -1 })
        return NextResponse.json(registrations)
    } catch (error) {
        console.error("Failed to fetch OPD registrations:", error)
        return NextResponse.json({ error: "Failed to fetch OPD registrations" }, { status: 500 })
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

        const opdData = {
            ...body,
            createdBy: session.id,
        }

        const opdRecord = await OPD.create(opdData)
        return NextResponse.json(opdRecord, { status: 201 })
    } catch (error) {
        console.error("Failed to create OPD registration:", error)
        return NextResponse.json({ error: "Failed to create OPD registration" }, { status: 500 })
    }
}
