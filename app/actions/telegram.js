'use server';

/**
 * Server-Side Input Sanitizer (Anti-XSS)
 * Strips HTML tags, scripts, event attributes, and control characters.
 */
function sanitizeServerString(value, maxLength = 256) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/\b(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, '')
    .replace(/\bon[a-z]+\s*=/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

// Proxy-safe server-side timestamp store keyed by authenticated user identifier (never by IP)
const checkoutSubmissionTimestamps = new Map();
const CHECKOUT_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown between checkout submissions

/**
 * Verifies and records server-side checkout timestamp for a user or session cookie
 * without relying on proxy IP addresses.
 */
export function verifyAndRecordCheckoutTimestamp(userKey, cookieLastTs = 0) {
  const now = Date.now();
  const normalizedKey = sanitizeServerString(userKey, 254).toLowerCase() || 'anonymous_session';

  // 1. Check cookie timestamp if present
  if (cookieLastTs && Number.isFinite(cookieLastTs) && now - cookieLastTs < CHECKOUT_COOLDOWN_MS) {
    const remainingSec = Math.ceil((CHECKOUT_COOLDOWN_MS - (now - cookieLastTs)) / 1000);
    return {
      allowed: false,
      remainingSeconds: remainingSec,
      timestamp: cookieLastTs,
    };
  }

  // 2. Check server-side user-keyed timestamp map
  const prevTs = checkoutSubmissionTimestamps.get(normalizedKey) || 0;
  if (prevTs && now - prevTs < CHECKOUT_COOLDOWN_MS) {
    const remainingSec = Math.ceil((CHECKOUT_COOLDOWN_MS - (now - prevTs)) / 1000);
    return {
      allowed: false,
      remainingSeconds: remainingSec,
      timestamp: prevTs,
    };
  }

  checkoutSubmissionTimestamps.set(normalizedKey, now);

  // Bound map size to prevent unbounded memory growth
  if (checkoutSubmissionTimestamps.size > 2000) {
    const cutoff = now - CHECKOUT_COOLDOWN_MS * 2;
    for (const [k, ts] of checkoutSubmissionTimestamps.entries()) {
      if (ts < cutoff) checkoutSubmissionTimestamps.delete(k);
    }
  }

  return {
    allowed: true,
    remainingSeconds: 0,
    timestamp: now,
  };
}

/**
 * Sends a Telegram text notification to the store owner's Telegram channel or chat ID
 * using the official Telegram Bot API sendMessage endpoint when a student claims payment.
 *
 * Security Layers:
 * - Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID strictly on the server (never NEXT_PUBLIC_).
 * - Strips HTML tags from all inputs before processing.
 * - Never returns raw Telegram API payloads, chat IDs, user emails, or user objects to the client.
 */
export async function sendPaymentTelegramNotification({
  submissionId,
  userEmail,
  userId,
  amount = '$10.00',
  cookieLastTs = 0,
  skipTimestampCheck = false,
} = {}) {
  const cleanEmail = sanitizeServerString(userEmail, 254).replace(/[^a-zA-Z0-9._%+\-@]/g, '');
  const cleanUserId = sanitizeServerString(userId, 128).replace(/[^a-zA-Z0-9_\-]/g, '');
  const cleanSubmissionId = sanitizeServerString(submissionId, 128).replace(/[^a-zA-Z0-9_\-]/g, '');
  const cleanAmount = sanitizeServerString(amount, 32) || '$10.00';

  if (!cleanEmail || !cleanUserId) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated user account is required to submit a payment claim.',
    };
  }

  if (!skipTimestampCheck) {
    const rateCheck = verifyAndRecordCheckoutTimestamp(cleanUserId || cleanEmail, Number(cookieLastTs) || 0);
    if (!rateCheck.allowed) {
      return {
        success: false,
        status: 429,
        cooldownSeconds: rateCheck.remainingSeconds,
        error: `Please wait ${rateCheck.remainingSeconds}s before submitting another payment claim.`,
      };
    }
  }

  // Server-only environment credentials (never prefixed with NEXT_PUBLIC_ or VITE_)
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '9010030487:AAEsWQsyCenwB-pslNetaM8mtYUfTl3kQA8';
  const chatId = process.env.TELEGRAM_CHAT_ID || '2128817856';

  const messageText = `New Payment Claim: ${cleanEmail} (Ref: ${cleanSubmissionId || 'N/A'}) claims they have transferred ${cleanAmount}. Check your bank app.`;

  try {
    const messageEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const messageResponse = await fetch(messageEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
      }),
    });

    const rawPayload = await messageResponse.json();

    if (messageResponse.ok && rawPayload?.ok) {
      // Anti-doxxing: Never return rawPayload, chat metadata, or user PII back to the client
      return {
        success: true,
        dispatchedAt: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        error: 'Unable to dispatch payment notification at this moment.',
      };
    }
  } catch (_error) {
    return {
      success: false,
      error: 'Failed to process payment notification request.',
    };
  }
}
