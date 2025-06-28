import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRequestApprovalEmail(
  requestorEmail: string,
  itemName: string,
  quantity: number,
  startDate: string,
  endDate: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CityFlow <noreply@cityflow.com>',
      to: [requestorEmail],
      subject: 'Equipment Request Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Equipment Request Approved ✅</h2>
          <p>Good news! Your equipment request has been approved.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Request Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Item:</strong> ${itemName}</li>
              <li><strong>Quantity:</strong> ${quantity}</li>
              <li><strong>Start Date:</strong> ${startDate}</li>
              <li><strong>End Date:</strong> ${endDate}</li>
            </ul>
          </div>
          
          <p>Please coordinate with the office staff for pickup arrangements.</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from CityFlow Equipment Management System.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending approval email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error };
  }
}

export async function sendRequestDenialEmail(
  requestorEmail: string,
  itemName: string,
  quantity: number,
  startDate: string,
  endDate: string,
  reason: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CityFlow <noreply@cityflow.com>',
      to: [requestorEmail],
      subject: 'Equipment Request Denied',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Equipment Request Denied ❌</h2>
          <p>We regret to inform you that your equipment request has been denied.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Request Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Item:</strong> ${itemName}</li>
              <li><strong>Quantity:</strong> ${quantity}</li>
              <li><strong>Start Date:</strong> ${startDate}</li>
              <li><strong>End Date:</strong> ${endDate}</li>
            </ul>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #dc2626;">Reason for Denial:</h4>
            <p style="margin-bottom: 0;">${reason}</p>
          </div>
          
          <p>If you have questions about this decision, please contact the office staff.</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from CityFlow Equipment Management System.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending denial email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending denial email:', error);
    return { success: false, error };
  }
}