import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { asset } from '@/src/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, lng, lat, color } = body;

    if (!id || !name || lng === undefined || lat === undefined || !color) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const newAsset = await db
      .insert(asset)
      .values({
        id,
        name,
        description: description || null,
        lng,
        lat,
        color,
      })
      .returning();

    return NextResponse.json(newAsset[0], { status: 200 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}