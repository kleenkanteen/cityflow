import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { asset } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const deletedAsset = await db
      .delete(asset)
      .where(eq(asset.id, id))
      .returning();

    if (deletedAsset.length === 0) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Asset deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}