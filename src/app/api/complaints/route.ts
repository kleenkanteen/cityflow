import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complaint } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { CreateComplaintRequest, UpdateComplaintRequest } from "@/src/types/complaint";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        let query = db.select().from(complaint);

        if (status) {
            query = query.where(eq(complaint.status, status as 'pending' | 'in_progress' | 'resolved'));
        }

        const complaints = await query.orderBy(desc(complaint.createdAt));

        return NextResponse.json(complaints);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaints" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateComplaintRequest = await request.json();

        const { name, email, description, location, imageUrl } = body;

        if (!description || !location) {
            return NextResponse.json(
                { error: "Description and location are required" },
                { status: 400 }
            );
        }

        const newComplaint = await db
            .insert(complaint)
            .values({
                id: uuidv4(),
                name: name || null,
                email: email || null,
                description,
                location,
                imageUrl: imageUrl || null,
                status: "pending",
                resolved: null, // Explicitly set resolved to null
            })
            .returning();

        return NextResponse.json(newComplaint[0], { status: 201 });
    } catch (error) {
        console.error("Error creating complaint:", error);
        return NextResponse.json(
            { error: "Failed to create complaint" },
            { status: 500 }
        );
    }
}


