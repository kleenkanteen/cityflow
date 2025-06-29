import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { equipmentRequest, inventoryItem } from '@/src/db/schema';
import { desc, eq } from 'drizzle-orm';
import { CreateEquipmentRequestRequest } from '@/src/types/request';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db
      .select({
        id: equipmentRequest.id,
        requestorEmail: equipmentRequest.requestorEmail,
        inventoryId: equipmentRequest.inventoryId,
        inventoryItemName: equipmentRequest.inventoryItemName,
        quantity: equipmentRequest.quantity,
        startDate: equipmentRequest.startDate,
        endDate: equipmentRequest.endDate,
        status: equipmentRequest.status,
        denialReason: equipmentRequest.denialReason,
        createdAt: equipmentRequest.createdAt,
        updatedAt: equipmentRequest.updatedAt,
      })
      .from(equipmentRequest);

    if (status) {
      query = query.where(eq(equipmentRequest.status, status));
    }

    const requests = await query.orderBy(desc(equipmentRequest.createdAt));

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEquipmentRequestRequest = await request.json();
    
    const { requestorEmail, inventoryId, inventoryItemName, quantity, startDate, endDate } = body;

    if (!requestorEmail || !inventoryId || !inventoryItemName || !quantity || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify inventory item exists
    const item = await db
      .select()
      .from(inventoryItem)
      .where(eq(inventoryItem.id, inventoryId))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const newRequest = await db
      .insert(equipmentRequest)
      .values({
        id: uuidv4(),
        requestorEmail,
        inventoryId,
        inventoryItemName,
        quantity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newRequest[0], { status: 201 });
  } catch (error) {
    console.error('Error creating equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}