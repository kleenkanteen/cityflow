import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { asset } from '@/src/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const assets = await db
      .select()
      .from(asset)
      .orderBy(desc(asset.createdAt));

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}