import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaint } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateComplaintRequest } from '@/src/types/complaint';
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
    const body: Omit<UpdateComplaintRequest, 'id'> = await request.json();
    const { id } = params;
    const { status, reviewed } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      if (!['pending', 'in_progress', 'resolved'].includes(status)) {
        return NextResponse.json(
          { error: 'Valid status is required' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (reviewed !== undefined) {
      updateData.reviewed = reviewed;
    }

    const updatedComplaint = await db
      .update(complaint)
      .set(updateData)
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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