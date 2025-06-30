import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { asset } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, lng, lat, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    if (!name || lng === undefined || lat === undefined) {
      return NextResponse.json(
        { error: "Name, longitude, and latitude are required" },
        { status: 400 }
      );
    }

    const updatedAsset = await db
      .update(asset)
      .set({
        name,
        description: description || null,
        lng: lng.toString(),
        lat: lat.toString(),
        color: color || "#3b82f6",
        updatedAt: new Date(),
      })
      .where(eq(asset.id as any, id))
      .returning();

    if (updatedAsset.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Asset updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const deletedAsset = await db
      .delete(asset)
      .where(eq(asset.id as any, id))
      .returning();

    if (deletedAsset.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Asset deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
