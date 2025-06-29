import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaint } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateComplaintRequest } from '@/src/types/complaint';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<UpdateComplaintRequest, 'id'> = await request.json();
    const { id } = params;
    const { status } = body;

    if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    const updatedComplaint = await db
      .update(complaint)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(complaint.id, id))
      .returning();

    if (updatedComplaint.length === 0) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedComplaint[0]);
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { error: 'Failed to update complaint' },
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

    const deletedComplaint = await db
      .delete(complaint)
      .where(eq(complaint.id, id))
      .returning();

    if (deletedComplaint.length === 0) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json(
      { error: 'Failed to delete complaint' },
      { status: 500 }
    );
  }
}