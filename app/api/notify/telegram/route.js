import { NextResponse } from 'next/server';
import { sendPaymentTelegramNotification } from '../../../actions/telegram';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await sendPaymentTelegramNotification(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send Telegram notification' },
      { status: 500 }
    );
  }
}
