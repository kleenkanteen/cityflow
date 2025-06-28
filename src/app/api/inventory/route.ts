import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItem } from '@/src/db/schema';
import { desc, ilike, or } from 'drizzle-orm';
import { CreateInventoryItemRequest } from '@/src/types/inventory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = db.select().from(inventoryItem);

    if (search) {
      query = query.where(
        or(
          ilike(inventoryItem.name, `%${search}%`),
          ilike(inventoryItem.description, `%${search}%`)
        )
      );
    }

    const items = await query.orderBy(desc(inventoryItem.createdAt));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateInventoryItemRequest = await request.json();
    
    const { name, description, quantity } = body;

    if (!name || quantity === undefined) {
      return NextResponse.json(
        { error: 'Name and quantity are required' },
        { status: 400 }
      );
    }

    const newItem = await db
      .insert(inventoryItem)
      .values({
        name,
        description: description || null,
        quantity,
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}