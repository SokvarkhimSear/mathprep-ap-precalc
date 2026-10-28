import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    verificationModalNotification,
    setVerificationModalNotification,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (authModalTab === 'signup') {
        const res = await signUpWithEmail(email, password);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          // Success notification is handled by verificationModalNotification
          setPassword('');
        }
      } else if (authModalTab === 'signin') {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          handleClose();
        }
      } else if (authModalTab === 'forgot') {
        const sent = await resetPassword(email);
        if (sent) {
          setSuccessMessage('Password reset link sent! Please check your inbox/spam folder.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        handleClose();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              ∑
            </div>
            <span className="font-bold text-slate-900 text-sm">
              MathPrep Account
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Link Sent Notification Modal View */}
        {verificationModalNotification ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Verify Your Email
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {verificationModalNotification}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 text-left flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                To protect student data, full test features and progress synchronization require verified student emails.
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setVerificationModalNotification(null);
                  setAuthModalTab('signin');
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-xs text-sm cursor-pointer"
              >
                Proceed to Sign In
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Tabs */}
            {authModalTab !== 'forgot' ? (
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'signin'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'signup'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">We will email you a secure reset link</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {/* Google OAuth Option placed at top for 1-click access */}
            {authModalTab !== 'forgot' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all shadow-xs text-xs flex items-center justify-between cursor-pointer hover:border-slate-400 group"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </div>
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    Instant Access
                  </span>
                </button>

                <div className="relative my-3.5 flex items-center justify-center text-xs text-slate-400">
                  <div className="grow border-t border-slate-200"></div>
                  <span className="px-2.5 bg-white font-medium text-slate-400 uppercase tracking-wider text-[10px]">
                    or with email
                  </span>
                  <div className="grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* Error / Success banners */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1.5 text-left">
                    <p className="font-semibold text-slate-900">{errorMessage}</p>
                    {errorMessage.includes('Firebase Console') && (
                      <div className="text-[11px] text-slate-700 bg-white/80 border border-amber-200 p-2.5 rounded-lg space-y-1.5">
                        <p className="font-semibold text-slate-900">How to enable Email/Password:</p>
                        <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                          <li>Go to <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong></li>
                          <li>Select <strong>Email/Password</strong> and toggle <strong>Enable</strong></li>
                          <li>Click <strong>Save</strong></li>
                        </ol>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            👉 Or click here to sign in with Google immediately
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {authModalTab !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Forgot password link below password field in Sign In tab */}
                  {authModalTab === 'signin' && (
                    <div className="mt-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('forgot');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-xs text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {authModalTab === 'signup'
                        ? 'Create Account & Verify'
                        : authModalTab === 'signin'
                        ? 'Sign In with Email'
                        : 'Send Password Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
