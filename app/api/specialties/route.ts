import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import specialty from "@/lib/models/Specialty"
import { headers } from "next/headers"

export async function GET() {
    try {
        await dbConnect()
        const headerList = headers()
        const organizationId = (await headerList).get("organization-id") || "default-org"

        const specialties = await specialty.find({ organizationId }).sort({ name: 1 })
        return NextResponse.json(specialties)
    } catch (error) {
        console.error("Failed to fetch specialties:", error)
        return NextResponse.json({ error: "Failed to fetch specialties" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect()
        const headerList = headers()
        const organizationId = (await headerList).get("organization-id") || "default-org"
        const body = await req.json()

        const specialtyId = `SPEC-${Math.floor(1000 + Math.random() * 9000)}`

        const newspecialty = new specialty({
            ...body,
            id: specialtyId,
            description: body.description,
        })

        await newspecialty.save()
        return NextResponse.json(newspecialty, { status: 201 })
    } catch (error) {
        console.error("Failed to create specialty:", error)
        return NextResponse.json({ error: "Failed to create specialty" }, { status: 500 })
    }
}
