import React, { useState } from 'react';
import { Menu, X, Bot, Calculator, User as UserIcon, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { PageId } from '../types';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenLimmy: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activePage, onNavigate, onOpenLimmy }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, emailVerified, logout, setAuthModalOpen } = useAuth();

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleOpenTi84 = () => {
    const win = window as any;
    if (typeof win.toggleTi84Calculator === 'function') {
      win.toggleTi84Calculator();
    } else if (typeof win.openTi84Calculator === 'function') {
      win.openTi84Calculator();
    }
  };

  const navLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'practice', label: 'Practice Hub' },
    { id: 'progress', label: '📊 Progress Tracker' },
    { id: 'formulas', label: 'Formula Sheet' },
    { id: 'checkout', label: '👑 Premium' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 max-w-full overflow-x-hidden">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div
            className="flex items-center gap-2.5 shrink-0 cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              ∑
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
                MathPrep
              </span>
              <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mt-0.5">
                AP Precalculus
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-semibold border-blue-600'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Admin Studio Navigation Link (Requirement 1) */}
            {currentUser?.email && currentUser.email.toLowerCase() === 'searsokvarkhim1@gmail.com' && (
              <button
                onClick={() => {
                  window.location.hash = '#admin-studio';
                  handleNavClick('admin');
                }}
                className={`admin-studio-nav-link transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer font-bold flex items-center gap-1 ${
                  activePage === 'admin'
                    ? 'text-amber-600 border-amber-600'
                    : 'text-amber-700 border-transparent hover:text-amber-900 hover:border-amber-300'
                }`}
              >
                <span>Admin Studio ⚙️</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & User Auth */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenTi84}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300/80 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              title="Open Floating TI-84 Plus CE Online Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>TI-84 Calc</span>
            </button>

            <button
              onClick={onOpenLimmy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Limmy AI</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-700"
                  title={currentUser.email || 'Student Account'}
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium max-w-[120px] truncate">
                    {currentUser.email?.split('@')[0]}
                  </span>
                  {emailVerified ? (
                    <span className="inline-flex items-center text-emerald-600" title="Email Verified">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-amber-600" title="Email Unverified">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => handleNavClick('lessons')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Lessons
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenTi84}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-md"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>TI-84</span>
            </button>

            <button
              onClick={onOpenLimmy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Limmy</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {currentUser?.email && currentUser.email.toLowerCase() === 'searsokvarkhim1@gmail.com' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.hash = '#admin-studio';
                handleNavClick('admin');
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
            >
              Admin Studio ⚙️
            </button>
          )}

          <div className="pt-2 flex flex-col gap-2">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-xs text-slate-700">
                <div className="flex items-center gap-1.5 truncate">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                  {emailVerified ? (
                    <span className="text-emerald-600 text-[10px] font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">Verified</span>
                  ) : (
                    <span className="text-amber-600 text-[10px] font-semibold bg-amber-100 px-1.5 py-0.5 rounded">Unverified</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-red-600 font-medium ml-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
              >
                Sign In / Register
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLimmy();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-center text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Ask Limmy AI Socratic Tutor</span>
            </button>

            <button
              onClick={() => handleNavClick('lessons')}
              className="w-full px-4 py-2 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Start Lessons
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
