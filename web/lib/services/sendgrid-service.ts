import { reportError, addBreadcrumb } from '@/lib/rollbar-utils';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using SendGrid API
 * Free tier: 100 emails/day for 60 days, then $19.95/mo for 50K emails
 */
export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<void> {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  
  if (!sendGridApiKey) {
    console.warn('SENDGRID_API_KEY not configured. Email will not be sent.');
    addBreadcrumb('SendGrid API key missing', 'sendgrid:config', 'warning');
    return;
  }

  const fromEmail = from || process.env.SENDGRID_FROM_EMAIL || 'noreply@therapyflow.ai';

  try {
    addBreadcrumb('Sending email via SendGrid', 'sendgrid:send', 'info', { to, subject });

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
    }

    addBreadcrumb('Email sent successfully', 'sendgrid:success', 'info', { to, subject });
  } catch (error: any) {
    reportError(error, 'sendgrid:sendEmail', { to, subject });
    throw error;
  }
}
