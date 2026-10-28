import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userEmail: string | null;
  loading: boolean;
  emailVerified: boolean;
  isGoogleUser: boolean;
  isPremium: boolean;
  limmyAI_credits: number;
  deductLimmyCredit: () => Promise<boolean>;
  premiumModalOpen: boolean;
  setPremiumModalOpen: (open: boolean) => void;
  premiumModalFeature: { title: string; description: string };
  openPremiumModal: (title?: string, description?: string) => void;
  cooldownSeconds: number;
  bannerDismissed: boolean;
  setBannerDismissed: (dismissed: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'signin' | 'signup' | 'forgot';
  setAuthModalTab: (tab: 'signin' | 'signup' | 'forgot') => void;
  signUpWithEmail: (email: string, pass: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  resendVerification: () => Promise<boolean>;
  checkVerificationStatus: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  guardProtectedAction: (actionName: string, callback: () => void) => boolean;
  verificationModalNotification: string | null;
  setVerificationModalNotification: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [limmyAI_credits, setLimmyCredits] = useState<number>(5);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumModalFeature, setPremiumModalFeature] = useState<{ title: string; description: string }>({
    title: 'AP Precalculus Premium Feature',
    description: 'Upgrade to MathPrep Premium to unlock this feature and achieve a 5 on your AP exam.',
  });
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [verificationModalNotification, setVerificationModalNotification] = useState<string | null>(null);

  // Sync isPremium and openPremiumModal globally for vanilla scripts (e.g. public/practice.js)
  useEffect(() => {
    (window as any).mathprepIsPremium = isPremium;
    (window as any).mathprepLimmyCredits = limmyAI_credits;
  }, [isPremium, limmyAI_credits]);

  const openPremiumModal = (title?: string, description?: string) => {
    setPremiumModalFeature({
      title: title || 'AP Precalculus Premium Feature',
      description: description || 'Upgrade to MathPrep Premium to unlock this feature and achieve a 5 on your AP exam.',
    });
    setPremiumModalOpen(true);
  };

  // Deduct 1 Limmy AI credit for free users; bypass completely for Premium users
  const deductLimmyCredit = async (): Promise<boolean> => {
    if (isPremium) return true; // Unlimited access for Premium users

    if (limmyAI_credits <= 0) {
      openPremiumModal(
        'Out of Limmy AI Credits',
        'You have used all 5 free Limmy AI tutoring prompts. Upgrade to Premium for unlimited 24/7 Socratic guidance!'
      );
      return false;
    }

    const nextCredits = Math.max(0, limmyAI_credits - 1);
    setLimmyCredits(nextCredits);

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          limmyAI_credits: nextCredits,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not persist decremented Limmy credits to Firestore:', e);
      }
    }
    return true;
  };

  useEffect(() => {
    (window as any).openPremiumModal = openPremiumModal;
    (window as any).deductLimmyCredit = deductLimmyCredit;
  }, [deductLimmyCredit, openPremiumModal]);

  // 60-second cooldown timer for resending verification email
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Auth State Listener & Real-Time Profile/Premium Listener
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // If Google OAuth: mark emailVerified as automatically true
        const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
        setIsGoogleUser(isGoogle);

        if (isGoogle) {
          setEmailVerified(true);
        } else {
          setEmailVerified(user.emailVerified);
        }

        // Real-time Firestore listener for isPremium and limmyAI_credits
        const isAdmin = user.email?.toLowerCase() === 'searsokvarkhim1@gmail.com';
        if (isAdmin) {
          setIsPremium(true);
          setLimmyCredits(9999);
        }

        const userDocRef = doc(db, 'users', user.uid);
        if (unsubscribeProfile) unsubscribeProfile();

        unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setIsPremium(isAdmin || Boolean(data?.isPremium));
              setLimmyCredits(isAdmin ? 9999 : (typeof data?.limmyAI_credits === 'number' ? data.limmyAI_credits : 5));
            } else {
              // Initialize default free profile in Firestore (or Premium if admin)
              setDoc(userDocRef, {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Student',
                targetScore: 5,
                isPremium: isAdmin ? true : false,
                limmyAI_credits: isAdmin ? 9999 : 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }).catch((e) => console.warn('Could not write profile to Firestore:', e));
            }
          },
          (err) => {
            console.warn('Realtime profile listener error:', err);
            // On quota error or read failure, preserve admin premium state
            if (isAdmin) {
              setIsPremium(true);
              setLimmyCredits(9999);
            }
          }
        );
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setIsPremium(false);
        setLimmyCredits(5);
        setEmailVerified(false);
        setIsGoogleUser(false);
        setBannerDismissed(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Sign up with Email/Password
  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user = cred.user;

      // 1. Immediately send verification email
      await sendEmailVerification(user);
      setCooldownSeconds(60);

      // 2. Set modal notification
      setVerificationModalNotification(
        `Verification link sent to ${email}! Please check your inbox/spam folder before signing in.`
      );

      // Keep emailVerified false until they verify
      setEmailVerified(false);
      return {
        success: true,
        message: `Verification link sent to ${email}!`,
        requiresVerification: true,
      };
    } catch (err: any) {
      console.warn('Sign up status:', err?.code, err?.message);
      let errMsg = 'Failed to create account.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password sign-up is not enabled in your Firebase Console. Sign in with Google (instant 1-click access) or enable "Email/Password" in Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      } else if (err.message) {
        errMsg = err.message;
      }
      return { success: false, message: errMsg, code: err?.code };
    }
  };

  // Sign in with Email/Password
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const user = cred.user;

      if (!user.emailVerified) {
        setEmailVerified(false);
        setBannerDismissed(false);
      } else {
        setEmailVerified(true);
      }

      return { success: true, message: 'Signed in successfully!' };
    } catch (err: any) {
      console.warn('Sign in status:', err?.code, err?.message);
      let errMsg = 'Invalid email or password.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password sign-in is not enabled in your Firebase Console. Sign in with Google (instant 1-click access) or enable "Email/Password" in Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Incorrect email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      } else if (err.message) {
        errMsg = err.message;
      }
      return { success: false, message: errMsg, code: err?.code };
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setEmailVerified(true);
      setIsGoogleUser(true);
      return { success: true, message: 'Signed in with Google!' };
    } catch (err: any) {
      console.warn('Google sign-in status:', err?.code, err?.message);
      return { success: false, message: 'Google sign-in was cancelled or failed.' };
    }
  };

  // Resend verification email with 60-second cooldown
  const resendVerification = async () => {
    if (!currentUser || cooldownSeconds > 0) return false;
    try {
      await sendEmailVerification(currentUser);
      setCooldownSeconds(60);
      showToast('Verification email sent successfully!');
      return true;
    } catch (err: any) {
      console.warn('Resend verification status:', err?.code, err?.message);
      if (err.code === 'auth/too-many-requests') {
        showToast('Too many requests. Please wait a minute and try again.', 'error');
      }
      return false;
    }
  };

  // Reload user status to check if emailVerified changed to true
  const checkVerificationStatus = async () => {
    if (!currentUser) return false;
    try {
      await currentUser.reload();
      const updatedUser = auth.currentUser;
      if (updatedUser?.emailVerified) {
        setEmailVerified(true);
        showToast('Email verified successfully! Full access unlocked.');
        return true;
      } else {
        showToast('Email is not verified yet. Please check your inbox or spam folder.', 'warning');
        return false;
      }
    } catch (err) {
      console.warn('Reload user status status:', err);
      return false;
    }
  };

  // Forgot password flow
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent! Check your inbox.');
      return true;
    } catch (err: any) {
      console.warn('Password reset status:', err?.code, err?.message);
      let errMsg = 'Failed to send password reset email.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email password reset is disabled in Firebase Console. Please sign in with Google or enable Email/Password provider.';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = 'No account found with this email address.';
      } else if (err.message) {
        errMsg = err.message;
      }
      showToast(errMsg, 'error');
      return false;
    }
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
    setEmailVerified(false);
    setIsGoogleUser(false);
  };

  // Protected action guard (blocks starting official practice exams or saving stats to Firestore)
  const guardProtectedAction = (actionName: string, callback: () => void): boolean => {
    if (!currentUser) {
      setAuthModalTab('signin');
      setAuthModalOpen(true);
      showToast(`Please sign in to ${actionName}.`, 'warning');
      return false;
    }

    if (!emailVerified) {
      setBannerDismissed(false);
      showToast(`Email verification required to ${actionName}. Please check your inbox.`, 'warning');
      return false;
    }

    callback();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userEmail: currentUser?.email || null,
        loading,
        emailVerified,
        isGoogleUser,
        isPremium,
        limmyAI_credits,
        deductLimmyCredit,
        premiumModalOpen,
        setPremiumModalOpen,
        premiumModalFeature,
        openPremiumModal,
        cooldownSeconds,
        bannerDismissed,
        setBannerDismissed,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resendVerification,
        checkVerificationStatus,
        resetPassword,
        logout,
        guardProtectedAction,
        verificationModalNotification,
        setVerificationModalNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Global lightweight Toast helper
export function showToast(message: string, type: 'success' | 'warning' | 'error' = 'success') {
  let container = document.getElementById('mathprep-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'mathprep-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `mathprep-toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
