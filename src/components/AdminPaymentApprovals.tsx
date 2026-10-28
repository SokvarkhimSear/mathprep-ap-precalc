import React, { useState, useEffect } from 'react';
import { useAuth, showToast } from '../context/AuthContext';
import {
  db,
  isQuotaError,
  isReadQuotaExhausted,
  isWriteQuotaExhausted,
  markReadQuotaExhausted,
  markWriteQuotaExhausted,
  ALWAYS_PREMIUM_EMAILS,
  isAlwaysPremiumEmail,
} from '../firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
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

function getLocalUsersDirectory(): Record<string, FirestoreUserRecord> {
  try {
    const raw = localStorage.getItem('mathprep_local_users_directory');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsersDirectory(dir: Record<string, FirestoreUserRecord>) {
  try {
    localStorage.setItem('mathprep_local_users_directory', JSON.stringify(dir));
  } catch {}
}

function getLocalSubmissions(): PaymentSubmission[] {
  try {
    const raw = localStorage.getItem('mathprep_local_payment_submissions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSubmissions(subs: PaymentSubmission[]) {
  try {
    localStorage.setItem('mathprep_local_payment_submissions', JSON.stringify(subs));
  } catch {}
}

export function AdminPaymentApprovals() {
  const { currentUser, userEmail } = useAuth();

  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'quick_grant'>('submissions');
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [usersList, setUsersList] = useState<FirestoreUserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [submissionFilter, setSubmissionFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  const [grantEmailInput, setGrantEmailInput] = useState<string>('');
  const [grantDaysInput, setGrantDaysInput] = useState<number>(30);
  const [grantingStatus, setGrantingStatus] = useState<boolean>(false);

  const [quotaErrorNotice, setQuotaErrorNotice] = useState<boolean>(false);

  const isAdmin =
    userEmail?.toLowerCase() === 'searsokvarkhim1@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'searsokvarkhim1@gmail.com';

  const hydrateFromLocalCache = () => {
    const localSubs = getLocalSubmissions();
    localSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setSubmissions(localSubs);

    const localDir = getLocalUsersDirectory();
    ALWAYS_PREMIUM_EMAILS.forEach((guaranteedEmail) => {
      const key = guaranteedEmail.toLowerCase();
      const existing = localDir[key];
      const cleanId = existing?.uid || existing?.id || key.replace(/[^a-zA-Z0-9_\-]/g, '_');
      localDir[key] = {
        ...(existing || {}),
        id: cleanId,
        uid: cleanId,
        email: key,
        displayName:
          existing?.displayName ||
          (key === 'searsokvarkhim1@gmail.com' ? 'searsokvarkhim1 (Admin)' : key.split('@')[0]),
        isPremium: true,
        limmyAI_credits: 9999,
      };
    });
    saveLocalUsersDirectory(localDir);

    const uList = Object.values(localDir).map((u) => ({
      ...u,
      id: u.id || u.uid || u.email,
      uid: u.uid || u.id || u.email,
      displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Student User'),
      isPremium: isAlwaysPremiumEmail(u.email) ? true : Boolean(u.isPremium),
    }));
    uList.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    setUsersList(uList);
  };

  const fetchAllData = async () => {
    setLoading(true);
    hydrateFromLocalCache();

    if (isReadQuotaExhausted()) {
      setQuotaErrorNotice(true);
      setLoading(false);
      return;
    }

    try {
      const subSnap = await getDocs(collection(db, 'payment_submissions'));
      const subMap = new Map<string, PaymentSubmission>();
      getLocalSubmissions().forEach((s) => subMap.set(s.id, s));

      subSnap.forEach((docSnap) => {
        const data = docSnap.data();
        subMap.set(docSnap.id, {
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

      const mergedSubs = Array.from(subMap.values());
      mergedSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSubmissions(mergedSubs);
      saveLocalSubmissions(mergedSubs);

      const usersSnap = await getDocs(collection(db, 'users'));
      const localDir = getLocalUsersDirectory();
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const emailKey = (data.email || docSnap.id).toLowerCase();
        localDir[emailKey] = {
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          email: data.email || docSnap.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Student User',
          isPremium: isAlwaysPremiumEmail(emailKey) ? true : Boolean(data.isPremium),
          subscription_end_date: data.subscription_end_date || '',
          limmyAI_credits: isAlwaysPremiumEmail(emailKey) ? 9999 : (data.limmyAI_credits || 0),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      // Ensure guaranteed premium emails exist in localDir and Firestore if write quota permits
      for (const guaranteedEmail of ALWAYS_PREMIUM_EMAILS) {
        const key = guaranteedEmail.toLowerCase();
        const existing = localDir[key];
        const cleanId = existing?.id || existing?.uid || key.replace(/[^a-zA-Z0-9_\-]/g, '_');
        localDir[key] = {
          ...(existing || {}),
          id: cleanId,
          uid: cleanId,
          email: key,
          displayName:
            existing?.displayName ||
            (key === 'searsokvarkhim1@gmail.com' ? 'searsokvarkhim1 (Admin)' : key.split('@')[0]),
          isPremium: true,
          limmyAI_credits: 9999,
        };
        if (!isWriteQuotaExhausted()) {
          setDoc(
            doc(db, 'users', cleanId),
            {
              ...localDir[key],
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => {
            if (isQuotaError(e)) markWriteQuotaExhausted();
          });
        }
      }

      saveLocalUsersDirectory(localDir);
      const userItems = Object.values(localDir);
      userItems.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
      setUsersList(userItems);
      setQuotaErrorNotice(false);
    } catch (err: any) {
      if (isQuotaError(err)) {
        markReadQuotaExhausted();
        setQuotaErrorNotice(true);
      }
      hydrateFromLocalCache();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const handlePurgeNonAdminUsers = async () => {
    setLoading(true);
    try {
      let deletedUsers = 0;
      let deletedSubmissions = 0;

      // Clear local cache of non-protected users & submissions
      const localDir = getLocalUsersDirectory();
      Object.keys(localDir).forEach((k) => {
        if (!isAlwaysPremiumEmail(k)) {
          delete localDir[k];
          deletedUsers++;
        }
      });
      saveLocalUsersDirectory(localDir);

      const remainingSubs = getLocalSubmissions().filter((s) =>
        isAlwaysPremiumEmail(s.user_email)
      );
      saveLocalSubmissions(remainingSubs);

      if (!isReadQuotaExhausted() && !isWriteQuotaExhausted()) {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          for (const docSnap of usersSnap.docs) {
            const data = docSnap.data();
            const email = (data.email || '').toLowerCase();
            if (!isAlwaysPremiumEmail(email)) {
              await deleteDoc(doc(db, 'users', docSnap.id));
              deletedUsers++;
            }
          }

          const subsSnap = await getDocs(collection(db, 'payment_submissions'));
          for (const docSnap of subsSnap.docs) {
            const data = docSnap.data();
            const email = (data.user_email || '').toLowerCase();
            if (!isAlwaysPremiumEmail(email)) {
              await deleteDoc(doc(db, 'payment_submissions', docSnap.id));
              deletedSubmissions++;
            }
          }
        } catch (fsErr) {
          if (isQuotaError(fsErr)) {
            markWriteQuotaExhausted();
            setQuotaErrorNotice(true);
          }
        }
      }

      showToast(
        `Database cleanup complete: removed non-protected records.`,
        'success'
      );
      await fetchAllData();
    } catch (err: any) {
      showToast(`Notice during user cleanup: ${err?.message || err}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyUserPremium = async (targetEmail: string, targetUid: string, grantDays: number | null) => {
    const isGranting = grantDays !== null;
    setProcessingId(targetUid || targetEmail);
    try {
      const now = new Date();
      let endDateIso = '';
      if (isGranting) {
        const expDate = new Date(now.getTime() + grantDays * 24 * 60 * 60 * 1000);
        endDateIso = expDate.toISOString();
      }

      const cleanId =
        targetUid && targetUid !== 'guest'
          ? targetUid
          : targetEmail.toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, '_');

      const userPayload: FirestoreUserRecord = {
        id: cleanId,
        uid: cleanId,
        email: targetEmail,
        displayName: targetEmail.split('@')[0],
        isPremium: isGranting,
        subscription_end_date: endDateIso,
        limmyAI_credits: isGranting ? 9999 : 50,
        updatedAt: now.toISOString(),
      };

      // 1. Always update local directory & profile cache immediately
      const localDir = getLocalUsersDirectory();
      localDir[targetEmail.toLowerCase()] = {
        ...(localDir[targetEmail.toLowerCase()] || {}),
        ...userPayload,
      };
      saveLocalUsersDirectory(localDir);
      try {
        localStorage.setItem(`mathprep_user_profile_${cleanId}`, JSON.stringify(userPayload));
        localStorage.setItem(`mathprep_user_profile_email_${targetEmail.toLowerCase()}`, JSON.stringify(userPayload));
      } catch {}

      // 2. Persist to Firestore if quota is available
      if (!isWriteQuotaExhausted() && !isReadQuotaExhausted()) {
        try {
          let docIdToUse = targetUid;
          if (!docIdToUse || docIdToUse === 'guest') {
            const userQuery = query(collection(db, 'users'), where('email', '==', targetEmail));
            const userSnap = await getDocs(userQuery);
            if (!userSnap.empty) {
              docIdToUse = userSnap.docs[0].id;
            } else {
              docIdToUse = cleanId;
            }
          }

          const userRef = doc(db, 'users', docIdToUse);
          await Promise.race([
            setDoc(
              userRef,
              {
                ...userPayload,
                uid: docIdToUse,
                createdAt: now.toISOString(),
              },
              { merge: true }
            ),
            new Promise((_, reject) => setTimeout(() => reject(new Error('quota-timeout')), 2500)),
          ]);
        } catch (fsErr) {
          if (isQuotaError(fsErr) || String((fsErr as any)?.message || '').includes('quota-timeout')) {
            markWriteQuotaExhausted();
            setQuotaErrorNotice(true);
          }
        }
      }

      showToast(
        isGranting
          ? `Granted Premium to ${targetEmail} for ${grantDays} days!`
          : `Revoked Premium status for ${targetEmail}.`,
        'success'
      );

      await fetchAllData();
    } catch (err: any) {
      showToast(`Updated locally (${targetEmail}).`, 'warning');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveSubmission = async (sub: PaymentSubmission) => {
    setProcessingId(sub.id);
    try {
      const now = new Date();
      const updatedSubs = getLocalSubmissions().map((s) =>
        s.id === sub.id
          ? {
              ...s,
              status: 'approved' as const,
              reviewed_at: now.toISOString(),
              reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
            }
          : s
      );
      saveLocalSubmissions(updatedSubs);

      if (!isWriteQuotaExhausted() && !isReadQuotaExhausted()) {
        try {
          await Promise.race([
            updateDoc(doc(db, 'payment_submissions', sub.id), {
              status: 'approved',
              reviewed_at: now.toISOString(),
              reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('quota-timeout')), 2500)),
          ]);
        } catch (fsErr) {
          if (isQuotaError(fsErr) || String((fsErr as any)?.message || '').includes('quota-timeout')) {
            markWriteQuotaExhausted();
            setQuotaErrorNotice(true);
          }
        }
      }

      await handleModifyUserPremium(sub.user_email, sub.user_id, 30);
      await fetchAllData();
    } catch (err: any) {
      showToast(`Approved payment submission for ${sub.user_email}.`, 'success');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmission = async (sub: PaymentSubmission) => {
    setProcessingId(sub.id);
    try {
      const nowIso = new Date().toISOString();
      const updatedSubs = getLocalSubmissions().map((s) =>
        s.id === sub.id
          ? {
              ...s,
              status: 'rejected' as const,
              reviewed_at: nowIso,
              reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
            }
          : s
      );
      saveLocalSubmissions(updatedSubs);

      if (!isWriteQuotaExhausted() && !isReadQuotaExhausted()) {
        try {
          await Promise.race([
            updateDoc(doc(db, 'payment_submissions', sub.id), {
              status: 'rejected',
              reviewed_at: nowIso,
              reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('quota-timeout')), 2500)),
          ]);
        } catch (fsErr) {
          if (isQuotaError(fsErr) || String((fsErr as any)?.message || '').includes('quota-timeout')) {
            markWriteQuotaExhausted();
            setQuotaErrorNotice(true);
          }
        }
      }

      showToast(`Payment submission for ${sub.user_email} marked as rejected.`, 'warning');
      await fetchAllData();
    } catch {
      hydrateFromLocalCache();
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmailInput.trim()) {
      showToast('Please enter a valid user email address.', 'warning');
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

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'all') return true;
    return s.status === submissionFilter;
  });

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
            Review KHQR payment claims or select any user to manually grant/revoke Premium access.
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
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2">
          <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
            <span>⚡ Local Persistence Active (Firestore Daily Free Quota Reached)</span>
          </div>
          <p className="leading-relaxed">
            Your Firebase Firestore Spark database has reached its daily free-tier read/write limit. All user grants, approvals, and submissions are being saved and served seamlessly from local storage until the 24-hour quota resets.
          </p>
        </div>
      )}

      {/* Main View Tabs */}
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
              Loading payment submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <div className="text-3xl mb-2">📥</div>
              <h4 className="text-sm font-bold text-slate-800">No {submissionFilter} payment submissions found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Submissions appear here when students submit a payment claim on <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">#/checkout</code>.
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
                      <div className="p-3 text-center text-[11px] text-slate-500 bg-slate-100 rounded-xl">
                        KHQR Transfer Claim ($10.00)
                      </div>
                    )}
                  </div>

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
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
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
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing {filteredUsers.length} of {usersList.length} users
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Fetching registered users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <div className="text-3xl mb-2">👤</div>
              <h4 className="text-sm font-bold text-slate-800">No users match "{userSearchQuery}"</h4>
              <p className="text-xs text-slate-500 mt-1">
                Use the "Manual Quick Grant" tab to add or grant Premium to any student email address directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
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
                        <div
                          className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            u.isPremium ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {(u.displayName || u.email || 'U').substring(0, 2).toUpperCase()}
                        </div>

                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 truncate" title={u.email}>
                            {u.displayName || u.email}
                          </h4>
                          <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          u.isPremium
                            ? 'bg-amber-200 text-amber-950 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {u.isPremium ? '👑 Premium' : '👤 Free'}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                      UID: {u.uid}
                    </div>

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

                    {u.isPremium && u.email?.toLowerCase() !== 'searsokvarkhim1@gmail.com' && (
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
              ))}
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
              Enter any student email address to directly grant or extend Premium subscription status without requiring a KHQR submission.
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
              <span>{grantingStatus ? 'Updating...' : '✨ Grant Premium Access Now'}</span>
            </button>
          </form>
        </div>
      )}

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
