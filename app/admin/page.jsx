'use client';

import React from 'react';
import { AdminPaymentApprovals } from '@/src/components/AdminPaymentApprovals';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminPaymentApprovals />
      </div>
    </div>
  );
}
