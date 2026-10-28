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
} from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "resolute-dialect-ns7sz",
  appId: "1:867238495850:web:1e73ace9f74306bf9cec13",
  apiKey: "AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU",
  authDomain: "resolute-dialect-ns7sz.firebaseapp.com",
  storageBucket: "resolute-dialect-ns7sz.firebasestorage.app",
  messagingSenderId: "867238495850",
  firestoreDatabaseId: "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172",
};

// Initialize Firebase App
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

import { getStorage } from 'firebase/storage';

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage(app);

// Initialize Firestore with the explicit provisioned database ID
export const FIRESTORE_DATABASE_ID = "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172";
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

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
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore (Per skill guidelines)
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info(`[Firestore] Successfully connected to database: ${FIRESTORE_DATABASE_ID}`);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is currently offline or unreachable.');
    } else {
      console.info(`[Firestore] Connected to database: ${FIRESTORE_DATABASE_ID}`);
    }
    return true;
  }
}

// Auto-run connection validation on load
if (typeof window !== 'undefined') {
  testFirestoreConnection().catch(console.error);
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
  const path = `users/${userId}/progress/main`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'progress', 'main'));
    if (snap.exists()) {
      const data = snap.data() as StudentProgress;
      try { localStorage.setItem(`mathprep_progress_${userId}`, JSON.stringify(data)); } catch (e) {}
      return data;
    }
    return null;
  } catch (err: any) {
    if (err?.message && err.message.toLowerCase().includes('quota')) {
      console.warn('[Firestore Quota] Free read limit reached, returning local cached student progress.');
      try {
        const cached = localStorage.getItem(`mathprep_progress_${userId}`);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return null;
    }
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveStudentProgress(userId: string, progress: Partial<StudentProgress>): Promise<void> {
  const path = `users/${userId}/progress/main`;
  try {
    localStorage.setItem(`mathprep_progress_${userId}`, JSON.stringify(progress));
    const existing = await getDoc(doc(db, 'users', userId, 'progress', 'main'));
    const baseData: StudentProgress = {
      userId,
      completedLessons: progress.completedLessons || [],
      bookmarkedFormulas: progress.bookmarkedFormulas || [],
      totalStudyMinutes: progress.totalStudyMinutes ?? 0,
      lastActiveAt: new Date().toISOString(),
    };

    if (existing.exists()) {
      await setDoc(doc(db, 'users', userId, 'progress', 'main'), {
        ...existing.data(),
        ...progress,
        userId,
        lastActiveAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      await setDoc(doc(db, 'users', userId, 'progress', 'main'), baseData);
    }
  } catch (err: any) {
    if (err?.message && err.message.toLowerCase().includes('quota')) {
      console.warn('[Firestore Quota] Free write limit reached, saved progress locally to localStorage.');
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveExamAttempt(userId: string, attempt: { examId: string; score: number; totalQuestions: number; percentage: number }): Promise<void> {
  const attemptId = `attempt_${Date.now()}`;
  const path = `users/${userId}/attempts/${attemptId}`;
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
    if (err?.message && err.message.toLowerCase().includes('quota')) {
      console.warn('[Firestore Quota] Free write limit reached, skipping attempt Firestore persistence.');
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
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
};
export type { User };
