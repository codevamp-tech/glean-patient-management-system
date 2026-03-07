import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Invoice from "@/lib/models/Invoice"
import { getAuthSession, hasRole } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getAuthSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const invoices = await Invoice.find({}).sort({ createdAt: -1 })
        return NextResponse.json(invoices)
    } catch (error) {
        console.error("Failed to fetch invoices:", error)
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if (!hasRole(session, ["ADMIN", "STAFF"])) {
            return NextResponse.json({ error: "Forbidden: Only Admin or Staff can create invoices" }, { status: 403 })
        }

        await dbConnect()
        const body = await req.json()

        // Generate a simple Invoice ID if not provided (e.g., INV-123456)
        const invoiceId = body.invoiceId || `INV-${Math.floor(100000 + Math.random() * 900000)}`

        const newInvoice = new Invoice({
            ...body,
            invoiceId,
            organizationId: session.organizationId,
        })

        await newInvoice.save()
        return NextResponse.json(newInvoice, { status: 201 })
    } catch (error) {
        console.error("Failed to create invoice:", error)
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }
}
