import { Resend } from 'resend';
import { serverEnv, isResendConfigured } from '@/lib/env';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!isResendConfigured) return null;
  client ??= new Resend(serverEnv.resendApiKey!);
  return client;
}

export interface SendResult {
  sent: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a transactional email through Resend.
 *
 * Never throws: a failed notification must not lose the visitor's enquiry. The
 * result is returned so the caller can record the failure (and raise an admin
 * notification) while still confirming the submission to the visitor.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<SendResult> {
  const resend = getClient();

  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[email] Resend not configured — would send "${subject}" to ${String(to)}`);
    }
    return { sent: false, error: 'not_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: serverEnv.emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });

    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : 'unknown' };
  }
}
