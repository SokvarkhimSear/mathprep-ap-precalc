import React from 'react';
import { Lock, Sparkles, Check, ArrowRight, X, Crown } from 'lucide-react';
import { PageId } from '../types';

interface PremiumLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const PremiumLockModal: React.FC<PremiumLockModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  featureTitle = 'AP Precalculus Premium Feature',
  featureDescription = 'Upgrade to MathPrep Premium to unlock this feature and achieve a 5 on your AP exam.',
}) => {
  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    onNavigate('checkout');
  };

  const perks = [
    {
      title: 'Full Units 2, 3 & 4 Mastery',
      desc: 'All 44 College Board topics: Exponential, Logarithmic, Trigonometric, Polar & Vectors.',
    },
    {
      title: 'Advanced Multi-Part FRQs',
      desc: 'Authentic AP Free-Response questions with official College Board scoring rubrics.',
    },
    {
      title: 'AI Weakness & Trap Remediation',
      desc: 'Personalized filters to drill into missed questions and avoid common exam traps.',
    },
    {
      title: 'Unlimited Teacher Limmy AI',
      desc: 'Bypass all credit limits for unlimited step-by-step Socratic hints & guidance.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-fade-in my-8">
        {/* Header with vibrant Red/Gold gradient */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Premium Access Required</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {featureTitle}
          </h2>
          <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-md">
            {featureDescription}
          </p>
        </div>

        {/* Perks list */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Everything included in AP Precalculus Premium:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {perks.map((perk, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {perk.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing callout */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                One-Time Payment
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900">$10.00</span>
                <span className="text-xs text-slate-500 font-semibold">USD / Lifetime</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Instant dynamic KHQR payment with ABA Mobile or Bakong app.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              ⚡
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleUpgradeClick}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Upgrade to Premium to Unlock</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Maybe later, keep free tier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
