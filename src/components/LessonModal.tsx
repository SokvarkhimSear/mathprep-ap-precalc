import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  X,
  CheckCircle,
  Lightbulb,
  Bot,
  BookmarkCheck,
  BookOpen,
  Calculator,
  CheckSquare,
  FileText,
  AlertTriangle,
  Layers,
  Clock,
  List,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  GraduationCap,
  Lock,
  Crown,
  Zap,
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Lesson } from '../types';
import { FormattedMathText, MathRenderer, LimmyMarkdownMath } from './MathRenderer';
import { useAuth, showToast } from '../context/AuthContext';
import { db, fetchStudentProgress, saveStudentProgress } from '../firebase';

interface LessonModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onOpenLimmy?: (context?: string) => void;
}

type ModalTab = 'lesson' | 'formulas' | 'mcq' | 'frq';

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose, onOpenLimmy }) => {
  const { currentUser, guardProtectedAction, isPremium, limmyAI_credits, deductLimmyCredit, openPremiumModal } = useAuth();
  const [activeTab, setActiveTab] = useState<ModalTab>('lesson');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTocId, setActiveTocId] = useState<string>('toc-sec-0');

  // Sub-topic filter & Published Question Bank state
  const [activeSubTopicId, setActiveSubTopicId] = useState<string>('all');
  const [publishedBankQuestions, setPublishedBankQuestions] = useState<any[] | null>(null);
  const [isLoadingBank, setIsLoadingBank] = useState<boolean>(false);

  // Interactive Model MCQ & Model FRQ states inside the Textbook Chapter
  const [selectedModelMcqOption, setSelectedModelMcqOption] = useState<Record<string, number>>({});
  const [expandedModelMcqDerivation, setExpandedModelMcqDerivation] = useState<Record<string, boolean>>({});
  const [expandedModelFrqPart, setExpandedModelFrqPart] = useState<Record<string, boolean>>({});

  // Interactive Practice Tab MCQ & FRQ states
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<number, number>>({});
  const [revealedFrqRubrics, setRevealedFrqRubrics] = useState<Record<string, boolean>>({});
  const [frqWorkInputs, setFrqWorkInputs] = useState<Record<string, string>>({});

  // Lesson View Teacher Limmy Guidance State (docked side-drawer & floating button)
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState<boolean>(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hey there! Teacher Limmy here. I'm right here with you while you study this lesson. Have a question about a formula, theorem, or graph? Ask away or click a quick prompt below!`,
    },
  ]);
  const [tutorInput, setTutorInput] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const tutorBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset tab and interactive state when switching lessons
  useEffect(() => {
    setActiveTab('lesson');
    setActiveSubTopicId('all');
    setActiveTocId('toc-sec-0');
    setSelectedModelMcqOption({});
    setExpandedModelMcqDerivation({});
    setExpandedModelFrqPart({});
    setSelectedMcqAnswers({});
    setRevealedFrqRubrics({});
    setFrqWorkInputs({});
  }, [lesson?.id]);

  // Fetch published questions from `question_bank` filtered by `sub_topic_id == activeSubTopicId` AND `is_published == true`
  const loadPublishedPracticeQuestions = useCallback(async () => {
    if (!lesson) return;
    setIsLoadingBank(true);

    try {
      const win = window as any;
      if (typeof win.fetchStudentPracticeQuestions === 'function') {
        const items = await win.fetchStudentPracticeQuestions(
          activeSubTopicId === 'all' ? null : activeSubTopicId,
          lesson.topicCode
        );
        setPublishedBankQuestions(items || []);
        setIsLoadingBank(false);
        return;
      }

      const constraints = [where('is_published', '==', true)];
      if (activeSubTopicId !== 'all') {
        constraints.push(where('sub_topic_id', '==', activeSubTopicId));
      } else {
        constraints.push(where('topic_id', '==', lesson.topicCode));
      }

      const qRef = query(collection(db, 'question_bank'), ...constraints);
      const snap = await getDocs(qRef);
      if (!snap.empty) {
        const docs: any[] = [];
        snap.forEach((d) => docs.push(d.data()));
        setPublishedBankQuestions(docs);
      } else {
        setPublishedBankQuestions(null);
      }
    } catch {
      setPublishedBankQuestions(null);
    } finally {
      setIsLoadingBank(false);
    }
  }, [lesson, activeSubTopicId]);

  useEffect(() => {
    loadPublishedPracticeQuestions();

    const handleBankUpdate = () => {
      loadPublishedPracticeQuestions();
    };
    window.addEventListener('mathprep:question-bank-updated', handleBankUpdate);
    return () => window.removeEventListener('mathprep:question-bank-updated', handleBankUpdate);
  }, [loadPublishedPracticeQuestions]);

  // Load completion state from Firestore
  useEffect(() => {
    if (!lesson || !currentUser) {
      setIsCompleted(false);
      return;
    }

    let isMounted = true;
    fetchStudentProgress(currentUser.uid)
      .then((progress) => {
        if (isMounted && progress?.completedLessons) {
          setIsCompleted(progress.completedLessons.includes(lesson.id));
        }
      })
      .catch((err) => {
        console.error('Failed to load lesson completion from Firestore:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [lesson, currentUser]);

  const handleToggleCompleted = () => {
    if (!lesson) return;

    guardProtectedAction('mark lessons as completed in your cloud progress', async () => {
      if (!currentUser) return;
      setIsSaving(true);
      try {
        const currentProgress = await fetchStudentProgress(currentUser.uid);
        const existing = currentProgress?.completedLessons || [];
        const nextCompleted = isCompleted
          ? existing.filter((id) => id !== lesson.id)
          : [...new Set([...existing, lesson.id])];

        const readingMins = lesson.lesson?.reading_time_minutes || 28;
        await saveStudentProgress(currentUser.uid, {
          completedLessons: nextCompleted,
          totalStudyMinutes: (currentProgress?.totalStudyMinutes || 0) + (isCompleted ? 0 : readingMins),
        });

        setIsCompleted(!isCompleted);
        showToast(
          !isCompleted
            ? 'Textbook chapter marked completed & saved to your Firebase database!'
            : 'Lesson completion updated in your Firebase database!',
          'success'
        );
      } catch (err) {
        console.error('Error saving progress to Firestore:', err);
        showToast('Failed to save to database. Check email verification status.', 'error');
      } finally {
        setIsSaving(false);
      }
    });
  };

  const scrollToAnchor = (anchorId: string) => {
    setActiveTocId(anchorId);
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!lesson) return null;

  const exhaustive = lesson.lesson;
  const readingTimeMinutes = exhaustive?.reading_time_minutes || 5;
  const rawSections = exhaustive?.conceptual_sections || [];
  const hasLeanThree =
    rawSections.length === 3 &&
    rawSections[0]?.title === 'Concept Description' &&
    rawSections[1]?.title === 'Core Formula' &&
    rawSections[2]?.title === 'Simple Explanation';
  const conceptualSections = hasLeanThree
    ? rawSections
    : [
        {
          section_id: 'sec-concept-description',
          title: 'Concept Description',
          body_markdown:
            exhaustive?.concept_description ||
            lesson.master_lesson?.concept_description ||
            rawSections[0]?.body_markdown ||
            lesson.summary,
        },
        {
          section_id: 'sec-core-formula',
          title: 'Core Formula',
          body_markdown:
            exhaustive?.core_formula ||
            lesson.master_lesson?.core_formula ||
            rawSections[1]?.body_markdown ||
            lesson.keyTheorems.join('\n\n'),
        },
        {
          section_id: 'sec-simple-explanation',
          title: 'Simple Explanation',
          body_markdown:
            exhaustive?.simple_explanation ||
            lesson.master_lesson?.simple_explanation ||
            rawSections[2]?.body_markdown ||
            exhaustive?.synthesis_summary ||
            lesson.examTip,
        },
      ];
  const theoremVault = exhaustive?.formula_theorem_vault || [];
  const modelMcqs = exhaustive?.model_mcqs || [];
  const modelFrqs = exhaustive?.model_frqs || [];
  const synthesisSummary = exhaustive?.synthesis_summary || '';

  const rawSubTopics = lesson.formula_sheet?.sub_topics || [];
  const subTopics =
    rawSubTopics.length >= 2
      ? rawSubTopics
      : rawSubTopics.length === 1
      ? [
          rawSubTopics[0],
          {
            sub_topic_id: `${lesson.topicCode}.B`,
            sub_topic_title: `${lesson.title} — Graphical, Tabular & Contextual Modeling`,
            essential_formulas: rawSubTopics[0].essential_formulas || [],
          },
        ]
      : [
          {
            sub_topic_id: `${lesson.topicCode}.A`,
            sub_topic_title: `${lesson.title} — Algebraic & Analytical Foundations`,
            essential_formulas: [],
          },
          {
            sub_topic_id: `${lesson.topicCode}.B`,
            sub_topic_title: `${lesson.title} — Graphical, Tabular & Contextual Modeling`,
            essential_formulas: [],
          },
        ];

  let formulaCount = 0;
  rawSubTopics.forEach((st) => {
    formulaCount += st.essential_formulas?.length || 0;
  });

  // Merge designated topic questions from `lesson.practice_section` with any live `question_bank` items,
  // deduplicating by ID and filtering by `activeSubTopicId`
  const mergedMcqMap = new Map<string, any>();
  (lesson.practice_section?.mcq || []).forEach((q, idx) => {
    const qId = q.question_id || `${lesson.topicCode}_mcq_${idx + 1}`;
    mergedMcqMap.set(qId, {
      ...q,
      question_id: qId,
      sub_topic_id: q.sub_topic_id || subTopics[idx % subTopics.length]?.sub_topic_id || `${lesson.topicCode}.A`,
    });
  });

  if (Array.isArray(publishedBankQuestions)) {
    publishedBankQuestions
      .filter((q) => q && q.type === 'MCQ')
      .forEach((q) => {
        const qId = q.id || q.question_id;
        if (!qId) return;
        mergedMcqMap.set(qId, {
          question_id: qId,
          sub_topic_id: q.sub_topic_id || `${lesson.topicCode}.A`,
          sub_topic_title: q.sub_topic_title || '',
          calculator_active: Boolean(q.calculator_active),
          difficulty: q.difficulty || 'AP Standard',
          question_latex: q.content?.prompt_latex || q.question_latex || '',
          options: q.content?.options || q.options || [],
          correct_index: Number(q.content?.correct_index ?? q.correct_index ?? 0),
          explanation_latex: q.content?.explanation_latex || q.explanation_latex || '',
          exam_trap: q.content?.exam_trap || q.exam_trap || '',
        });
      });
  }

  const allTopicMcqs = Array.from(mergedMcqMap.values());
  const mcqList =
    activeSubTopicId === 'all'
      ? allTopicMcqs
      : allTopicMcqs.filter((q) => String(q.sub_topic_id) === String(activeSubTopicId));

  const mergedFrqMap = new Map<string, any>();
  (lesson.practice_section?.frq || []).forEach((f, idx) => {
    const fId = f.frq_id || `${lesson.topicCode}_frq_${idx + 1}`;
    mergedFrqMap.set(fId, {
      ...f,
      frq_id: fId,
      sub_topic_id: f.sub_topic_id || subTopics[idx % subTopics.length]?.sub_topic_id || `${lesson.topicCode}.A`,
    });
  });

  if (Array.isArray(publishedBankQuestions)) {
    publishedBankQuestions
      .filter((q) => q && q.type === 'FRQ')
      .forEach((q) => {
        const fId = q.id || q.frq_id;
        if (!fId) return;
        mergedFrqMap.set(fId, {
          frq_id: fId,
          sub_topic_id: q.sub_topic_id || `${lesson.topicCode}.A`,
          sub_topic_title: q.sub_topic_title || '',
          difficulty: q.difficulty || 'AP Standard',
          calculator_active: Boolean(q.calculator_active),
          scenario_latex: q.content?.scenario_latex || q.scenario_latex || '',
          parts: q.content?.parts || q.parts || [],
        });
      });
  }

  const allTopicFrqs = Array.from(mergedFrqMap.values());
  const frqList =
    activeSubTopicId === 'all'
      ? allTopicFrqs
      : allTopicFrqs.filter((f) => String(f.sub_topic_id) === String(activeSubTopicId));

  // Build structured Table of Contents anchors for the left sidebar
  const tocItems: Array<{ id: string; label: string; badge?: string }> = [
    ...conceptualSections.map((sec, idx) => ({
      id: `toc-sec-${idx}`,
      label: sec.title.replace(/^[IVX]+\.\s*/, ''),
      badge: `Sec ${idx + 1}`,
    })),
    ...(theoremVault.length > 0
      ? [{ id: 'toc-vault', label: 'Formula & Theorem Vault', badge: `${theoremVault.length}` }]
      : []),
    ...modelMcqs.map((m, idx) => ({
      id: `toc-model-mcq-${idx}`,
      label: `Model AP Exam MCQ #${idx + 1}`,
      badge: m.calculator_active ? 'Calc' : 'No-Calc',
    })),
    ...modelFrqs.map((_, idx) => ({
      id: `toc-model-frq-${idx}`,
      label: `Model AP FRQ Walkthrough (Parts a–d)`,
      badge: '6 Pts',
    })),
    ...(synthesisSummary
      ? [{ id: 'toc-synthesis', label: 'Synthesis & AP Exam Traps', badge: 'Rules' }]
      : []),
  ];

  const handleSendLessonTutorMessage = async (customPrompt?: string) => {
    const query = (customPrompt || tutorInput).trim();
    if (!query || isTutorLoading || !lesson) return;

    // Check credits for free tier
    if (!isPremium && limmyAI_credits <= 0) {
      openPremiumModal(
        'Out of Limmy AI Credits',
        'You have used all 5 free Limmy AI tutoring credits. Upgrade to Premium for unlimited 24/7 Socratic guidance across all 4 units!'
      );
      return;
    }

    const creditAllowed = await deductLimmyCredit();
    if (!creditAllowed && !isPremium) return;

    const userMsg = { role: 'user' as const, content: query };
    setTutorMessages((prev) => [...prev, userMsg]);
    setTutorInput('');
    setIsTutorLoading(true);
    setIsTutorDrawerOpen(true);

    // Telemetry capture: Topic Title + exact rendered text & KaTeX formulas of the lesson module
    const topicTitle = `Topic ${lesson.topicCode}: ${lesson.title}`;
    const conceptualText = conceptualSections
      .map((sec) => `${sec.title}:\n${sec.body_markdown}`)
      .join('\n\n');
    const formulasText = theoremVault
      .map((thm) => `${thm.title}: $$${thm.latex}$$\n${thm.formal_definition}`)
      .join('\n\n');
    const renderedContent = `${conceptualText}\n\n${formulasText}`.trim() || lesson.summary;

    try {
      const historyPayload = tutorMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'LESSON_GUIDANCE',
          topic_title: topicTitle,
          lesson_content: renderedContent,
          student_question: query,
          history: historyPayload,
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        "Let's look at this part of your lesson together. What does the formula say about the relationship between input and output?";

      setTutorMessages((prev) => [
        ...prev,
        { role: 'assistant', content: replyText },
      ]);
    } catch (err) {
      console.error('Error fetching lesson guidance:', err);
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I ran into a temporary connection issue. Let's look at the formula in your lesson: what are the input and output values given in the problem?",
        },
      ]);
    } finally {
      setIsTutorLoading(false);
      setTimeout(() => {
        tutorBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-300 mb-1.5">
              <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-md">
                Unit {lesson.unitNumber}
              </span>
              <span className="font-mono bg-indigo-500/30 text-indigo-100 border border-indigo-400/30 px-2.5 py-0.5 rounded-md font-bold">
                Topic {lesson.topicCode}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTimeMinutes} min Study Guide</span>
              </span>
              <span className="text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md">
                {lesson.calculatorRequirement}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Topic {lesson.topicCode}: {lesson.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Tab Bar (Topic Study Guide, Dedicated Formula Sheet, Live Bank MCQ, Live Bank FRQ) */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('lesson')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              activeTab === 'lesson'
                ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Core Study Guide (Concept + Formula + Explanation)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              activeTab === 'formulas'
                ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Sub-Topic Formula Sheet ({formulaCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mcq')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              activeTab === 'mcq'
                ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Practice Bank: MCQ ({mcqList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isPremium) {
                openPremiumModal(
                  'Advanced AP Free-Response Questions (FRQs)',
                  'Multi-part FRQs with official College Board scoring rubrics, point breakdowns, and live KaTeX preview are reserved for Premium members.'
                );
              }
              setActiveTab('frq');
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              activeTab === 'frq'
                ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Practice Bank: FRQ ({frqList.length})</span>
            {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
          </button>

          {/* Ask Teacher Limmy Floating / Docked Side-Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setIsTutorDrawerOpen(!isTutorDrawerOpen)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ml-auto ${
              isTutorDrawerOpen
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Ask Teacher Limmy questions about this specific lesson"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>🧑‍🏫 Ask Teacher Limmy</span>
            {isTutorDrawerOpen && (
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-mono">
                Docked
              </span>
            )}
          </button>
        </div>

        {/* Sub-Topic Filter Bar inside Practice MCQ & FRQ Tabs */}
        {(activeTab === 'mcq' || activeTab === 'frq') && (
          <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sub-Topic Filter:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTopicId('all');
                  setSelectedMcqAnswers({});
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  activeSubTopicId === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                All Sub-Topics ({lesson.topicCode})
              </button>
              {subTopics.map((st) => (
                <button
                  key={st.sub_topic_id}
                  type="button"
                  onClick={() => {
                    setActiveSubTopicId(st.sub_topic_id);
                    setSelectedMcqAnswers({});
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    activeSubTopicId === st.sub_topic_id
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st.sub_topic_id}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Live Published Set
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* LEFT FLOATING / STICKY TABLE OF CONTENTS SIDEBAR (Only in Textbook Chapter Tab) */}
          {activeTab === 'lesson' && tocItems.length > 0 && (
            <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/90 p-4 overflow-y-auto shrink-0 max-h-44 lg:max-h-none">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <List className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chapter Contents</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                  {readingTimeMinutes}m
                </span>
              </div>

              <nav className="space-y-1" aria-label="Chapter Table of Contents">
                {tocItems.map((item) => {
                  const isActive = activeTocId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToAnchor(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-200/70 font-medium'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            isActive
                              ? 'bg-blue-700 text-blue-100'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 p-3 rounded-xl bg-indigo-50/90 border border-indigo-200/80 space-y-1.5 hidden lg:block">
                <div className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AP Study Strategy</span>
                </div>
                <p className="text-[11px] text-indigo-900/90 leading-relaxed">
                  Review the <strong>Concept Description</strong>, <strong>Core Formula</strong>, and{' '}
                  <strong>Simple Explanation</strong> first, then test yourself on the{' '}
                  <strong>Model AP MCQs</strong> and <strong>Model FRQ</strong>.
                </p>
              </div>
            </aside>
          )}

          {/* MAIN SCROLLABLE READER PANE */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-white">
            {/* TAB 1: LEAN STUDY GUIDE */}
            {activeTab === 'lesson' && (
              <div className="space-y-10 max-w-4xl mx-auto">
                {/* Chapter Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-slate-800 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-blue-300 font-bold">
                      AP Precalculus Study Guide · Topic {lesson.topicCode}
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                      College Board CED Aligned
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <FormattedMathText text={lesson.summary} />
                  </p>
                </div>

                {/* A) 3-PART LEAN CONCEPTUAL SECTIONS */}
                {conceptualSections.map((sec, idx) => (
                  <section
                    key={sec.section_id || idx}
                    id={`toc-sec-${idx}`}
                    className="scroll-mt-6 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {sec.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200 shrink-0">
                        Core Mechanics
                      </span>
                    </div>
                    <div className="p-6 text-slate-800 leading-relaxed">
                      <LimmyMarkdownMath content={sec.body_markdown} />
                    </div>
                  </section>
                ))}

                {/* B) FORMULA & THEOREM VAULT */}
                {theoremVault.length > 0 && (
                  <section id="toc-vault" className="scroll-mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                          V
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Formula & Theorem Vault (Conditions & Boundary Cases)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Formal theorems, algebraic prerequisites when each formula works, and boundary conditions where it fails
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {theoremVault.map((thm, tIdx) => (
                        <div
                          key={thm.theorem_id || tIdx}
                          className="rounded-2xl border border-indigo-200/90 bg-indigo-50/30 p-5 space-y-4 shadow-2xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">
                                {thm.sub_topic_id}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                <FormattedMathText text={thm.title} />
                              </h4>
                            </div>
                            <span className="text-[11px] font-medium text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                              {thm.sub_topic_title}
                            </span>
                          </div>

                          <div className="p-4 bg-white rounded-xl border border-indigo-100 overflow-x-auto flex items-center justify-center shadow-2xs">
                            <MathRenderer math={thm.latex} displayMode={true} />
                          </div>

                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white/90 p-3.5 rounded-xl border border-slate-200/80">
                            <span className="font-bold text-slate-900 mr-1.5">Formal Definition:</span>
                            <FormattedMathText text={thm.formal_definition} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>When It Works (Prerequisites)</span>
                              </div>
                              <div className="text-xs text-emerald-950/90 leading-relaxed">
                                <FormattedMathText text={thm.conditions_when_it_works} />
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>When It Fails (Boundary Traps)</span>
                              </div>
                              <div className="text-xs text-rose-950/90 leading-relaxed">
                                <FormattedMathText text={thm.when_it_fails} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* C) EMBEDDED MODEL AP EXAM QUESTIONS — MCQ SPOTLIGHT */}
                {modelMcqs.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center">
                          ★
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Embedded Model AP Exam Questions — MCQ Spotlight
                          </h3>
                          <p className="text-xs text-slate-500">
                            Select an option (A–D) or expand the full derivation to inspect the line-by-line solution and Anatomy of Distractors
                          </p>
                        </div>
                      </div>
                    </div>

                    {modelMcqs.map((mcq, mIdx) => {
                      const mKey = mcq.model_id || `mcq_${mIdx}`;
                      const selectedOpt = selectedModelMcqOption[mKey];
                      const isAnswered = selectedOpt !== undefined;
                      const isExpanded = Boolean(expandedModelMcqDerivation[mKey]) || isAnswered;
                      const correctLetter = String.fromCharCode(65 + (mcq.correct_index || 0));

                      return (
                        <div
                          key={mKey}
                          id={`toc-model-mcq-${mIdx}`}
                          className="scroll-mt-6 rounded-2xl border-2 border-amber-300/90 bg-gradient-to-b from-amber-50/40 to-white p-6 space-y-4 shadow-xs"
                        >
                          {/* Spotlight Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Model AP Exam MCQ #{mIdx + 1}</span>
                              </span>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                {mcq.difficulty}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                mcq.calculator_active
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {mcq.calculator_active
                                ? '🧮 Section I Part B: Graphing Calculator Active'
                                : '🚫 Section I Part A: No Calculator Allowed'}
                            </span>
                          </div>

                          {/* Problem Stem */}
                          <div className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                            <LimmyMarkdownMath content={mcq.prompt_latex} />
                          </div>

                          {/* 4 Choices (A–D) */}
                          <div className="grid grid-cols-1 gap-2.5">
                            {mcq.options.map((opt, optIdx) => {
                              const cleanOpt = String(opt).replace(/^\([A-D]\)\s*/i, '');
                              const isCorrect = optIdx === mcq.correct_index;
                              const isChosen = selectedOpt === optIdx;

                              let btnClasses =
                                'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
                              if (isAnswered) {
                                if (isCorrect) {
                                  btnClasses =
                                    'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                                } else if (isChosen) {
                                  btnClasses = 'border-rose-400 bg-rose-50 text-rose-900';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() =>
                                    setSelectedModelMcqOption((prev) => ({
                                      ...prev,
                                      [mKey]: optIdx,
                                    }))
                                  }
                                  className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnClasses}`}
                                >
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-slate-300">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <div className="leading-relaxed flex-1">
                                    <FormattedMathText text={cleanOpt} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Toggle Button for Complete Derivation & Distractor Breakdown */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedModelMcqDerivation((prev) => ({
                                  ...prev,
                                  [mKey]: !isExpanded,
                                }))
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 text-amber-400" />
                                  <span>Hide Complete Derivation & Distractor Breakdown</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 text-amber-400" />
                                  <span>Show Complete Derivation & Distractor Breakdown</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Collapsible Worked Solution + Anatomy of Distractors + AP Exam Trap Alert */}
                          {isExpanded && (
                            <div className="space-y-4 pt-3 border-t border-amber-200/80 animate-fade-in">
                              {/* Line-by-Line Worked Solution */}
                              <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-2">
                                <div className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>
                                    Line-by-Line Worked Solution (Correct Choice: {correctLetter})
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                                  <LimmyMarkdownMath content={mcq.worked_solution_latex} />
                                </div>
                              </div>

                              {/* Anatomy of Distractors */}
                              {mcq.distractor_breakdown &&
                                Object.keys(mcq.distractor_breakdown).length > 0 && (
                                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                      🔬 Anatomy of Distractors (Why Each Incorrect Choice Is Wrong)
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                      {Object.entries(mcq.distractor_breakdown).map(
                                        ([letter, reason]) => (
                                          <div
                                            key={letter}
                                            className="p-3 rounded-lg bg-white border border-rose-200/80 flex items-start gap-2.5 text-xs text-slate-800"
                                          >
                                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold shrink-0">
                                              Why ({letter}) is wrong:
                                            </span>
                                            <div className="leading-relaxed">
                                              <FormattedMathText text={reason} />
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* AP Exam Trap Callout Box */}
                              {mcq.ap_exam_trap && (
                                <div className="p-4 rounded-xl bg-amber-100/80 border-2 border-amber-400 text-amber-950 flex items-start gap-3 text-xs sm:text-sm">
                                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold uppercase tracking-wide block mb-0.5 text-amber-900">
                                      ⚠️ AP Exam Trap Alert
                                    </span>
                                    <FormattedMathText text={mcq.ap_exam_trap} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </section>
                )}

                {/* D) EMBEDDED MODEL AP EXAM QUESTIONS — 4-PART FRQ WALKTHROUGH */}
                {modelFrqs.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                          FRQ
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Embedded Model AP Exam FRQ Walkthrough (Parts a, b, c, d)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Full 4-part College Board Free-Response simulation with official scoring guidelines and Chief Reader commentary
                          </p>
                        </div>
                      </div>
                    </div>

                    {modelFrqs.map((frq, fIdx) => (
                      <div
                        key={frq.model_id || fIdx}
                        id={`toc-model-frq-${fIdx}`}
                        className="scroll-mt-6 rounded-2xl border-2 border-purple-300/90 bg-gradient-to-b from-purple-50/30 to-white p-6 space-y-5 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-200">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-900 text-purple-100 font-mono text-xs font-bold">
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>{frq.frq_type || 'Official AP Precalculus 4-Part FRQ'}</span>
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              frq.calculator_active
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {frq.calculator_active
                              ? '🧮 Section II Part A: Graphing Calculator Required'
                              : '🚫 Section II Part B: No Calculator Allowed'}
                          </span>
                        </div>

                        {/* Scenario Stem */}
                        <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                          <LimmyMarkdownMath content={frq.scenario_latex} />
                        </div>

                        {/* 4 Parts: (a), (b), (c), (d) */}
                        <div className="space-y-4">
                          {frq.parts.map((pt, pIdx) => {
                            const pKey = `${fIdx}-${pIdx}`;
                            const isOpen = Boolean(expandedModelFrqPart[pKey]);

                            return (
                              <div
                                key={pKey}
                                className="p-5 rounded-xl border border-slate-200 bg-white space-y-3.5 shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono font-bold text-xs shrink-0 mt-0.5">
                                      Part {pt.part_label}
                                    </span>
                                    <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                                      <FormattedMathText text={pt.prompt_latex} />
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                                    {pt.point_value} {pt.point_value === 1 ? 'Point' : 'Points'}
                                  </span>
                                </div>

                                <div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedModelFrqPart((prev) => ({
                                        ...prev,
                                        [pKey]: !prev[pKey],
                                      }))
                                    }
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    {isOpen ? (
                                      <>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                        <span>
                                          Hide Official College Board Scoring Rubric & Chief Reader Notes
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3.5 h-3.5" />
                                        <span>
                                          Show Official College Board Scoring Rubric & Chief Reader Notes
                                        </span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {isOpen && (
                                  <div className="space-y-3.5 pt-3 border-t border-slate-100 animate-fade-in">
                                    {/* Official Scoring Rubric */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                                        <span>Official College Board Scoring Guidelines</span>
                                        <span>Point Allocation</span>
                                      </div>
                                      <div className="divide-y divide-slate-200/70">
                                        {(pt.rubric || []).map((rub, rIdx) => (
                                          <div
                                            key={rIdx}
                                            className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                                          >
                                            <div className="text-slate-800">
                                              <FormattedMathText text={rub.description} />
                                            </div>
                                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 shrink-0 text-xs">
                                              +{rub.point} pt{rub.point === 1 ? '' : 's'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Model Solution */}
                                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                                      <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                                        ✓ Official College Board Model Solution
                                      </div>
                                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                                        <LimmyMarkdownMath content={pt.model_solution_latex} />
                                      </div>
                                    </div>

                                    {/* Chief Reader Commentary */}
                                    {pt.common_errors && (
                                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="leading-relaxed">
                                          <FormattedMathText text={pt.common_errors} />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {/* E) COMMON MISCONCEPTIONS & SYNTHESIS SUMMARY */}
                {synthesisSummary && (
                  <section
                    id="toc-synthesis"
                    className="scroll-mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-6 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-base font-bold text-blue-950 border-b border-blue-200/80 pb-2.5">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <span>Common Misconceptions & Unit Synthesis Summary</span>
                    </div>
                    <div className="text-slate-800 leading-relaxed">
                      <LimmyMarkdownMath content={synthesisSummary} />
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* TAB 2: DEDICATED SUB-TOPIC FORMULA SHEET */}
            {activeTab === 'formulas' && (
              <div className="space-y-5 max-w-4xl mx-auto">
                {rawSubTopics.map((st, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs">
                        {st.sub_topic_id}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        <FormattedMathText text={st.sub_topic_title} />
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {st.essential_formulas.map((ef, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
                        >
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            <FormattedMathText text={ef.name} />
                          </div>
                          <div className="p-3.5 bg-white rounded-lg border border-blue-100 overflow-x-auto flex items-center justify-center">
                            <MathRenderer math={ef.latex} displayMode={true} />
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            <FormattedMathText text={ef.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: PRACTICE: MULTIPLE-CHOICE QUESTIONS (MCQ) */}
            {activeTab === 'mcq' && (
              <div className="space-y-5 max-w-4xl mx-auto">
                {isLoadingBank ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Loading published practice questions...
                  </div>
                ) : mcqList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <div className="text-2xl">🧪</div>
                    <p className="text-sm font-bold text-slate-800">
                      Practice set currently in staging by Teacher Limmy. Check back soon!
                    </p>
                  </div>
                ) : (
                  mcqList.map((q: any, qIdx: number) => {
                    const chosen = selectedMcqAnswers[qIdx];
                    const isAnswered = chosen !== undefined;
                    return (
                      <div
                        key={q.question_id || qIdx}
                        className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              Question {qIdx + 1}
                            </span>
                            {q.sub_topic_id && (
                              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {q.sub_topic_id}
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {q.difficulty}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              q.calculator_active
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {q.calculator_active
                              ? 'Part B: Graphing Calculator Active'
                              : 'Part A: No Calculator Allowed'}
                          </span>
                        </div>

                        <div className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
                          <LimmyMarkdownMath content={q.question_latex} />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt: string, optIdx: number) => {
                            const cleanOpt = String(opt).replace(/^\([A-D]\)\s*/i, '');
                            const isCorrect = optIdx === q.correct_index;
                            const isSelected = chosen === optIdx;
                            let btnStyle =
                              'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
                            if (isAnswered) {
                              if (isCorrect) {
                                btnStyle =
                                  'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                              } else if (isSelected) {
                                btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() =>
                                  setSelectedMcqAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                }
                                className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                              >
                                <span className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-slate-300">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <div className="leading-relaxed">
                                  <FormattedMathText text={cleanOpt} />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5 text-xs sm:text-sm">
                            <div className="font-bold text-emerald-900">
                              ✓ Official College Board Solution (Answer:{' '}
                              {String.fromCharCode(65 + q.correct_index)}):
                            </div>
                            <div className="text-slate-800 leading-relaxed">
                              <LimmyMarkdownMath content={q.explanation_latex} />
                            </div>
                            {q.exam_trap && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold mr-1">Common AP Exam Trap:</span>
                                  <FormattedMathText text={q.exam_trap} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 4: PRACTICE: FREE-RESPONSE QUESTIONS (FRQ) */}
            {activeTab === 'frq' && (
              <div className="space-y-5 max-w-4xl mx-auto">
                {!isPremium ? (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-8 sm:p-10 text-white border border-amber-500/30 shadow-xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
                      🔒
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold font-mono uppercase tracking-wider">
                        Premium Tier Feature
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                        Unlock Advanced Multi-Part FRQs
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Access all 4-part AP Precalculus Free-Response Questions complete with official College Board scoring guidelines, point rubrics, live KaTeX preview, and line-by-line model solutions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="font-bold text-amber-300">✓ Official Rubrics</span>
                        <p className="text-[11px] text-slate-400 mt-1">Exact point breakdown per sub-part (a–d)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="font-bold text-amber-300">✓ Live Math Typer</span>
                        <p className="text-[11px] text-slate-400 mt-1">Auto-renders LaTeX formulas as you type</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="font-bold text-amber-300">✓ Model Solutions</span>
                        <p className="text-[11px] text-slate-400 mt-1">Full justification & algebraic steps</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <a
                        href="/checkout"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-amber-500/25 transition-all text-center"
                      >
                        Upgrade to Premium ($10 USD)
                      </a>
                      <button
                        type="button"
                        onClick={() => openPremiumModal('Advanced AP Free-Response Questions')}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        View Tier Comparison
                      </button>
                    </div>
                  </div>
                ) : isLoadingBank ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Loading published Free-Response Questions...
                  </div>
                ) : frqList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <div className="text-2xl">🧪</div>
                    <p className="text-sm font-bold text-slate-800">
                      Practice set currently in staging by Teacher Limmy. Check back soon!
                    </p>
                  </div>
                ) : (
                  frqList.map((frq: any, fIdx: number) => (
                    <div
                      key={frq.frq_id || fIdx}
                      className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs">
                            AP Free-Response Question #{fIdx + 1}
                          </span>
                          {frq.sub_topic_id && (
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {frq.sub_topic_id}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            frq.calculator_active
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {frq.calculator_active
                            ? 'Part A: Graphing Calculator Required'
                            : 'Part B: No Calculator Allowed'}
                        </span>
                      </div>

                      {/* Scenario Stem */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                        <LimmyMarkdownMath content={frq.scenario_latex} />
                      </div>

                      {/* Parts */}
                      <div className="space-y-4">
                        {frq.parts.map((pt: any, pIdx: number) => {
                          const rKey = `${fIdx}-${pIdx}`;
                          const isShown = Boolean(revealedFrqRubrics[rKey]);
                          const totalPts = (pt.scoring_rubric || []).reduce(
                            (acc: number, r: any) => acc + (Number(r.points) || 0),
                            0
                          );

                          return (
                            <div
                              key={pIdx}
                              className="p-4 rounded-xl border border-slate-200 bg-white space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs shrink-0 mt-0.5">
                                    Part {pt.part_label}
                                  </span>
                                  <div className="text-sm text-slate-800 leading-relaxed font-medium">
                                    <FormattedMathText text={pt.prompt_latex} />
                                  </div>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                  {totalPts} {totalPts === 1 ? 'Point' : 'Points'}
                                </span>
                              </div>

                              {/* Student Algebraic Work & Live KaTeX Preview */}
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Your Algebraic Work & Justification (Part {pt.part_label}):
                                </label>
                                <textarea
                                  rows={3}
                                  value={frqWorkInputs[rKey] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFrqWorkInputs((prev) => ({ ...prev, [rKey]: val }));
                                    const previewNode = document.getElementById(
                                      `modal-frq-live-preview-${rKey}`
                                    );
                                    const win = window as any;
                                    if (
                                      previewNode &&
                                      typeof win.renderLiveFrqMathPreview === 'function'
                                    ) {
                                      win.renderLiveFrqMathPreview(val, previewNode);
                                    }
                                  }}
                                  placeholder="Write your equations, difference quotients (e.g. \frac{f(b)-f(a)}{b-a}, \Delta x = x_2 - x_1, \sqrt{x}), limits, or justifications here..."
                                  className="w-full text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                                />
                                <div className="frq-live-preview-box">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                                      ✨ Live Math Preview
                                    </span>
                                    <span className="text-[10px] font-mono text-purple-500">
                                      Auto-renders LaTeX (\frac{'{a}{b}'}, \sqrt{'{x}'}, \Delta x, x^2, $...$)
                                    </span>
                                  </div>
                                  <div
                                    id={`modal-frq-live-preview-${rKey}`}
                                    className="frq-live-math-preview math-content"
                                  >
                                    <span className="frq-preview-placeholder">
                                      Your mathematical formulas and work will preview live here...
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedFrqRubrics((prev) => ({
                                      ...prev,
                                      [rKey]: !prev[rKey],
                                    }))
                                  }
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  {isShown
                                    ? 'Hide Scoring Rubric & Model Solution'
                                    : 'Show Scoring Rubric & Model Solution'}
                                </button>
                              </div>

                              {isShown && (
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                  <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                                      <span>College Board Scoring Guidelines</span>
                                      <span>Points</span>
                                    </div>
                                    <div className="divide-y divide-slate-200/70">
                                      {(pt.scoring_rubric || []).map((rub: any, rIdx: number) => (
                                        <div
                                          key={rIdx}
                                          className="px-3 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm"
                                        >
                                          <div className="text-slate-800">
                                            <FormattedMathText text={rub.criteria} />
                                          </div>
                                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 text-xs">
                                            +{rub.points} pt{rub.points === 1 ? '' : 's'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                                    <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                      Model Solution
                                    </div>
                                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                                      <LimmyMarkdownMath content={pt.model_solution_latex} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Floating "Ask Teacher Limmy" button */}
            {!isTutorDrawerOpen && activeTab === 'lesson' && (
              <div className="sticky bottom-4 right-4 flex justify-end pointer-events-none mt-6">
                <button
                  type="button"
                  onClick={() => setIsTutorDrawerOpen(true)}
                  className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer border border-white/20 active:scale-95 animate-fade-in"
                  title="Ask Teacher Limmy for clarification on this lesson"
                >
                  <span className="text-base">🧑‍🏫</span>
                  <span className="text-xs font-bold">Ask Teacher Limmy</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">Lesson Help</span>
                </button>
              </div>
            )}
          </div>

          {/* DOCKED TEACHER LIMMY LESSON GUIDANCE SIDE-DRAWER */}
          {isTutorDrawerOpen && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 z-20 shadow-lg max-h-[50vh] lg:max-h-none">
              {/* Drawer Header */}
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-2xs">
                    🧑‍🏫
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-bold tracking-tight">Teacher Limmy</div>
                      {isPremium ? (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" />
                          <span>Premium</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPremiumModal('Teacher Limmy Socratic Mentorship')}
                          className="text-[9px] font-bold text-indigo-200 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 cursor-pointer"
                        >
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          <span>{limmyAI_credits} credits</span>
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-blue-300 font-mono">Lesson Guidance • Topic {lesson.topicCode}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTutorDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                  aria-label="Close Teacher Limmy drawer"
                >
                  ✕
                </button>
              </div>

              {/* Telemetry Status Strip */}
              <div className="px-3.5 py-1.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900 shrink-0">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Context: Topic {lesson.topicCode}</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                  KaTeX Active
                </span>
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendLessonTutorMessage('Can you explain this formula in simple words?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold border border-slate-200 shrink-0 cursor-pointer transition-colors"
                >
                  💡 Explain formula
                </button>
                <button
                  type="button"
                  onClick={() => handleSendLessonTutorMessage('What does this mean in plain English?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold border border-slate-200 shrink-0 cursor-pointer transition-colors"
                >
                  🔍 What does this mean?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendLessonTutorMessage('Can you give me a simple real-world analogy for this?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold border border-slate-200 shrink-0 cursor-pointer transition-colors"
                >
                  🚗 Real-world analogy
                </button>
                <button
                  type="button"
                  onClick={() => handleSendLessonTutorMessage('What is a common AP exam mistake on this topic?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold border border-slate-200 shrink-0 cursor-pointer transition-colors"
                >
                  ⚠️ AP exam traps
                </button>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" id="lesson-tutor-feed">
                {tutorMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'user' ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-3.5 py-2 text-xs leading-relaxed shadow-2xs">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[92%] rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3.5 text-xs text-slate-800 leading-relaxed shadow-2xs space-y-1.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                          Teacher Limmy
                        </div>
                        <div className="math-content leading-relaxed">
                          <FormattedMathText text={msg.content} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTutorLoading && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 animate-pulse">
                    <span>🧑‍🏫</span>
                    <span>Teacher Limmy is reading the lesson text and preparing guidance...</span>
                  </div>
                )}
                <div ref={tutorBottomRef} />
              </div>

              {/* Zero credit warning for free users */}
              {!isPremium && limmyAI_credits <= 0 && (
                <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-950 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>0 free AI prompts remaining</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openPremiumModal(
                        'Unlimited Teacher Limmy Guidance',
                        'Upgrade to MathPrep Premium for unlimited AI tutoring and error breakdowns.'
                      )
                    }
                    className="font-bold text-indigo-700 hover:underline cursor-pointer"
                  >
                    Upgrade →
                  </button>
                </div>
              )}

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendLessonTutorMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  placeholder="Ask Limmy about this lesson (e.g. 'Can you explain this formula?')..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isTutorLoading || !tutorInput.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Send
                </button>
              </form>
            </aside>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenLimmy && (
              <button
                onClick={() => {
                  onOpenLimmy(`Topic ${lesson.topicCode}: ${lesson.title}`);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Ask Limmy to Guide You</span>
              </button>
            )}

            <button
              onClick={handleToggleCompleted}
              disabled={isSaving}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Saves lesson completion state directly to your Firebase Firestore database"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Completed in Database</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4 text-slate-500" />
                  <span>{isSaving ? 'Saving...' : 'Mark Chapter Completed'}</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer ml-auto"
          >
            Close Chapter
          </button>
        </div>
      </div>
    </div>
  );
};
