import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItem } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateInventoryItemRequest } from '@/src/types/inventory';
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: Omit<UpdateInventoryItemRequest, 'id'> = await request.json();
    const { id } = params;

    const updatedItem = await db
      .update(inventoryItem)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItem.id, id))
      .returning();

    if (updatedItem.length === 0) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem[0]);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const deletedItem = await db
      .delete(inventoryItem)
      .where(eq(inventoryItem.id, id))
      .returning();

    if (deletedItem.length === 0) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}