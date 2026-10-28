import { NextResponse } from 'next/server';

export async function GET(request) {
  return handleCron(request);
}

export async function POST(request) {
  return handleCron(request);
}

async function handleCron(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET || 'mathprep_cron_secret_2026';

  if (secret && secret !== cronSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, doc, updateDoc } = await import('firebase/firestore');

    const projectId = "resolute-dialect-ns7sz";
    const databaseId = "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172";

    const config = {
      projectId,
      appId: "1:867238495850:web:1e73ace9f74306bf9cec13",
      apiKey: "AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU",
      authDomain: "resolute-dialect-ns7sz.firebaseapp.com",
    };

    const app = getApps().length ? getApp() : initializeApp(config);
    const db = getFirestore(app, databaseId);

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    let expiredCount = 0;
    let remindersCount = 0;

    const usersSnap = await getDocs(collection(db, 'users'));

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const subEndDateStr = userData.subscription_end_date;

      if (subEndDateStr) {
        const subEndDate = new Date(subEndDateStr);

        // Check if subscription has expired
        if (subEndDate < now && userData.isPremium === true) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            isPremium: false,
            subscription_status: 'expired',
            updatedAt: now.toISOString(),
          });
          expiredCount++;
        }

        // Check if expiring in < 3 days
        if (subEndDate > now && subEndDate <= threeDaysFromNow && userData.isPremium === true) {
          remindersCount++;
          if (process.env.RESEND_API_KEY && userData.email) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                  from: 'MathPrep <support@mathprep.app>',
                  to: [userData.email],
                  subject: 'Your MathPrep AP Precalculus Subscription is Expiring Soon',
                  html: `<p>Hi ${userData.displayName || 'Student'},</p><p>Your MathPrep Premium Subscription will expire on <b>${new Date(subEndDateStr).toLocaleDateString()}</b>. Please visit <a href="${process.env.APP_URL || 'https://mathprep.app'}/#/checkout">MathPrep Checkout</a> to upload a payment screenshot and extend your membership.</p>`,
                }),
              });
            } catch (emailErr) {
              console.warn('[Cron Email Error]:', emailErr);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      expiredSubscriptionsProcessed: expiredCount,
      expiringRemindersSent: remindersCount,
    });
  } catch (error) {
    console.error('[Cron Route Exception]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
