import React from 'react';
import { ArrowRight, BookOpen, Calculator, ShieldCheck, ChevronRight, Bot } from 'lucide-react';
import { PageId } from '../types';
import { UNITS } from '../data/curriculumData';

interface HomePageProps {
  onNavigate: (page: PageId, unitFilter?: string | number | null) => void;
  onOpenLimmy?: (context?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenLimmy }) => {
  return (
    <div className="space-y-10 sm:space-y-16 pb-12 sm:pb-16 max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-8 sm:pt-14 pb-12 sm:pb-16 border-b border-slate-200 max-w-full overflow-x-hidden">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 mb-3">
              <span>Official Curriculum Standards</span>
              <span aria-hidden="true">·</span>
              <span>College Board AP Precalculus</span>
              <span aria-hidden="true">·</span>
              <span>Units 1, 2A, 2B, 3, 4A, 4B</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Master All AP Precalculus Units with Mathematical Precision
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Welcome to MathPrep. A streamlined, high-clarity study portal designed to help students master AP Precalculus through structured conceptual lessons, step-by-step worked examples, an exhaustive LaTeX formula bank, and Limmy AI—your dedicated Socratic tutor.
            </p>

            {/* Quick Action Navigation */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('lessons')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Lessons</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
              <button
                onClick={() => onNavigate('practice')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Question Bank & Practice Hub</span>
              </button>
              <button
                onClick={() => onNavigate('formulas')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>LaTeX Formula Bank</span>
              </button>
              {onOpenLimmy && (
                <button
                  onClick={() => onOpenLimmy('AP Precalculus Study Overview')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Ask Limmy AI Tutor</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Study Modes (2 Focused Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Core Study Resources
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Curriculum Resources & Reference
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Choose between topic lessons with step-by-step worked examples, or the searchable LaTeX formula sheet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Lessons */}
          <div
            onClick={() => onNavigate('lessons')}
            className="group bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-1.5">
                <span>All 71 Official Topics & Reviews</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Units 1, 2A, 2B, 3, 4A, 4B</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Lessons, MCQs & FRQs</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                Curriculum Lessons Hub
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive topic modules across Unit 1, Unit 2A, Unit 2B, Unit 3, Unit 4A, and Unit 4B—including A/B/C topic splits and Unit Reviews. Explore Master Lessons, Dedicated Formula Sheets, AP Multiple-Choice Questions, and Multi-Part FRQs with scoring rubrics.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Unit 1 (15 Modules): Polynomials, Rational Functions, Transformations & Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Units 2A & 2B (20 Modules): Sequences, Exponentials, Compositions, Inverses & Logarithms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Unit 3 (16 Modules): Unit Circle, Sinusoidal Waves, Inverse Trig, Polar Graphs & Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Units 4A & 4B (20 Modules): Parametrics, Conics (Parabolas/Ellipses/Hyperbolas), Vectors & Matrices</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-blue-600">
              <span>Enter All 71 Lessons</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Formula Sheet */}
          <div
            onClick={() => onNavigate('formulas')}
            className="group bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <div className="text-xs text-slate-500 font-medium mb-1.5">
                <span>160+ LaTeX Formulas</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>All 71 Curriculum Modules</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>One-Click Copy</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-3">
                Official LaTeX Formula Bank
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fast, searchable mathematical reference sheet covering every formula required for the AP Precalculus exam. Rendered in authentic display LaTeX font with conditions and calculator indicators.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Average Rate of Change & Difference Quotients</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Compound Interest, Continuous Compounding & Log Rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Pythagorean Identities, Double Angles & Polar Conversions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Vector Dot Product, Magnitude & 2D Matrix Inverses</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-sky-600">
              <span>Open Formula Sheet</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Complete 6 Unit Sections Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Curriculum Structure
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AP Precalculus Units (1, 2A, 2B, 3, 4A, 4B)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Jump directly into any unit section's lessons or formulas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNITS.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
                  <span className="font-semibold text-blue-600">{unit.shortTitle || `Unit ${unit.unitKey || unit.number}`}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{unit.examWeight}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {unit.fullTitle || unit.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {unit.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600 mb-5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Key Topics Covered ({unit.topicsCount} Topics):
                  </div>
                  {unit.keyTopics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('lessons', unit.unitId || unit.number)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {unit.shortTitle || `Unit ${unit.number}`} Lessons
                </button>
                <button
                  onClick={() => onNavigate('formulas', unit.unitId || unit.number)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {unit.shortTitle || `Unit ${unit.number}`} Formulas
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AP Exam Blueprint Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Official AP Precalculus Testing Specifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <div className="sm:border-r sm:border-slate-800 sm:pr-4">
              <div className="text-xs text-slate-400 uppercase font-semibold">Testing Window</div>
              <div className="text-xl font-bold text-white mt-1">3 Hours Total</div>
              <div className="text-xs text-slate-400 mt-1">Split into timed sections</div>
            </div>
            <div className="sm:border-r sm:border-slate-800 sm:pr-4">
              <div className="text-xs text-slate-400 uppercase font-semibold">Multiple Choice (62.5%)</div>
              <div className="text-xl font-bold text-white mt-1 tabular-nums">40 Questions</div>
              <div className="text-xs text-slate-400 mt-1">28 No-Calc + 12 Calc-Active</div>
            </div>
            <div className="sm:border-r sm:border-slate-800 sm:pr-4">
              <div className="text-xs text-slate-400 uppercase font-semibold">Free Response (37.5%)</div>
              <div className="text-xl font-bold text-white mt-1 tabular-nums">4 Multi-Part FRQs</div>
              <div className="text-xs text-slate-400 mt-1">2 Calc-Active + 2 No-Calc</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">College Placement</div>
              <div className="text-xl font-bold text-white mt-1">Precalculus / Calc I</div>
              <div className="text-xs text-slate-400 mt-1">Standard credit for scores 3, 4, or 5</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
