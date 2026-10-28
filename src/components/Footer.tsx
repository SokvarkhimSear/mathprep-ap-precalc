import React from 'react';
import { PageId } from '../types';

interface FooterProps {
  onNavigatePage: (page: PageId, unit?: number | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-800 text-sm">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div
              className="flex items-center gap-2 mb-3 cursor-pointer"
              onClick={() => onNavigatePage('home')}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base">
                ∑
              </div>
              <span className="text-lg font-bold text-white tracking-tight">MathPrep</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered for high school scholars preparing for the AP Precalculus exam. Focused curriculum lessons with LaTeX derivations and an exhaustive searchable formula bank.
            </p>
          </div>

          {/* Quick Pillars */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Study Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigatePage('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('lessons')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Curriculum Lessons Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('formulas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  LaTeX Formula & Identity Bank
                </button>
              </li>
            </ul>
          </div>

          {/* All 4 Units */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">All 4 Units</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigatePage('lessons', 1)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Unit 1: Polynomial & Rational Functions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('lessons', 2)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Unit 2: Exponential & Logarithmic Functions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('lessons', 3)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Unit 3: Trigonometric & Polar Functions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('lessons', 4)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Unit 4: Parameters, Vectors & Matrices
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="max-w-xl text-center sm:text-left">
            AP® is a registered trademark of the College Board, which was not involved in the production of, and does not endorse, this study website.
          </p>
          <p>© {new Date().getFullYear()} MathPrep. Dedicated to student mastery.</p>
        </div>
      </div>
    </footer>
  );
};
