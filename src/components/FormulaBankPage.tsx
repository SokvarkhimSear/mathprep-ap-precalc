import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Copy, Check, Bot, Bookmark, BookmarkCheck } from 'lucide-react';
import { FORMULAS, UNITS } from '../data/curriculumData';
import { FormulaItem, PageId } from '../types';
import { MathRenderer } from './MathRenderer';
import { UnitFilterBar } from './UnitFilterBar';
import { useAuth, showToast } from '../context/AuthContext';
import { fetchStudentProgress, saveStudentProgress } from '../firebase';

interface FormulaBankPageProps {
  selectedUnit: number | null;
  onSelectUnit: (unit: number | null) => void;
  onNavigate: (page: PageId) => void;
  onOpenLimmy?: (context?: string) => void;
}

export const FormulaBankPage: React.FC<FormulaBankPageProps> = ({
  selectedUnit,
  onSelectUnit,
  onNavigate,
  onOpenLimmy,
}) => {
  const { currentUser, guardProtectedAction } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Load user bookmarks from Firestore
  useEffect(() => {
    if (!currentUser) {
      setBookmarkedIds([]);
      return;
    }
    let isMounted = true;
    fetchStudentProgress(currentUser.uid)
      .then((progress) => {
        if (isMounted && progress?.bookmarkedFormulas) {
          setBookmarkedIds(progress.bookmarkedFormulas);
        }
      })
      .catch((err) => {
        console.error('Error loading bookmarks from Firestore:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleCopyFormula = (formula: FormulaItem) => {
    navigator.clipboard?.writeText(formula.formula);
    setCopiedId(formula.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (formulaId: string) => {
    guardProtectedAction('save formula bookmarks to your cloud database', async () => {
      if (!currentUser) return;
      const isBookmarked = bookmarkedIds.includes(formulaId);
      const nextBookmarks = isBookmarked
        ? bookmarkedIds.filter((id) => id !== formulaId)
        : [...bookmarkedIds, formulaId];

      setBookmarkedIds(nextBookmarks);
      try {
        await saveStudentProgress(currentUser.uid, {
          bookmarkedFormulas: nextBookmarks,
        });
        showToast(
          !isBookmarked
            ? 'Formula bookmarked to your Firebase database!'
            : 'Bookmark removed from your database.',
          'success'
        );
      } catch (err) {
        console.error('Failed to sync bookmark to Firestore:', err);
        showToast('Error syncing with database. Check email verification.', 'error');
      }
    });
  };

  const filteredFormulas = FORMULAS.filter((f) => {
    const matchesUnit = selectedUnit ? f.unitNumber === selectedUnit : true;
    const matchesBookmark = showOnlyBookmarks ? bookmarkedIds.includes(f.id) : true;
    const matchesSearch =
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUnit && matchesBookmark && matchesSearch;
  });

  // Group formulas by unit
  const formulasByUnit = [1, 2, 3, 4].map((uNum) => ({
    unit: UNITS.find((u) => u.number === uNum)!,
    formulas: filteredFormulas.filter((f) => f.unitNumber === uNum),
  }));

  return (
    <div className="py-6 sm:py-10 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fade-in max-w-full overflow-x-hidden">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="text-xs text-slate-500 font-medium">
          AP Precalculus / <span className="text-slate-900 font-semibold">Formula Sheet</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Reference Bank
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Official AP Precalculus Formula Sheet
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Essential reference equations across all 4 units rendered in authentic LaTeX Computer Modern math notation. Click to copy raw LaTeX source code or bookmark directly to your Firebase database.
          </p>
        </div>

        {/* Clean Unit Filter */}
        <div className="self-start md:self-auto">
          <UnitFilterBar
            selectedUnit={selectedUnit}
            onSelectUnit={onSelectUnit}
          />
        </div>
      </div>

      {/* Search Bar & Active Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equations (e.g. pythagorean, compound, dot product, asymptote)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs transition-all"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {currentUser && (
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                showOnlyBookmarks
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Saved ({bookmarkedIds.length})</span>
            </button>
          )}

          <span>Showing:</span>
          <span className="font-semibold text-blue-600">
            {selectedUnit ? `Unit ${selectedUnit}` : 'All 4 Units'} ({filteredFormulas.length} formulas)
          </span>
          {selectedUnit && (
            <button
              onClick={() => onSelectUnit(null)}
              className="text-slate-500 hover:text-slate-900 underline cursor-pointer ml-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Formulas Content Grid */}
      {filteredFormulas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">
            {showOnlyBookmarks
              ? 'No bookmarked formulas found. Bookmark formulas below to save them to your account!'
              : `No formulas matching "${searchQuery}".`}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setShowOnlyBookmarks(false);
              onSelectUnit(null);
            }}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Reset search and filters
          </button>
        </div>
      ) : selectedUnit ? (
        /* Single Unit View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFormulas.map((item) => (
            <FormulaCard
              key={item.id}
              item={item}
              copiedId={copiedId}
              isBookmarked={bookmarkedIds.includes(item.id)}
              onCopy={handleCopyFormula}
              onToggleBookmark={handleToggleBookmark}
              onAskLimmy={onOpenLimmy}
            />
          ))}
        </div>
      ) : (
        /* All Units View with Clean Dividers */
        <div className="space-y-10">
          {formulasByUnit
            .filter(({ formulas }) => formulas.length > 0)
            .map(({ unit, formulas }) => (
              <div key={unit.id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {unit.number}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Unit {unit.number}: {unit.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => onSelectUnit(unit.number)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Focus Unit {unit.number} Only →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {formulas.map((item) => (
                    <FormulaCard
                      key={item.id}
                      item={item}
                      copiedId={copiedId}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onCopy={handleCopyFormula}
                      onToggleBookmark={handleToggleBookmark}
                      onAskLimmy={onOpenLimmy}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

interface FormulaCardProps {
  item: FormulaItem;
  copiedId: string | null;
  isBookmarked: boolean;
  onCopy: (formula: FormulaItem) => void;
  onToggleBookmark: (id: string) => void;
  onAskLimmy?: (context?: string) => void;
}

const FormulaCard: React.FC<FormulaCardProps> = ({
  item,
  copiedId,
  isBookmarked,
  onCopy,
  onToggleBookmark,
  onAskLimmy,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>
        {/* Zero-pill metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-blue-600">Unit {item.unitNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{item.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              {item.calculatorActive ? 'Calc Active' : 'No Calc'}
            </span>
            <button
              onClick={() => onToggleBookmark(item.id)}
              className="text-slate-400 hover:text-amber-500 transition-colors cursor-pointer p-0.5"
              title={isBookmarked ? 'Remove bookmark from database' : 'Bookmark to your Firebase database'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-3">
          {item.name}
        </h3>

        {/* Math Expression Block in LaTeX font */}
        <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 text-slate-900 mb-3.5 overflow-x-auto min-h-[58px] flex items-center justify-center">
          <MathRenderer math={item.formula} displayMode={true} />
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          {item.description}
        </p>

        {item.conditions && (
          <div className="text-[11px] text-slate-500">
            <span className="font-medium mr-1 text-slate-700">Conditions:</span>
            <MathRenderer math={item.conditions} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {onAskLimmy ? (
          <button
            onClick={() => onAskLimmy(`Formula: ${item.name} ($${item.formula}$) - Unit ${item.unitNumber}`)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
            title="Ask Limmy AI to explain this formula"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Limmy</span>
          </button>
        ) : (
          <span className="text-slate-400">LaTeX Math Font</span>
        )}

        <button
          onClick={() => onCopy(item)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          title="Copy LaTeX source code"
        >
          {copiedId === item.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">LaTeX Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy LaTeX</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
