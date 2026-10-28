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
  orderBy,
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

export function AdminPaymentApprovals() {
  const { currentUser, userEmail } = useAuth();
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Strict Admin Email Check: Searsokvarkhim1@gmail.com
  const isAdmin = userEmail?.toLowerCase() === 'searsokvarkhim1@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'searsokvarkhim1@gmail.com';

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'payment_submissions'));
      const items: PaymentSubmission[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
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

      // Sort newest first
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSubmissions(items);
    } catch (err) {
      console.error('Error fetching payment submissions:', err);
    } finally {
      setLoading(false);
    }
  };

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
      await fetchSubmissions();
    } catch (err: any) {
      console.error('Purge error:', err);
      alert(`Error during user cleanup: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin]);

  const handleApprove = async (sub: PaymentSubmission) => {
    if (!confirm(`Approve payment for ${sub.user_email}? This will set isPremium = true and grant 30 days of subscription.`)) {
      return;
    }

    setProcessingId(sub.id);
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Update payment submission record
      await updateDoc(doc(db, 'payment_submissions', sub.id), {
        status: 'approved',
        reviewed_at: now.toISOString(),
        reviewed_by: currentUser?.email || 'searsokvarkhim1@gmail.com',
      });

      // 2. Update user profile in Firestore
      let targetUserId = sub.user_id;

      // If user_id is 'guest' or missing, query users collection by user_email
      if (!targetUserId || targetUserId === 'guest') {
        const usersQuery = query(collection(db, 'users'), where('email', '==', sub.user_email));
        const userSnap = await getDocs(usersQuery);
        if (!userSnap.empty) {
          targetUserId = userSnap.docs[0].id;
        }
      }

      if (targetUserId && targetUserId !== 'guest') {
        const userRef = doc(db, 'users', targetUserId);
        const existingUser = await getDoc(userRef);

        if (existingUser.exists()) {
          await updateDoc(userRef, {
            isPremium: true,
            subscription_end_date: thirtyDaysFromNow,
            subscription_status: 'active',
            updatedAt: now.toISOString(),
          });
        } else {
          await setDoc(userRef, {
            uid: targetUserId,
            email: sub.user_email,
            isPremium: true,
            subscription_end_date: thirtyDaysFromNow,
            subscription_status: 'active',
            limmyAI_credits: 9999,
            updatedAt: now.toISOString(),
          }, { merge: true });
        }
      } else {
        // If user not found yet, create or update by email key
        const userRef = doc(db, 'users', sub.user_email.replace(/[^a-zA-Z0-9]/g, '_'));
        await setDoc(userRef, {
          email: sub.user_email,
          isPremium: true,
          subscription_end_date: thirtyDaysFromNow,
          subscription_status: 'active',
          limmyAI_credits: 9999,
          updatedAt: now.toISOString(),
        }, { merge: true });
      }

      alert(`✅ Payment approved! ${sub.user_email} upgraded to Premium for 30 days (until ${new Date(thirtyDaysFromNow).toLocaleDateString()}).`);
      await fetchSubmissions();
    } catch (err: any) {
      console.error('Approve payment error:', err);
      alert(`Error approving payment: ${err?.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sub: PaymentSubmission) => {
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
      alert(`Submission rejected.`);
      await fetchSubmissions();
    } catch (err: any) {
      console.error('Reject payment error:', err);
      alert(`Error rejecting payment: ${err?.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl max-w-lg mx-auto my-12">
        <div className="text-3xl mb-2">🔒</div>
        <h2 className="text-lg font-bold text-rose-950">Admin Restricted Access</h2>
        <p className="text-xs text-rose-800 mt-1">
          This payment approval portal is restricted strictly to <code className="font-mono bg-rose-100 px-1.5 py-0.5 rounded font-bold">searsokvarkhim1@gmail.com</code>.
        </p>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">💳 ACLEDA KHQR Payment Submissions</h2>
            <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
              {submissions.filter((s) => s.status === 'pending').length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review uploaded payment screenshots and approve 30-day monthly subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubmissions}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>🔄 Refresh List</span>
          </button>
          <button
            onClick={handlePurgeNonAdminUsers}
            disabled={loading}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            <span>🧹 Purge Non-Admin Users</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'pending'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending ({submissions.filter((s) => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'approved'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Approved ({submissions.filter((s) => s.status === 'approved').length})
        </button>
        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'rejected'
              ? 'bg-rose-100 text-rose-900 border border-rose-300'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rejected ({submissions.filter((s) => s.status === 'rejected').length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-blue-100 text-blue-900 border border-blue-300'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({submissions.length})
        </button>
      </div>

      {/* Submissions Grid / Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          Loading payment submissions from Firestore...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
          <div className="text-3xl mb-2">📥</div>
          <h4 className="text-sm font-bold text-slate-800">No {activeFilter} payment submissions found</h4>
          <p className="text-xs text-slate-500 mt-1">
            Submissions will appear here when students upload payment screenshots on <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">#/checkout</code>.
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
                  <p className="text-[10px] font-mono text-slate-500">User ID: {sub.user_id}</p>
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
                      🔍 Click to Zoom Image
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-100 rounded-xl">
                    No screenshot attached
                  </div>
                )}
              </div>

              {/* Action Buttons for Pending */}
              {sub.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => handleApprove(sub)}
                    disabled={processingId === sub.id}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {processingId === sub.id ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(sub)}
                    disabled={processingId === sub.id}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Screenshot Modal */}
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
