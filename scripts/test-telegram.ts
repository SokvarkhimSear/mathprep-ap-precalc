import { sendPaymentTelegramNotification } from '../app/actions/telegram.js';

async function runTest() {
  console.log('Executing live test for Telegram sendMessage notification...');
  const res = await sendPaymentTelegramNotification({
    submissionId: 'test_sub_verification',
    userEmail: 'searsokvarkhim1@gmail.com',
    userId: 'user_admin_test',
    amount: '$10.00',
  });
  console.log('Live Test Execution Result:', res);
  process.exit(0);
}

runTest();
