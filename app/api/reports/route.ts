import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Report from "@/lib/models/Report"

export async function GET() {
    try {
        await dbConnect()
        const reports = await Report.find({}).sort({ date: -1 })
        return NextResponse.json(reports)
    } catch (error) {
        console.error("Failed to fetch reports:", error)
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const body = await request.json()
        const report = await Report.create(body)
        return NextResponse.json(report, { status: 201 })
    } catch (error) {
        console.error("Failed to create report:", error)
        return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
    }
}
