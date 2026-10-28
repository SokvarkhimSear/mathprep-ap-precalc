/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TopBar } from './components/TopBar';
import { HomePage } from './components/HomePage';
import { LessonsPage } from './components/LessonsPage';
import { FormulaBankPage } from './components/FormulaBankPage';
import { ProgressTrackerPage } from './components/ProgressTrackerPage';
import { LimmyChatDrawer } from './components/LimmyChatDrawer';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VerificationBanner } from './components/VerificationBanner';
import { AuthModal } from './components/AuthModal';
import { PremiumLockModal } from './components/PremiumLockModal';
import { AdminPaymentApprovals } from './components/AdminPaymentApprovals';
import { PageId } from './types';
import { Bot, Sparkles } from 'lucide-react';
// @ts-ignore - JSX Client Component from app/checkout/page.jsx
import CheckoutPage from '../app/checkout/page.jsx';

function AdminPaymentsPortal() {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findMountNode = () => {
      const el = document.getElementById('admin-payments-mount-point');
      if (el) {
        setMountNode(el);
      }
    };
    findMountNode();
    const interval = setInterval(findMountNode, 300);
    return () => clearInterval(interval);
  }, []);

  if (!mountNode) return null;
  return createPortal(<AdminPaymentApprovals />, mountNode);
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [selectedUnit, setSelectedUnit] = useState<string | number | null>(null);
  const [isLimmyOpen, setIsLimmyOpen] = useState<boolean>(false);
  const [limmyContext, setLimmyContext] = useState<string | null>(null);

  // Sync with browser hash routing for back/forward buttons and direct bookmarking
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim().toLowerCase();
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const adminSection = document.getElementById('admin-studio');
      const practiceSection = document.getElementById('practice-hub-section');

      if (['lessons', 'formulas', 'progress', 'checkout'].includes(hash)) {
        setCurrentPage(hash as PageId);
        if (adminSection) adminSection.classList.add('hidden');
        if (practiceSection) practiceSection.classList.add('hidden');
      } else if (pathname === 'checkout') {
        setCurrentPage('checkout');
        if (adminSection) adminSection.classList.add('hidden');
        if (practiceSection) practiceSection.classList.add('hidden');
      } else if (hash === 'practice' || hash === 'practice-hub') {
        setCurrentPage('practice');
        if (adminSection) adminSection.classList.add('hidden');
        if (practiceSection) practiceSection.classList.remove('hidden');
      } else if (hash === 'admin' || hash === 'admin-studio') {
        setCurrentPage('admin');
        if (adminSection) adminSection.classList.remove('hidden');
        if (practiceSection) practiceSection.classList.add('hidden');
      } else {
        setCurrentPage('home');
        if (adminSection) adminSection.classList.add('hidden');
        if (practiceSection) practiceSection.classList.add('hidden');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleNavigate = (page: PageId, unitFilter?: string | number | null) => {
    setCurrentPage(page);
    if (unitFilter !== undefined) {
      setSelectedUnit(unitFilter);
    }
    const adminSection = document.getElementById('admin-studio');
    const practiceSection = document.getElementById('practice-hub-section');

    // Update hash
    if (page === 'home') {
      window.location.hash = '';
      if (adminSection) adminSection.classList.add('hidden');
      if (practiceSection) practiceSection.classList.add('hidden');
    } else if (page === 'admin') {
      window.location.hash = '#admin-studio';
      if (adminSection) adminSection.classList.remove('hidden');
      if (practiceSection) practiceSection.classList.add('hidden');
    } else if (page === 'practice') {
      window.location.hash = '#/practice';
      if (adminSection) adminSection.classList.add('hidden');
      if (practiceSection) practiceSection.classList.remove('hidden');
      if (unitFilter) {
        const unitSel = document.getElementById('practice-filter-unit') as HTMLSelectElement | null;
        if (unitSel) {
          const valStr = typeof unitFilter === 'string' && unitFilter.startsWith('unit_') ? unitFilter : `unit_${unitFilter}`;
          unitSel.value = valStr;
          unitSel.dispatchEvent(new Event('change'));
        }
      }
    } else {
      window.location.hash = `#/${page}`;
      if (adminSection) adminSection.classList.add('hidden');
      if (practiceSection) practiceSection.classList.add('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mount or unmount admin-studio and practice-hub-section inside React main layout
  useEffect(() => {
    const adminSection = document.getElementById('admin-studio');
    const adminMount = document.getElementById('admin-mount-point');
    if (currentPage === 'admin') {
      if (adminSection && adminMount && adminSection.parentElement !== adminMount) {
        adminMount.appendChild(adminSection);
      }
      if (adminSection) adminSection.classList.remove('hidden');
    } else {
      if (adminSection) adminSection.classList.add('hidden');
    }

    const practiceSection = document.getElementById('practice-hub-section');
    const practiceMount = document.getElementById('practice-mount-point');
    if (currentPage === 'practice') {
      if (practiceSection && practiceMount && practiceSection.parentElement !== practiceMount) {
        practiceMount.appendChild(practiceSection);
      }
      if (practiceSection) practiceSection.classList.remove('hidden');
    } else {
      if (practiceSection) practiceSection.classList.add('hidden');
    }
  }, [currentPage]);

  const handleOpenLimmyWithContext = (context?: string) => {
    if (context) {
      setLimmyContext(context);
    }
    setIsLimmyOpen(true);
  };

  const { premiumModalOpen, setPremiumModalOpen, premiumModalFeature } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative max-w-full overflow-x-hidden">
      {/* Sticky Top Bar with 3-zone contract */}
      <TopBar
        activePage={currentPage}
        onNavigate={(page) => handleNavigate(page)}
        onOpenLimmy={() => handleOpenLimmyWithContext()}
      />

      {/* Persistent Email Verification Warning Banner */}
      <VerificationBanner />

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col max-w-full overflow-x-hidden">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenLimmy={handleOpenLimmyWithContext}
          />
        )}

        {currentPage === 'lessons' && (
          <LessonsPage
            selectedUnit={selectedUnit}
            onSelectUnit={setSelectedUnit}
            onNavigate={handleNavigate}
            onOpenLimmy={handleOpenLimmyWithContext}
          />
        )}

        {currentPage === 'practice' && (
          <div id="practice-mount-point" className="w-full flex-1"></div>
        )}

        {currentPage === 'progress' && (
          <ProgressTrackerPage
            onNavigate={handleNavigate}
            onSelectTopicLesson={(topicCode) => {
              const win = window as unknown as {
                getUnitIdForTopic?: (code: string) => string;
              };
              const unitId =
                typeof win.getUnitIdForTopic === 'function'
                  ? win.getUnitIdForTopic(topicCode)
                  : `unit_${parseInt(String(topicCode).split('.')[0], 10) || 1}`;
              handleNavigate('lessons', unitId);
            }}
          />
        )}

        {currentPage === 'formulas' && (
          <FormulaBankPage
            selectedUnit={selectedUnit}
            onSelectUnit={setSelectedUnit}
            onNavigate={handleNavigate}
            onOpenLimmy={handleOpenLimmyWithContext}
          />
        )}

        {currentPage === 'checkout' && <CheckoutPage />}

        {currentPage === 'admin' && (
          <>
            <div id="admin-mount-point" className="w-full flex-1"></div>
            <AdminPaymentsPortal />
          </>
        )}
      </main>

      {/* Floating Mascot Button for Ask Limmy AI - hidden in admin studio */}
      {currentPage !== 'admin' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => handleOpenLimmyWithContext()}
            className="group flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Open Limmy AI Socratic Tutor"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold tracking-wide">
              Ask Limmy AI
            </span>
            <span className="text-[10px] bg-blue-500/80 px-1.5 py-0.5 rounded-full font-medium">
              Socratic Tutor
            </span>
          </button>
        </div>
      )}

      {/* Socratic Limmy AI Chat Drawer */}
      <LimmyChatDrawer
        isOpen={isLimmyOpen}
        onClose={() => setIsLimmyOpen(false)}
        activeContext={limmyContext}
        onClearContext={() => setLimmyContext(null)}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal />

      {/* Global Premium Lock Modal */}
      <PremiumLockModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onNavigate={handleNavigate}
        featureTitle={premiumModalFeature.title}
        featureDescription={premiumModalFeature.description}
      />

      {/* Global Footer - only rendered on student-facing pages, never above admin studio */}
      {currentPage !== 'admin' && (
        <Footer onNavigatePage={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

