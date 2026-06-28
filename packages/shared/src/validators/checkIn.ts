import { z } from 'zod';

/**
 * Wire format of the QR/NFC check-in session token payload (REQ-004 / ADR-004).
 * Untrusted input scanned by the Aikidoka device — must be validated before
 * the HMAC signature is checked server-side. Times are epoch seconds.
 */
export const checkInTokenSchema = z
  .object({
    event_id: z.string().uuid(),
    dojo_id: z.string().uuid(),
    issued_at: z.number().int().nonnegative(),
    expires_at: z.number().int().nonnegative(),
    nonce: z.string().min(1),
  })
  .refine((t) => t.expires_at > t.issued_at, {
    message: 'expires_at deve essere successivo a issued_at',
    path: ['expires_at'],
  });

export type CheckInToken = z.infer<typeof checkInTokenSchema>;
