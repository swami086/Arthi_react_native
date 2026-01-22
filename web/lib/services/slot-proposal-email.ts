import { sendEmail } from './sendgrid-service';
import { formatDate, formatTime } from '@/lib/utils';

export interface TimeSlot {
  start: string; // ISO 8601
  end: string; // ISO 8601
  confidence?: number;
}

export async function sendSlotProposalEmail(
  patientEmail: string,
  patientName: string,
  therapistName: string,
  proposedSlots: TimeSlot[],
  bookingLink: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Session Proposal from ${therapistName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Session Proposal</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${patientName},</p>
        
        <p style="font-size: 16px;">
          <strong>${therapistName}</strong> has proposed the following times for your therapy session:
        </p>
        
        <div style="margin: 30px 0;">
          ${proposedSlots.map((slot, i) => {
            const startDate = new Date(slot.start);
            const endDate = new Date(slot.end);
            const slotLink = `${bookingLink}?slot=${i}&proposal=${encodeURIComponent(JSON.stringify(slot))}`;
            
            return `
              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                      ${formatDate(startDate.toISOString())}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; color: #666;">
                      ${formatTime(startDate.toISOString())} - ${formatTime(endDate.toISOString())}
                    </p>
                    ${slot.confidence ? `
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #999;">
                        Confidence: ${Math.round(slot.confidence * 100)}%
                      </p>
                    ` : ''}
                  </div>
                  <a href="${slotLink}" 
                     style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Book This Time
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          <strong>Note:</strong> These proposals expire in 48 hours. Please select your preferred time slot as soon as possible.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          If none of these times work for you, please reply to this email or contact your therapist directly.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="font-size: 12px; color: #999;">
            This is an automated message from TherapyFlow AI. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: patientEmail,
    subject: `Session Proposal from ${therapistName}`,
    html,
  });
}
