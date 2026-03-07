import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Diagnosis from "@/lib/models/Diagnosis"

export async function GET() {
    try {
        await dbConnect()
        const diagnoses = await Diagnosis.find({})
        return NextResponse.json(diagnoses)
    } catch (error) {
        console.error("Failed to fetch diagnoses:", error)
        return NextResponse.json({ error: "Failed to fetch diagnoses" }, { status: 500 })
    }
}
