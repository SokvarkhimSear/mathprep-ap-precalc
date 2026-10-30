import { NextResponse } from 'next/server';
import { sendPaymentTelegramNotification, verifyAndRecordCheckoutTimestamp } from '../../../actions/telegram';

function parseCookieTimestamp(cookieHeader = '') {
  const match = String(cookieHeader).match(/(?:^|;\s*)mathprep_checkout_ts=(\d+)/);
  return match ? Number(match[1]) : 0;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieLastTs = parseCookieTimestamp(cookieHeader);

    const userKey = body?.userId || body?.userEmail || 'anonymous_session';
    const tsCheck = verifyAndRecordCheckoutTimestamp(userKey, cookieLastTs);

    if (!tsCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          cooldownSeconds: tsCheck.remainingSeconds,
          error: `Please wait ${tsCheck.remainingSeconds} seconds before submitting another payment claim.`,
        },
        { status: 429 }
      );
    }

    const result = await sendPaymentTelegramNotification({
      ...body,
      skipTimestampCheck: true,
    });

    const status = result.status || (result.success ? 200 : 400);
    // Anti-doxxing: Only return boolean success status & cooldown metadata, never user objects or emails
    const response = NextResponse.json(
      {
        success: Boolean(result.success),
        ...(result.error ? { error: result.error } : {}),
      },
      { status }
    );

    if (result.success) {
      response.cookies.set('mathprep_checkout_ts', String(tsCheck.timestamp), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30,
      });
    }

    return response;
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process payment notification' },
      { status: 500 }
    );
  }
}
