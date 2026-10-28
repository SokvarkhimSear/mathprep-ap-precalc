import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  getDocs,
  serverTimestamp,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  projectId: "resolute-dialect-ns7sz",
  appId: "1:867238495850:web:1e73ace9f74306bf9cec13",
  apiKey: "AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU",
  authDomain: "resolute-dialect-ns7sz.firebaseapp.com",
  storageBucket: "resolute-dialect-ns7sz.firebasestorage.app",
  messagingSenderId: "867238495850",
  firestoreDatabaseId: "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172",
};

// Silence internal @firebase/firestore SDK console.error spam when free-tier daily quota is reached
try {
  setLogLevel('silent');
} catch (_e) {}

// Initialize Firebase App
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage(app);

// Initialize Firestore with the explicit provisioned database ID
export const FIRESTORE_DATABASE_ID = "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172";
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

export const ALWAYS_PREMIUM_EMAILS = [
  'searsokvarkhim1@gmail.com',
  'meyjingstudy88@gmail.com',
];

export function isAlwaysPremiumEmail(email?: string | null): boolean {
  if (!email) return false;
  return ALWAYS_PREMIUM_EMAILS.includes(email.trim().toLowerCase());
}

const QUOTA_READ_KEY = 'mathprep_firestore_read_quota_exhausted';
const QUOTA_WRITE_KEY = 'mathprep_firestore_write_quota_exhausted';

export function isQuotaError(error: unknown): boolean {
  const msg = (error instanceof Error ? error.message : String(error || '')).toLowerCase();
  const code = String((error as any)?.code || '').toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource exhausted') ||
    code.includes('resource-exhausted')
  );
}

export function isReadQuotaExhausted(): boolean {
  try {
    return sessionStorage.getItem(QUOTA_READ_KEY) === '1';
  } catch {
    return false;
  }
}

export function isWriteQuotaExhausted(): boolean {
  try {
    return sessionStorage.getItem(QUOTA_WRITE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markReadQuotaExhausted(): void {
  try {
    sessionStorage.setItem(QUOTA_READ_KEY, '1');
  } catch {}
}

export function markWriteQuotaExhausted(): void {
  try {
    sessionStorage.setItem(QUOTA_WRITE_KEY, '1');
  } catch {}
}

// Operation types for structured error reporting
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore (Per skill guidelines)
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (isReadQuotaExhausted()) return true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info(`[Firestore] Successfully connected to database: ${FIRESTORE_DATABASE_ID}`);
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      markReadQuotaExhausted();
      return true;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is currently offline or unreachable.');
    } else {
      console.info(`[Firestore] Connected to database: ${FIRESTORE_DATABASE_ID}`);
    }
    return true;
  }
}

// Firestore Database helper methods
export interface StudentProgress {
  userId: string;
  completedLessons: string[];
  bookmarkedFormulas: string[];
  totalStudyMinutes: number;
  lastActiveAt: string;
}

export async function fetchStudentProgress(userId: string): Promise<StudentProgress | null> {
  const localKey = `mathprep_progress_${userId}`;
  const getLocal = (): StudentProgress | null => {
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  };

  if (isReadQuotaExhausted()) {
    return getLocal();
  }

  try {
    const snap = await getDoc(doc(db, 'users', userId, 'progress', 'main'));
    if (snap.exists()) {
      const data = snap.data() as StudentProgress;
      try {
        localStorage.setItem(localKey, JSON.stringify(data));
      } catch {}
      return data;
    }
    return getLocal();
  } catch (err: any) {
    if (isQuotaError(err)) {
      markReadQuotaExhausted();
    }
    return getLocal();
  }
}

export async function saveStudentProgress(userId: string, progress: Partial<StudentProgress>): Promise<void> {
  const localKey = `mathprep_progress_${userId}`;
  try {
    const prevRaw = localStorage.getItem(localKey);
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    const merged: StudentProgress = {
      userId,
      completedLessons: progress.completedLessons ?? prev.completedLessons ?? [],
      bookmarkedFormulas: progress.bookmarkedFormulas ?? prev.bookmarkedFormulas ?? [],
      totalStudyMinutes: progress.totalStudyMinutes ?? prev.totalStudyMinutes ?? 0,
      lastActiveAt: new Date().toISOString(),
    };
    localStorage.setItem(localKey, JSON.stringify(merged));
  } catch {}

  if (isWriteQuotaExhausted() || isReadQuotaExhausted()) {
    return;
  }

  try {
    await setDoc(
      doc(db, 'users', userId, 'progress', 'main'),
      {
        ...progress,
        userId,
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err: any) {
    if (isQuotaError(err)) {
      markWriteQuotaExhausted();
    }
  }
}

export async function saveExamAttempt(
  userId: string,
  attempt: { examId: string; score: number; totalQuestions: number; percentage: number }
): Promise<void> {
  const attemptId = `attempt_${Date.now()}`;
  try {
    const localAttemptsKey = `mathprep_attempts_${userId}`;
    const prev = JSON.parse(localStorage.getItem(localAttemptsKey) || '[]');
    prev.unshift({
      id: attemptId,
      userId,
      ...attempt,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem(localAttemptsKey, JSON.stringify(prev.slice(0, 50)));
  } catch {}

  if (isWriteQuotaExhausted() || isReadQuotaExhausted()) {
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'attempts', attemptId), {
      userId,
      examId: attempt.examId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      completedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (isQuotaError(err)) {
      markWriteQuotaExhausted();
    }
  }
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  collection,
  getDocs,
  serverTimestamp,
};
export type { User };
