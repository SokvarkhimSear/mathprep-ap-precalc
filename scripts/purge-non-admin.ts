import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "resolute-dialect-ns7sz",
  appId: "1:867238495850:web:1e73ace9f74306bf9cec13",
  apiKey: "AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU",
  authDomain: "resolute-dialect-ns7sz.firebaseapp.com",
  storageBucket: "resolute-dialect-ns7sz.firebasestorage.app",
  messagingSenderId: "867238495850",
  firestoreDatabaseId: "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const adminEmail = 'searsokvarkhim1@gmail.com';

async function purge() {
  console.log('Starting Firestore non-admin user & submission cleanup...');

  let userCount = 0;
  let subCount = 0;

  // 1. Clean users collection
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log(`Found ${usersSnap.size} total user records in Firestore.`);
    for (const docSnap of usersSnap.docs) {
      const data = docSnap.data();
      const email = (data.email || '').toLowerCase();
      if (email !== adminEmail) {
        console.log(`Deleting non-admin user document ID: ${docSnap.id} (Email: ${data.email || 'N/A'})`);
        await deleteDoc(doc(db, 'users', docSnap.id));
        userCount++;
      } else {
        console.log(`[PRESERVED] Admin user document ID: ${docSnap.id} (Email: ${data.email})`);
      }
    }
  } catch (err) {
    console.warn('Note during users collection cleanup:', err);
  }

  // 2. Clean payment_submissions collection
  try {
    const subSnap = await getDocs(collection(db, 'payment_submissions'));
    console.log(`Found ${subSnap.size} total payment submissions in Firestore.`);
    for (const docSnap of subSnap.docs) {
      const data = docSnap.data();
      const email = (data.user_email || '').toLowerCase();
      if (email !== adminEmail) {
        console.log(`Deleting non-admin payment submission ID: ${docSnap.id} (Email: ${data.user_email || 'N/A'})`);
        await deleteDoc(doc(db, 'payment_submissions', docSnap.id));
        subCount++;
      } else {
        console.log(`[PRESERVED] Admin payment submission ID: ${docSnap.id} (Email: ${data.user_email})`);
      }
    }
  } catch (err) {
    console.warn('Note during payment_submissions cleanup:', err);
  }

  console.log(`====================================================`);
  console.log(`Cleanup complete! Deleted ${userCount} non-admin user(s) and ${subCount} non-admin payment submission(s).`);
  console.log(`Only admin (${adminEmail}) remains in the database.`);
  console.log(`====================================================`);
  process.exit(0);
}

purge().catch((err) => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
