import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ connected: true });
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        return NextResponse.json(
            { connected: false, error: error.message },
            { status: 500 }
        );
    }
}
