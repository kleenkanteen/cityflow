import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db";
import { complaint as complaintSchema } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Complaint ID is required' }, { status: 400 });
    }

    const complaints = await db.select().from(complaintSchema).where(eq(complaintSchema.id, id));

    if (complaints.length === 0) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }
    const existingComplaint = complaints[0];

    const updatedComplaint = await db.update(complaintSchema)
      .set({ 
        status: 'resolved',
        resolved: new Date(),
      })
      .where(eq(complaintSchema.id, id))
      .returning();

    if (existingComplaint.email) {
      try {
        await resend.emails.send({
          from: 'sabih@sabih.dev',
          to: existingComplaint.email,
          subject: 'Your Complaint has been Resolved',
          html: `
            <h1>Complaint Resolved</h1>
            <p>Hello ${existingComplaint.name || 'Citizen'},</p>
            <p>We are writing to inform you that your complaint regarding "${existingComplaint.description.substring(0, 50)}..." has been marked as resolved.</p>
            <p>Thank you for helping us improve our city.</p>
            <br/>
            <p>Best,</p>
            <p>The CityFlow Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send resolution email:', emailError);
      }
    }

    return NextResponse.json(updatedComplaint[0], { status: 200 });

  } catch (error) {
    console.error('Error resolving complaint:', error);
    return NextResponse.json({ message: 'An error occurred while resolving the complaint' }, { status: 500 });
  }
}

