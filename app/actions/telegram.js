'use server';

/**
 * Sends a Telegram text notification to the store owner's Telegram channel or chat ID
 * using the official Telegram Bot API sendMessage endpoint when a student claims payment.
 */
export async function sendPaymentTelegramNotification({ submissionId, userEmail, userId, amount = '$10.00' }) {
  // Hardcoded credentials as explicitly requested for verification
  const botToken = "9010030487:AAEsWQsyCenwB-pslNetaM8mtYUfTl3kQA8";
  const chatId = "2128817856";

  const messageText = `New Payment Claim: ${userEmail || 'Unknown Email'} claims they have transferred $10. Check your bank app.`;

  console.log('====================================================');
  console.log('[Telegram Action] Hardcoded Credentials Verification');
  console.log('[Telegram Action] Bot Token:', botToken);
  console.log('[Telegram Action] Chat ID:', chatId);
  console.log('[Telegram Action] Customer Email:', userEmail);
  console.log('[Telegram Action] Submission ID:', submissionId);
  console.log('====================================================');

  try {
    const messageEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('[Telegram Action] Sending POST to:', messageEndpoint);

    const messageResponse = await fetch(messageEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
      }),
    });

    const rawPayload = await messageResponse.json();
    console.log(`[Telegram sendMessage Response Status]: ${messageResponse.status} ${messageResponse.statusText}`);
    console.log('[Telegram Raw Response Payload]:', JSON.stringify(rawPayload, null, 2));

    if (messageResponse.ok && rawPayload.ok) {
      return { success: true, data: rawPayload };
    } else {
      console.error('[Telegram API Error]:', rawPayload);
      return { success: false, error: rawPayload?.description || 'Telegram API request failed' };
    }
  } catch (error) {
    console.error('[Telegram Action Exception]:', error);
    return { success: false, error: error?.message || String(error) };
  }
}
