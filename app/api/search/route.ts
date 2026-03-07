import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import SearchResult from "@/lib/models/SearchResult"

export async function GET() {
    try {
        await dbConnect()
        const searchResults = await SearchResult.find({}).sort({ date: -1 })
        return NextResponse.json(searchResults)
    } catch (error) {
        console.error("Failed to fetch search results:", error)
        return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 })
    }
}
