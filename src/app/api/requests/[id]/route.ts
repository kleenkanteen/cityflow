import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { equipmentRequest } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateRequestStatusRequest } from '@/src/types/request';
import { sendRequestApprovalEmail, sendRequestDenialEmail } from '@/src/lib/resend';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<UpdateRequestStatusRequest, 'id'> = await request.json();
    const { id } = params;
    const { status, denialReason } = body;

    if (!status || (status !== 'approved' && status !== 'denied')) {
      return NextResponse.json(
        { error: 'Valid status (approved or denied) is required' },
        { status: 400 }
      );
    }

    if (status === 'denied' && !denialReason) {
      return NextResponse.json(
        { error: 'Denial reason is required when denying a request' },
        { status: 400 }
      );
    }

    // Get the current request details for email
    const currentRequest = await db
      .select()
      .from(equipmentRequest)
      .where(eq(equipmentRequest.id, id))
      .limit(1);

    if (currentRequest.length === 0) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    const request_data = currentRequest[0];

    // Update the request
    const updatedRequest = await db
      .update(equipmentRequest)
      .set({
        status,
        denialReason: status === 'denied' ? denialReason : null,
        updatedAt: new Date(),
      })
      .where(eq(equipmentRequest.id, id))
      .returning();

    if (updatedRequest.length === 0) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    // Send email notification
    const startDateStr = request_data.startDate.toLocaleDateString();
    const endDateStr = request_data.endDate.toLocaleDateString();

    if (status === 'approved') {
      await sendRequestApprovalEmail(
        request_data.requestorEmail,
        request_data.inventoryItemName,
        request_data.quantity,
        startDateStr,
        endDateStr
      );
    } else if (status === 'denied') {
      await sendRequestDenialEmail(
        request_data.requestorEmail,
        request_data.inventoryItemName,
        request_data.quantity,
        startDateStr,
        endDateStr,
        denialReason || 'No reason provided'
      );
    }

    return NextResponse.json(updatedRequest[0]);
  } catch (error) {
    console.error('Error updating equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment request' },
      { status: 500 }
    );
  }
}