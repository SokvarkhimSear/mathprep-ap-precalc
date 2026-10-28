import React from 'react';
import { AlertTriangle, RefreshCw, Mail, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerificationBanner: React.FC = () => {
  const {
    currentUser,
    emailVerified,
    isGoogleUser,
    cooldownSeconds,
    bannerDismissed,
    setBannerDismissed,
    resendVerification,
    checkVerificationStatus,
  } = useAuth();

  // If no user, or user is Google OAuth verified, or already emailVerified, or dismissed: do not render
  if (!currentUser || emailVerified || isGoogleUser || bannerDismissed) {
    return null;
  }

  return (
    <div className="verification-warning-banner sticky top-16 z-30 w-full bg-amber-500/10 border-b border-amber-300/80 px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Warning Icon and Message */}
        <div className="flex items-center gap-2.5 text-amber-900 font-medium">
          <span className="inline-flex items-center justify-center p-1 bg-amber-200 text-amber-800 rounded-md shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <span>Your email address (<strong>{currentUser.email}</strong>) is not verified. </span>
            <span className="text-amber-800/90 hidden md:inline">
              Check your inbox or spam folder, or click below to resend.
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => resendVerification()}
            disabled={cooldownSeconds > 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all shadow-2xs text-xs cursor-pointer ${
              cooldownSeconds > 0
                ? 'bg-amber-100 text-amber-500 cursor-not-allowed border border-amber-200'
                : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-xs'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>
              {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend Verification Email'}
            </span>
          </button>

          <button
            onClick={() => checkVerificationStatus()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs text-xs cursor-pointer"
            title="Reload your account status to confirm verification"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>I've Verified / Refresh</span>
          </button>

          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1 rounded-md text-amber-800 hover:bg-amber-200/50 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
            title="Dismiss temporary banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
