import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen, Calculator, FileText, CheckSquare, Lock } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isReadQuotaExhausted, isQuotaError, markReadQuotaExhausted } from '../firebase';
import { LESSONS, UNITS } from '../data/curriculumData';
import { Lesson, PageId } from '../types';
import { LessonModal } from './LessonModal';
import { FormattedMathText } from './MathRenderer';
import { UnitFilterBar } from './UnitFilterBar';
import { useAuth } from '../context/AuthContext';

interface LessonsPageProps {
  selectedUnit: string | number | null;
  onSelectUnit: (unit: string | number | null) => void;
  onNavigate: (page: PageId) => void;
  onOpenLimmy?: (context?: string) => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  selectedUnit,
  onSelectUnit,
  onNavigate,
  onOpenLimmy,
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lessonsList, setLessonsList] = useState<Lesson[]>(LESSONS);

  // Merge any live published topic updates from Firestore's `curriculum` collection
  // AND any Question Bank items into their designated topics
  useEffect(() => {
    let isMounted = true;

    const mergePracticeSections = (basePs: any, livePs: any) => {
      const mcqMap = new Map<string, any>();
      (basePs?.mcq || []).forEach((q: any, idx: number) => {
        const id = q.question_id || `mcq_${idx}`;
        mcqMap.set(id, q);
      });
      (livePs?.mcq || []).forEach((q: any, idx: number) => {
        const id = q.question_id || `live_mcq_${idx}`;
        if (!mcqMap.has(id)) {
          mcqMap.set(id, q);
        }
      });

      const frqMap = new Map<string, any>();
      (basePs?.frq || []).forEach((f: any, idx: number) => {
        const id = f.frq_id || `frq_${idx}`;
        frqMap.set(id, f);
      });
      (livePs?.frq || []).forEach((f: any, idx: number) => {
        const id = f.frq_id || `live_frq_${idx}`;
        if (!frqMap.has(id)) {
          frqMap.set(id, f);
        }
      });

      return {
        mcq: Array.from(mcqMap.values()),
        frq: Array.from(frqMap.values()),
      };
    };

    if (!isReadQuotaExhausted()) {
      getDocs(collection(db, 'curriculum'))
        .then((snap) => {
          if (!isMounted || snap.empty) return;
          const firestoreMap = new Map<string, any>();
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            const code = String(data.topic_id || data.topicCode || '');
            if (code && (data.master_lesson || data.lesson)) {
              firestoreMap.set(code, data);
            }
          });

          if (firestoreMap.size > 0) {
            setLessonsList((prev) =>
              prev.map((baseLesson) => {
                const live = firestoreMap.get(baseLesson.topicCode);
                if (!live) return baseLesson;
                const liveOverview =
                  live.master_lesson?.conceptual_overview ||
                  live.lesson?.summary ||
                  live.lesson?.overview ||
                  baseLesson.summary;
                const cleanTitle = String(live.topic_title || live.title || baseLesson.title).replace(
                  /^Topic\s+[0-9A-Za-z.]+:\s*/i,
                  ''
                );
                return {
                  ...baseLesson,
                  title: cleanTitle,
                  summary: liveOverview,
                  lesson: live.lesson?.conceptual_sections ? live.lesson : baseLesson.lesson,
                  formula_sheet:
                    (live.formula_sheet?.sub_topics?.length || 0) >=
                    (baseLesson.formula_sheet?.sub_topics?.length || 0)
                      ? live.formula_sheet
                      : baseLesson.formula_sheet,
                  master_lesson: live.master_lesson || baseLesson.master_lesson,
                  practice_section: mergePracticeSections(
                    baseLesson.practice_section,
                    live.practice_section
                  ),
                };
              })
            );
          }
        })
        .catch((err) => {
          if (isQuotaError(err)) {
            markReadQuotaExhausted();
          }
        });
    }

    const handleBankUpdated = (ev: Event) => {
      const customEv = ev as CustomEvent;
      const allBankQuestions: any[] = customEv.detail?.allQuestions || [];
      if (!Array.isArray(allBankQuestions) || allBankQuestions.length === 0) return;

      setLessonsList((prev) =>
        prev.map((lesson) => {
          const topicBankItems = allBankQuestions.filter(
            (q) => q && q.is_published !== false && String(q.topic_id) === String(lesson.topicCode)
          );
          if (topicBankItems.length === 0) return lesson;

          const bankMcqs = topicBankItems
            .filter((q) => q.type === 'MCQ')
            .map((q) => ({
              question_id: q.id,
              sub_topic_id: q.sub_topic_id,
              sub_topic_title: q.sub_topic_title,
              calculator_active: Boolean(q.calculator_active),
              difficulty: q.difficulty || 'AP Standard',
              question_latex: q.content?.prompt_latex || '',
              options: q.content?.options || [],
              correct_index: Number(q.content?.correct_index) || 0,
              explanation_latex: q.content?.explanation_latex || '',
              exam_trap: q.content?.exam_trap || '',
            }));

          const bankFrqs = topicBankItems
            .filter((q) => q.type === 'FRQ')
            .map((q) => ({
              frq_id: q.id,
              sub_topic_id: q.sub_topic_id,
              sub_topic_title: q.sub_topic_title,
              difficulty: q.difficulty || 'AP Standard',
              calculator_active: Boolean(q.calculator_active),
              scenario_latex: q.content?.scenario_latex || '',
              parts: q.content?.parts || [],
            }));

          return {
            ...lesson,
            practice_section: mergePracticeSections(lesson.practice_section, {
              mcq: bankMcqs,
              frq: bankFrqs,
            }),
          };
        })
      );
    };

    window.addEventListener('mathprep:question-bank-updated', handleBankUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('mathprep:question-bank-updated', handleBankUpdated);
    };
  }, []);

  const { isPremium } = useAuth();

  const handleOpenLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const lessonMatchesSelectedUnit = (l: Lesson) => {
    if (!selectedUnit) return true;
    if (typeof selectedUnit === 'number') {
      return l.unitNumber === selectedUnit;
    }
    const sel = String(selectedUnit).toLowerCase();
    return (
      String(l.unitId || '').toLowerCase() === sel ||
      String(l.unitKey || '').toLowerCase() === sel.replace('unit_', '').replace('unit-', '')
    );
  };

  const filteredLessons = lessonsList.filter((l) => {
    const matchesUnit = lessonMatchesSelectedUnit(l);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      l.topicCode.toLowerCase().includes(q) ||
      `topic ${l.topicCode.toLowerCase()}`.includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q);
    return matchesUnit && matchesSearch;
  });

  const lessonsByUnit = UNITS.map((unit) => ({
    unit,
    lessons: filteredLessons.filter(
      (l) => (l.unitId || `unit_${l.unitNumber}`) === (unit.unitId || unit.id)
    ),
  }));

  const selectedUnitLabel = selectedUnit
    ? UNITS.find(
        (u) =>
          u.unitId === selectedUnit ||
          u.id === selectedUnit ||
          (typeof selectedUnit === 'number' && u.number === selectedUnit)
      )?.shortTitle || `Unit ${selectedUnit}`
    : 'All Units (1–4B)';

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
          AP Precalculus / <span className="text-slate-900 font-semibold">All {lessonsList.length} Curriculum Topics</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-5">
        <div className="max-w-3xl">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Complete AP Precalculus Curriculum (Units 1, 2A, 2B, 3, 4A, 4B · {lessonsList.length} Topics)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AP Precalculus Lessons Hub
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            Every topic and review module across Unit 1, Unit 2A, Unit 2B, Unit 3, Unit 4A, and Unit 4B—complete with Master Lessons, Dedicated Formula Sheets, AP Multiple-Choice Questions, and Multi-Part Free-Response Questions with Scoring Rubrics.
          </p>
        </div>

        {/* Unit Filter */}
        <div className="w-full">
          <UnitFilterBar selectedUnit={selectedUnit} onSelectUnit={onSelectUnit} />
        </div>
      </div>

      {/* Search Bar & Topic Count */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any topic (e.g. 1.2, 2.5A, 4.6B, Unit 1 REVIEW, holes, semi-log, vectors)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Showing:</span>
          <span className="font-semibold text-blue-600">
            {selectedUnitLabel} ({filteredLessons.length} of {lessonsList.length} topics)
          </span>
          {(selectedUnit || searchQuery) && (
            <button
              onClick={() => {
                onSelectUnit(null);
                setSearchQuery('');
              }}
              className="text-slate-500 hover:text-slate-900 underline cursor-pointer ml-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Lessons Content */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">No topics matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectUnit(null);
            }}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Show all {lessonsList.length} topics
          </button>
        </div>
      ) : selectedUnit ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onOpen={handleOpenLesson}
              isPremium={isPremium}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {lessonsByUnit
            .filter(({ lessons }) => lessons.length > 0)
            .map(({ unit, lessons }) => (
              <div key={unit.id} className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {unit.unitKey || unit.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {unit.fullTitle || `Unit ${unit.unitKey || unit.number} - ${unit.title}`}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500">
                        {lessons.length} Topics ({lessons[0]?.topicCode} – {lessons[lessons.length - 1]?.topicCode}) · {unit.examWeight}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectUnit(unit.unitId || unit.number)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer self-start sm:self-auto"
                  >
                    Filter {unit.shortTitle || `Unit ${unit.number}`} Only ({lessons.length} Topics) →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onOpen={handleOpenLesson}
                      isPremium={isPremium}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Lesson Details Modal (with Master Lesson, Formula Sheet, MCQ & FRQ tabs) */}
      <LessonModal
        lesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        onOpenLimmy={onOpenLimmy}
      />
    </div>
  );
};

interface LessonCardProps {
  lesson: Lesson;
  onOpen: (lesson: Lesson) => void;
  isPremium?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onOpen }) => {
  const isLocked = false;
  const isReviewTopic = lesson.topicCode.toUpperCase().includes('REVIEW');
  const mcqCount = lesson.practice_section?.mcq?.length || 0;
  const frqCount = lesson.practice_section?.frq?.length || 0;
  let formulaCount = 0;
  (lesson.formula_sheet?.sub_topics || []).forEach((st) => {
    formulaCount += st.essential_formulas?.length || 0;
  });

  return (
    <div
      onClick={() => onOpen(lesson)}
      className={`group bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
        isLocked
          ? 'border-amber-200/90 hover:border-amber-400 bg-gradient-to-b from-white to-amber-50/20'
          : isReviewTopic
          ? 'border-indigo-200 hover:shadow-md hover:border-indigo-400 bg-gradient-to-b from-white to-indigo-50/20'
          : 'border-slate-200 hover:shadow-md hover:border-blue-300'
      }`}
    >
      {isLocked && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-2xs">
          <Lock className="w-2.5 h-2.5" />
          <span>Premium</span>
        </div>
      )}

      <div>
        {/* Metadata Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-blue-600">Unit {lesson.unitKey || lesson.unitNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {isReviewTopic ? lesson.topicCode : `Topic ${lesson.topicCode}`}
            </span>
          </div>
          <span className="text-slate-400">{lesson.duration}</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2 flex items-center gap-1.5">
          <span>{isReviewTopic ? lesson.title : `${lesson.topicCode} ${lesson.title}`}</span>
          {isLocked && <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
        </h3>

        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
          <FormattedMathText text={lesson.summary} />
        </div>

        {/* Key Formula / Principle Preview */}
        {lesson.keyTheorems && lesson.keyTheorems.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-700 mb-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Essential Formula / Principle
            </div>
            <div className="line-clamp-2 text-slate-800">
              <FormattedMathText text={lesson.keyTheorems[0]} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100">
        {/* Included Package Counts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
            <Calculator className="w-3 h-3 text-blue-600" />
            <span>{formulaCount} Formulas</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
            <CheckSquare className="w-3 h-3 text-emerald-600" />
            <span>{mcqCount} AP MCQs</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
            <FileText className="w-3 h-3 text-purple-600" />
            <span>{frqCount} FRQ + Rubric</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium truncate">
            {lesson.difficulty} · {lesson.calculatorRequirement}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(lesson);
              }}
              className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1 ${
                isLocked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title={isLocked ? 'Upgrade to unlock practice' : `Configure & Launch Practice Session for Topic ${lesson.topicCode}`}
            >
              {isLocked && <Lock className="w-3 h-3" />}
              <span>{isLocked ? 'Unlock' : '🎯 Practice'}</span>
            </button>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-800">
              <span>{isLocked ? 'Locked' : 'Lesson'}</span>
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
