import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Lock,
  Crown,
} from 'lucide-react';
import { PageId } from '../types';
import { useAuth } from '../context/AuthContext';

interface TopicTelemetryStat {
  topic_id: string;
  unit_id: string;
  title: string;
  total_attempted: number;
  total_correct: number;
  mcq_attempted: number;
  mcq_correct: number;
  frq_attempted: number;
  frq_completed: number;
  accuracy_rate: number;
  consecutive_errors: number;
  exam_traps_triggered: number;
  mastery_status: 'Mastered' | 'In Progress' | 'Struggling / Needs Review' | 'Unattempted' | string;
}

interface SubTopicTelemetryStat {
  sub_topic_id: string;
  topic_id: string;
  topic_title: string;
  title: string;
  total_attempted: number;
  total_correct: number;
  accuracy_rate: number;
  consecutive_errors: number;
  exam_traps_triggered: number;
  mastery_status: string;
}

interface TelemetrySnapshot {
  topicStats: Record<string, TopicTelemetryStat>;
  subTopicStats: Record<string, SubTopicTelemetryStat>;
  weakSubTopics: SubTopicTelemetryStat[];
  telemetryLog: Array<{
    topic_id: string;
    sub_topic_id: string;
    question_id: string;
    question_type: string;
    is_correct: boolean;
    timestamp: string;
    time_spent_seconds: number;
    exam_trap_triggered: boolean;
  }>;
  totalQuestionsInBank: number;
}

interface ProgressTrackerPageProps {
  onNavigate: (page: PageId) => void;
  onSelectTopicLesson?: (topicCode: string) => void;
}

const UNIT_HEADERS: Array<{
  unit_id: string;
  num: number;
  title: string;
  weight: string;
  accent: string;
}> = [
  {
    unit_id: 'unit_1',
    num: 1,
    title: 'Unit 1: Polynomial and Rational Functions',
    weight: '30%–40% Exam Weight',
    accent: 'from-blue-600 to-indigo-700',
  },
  {
    unit_id: 'unit_2',
    num: 2,
    title: 'Unit 2: Exponential and Logarithmic Functions',
    weight: '27%–40% Exam Weight',
    accent: 'from-emerald-600 to-teal-700',
  },
  {
    unit_id: 'unit_3',
    num: 3,
    title: 'Unit 3: Trigonometric and Polar Functions',
    weight: '30%–35% Exam Weight',
    accent: 'from-purple-600 to-indigo-700',
  },
  {
    unit_id: 'unit_4',
    num: 4,
    title: 'Unit 4: Functions Involving Parameters, Vectors, and Matrices',
    weight: 'Additional AP Topics',
    accent: 'from-amber-600 to-orange-700',
  },
];

export const ProgressTrackerPage: React.FC<ProgressTrackerPageProps> = ({
  onNavigate,
  onSelectTopicLesson,
}) => {
  const { isPremium, openPremiumModal } = useAuth();
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const refreshTelemetry = () => {
    const win = window as unknown as {
      getStudentTelemetryData?: () => TelemetrySnapshot;
    };
    if (typeof win.getStudentTelemetryData === 'function') {
      setSnapshot({ ...win.getStudentTelemetryData() });
    }
  };

  useEffect(() => {
    refreshTelemetry();
    const timer = setTimeout(refreshTelemetry, 400);
    const handleUpdate = () => refreshTelemetry();
    window.addEventListener('mathprep:telemetry-updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mathprep:telemetry-updated', handleUpdate);
    };
  }, []);

  const allTopics: TopicTelemetryStat[] = snapshot?.topicStats
    ? (Object.values(snapshot.topicStats) as TopicTelemetryStat[]).sort((a, b) => {
        const [uA, tA] = a.topic_id.split('.').map(Number);
        const [uB, tB] = b.topic_id.split('.').map(Number);
        if (uA !== uB) return uA - uB;
        return tA - tB;
      })
    : [];

  const totalAttemptedQuestions = allTopics.reduce((acc, t) => acc + t.total_attempted, 0);
  const totalCorrectQuestions = allTopics.reduce((acc, t) => acc + t.total_correct, 0);
  const overallAccuracy =
    totalAttemptedQuestions > 0
      ? Math.round((totalCorrectQuestions / totalAttemptedQuestions) * 100)
      : 0;

  const masteredTopicsCount = allTopics.filter((t) => t.mastery_status === 'Mastered').length;
  const inProgressTopicsCount = allTopics.filter((t) => t.mastery_status === 'In Progress').length;
  const strugglingTopicsCount = allTopics.filter(
    (t) => t.mastery_status === 'Struggling / Needs Review'
  ).length;

  // Compute Priority Review / Struggle Areas (Top 3 weakest sub-topics or topics)
  const weakSubTopics = snapshot?.weakSubTopics || [];
  const strugglingTopics = allTopics
    .filter((t) => t.total_attempted > 0 && (t.mastery_status === 'Struggling / Needs Review' || t.accuracy_rate < 75))
    .sort((a, b) => a.accuracy_rate - b.accuracy_rate)
    .slice(0, 3);

  const handleLaunchWeaknessDrill = (targetSubTopicOrTopicId?: string) => {
    if (!isPremium) {
      openPremiumModal(
        'Targeted Weakness Remediation Drills',
        'AI-guided drills targeting your specific missed questions, error diagnostics, and struggling topics are reserved for Premium members.'
      );
      return;
    }
    const win = window as unknown as {
      launchTargetedWeaknessDrill?: (id?: string | null) => void;
    };
    onNavigate('practice');
    setTimeout(() => {
      if (typeof win.launchTargetedWeaknessDrill === 'function') {
        win.launchTargetedWeaknessDrill(targetSubTopicOrTopicId || null);
      }
    }, 100);
  };

  const getStatusBadgeClasses = (status: string) => {
    if (status === 'Mastered') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (status === 'In Progress') {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (status === 'Struggling / Needs Review') {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getAccuracyBarColor = (accuracy: number, attempted: number) => {
    if (attempted === 0) return 'bg-slate-300';
    if (accuracy >= 80) return 'bg-emerald-500';
    if (accuracy >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 max-w-full overflow-x-hidden">
      {/* Top Hero Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 max-w-full overflow-x-hidden">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>AP Precalculus Telemetry & Mastery Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                📊 Progress & Mastery Tracker
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
                Real-time diagnostic telemetry across all 4 AP Precalculus units. Track your MCQ accuracy, FRQ rubric completion, and eliminate exam traps before test day.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleLaunchWeaknessDrill()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>⚡ Targeted Drill: Fix My Weak Spots</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('practice')}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
              >
                ← Back to Practice Hub
              </button>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Overall Accuracy</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {overallAccuracy}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({totalCorrectQuestions}/{totalAttemptedQuestions} correct)
                </span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Mastered Topics (80%+)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {masteredTopicsCount}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  / {allTopics.length || 37} CED Topics
                </span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>In Progress (60–79%)</span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                  {inProgressTopicsCount}
                </span>
                <span className="text-xs font-mono text-slate-400">building fluency</span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Needs Review (&lt;60%)</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
                  {strugglingTopicsCount}
                </span>
                <span className="text-xs font-mono text-slate-400">priority struggle areas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 1. ⚠️ Priority Review / Struggle Areas Alert Box */}
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/70 to-rose-50/60 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-amber-200/80">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  <span>⚠️ Priority Review / Struggle Areas</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  Top Diagnostic Weak Spots & High-Risk Sub-Topics
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                  Automatically identified from your accuracy rate (&lt;60%), consecutive errors (3+ in a row), and triggered AP Exam traps.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchWeaknessDrill()}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isPremium ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>⚡ Targeted Drill: Fix My Weak Spots</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>⚡ Targeted Weakness Drill (Premium)</span>
                </>
              )}
            </button>
          </div>

          {!isPremium && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-indigo-500/15 border border-amber-300/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Personalized Weakness Remediation:</strong> Isolates your exact distractor traps and generates customized remedial practice sets.
                </span>
              </div>
              <a
                href="/checkout"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold whitespace-nowrap shadow-xs"
              >
                Upgrade ($10) →
              </a>
            </div>
          )}

          {weakSubTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {weakSubTopics.map((sub, i) => (
                <div
                  key={sub.sub_topic_id}
                  className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-900 font-mono text-xs font-bold">
                        #{i + 1} Priority • {sub.sub_topic_id}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-rose-700">
                        {sub.accuracy_rate}% Accuracy
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      Topic {sub.topic_id}: {sub.topic_title}
                    </div>
                    <div className="text-xs text-slate-600">
                      Sub-Topic: <span className="font-semibold text-slate-800">{sub.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>
                        Attempted: <strong>{sub.total_attempted}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Correct: <strong>{sub.total_correct}</strong>
                      </span>
                      {sub.consecutive_errors >= 2 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-700 font-bold">
                            {sub.consecutive_errors} consecutive misses
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleLaunchWeaknessDrill(sub.sub_topic_id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Drill {sub.sub_topic_id}</span>
                    </button>
                    {onSelectTopicLesson && (
                      <button
                        type="button"
                        onClick={() => onSelectTopicLesson(sub.topic_id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Lesson</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : strugglingTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {strugglingTopics.map((t, i) => (
                <div
                  key={t.topic_id}
                  className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-900 font-mono text-xs font-bold">
                        #{i + 1} Priority • Topic {t.topic_id}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-rose-700">
                        {t.accuracy_rate}% Accuracy
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-600">
                      {t.total_correct}/{t.total_attempted} correct • Status: {t.mastery_status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchWeaknessDrill(t.topic_id)}
                    className="w-full px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Drill Topic {t.topic_id}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 bg-white/90 rounded-2xl border border-amber-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {totalAttemptedQuestions === 0
                    ? 'No practice attempts recorded yet — start a diagnostic drill to map your weak spots!'
                    : '🎉 Zero active struggle areas! All attempted topics are above the 75% mastery threshold.'}
                </div>
                <p className="text-xs text-slate-600">
                  Click &ldquo;⚡ Targeted Drill: Fix My Weak Spots&rdquo; to launch a 10-question adaptive study session.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchWeaknessDrill()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
              >
                Start Diagnostic Session →
              </button>
            </div>
          )}
        </div>

        {/* 2. Filter Bar for Unit-by-Unit Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Unit Filter:</span>
            </span>
            {[
              { id: 'all', label: 'All Units (1–4)' },
              { id: 'unit_1', label: 'Unit 1' },
              { id: 'unit_2', label: 'Unit 2' },
              { id: 'unit_3', label: 'Unit 3' },
              { id: 'unit_4', label: 'Unit 4' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUnitFilter(u.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedUnitFilter === u.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Mastery Status:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'Struggling / Needs Review', label: 'Needs Review (<60%)' },
              { id: 'In Progress', label: 'In Progress (60–79%)' },
              { id: 'Mastered', label: 'Mastered (80%+)' },
              { id: 'Unattempted', label: 'Unattempted' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
            <button
              type="button"
              onClick={refreshTelemetry}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Unit-by-Unit Breakdown Matrix (Units 1 through 4) */}
        <div className="space-y-8">
          {UNIT_HEADERS.filter(
            (u) => selectedUnitFilter === 'all' || u.unit_id === selectedUnitFilter
          ).map((unit) => {
            const unitTopics = allTopics.filter(
              (t) =>
                t.unit_id === unit.unit_id &&
                (statusFilter === 'all' || t.mastery_status === statusFilter)
            );

            const unitAttempted = unitTopics.reduce((acc, t) => acc + t.total_attempted, 0);
            const unitCorrect = unitTopics.reduce((acc, t) => acc + t.total_correct, 0);
            const unitPct =
              unitAttempted > 0 ? Math.round((unitCorrect / unitAttempted) * 100) : 0;

            return (
              <div
                key={unit.unit_id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Unit Header Banner */}
                <div
                  className={`bg-gradient-to-r ${unit.accent} text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                      {unit.weight}
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold">{unit.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-2xl">
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-white/75 font-bold">
                        Unit Accuracy
                      </div>
                      <div className="text-lg font-mono font-extrabold">
                        {unitAttempted > 0 ? `${unitPct}%` : '—'}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-white/75 font-bold">
                        Total Attempts
                      </div>
                      <div className="text-lg font-mono font-extrabold">{unitAttempted}</div>
                    </div>
                  </div>
                </div>

                {/* Topic Breakdown Matrix Table / Cards */}
                {unitTopics.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No topics in {unit.title} match the selected status filter.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {unitTopics.map((topic) => {
                      const mcqPct =
                        topic.mcq_attempted > 0
                          ? Math.round((topic.mcq_correct / topic.mcq_attempted) * 100)
                          : null;

                      return (
                        <div
                          key={topic.topic_id}
                          className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          {/* Topic ID, Title & Status Badge */}
                          <div className="space-y-1.5 lg:w-5/12">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                                Topic {topic.topic_id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClasses(
                                  topic.mastery_status
                                )}`}
                              >
                                {topic.mastery_status}
                              </span>
                              {topic.exam_traps_triggered > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  ⚠️ {topic.exam_traps_triggered} Trap{topic.exam_traps_triggered > 1 ? 's' : ''} Triggered
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-sm sm:text-base text-slate-900">
                              {topic.title}
                            </div>
                          </div>

                          {/* Color-Coded Accuracy Progress Bar + MCQ vs FRQ Breakdown */}
                          <div className="lg:w-4/12 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-600">
                                Accuracy Rate ({topic.total_correct}/{topic.total_attempted})
                              </span>
                              <span className="font-mono font-extrabold text-slate-900">
                                {topic.total_attempted > 0 ? `${topic.accuracy_rate}%` : 'Unattempted'}
                              </span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${getAccuracyBarColor(
                                  topic.accuracy_rate,
                                  topic.total_attempted
                                )}`}
                                style={{
                                  width: `${topic.total_attempted > 0 ? Math.max(6, topic.accuracy_rate) : 0}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                              <span>
                                MCQ Accuracy:{' '}
                                <strong className="text-slate-800">
                                  {mcqPct !== null
                                    ? `${mcqPct}% (${topic.mcq_correct}/${topic.mcq_attempted})`
                                    : '0/0'}
                                </strong>
                              </span>
                              <span>
                                FRQ Completed:{' '}
                                <strong className="text-purple-700">
                                  {topic.frq_completed}/{topic.frq_attempted}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 lg:w-3/12 lg:justify-end">
                            <button
                              type="button"
                              onClick={() => handleLaunchWeaknessDrill(topic.topic_id)}
                              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Practice {topic.topic_id}</span>
                            </button>
                            {onSelectTopicLesson && (
                              <button
                                type="button"
                                onClick={() => onSelectTopicLesson(topic.topic_id)}
                                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Lesson</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
