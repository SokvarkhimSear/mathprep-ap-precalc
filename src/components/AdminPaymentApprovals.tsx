import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  getDoc,
} from 'firebase/firestore';

export interface PaymentSubmission {
  id: string;
  user_id: string;
  user_email: string;
  screenshot_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  amount?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface FirestoreUserRecord {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  isPremium?: boolean;
  subscription_end_date?: string;
  limmyAI_credits?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function AdminPaymentApprovals() {
  const { currentUser, userEmail } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'quick_grant'>('submissions');
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [usersList, setUsersList] = useState<FirestoreUserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Submission Filter State
  const [submissionFilter, setSubmissionFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Quick Grant Form State
  const [grantEmailInput, setGrantEmailInput] = useState<string>('');
  const [grantDaysInput, setGrantDaysInput] = useState<number>(30);
  const [grantingStatus, setGrantingStatus] = useState<boolean>(false);

  // Quota Error State
  const [quotaErrorNotice, setQuotaErrorNotice] = useState<boolean>(false);

  // Strict Admin Check
  const isAdmin = userEmail?.toLowerCase() === 'searsokvarkhim1@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'searsokvarkhim1@gmail.com';

  const fetchAllData = async () => {
    setLoading(true);
    setQuotaErrorNotice(false);
    try {
      // 1. Fetch Payment Submissions
      const subSnap = await getDocs(collection(db, 'payment_submissions'));
      const subItems: PaymentSubmission[] = [];
      subSnap.forEach((docSnap) => {
        const data = docSnap.data();
        subItems.push({
          id: docSnap.id,
          user_id: data.user_id || 'guest',
          user_email: data.user_email || 'No email provided',
          screenshot_url: data.screenshot_url || '',
          status: data.status || 'pending',
          created_at: data.created_at || new Date().toISOString(),
          amount: data.amount || '$10.00',
          reviewed_at: data.reviewed_at,
          reviewed_by: data.reviewed_by,
        });
      });
      subItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSubmissions(subItems);

      // 2. Fetch Users from Firebase
      const usersSnap = await getDocs(collection(db, 'users'));
      const userItems: FirestoreUserRecord[] = [];
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        userItems.push({
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          email: data.email || docSnap.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Student User',
          isPremium: Boolean(data.isPremium),
          subscription_end_date: data.subscription_end_date || '',
          limmyAI_credits: data.limmyAI_credits || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // Sort users by email / update date
      userItems.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
      setUsersList(userItems);

    } catch (err: any) {
      console.warn('Error fetching admin data from Firebase:', err);
      if (err?.message && err.message.toLowerCase().includes('quota')) {
        setQuotaErrorNotice(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  // Purge non-admin users except Searsokvarkhim1@gmail.com
  const handlePurgeNonAdminUsers = async () => {
    const adminEmail = 'searsokvarkhim1@gmail.com';
    if (!confirm(`⚠️ WARNING: Are you sure you want to remove ALL users and payment submissions except the admin (${adminEmail})? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      let deletedUsers = 0;
      let deletedSubmissions = 0;

      // 1. Delete non-admin user documents in 'users'
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const docSnap of usersSnap.docs) {
        const data = docSnap.data();
        const email = (data.email || '').toLowerCase();
        if (email !== adminEmail) {
          await deleteDoc(doc(db, 'users', docSnap.id));
          deletedUsers++;
        }
      }

      // 2. Delete non-admin submissions in 'payment_submissions'
      const subsSnap = await getDocs(collection(db, 'payment_submissions'));
      for (const docSnap of subsSnap.docs) {
        const data = docSnap.data();
        const email = (data.user_email || '').toLowerCase();
        if (email !== adminEmail) {
          await deleteDoc(doc(db, 'payment_submissions', docSnap.id));
          deletedSubmissions++;
        }
      }

      alert(`✅ Database Purge Complete!\n\nDeleted ${deletedUsers} non-admin user record(s) and ${deletedSubmissions} non-admin payment submission(s).\n\nOnly admin (${adminEmail}) remains.`);
      await fetchAllData();
    } catch (err: any) {
      console.error('Purge error:', err);
      alert(`Error during user cleanup: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to grant or revoke premium for a target user email/uid
  const handleModifyUserPremium = async (targetEmail: string, targetUid: string, grantDays: number | null) => {
    const isGranting = grantDays !== null;
    const actionLabel = isGranting ? `grant ${grantDays} days of Premium` : 'REVOKE Premium';

    if (!confirm(`Are you sure you want to ${actionLabel} for ${targetEmail}?`)) {
      return;
    }

    setProcessingId(targetUid || targetEmail);
    try {
      const now = new Date();
      let endDateIso = '';
      if (isGranting) {
        const expDate = new Date(now.getTime() + grantDays * 24 * 60 * 60 * 1000);
        endDateIso = expDate.toISOString();
      }

      // 1. Determine doc ref ID in 'users'
      let docIdToUse = targetUid;
      if (!docIdToUse || docIdToUse === 'guest') {
        const userQuery = query(collection(db, 'users'), where('email', '==', targetEmail));
        const userSnap = await getDocs(userQuery);
        if (!userSnap.empty) {
          docIdToUse = userSnap.docs[0].id;
        } else {
          // Format safe doc ID from email
          docIdToUse = targetEmail.toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, '_');
        }
      }

      const userRef = doc(db, 'users', docIdToUse);
      const existingDoc = await getDoc(userRef);

      const userPayload = {
        uid: existingDoc.exists() && existingDoc.data().uid ? existingDoc.data().uid : docIdToUse,
        email: targetEmail,
        displayName: existingDoc.exists() && existingDoc.data().displayName ? existingDoc.data().displayName : targetEmail.split('@')[0],
        isPremium: isGranting,
        subscription_end_date: endDateIso,
        limmyAI_credits: isGranting ? 9999 : 50,
        updatedAt: now.toISOString(),
      };

      if (existingDoc.exists()) {
        await updateDoc(userRef, userPayload);
      } else {
        await setDoc(userRef, {
          ...userPayload,
          createdAt: now.toISOString(),
        }, { merge: true });
      }

      alert(
        isGranting
          ? `✅ Successfully granted Premium to ${targetEmail} for ${grantDays} days! Expiration: ${new Date(endDateIso).toLocaleDateString()}`
          : `🚫 Revoked Premium status for ${targetEmail}.`
      );

      await fetchAllData();
    } catch (err: any) {
      console.error('Error modifying user premium status:', err);
      alert(`Error modifying user premium: ${err?.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Approve Payment Submission
  const handleApproveSubmission = async (sub: PaymentSubmission) => {
    if (!confirm(`Approve payment submission for ${sub.user_email}? This will set isPremium = true for 30 days.`)) {
      return;
    }

    setProcessingId(sub.id);
    try {
      const now = new Date();

      // 1. Mark submission as approved
      await updateDoc(doc(db, 'payment_submissions', sub.id), {
        status: 'approved',
        reviewed_at: now.toISOString(),
        reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
      });

      // 2. Grant 30 days premium to user
      await handleModifyUserPremium(sub.user_email, sub.user_id, 30);
      await fetchAllData();
    } catch (err: any) {
      console.error('Approve payment submission error:', err);
      alert(`Error approving payment: ${err?.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Payment Submission
  const handleRejectSubmission = async (sub: PaymentSubmission) => {
    if (!confirm(`Reject payment submission for ${sub.user_email}?`)) {
      return;
    }

    setProcessingId(sub.id);
    try {
      await updateDoc(doc(db, 'payment_submissions', sub.id), {
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
      });
      alert(`Payment submission rejected.`);
      await fetchAllData();
    } catch (err: any) {
      console.error('Reject submission error:', err);
      alert(`Error rejecting payment: ${err?.message || err}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Quick Direct Grant Submit Form
  const handleQuickGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmailInput.trim()) {
      alert('Please enter a valid user email address.');
      return;
    }

    setGrantingStatus(true);
    await handleModifyUserPremium(grantEmailInput.trim(), '', grantDaysInput);
    setGrantingStatus(false);
    setGrantEmailInput('');
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl max-w-lg mx-auto my-12">
        <div className="text-3xl mb-2">🔒</div>
        <h2 className="text-lg font-bold text-rose-950">Admin Restricted Access</h2>
        <p className="text-xs text-rose-800 mt-1">
          This payment approval and user management portal is restricted strictly to <code className="font-mono bg-rose-100 px-1.5 py-0.5 rounded font-bold">searsokvarkhim1@gmail.com</code>.
        </p>
      </div>
    );
  }

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'all') return true;
    return s.status === submissionFilter;
  });

  // Filter Users
  const filteredUsers = usersList.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.uid || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">💳 Payment Approvals & User Premium Portal</h2>
            <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
              {submissions.filter((s) => s.status === 'pending').length} Pending Submissions
            </span>
            <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
              {usersList.length} Total Users
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review KHQR payment screenshots or select any user to manually grant/revoke Premium access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄 Refresh Data</span>
          </button>
          <button
            onClick={handlePurgeNonAdminUsers}
            disabled={loading}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>🧹 Purge Non-Admin Users</span>
          </button>
        </div>
      </div>

      {/* Quota Exceeded Notice Banner */}
      {quotaErrorNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2.5">
          <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
            <span>⚠️ Firestore Free Read Quota Exceeded for Today</span>
          </div>
          <p className="leading-relaxed">
            Your Firebase Firestore database has reached its daily free tier read quota (Spark plan free daily read limit). Quota limits automatically reset every 24 hours. You can inspect or manage your database directly in the Firebase Console:
          </p>
          <div>
            <a
              href="https://console.firebase.google.com/project/resolute-dialect-ns7sz/firestore/databases/ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172/data?openUpgradeDialog=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 bg-white px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs transition-colors"
            >
              <span>Open Firebase Console Database Manager ↗</span>
            </a>
          </div>
        </div>
      )}

      {/* Main View Tabs (Submissions vs Users List vs Quick Grant) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>💳 Payment Submissions ({submissions.filter((s) => s.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>👥 All Registered Users ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quick_grant')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'quick_grant'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>⚡ Manual Quick Grant</span>
        </button>
      </div>

      {/* TAB 1: KHQR PAYMENT SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Submission Filter Bar */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <button
              onClick={() => setSubmissionFilter('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                submissionFilter === 'pending'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending ({submissions.filter((s) => s.status === 'pending').length})
            </button>
            <button
              onClick={() => setSubmissionFilter('approved')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                submissionFilter === 'approved'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Approved ({submissions.filter((s) => s.status === 'approved').length})
            </button>
            <button
              onClick={() => setSubmissionFilter('rejected')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                submissionFilter === 'rejected'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rejected ({submissions.filter((s) => s.status === 'rejected').length})
            </button>
            <button
              onClick={() => setSubmissionFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                submissionFilter === 'all'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({submissions.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Loading payment submissions from Firestore...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <div className="text-3xl mb-2">📥</div>
              <h4 className="text-sm font-bold text-slate-800">No {submissionFilter} payment submissions found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Submissions appear here when students upload payment screenshots on <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">#/checkout</code>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
                    sub.status === 'pending'
                      ? 'bg-amber-50/40 border-amber-200'
                      : sub.status === 'approved'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                          sub.status === 'pending'
                            ? 'bg-amber-200 text-amber-900'
                            : sub.status === 'approved'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={sub.user_email}>
                        {sub.user_email}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 truncate">UID: {sub.user_id}</p>
                    </div>

                    <div className="flex items-center justify-between bg-white/80 p-2 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-600">Amount:</span>
                      <span className="font-black text-slate-900">{sub.amount || '$10.00'}</span>
                    </div>

                    {/* Screenshot Preview Thumbnail */}
                    {sub.screenshot_url ? (
                      <div
                        onClick={() => setSelectedScreenshot(sub.screenshot_url)}
                        className="relative group cursor-pointer border border-slate-200 rounded-xl overflow-hidden bg-slate-100 max-h-40"
                      >
                        <img
                          src={sub.screenshot_url}
                          alt="Payment Screenshot"
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                          🔍 Zoom Receipt Image
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-100 rounded-xl">
                        No screenshot attached
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {sub.status === 'pending' ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                      <button
                        onClick={() => handleApproveSubmission(sub)}
                        disabled={processingId === sub.id}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {processingId === sub.id ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectSubmission(sub)}
                        disabled={processingId === sub.id}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Reviewed: {sub.reviewed_at ? new Date(sub.reviewed_at).toLocaleDateString() : 'N/A'}
                      </span>
                      <button
                        onClick={() => handleModifyUserPremium(sub.user_email, sub.user_id, sub.status === 'approved' ? null : 30)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {sub.status === 'approved' ? 'Revoke Premium' : 'Re-Grant 30 Days'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTERED USERS & MANUAL PREMIUM MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search user by Name, Email, or UID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing {filteredUsers.length} of {usersList.length} users
            </div>
          </div>

          {/* User Cards Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Fetching registered users from Firebase Firestore...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <div className="text-3xl mb-2">👤</div>
              <h4 className="text-sm font-bold text-slate-800">No users match "{userSearchQuery}"</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for a different email or click "Refresh Data" above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => {
                const isExpActive = u.isPremium && u.subscription_end_date && new Date(u.subscription_end_date).getTime() > Date.now();
                
                return (
                  <div
                    key={u.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
                      u.isPremium
                        ? 'bg-gradient-to-br from-amber-50/60 to-yellow-50/30 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            u.isPremium ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {(u.displayName || u.email || 'U').substring(0, 2).toUpperCase()}
                          </div>

                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 truncate" title={u.email}>
                              {u.displayName || u.email}
                            </h4>
                            <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          u.isPremium
                            ? 'bg-amber-200 text-amber-950 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {u.isPremium ? '👑 Premium' : '👤 Free'}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                        UID: {u.uid}
                      </div>

                      {/* Expiration detail */}
                      <div className="text-xs bg-white/80 p-2 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-medium">Subscription:</span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {u.isPremium
                            ? u.subscription_end_date
                              ? `Expires ${new Date(u.subscription_end_date).toLocaleDateString()}`
                              : 'Active (Lifetime)'
                            : 'Standard Free Tier'}
                        </span>
                      </div>
                    </div>

                    {/* Manual Premium Grant / Revoke Action Buttons */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Manual Grant Controls:
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleModifyUserPremium(u.email, u.uid, 30)}
                          disabled={processingId === u.uid}
                          className="py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
                        >
                          +30 Days
                        </button>

                        <button
                          onClick={() => handleModifyUserPremium(u.email, u.uid, 365)}
                          disabled={processingId === u.uid}
                          className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
                        >
                          +1 Year
                        </button>
                      </div>

                      {u.isPremium && (
                        <button
                          onClick={() => handleModifyUserPremium(u.email, u.uid, null)}
                          disabled={processingId === u.uid}
                          className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
                        >
                          🚫 Revoke Premium Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANUAL QUICK GRANT BY EMAIL FORM */}
      {activeTab === 'quick_grant' && (
        <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚡ Manual Quick Premium Override</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter any student email address to directly grant or extend Premium subscription status in Cloud Firestore without requiring a KHQR submission.
            </p>
          </div>

          <form onSubmit={handleQuickGrantSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Email Address:
              </label>
              <input
                type="email"
                required
                placeholder="e.g. student@gmail.com"
                value={grantEmailInput}
                onChange={(e) => setGrantEmailInput(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Premium Duration:
              </label>
              <select
                value={grantDaysInput}
                onChange={(e) => setGrantDaysInput(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value={30}>30 Days (Standard 1 Month)</option>
                <option value={60}>60 Days (2 Months)</option>
                <option value={90}>90 Days (1 Quarter)</option>
                <option value={365}>365 Days (Full Academic Year)</option>
                <option value={3650}>Lifetime Access (10 Years)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={grantingStatus || !grantEmailInput.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{grantingStatus ? 'Updating Firestore...' : '✨ Grant Premium Access Now'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Lightbox Zoom Modal for Receipts */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative bg-white rounded-2xl p-2 max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
            <img
              src={selectedScreenshot}
              alt="Full Payment Screenshot"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
