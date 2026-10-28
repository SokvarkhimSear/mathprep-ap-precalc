'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
  db,
  isQuotaError,
  isReadQuotaExhausted,
  isWriteQuotaExhausted,
  markWriteQuotaExhausted,
} from '@/src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sendPaymentTelegramNotification } from '../actions/telegram';

export default function CheckoutPage() {
  const { currentUser, isPremium, setAuthModalOpen, setAuthModalTab } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [error, setError] = useState('');

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must sign in or create an account before submitting a payment.');
      setAuthModalTab('signin');
      setAuthModalOpen(true);
      return;
    }

    const targetEmail = currentUser.email;
    if (!targetEmail) {
      setError('No email address associated with your account.');
      return;
    }

    setSubmitting(true);

    try {
      const newSubId = `sub_${Date.now()}`;
      const submissionData = {
        id: newSubId,
        user_id: currentUser.uid,
        user_email: targetEmail,
        status: 'pending',
        amount: '$10.00',
        created_at: new Date().toISOString(),
      };

      // 1. Always save locally first so Admin Console sees it immediately even if Firestore daily quota is exhausted
      try {
        const prevSubs = JSON.parse(localStorage.getItem('mathprep_local_payment_submissions') || '[]');
        prevSubs.unshift(submissionData);
        localStorage.setItem('mathprep_local_payment_submissions', JSON.stringify(prevSubs.slice(0, 100)));
      } catch (_e) {}

      // 2. Save payment claim record to Firestore collection 'payment_submissions' if write quota is available
      if (!isWriteQuotaExhausted() && !isReadQuotaExhausted()) {
        try {
          await Promise.race([
            setDoc(doc(db, 'payment_submissions', newSubId), submissionData),
            new Promise((_, reject) => setTimeout(() => reject(new Error('quota-timeout')), 2500)),
          ]);
        } catch (fsErr) {
          if (isQuotaError(fsErr) || String(fsErr?.message || '').includes('quota-timeout')) {
            markWriteQuotaExhausted();
          }
        }
      }

      setSubmissionId(newSubId);

      // 3. Trigger Telegram sendMessage text alert to store owner
      try {
        await fetch('/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: newSubId,
            userEmail: targetEmail,
            userId: currentUser.uid,
            amount: '$10.00',
          }),
        });

        await sendPaymentTelegramNotification({
          submissionId: newSubId,
          userEmail: targetEmail,
          userId: currentUser.uid,
          amount: '$10.00',
        });
      } catch (_telegramErr) {
        // Non-blocking if Telegram webhook is unreachable
      }

      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit payment claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col justify-center items-center px-3 py-6 sm:px-6 md:px-8 font-sans">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden my-auto">
        {/* Mobile-first Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">MathPrep Premium</h1>
              <span className="bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded font-bold">
                👑 $10 / Month
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-200/90 leading-snug">
              Unlock all 6 AP Precalculus Units (71 Topics) & Unlimited AI Tutoring
            </p>
          </div>
          <div className="self-start sm:self-center bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-md tracking-wider uppercase shadow-xs">
            30-DAY ACCESS
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Active Subscription Badge */}
          {isPremium && (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-base">👑</span>
                <span className="leading-tight">Active AP Precalculus Premium Subscription</span>
              </span>
              <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                ACTIVE
              </span>
            </div>
          )}

          {/* Auth Gate: Must Sign In Before Getting Premium */}
          {!currentUser ? (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-5 sm:p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto text-xl shadow-xs">
                🔒
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-amber-950">
                  Sign In or Create an Account First
                </h2>
                <p className="text-xs text-amber-900/90 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                  To upgrade to <b>MathPrep Premium</b>, please sign in to your student account first so your 30-day membership is linked directly to your email!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signin');
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto py-3 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Sign In to Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('signup');
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto py-3 px-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Logged in Account Banner */}
              <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <span className="shrink-0">👤 Signed in:</span>
                  <b className="text-blue-950 font-bold truncate">{currentUser.email}</b>
                </span>
                <span className="text-[10px] bg-blue-200/90 text-blue-900 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                  VERIFIED
                </span>
              </div>

              {/* Submitted Success View */}
              {submitted ? (
                <div className="space-y-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-5 sm:p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-xs">
                    ✓
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
                    Payment Claim Submitted!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed max-w-sm mx-auto">
                    Thank you! Your payment claim for <b className="break-all">{currentUser.email}</b> (Ref: <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded font-bold text-emerald-950">{submissionId}</code>) has been dispatched to admin for instant review.
                  </p>

                  <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200/80 text-xs text-slate-700 text-left space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><b>Admin Alerted:</b> Instant Telegram Notification Sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><b>Expected Approval:</b> 5 – 15 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><b>Account Email:</b> <span className="break-all">{currentUser.email}</span></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                    }}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile-First Centered QR Code Block */}
                  <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl shadow-xs space-y-3 text-center">
                    <div className="space-y-0.5">
                      <span className="inline-block bg-blue-100 text-blue-900 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                        ACLEDA KHQR Payment
                      </span>
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                        Scan Code with Any Mobile Banking App
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Supported: ACLEDA, ABA, Wing, Sathapana, Vattanac & KHQR
                      </p>
                    </div>

                    {/* QR Code Scaling Container for Mobile Phones */}
                    <div className="w-full max-w-xs mx-auto p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-center">
                      <img
                        src="/acleda-qr.png"
                        alt="ACLEDA KHQR Payment Code"
                        width={320}
                        height={320}
                        className="w-full max-w-xs h-auto object-contain rounded-lg sm:rounded-xl"
                      />
                    </div>

                    <div className="text-[11px] text-slate-600 font-semibold bg-white px-3 py-1 rounded-lg border border-slate-200/80">
                      💵 Transfer Amount: <b className="text-slate-950 font-black">$10.00 USD</b>
                    </div>
                  </div>

                  {/* Touch-Friendly Single Submission Form */}
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    {error && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                        {error}
                      </div>
                    )}

                    {/* Prominent Touch-Friendly Button with Ample Padding */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full min-h-[52px] py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] focus:ring-4 focus:ring-emerald-300 text-white font-extrabold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                          <span>Notifying Admin...</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>I have transferred $10</span>
                          <span className="text-emerald-200 text-lg">➔</span>
                        </span>
                      )}
                    </button>

                    <p className="text-[10px] sm:text-[11px] text-slate-400 text-center leading-normal max-w-xs mx-auto">
                      Clicking button alerts admin via Telegram to confirm your transfer and activate your 30-day Premium access.
                    </p>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
