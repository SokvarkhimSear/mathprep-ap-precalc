/**
 * MathPrep AP Precalculus — Advanced Practice Hub, Multi-Criteria Filter Engine,
 * Interactive Session Launcher, Exam Simulation Runner, TI-84 Graphing Calculator &
 * Firestore Mastery Persistence (Modular SDK v11)
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ============================================================================
// 1. FIREBASE INITIALIZATION & CATALOG METADATA
// ============================================================================
const firebaseConfig = window.firebaseConfig || {};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
const db = getFirestore(app, databaseId);

const STORAGE_MASTERY_KEY = "mathprep_student_mastery_v1";
const STORAGE_TELEMETRY_KEY = "mathprep_student_telemetry_v1";
const STORAGE_ACTIVE_SESSION_KEY = "mathprep_active_practice_session_v1";

const UNIT_METADATA = {
  unit_1: {
    id: "unit_1",
    num: 1,
    title: "Unit 1: Polynomial and Rational Functions",
    weight: "30%–40% Exam Weight",
    description: "Rates of change, concavity, polynomial zeros, end behavior, rational asymptotes, holes, transformations, and function models."
  },
  unit_2: {
    id: "unit_2",
    num: 2,
    title: "Unit 2: Exponential and Logarithmic Functions",
    weight: "27%–40% Exam Weight",
    description: "Arithmetic/geometric sequences, exponential growth/decay, function composition, inverses, logarithmic expressions, equations, and semi-log plots."
  },
  unit_3: {
    id: "unit_3",
    num: 3,
    title: "Unit 3: Trigonometric and Polar Functions",
    weight: "30%–35% Exam Weight",
    description: "Periodic phenomena, unit circle radians, sinusoidal graphs and modeling, tangent/reciprocal functions, inverse trig, identities, and polar coordinates."
  },
  unit_4: {
    id: "unit_4",
    num: 4,
    title: "Unit 4: Functions Involving Parameters, Vectors, and Matrices",
    weight: "Additional AP Topics",
    description: "Parametric planar motion, rates of change, conic sections, vectors in 2D, dot products, matrices, linear transformations, determinants, and Markov chains."
  }
};

const TOPIC_TITLES = {
  "1.1": "Change in Tandem",
  "1.2": "Rates of Change",
  "1.3": "Rates of Change in Linear and Quadratic Functions",
  "1.4": "Polynomial Functions and Rates of Change",
  "1.5": "Polynomial Functions and Complex Zeros",
  "1.6": "Polynomial Functions and End Behavior",
  "1.7": "Rational Functions and End Behavior",
  "1.8": "Rational Functions and Zeros",
  "1.9": "Rational Functions and Vertical Asymptotes",
  "1.10": "Rational Functions and Holes",
  "1.11": "Equivalent Representations of Polynomial and Rational Expressions",
  "1.12": "Transformations of Functions",
  "1.13": "Function Model Selection and Assumption Articulation",
  "1.14": "Function Model Construction and Application",
  "1.15": "Composition of Functions",
  "1.16": "Inverse Functions",
  "2.1": "Change in Arithmetic and Geometric Sequences",
  "2.2": "Change in Linear and Exponential Functions",
  "2.3": "Exponential Functions",
  "2.4": "Exponential Function Manipulation",
  "2.5": "Exponential Function Context and Data Modeling",
  "2.6": "Competing Function Model Validation",
  "2.7": "Logarithmic Expressions and Functions",
  "3.1": "Periodic Phenomena",
  "3.2": "Sine, Cosine, and Tangent",
  "3.3": "Sine and Cosine Function Values",
  "3.4": "Sine and Cosine Function Graphs",
  "3.5": "Sinusoidal Functions",
  "3.6": "Sinusoidal Function Transformations",
  "3.7": "Sinusoidal Function Context and Data Modeling",
  "3.8": "The Tangent Function",
  "3.9": "Inverse Trigonometric Functions",
  "3.10": "Trigonometric Equations and Inequalities",
  "3.11": "The Secant, Cosecant, and Cotangent Functions & Polar Curves",
  "4.1": "Parametric Functions",
  "4.2": "Parametric Functions Modeling Planar Motion",
  "4.3": "Parametric Functions and Rates of Change",
  "4.4": "Parametrically Defined Circles and Lines",
  "4.5": "Implicitly Defined Functions and Conic Sections",
  "4.6": "Vectors in Two Dimensions",
  "4.7": "Vector-Valued Functions",
  "4.8": "Matrices and Linear Transformations",
  "4.9": "Matrix Inverse and Determinants",
  "4.10": "Matrices Modeling Contexts (Markov Chains)"
};

// ============================================================================
// 2. PRACTICE HUB & SESSION STATE
// ============================================================================
const practiceState = {
  allQuestions: [], // All published questions (792+ items)
  filteredQuestions: [],
  curriculumFormulasByTopic: {}, // Topic code -> array of essential formulas
  masteryMap: {}, // questionId -> { status: 'mastered' | 'missed' | 'unattempted', attempts: number, lastScore?: number, updatedAt: number }
  telemetryLog: [], // Array of attempt records { topic_id, sub_topic_id, question_id, question_type, is_correct, timestamp, time_spent_seconds, exam_trap_triggered }
  topicStats: {}, // topic_id -> { topic_id, title, total_attempted, total_correct, accuracy_rate, consecutive_errors, mastery_status }
  subTopicStats: {}, // sub_topic_id -> { sub_topic_id, topic_id, title, total_attempted, total_correct, accuracy_rate, consecutive_errors, mastery_status }
  limmyLoungeMap: {}, // questionId -> { isOpen, isMinimized, isLoading, mode, messages: [{ role, text, modeLabel }] }
  questionStartTimes: {}, // questionId -> timestamp ms when student viewed question
  currentUser: null,

  // Hub Filter Criteria
  filters: {
    unit: "all",       // 'all' | 'unit_1' | 'unit_2' | 'unit_3' | 'unit_4'
    topic: "all",      // 'all' | '1.1' .. '4.10'
    subTopic: "all",   // 'all' | '1.1.A' .. '4.10.B'
    type: "all",       // 'all' | 'MCQ' | 'FRQ'
    difficulty: "all", // 'all' | 'Easy' | 'Medium' | 'Hard'
    calculator: "all", // 'all' | 'nocalc' | 'calc'
    status: "all",     // 'all' | 'unattempted' | 'missed' | 'mastered'
    search: ""
  },

  // Hub View & Selection State
  expandedUnits: {
    unit_1: true,
    unit_2: false,
    unit_3: false,
    unit_4: false
  },
  selectedTopics: new Set(), // e.g., Set(['1.1', '1.3'])

  // Session Launcher Modal Configuration State
  launcher: {
    isOpen: false,
    sourceLabel: "All Matching Practice Topics",
    targetTopics: [], // Array of topic_ids (empty = use current hub filters)
    mode: "study",    // 'study' | 'exam'
    questionCount: 10, // 5 | 10 | 20 | 'all'
    questionType: "all", // 'all' | 'MCQ' | 'FRQ'
    calculatorFilter: "all", // 'all' | 'nocalc' | 'calc'
    availableSubTopics: [], // [{ id, title, topic_id, count }]
    selectedSubTopics: new Set(),
    selectedDifficulties: new Set(["Easy", "Medium", "Hard"]),
    enableTi84: true,
    enableScratchpad: true
  },

  // Active Practice Arena Session State
  session: {
    isActive: false,
    isSubmitted: false,
    mode: "study", // 'study' | 'exam'
    title: "",
    questions: [],
    currentIndex: 0,
    answers: {},         // qId -> selected option index (0-3) for MCQ
    checkedMap: {},      // qId -> boolean (whether Check Answer was clicked in Study Mode)
    eliminatedMap: {},   // qId -> Set of eliminated option indices
    flaggedMap: {},      // qId -> boolean
    frqNotes: {},        // `${qId}_${partLabel}` -> string
    frqRubricOpen: {},   // `${qId}_${partLabel}` -> boolean
    frqSelfScores: {},   // qId -> number (0..6)
    timerSeconds: 0,     // Remaining seconds in Exam Mode, or elapsed seconds in Study Mode
    totalAllocatedSeconds: 0,
    timerPaused: false,
    timerHidden: false,
    timerInterval: null,
    directionsOpen: false,
    gridPopoverOpen: false,
    ti84Open: false,
    drawerOpen: false,
    drawerTab: "formulas", // 'formulas' | 'scratchpad'
    scratchpadText: ""
  }
};

// ============================================================================
// 3. UTILITIES, SANITIZED MARKDOWN + MATH PIPELINE & LIVE FRQ PREVIEW
// ============================================================================
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sanitized Text & Math Rendering Pipeline (`formatMathAndMarkdown`):
 * 1. Extracts all LaTeX math segments (`$$...$$`, `\[...\]`, `$...$`, `\(...\)`) into
 *    safe placeholders so math expressions like `\Delta x = x_2 - x_1` or `2 * x`
 *    are preserved 100% untouched.
 * 2. Escapes HTML entities in the non-math prose.
 * 3. Converts Markdown `**bold**` -> `<strong>bold</strong>` and `*italic*` -> `<em>italic</em>`,
 *    and strips any stray unmatched `**` artifacts.
 * 4. Restores the protected math blocks ready for `renderMathInElement` / KaTeX.
 */
function formatMathAndMarkdown(rawText) {
  if (rawText === null || rawText === undefined) return "";
  const str = String(rawText);
  if (!str) return "";

  const mathSegments = [];
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

  // Step 1: Protect math blocks with placeholders
  const textWithPlaceholders = str.replace(mathRegex, (match) => {
    const idx = mathSegments.length;
    mathSegments.push(match);
    return `@@MATH_TOKEN_${idx}@@`;
  });

  // Step 2: Escape HTML on non-math prose
  let formatted = escapeHtml(textWithPlaceholders);

  // Step 3: Parse Markdown headings (####, ###, ##, #), horizontal rules (---), bold (**text**), italic (*text*), and clean stray ** or ##
  formatted = formatted
    .replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, "<strong>$1</strong>")
    .replace(/^[ \t]*---+[ \t]*$/gm, "")
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__([\s\S]+?)__/g, "<strong>$1</strong>")
    .replace(/\*([^\*\n]+?)\*/g, "<em>$1</em>")
    .replace(/\*\*/g, "")
    .replace(/#{2,}/g, "")
    .replace(/\n/g, "<br/>");

  // Step 4: Restore math expressions (HTML-escaped only for &, <, > so KaTeX parses cleanly)
  return formatted.replace(/@@MATH_TOKEN_(\d+)@@/g, (_m, idxStr) => {
    const rawMath = mathSegments[Number(idxStr)] || "";
    return rawMath
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  });
}

window.formatMathAndMarkdown = formatMathAndMarkdown;

/**
 * Formats an FRQ scoring rubric (whether stored as an array of criterion objects or a string)
 * into clean HTML with Markdown and LaTeX preserved.
 */
function formatScoringRubricHtml(rubric) {
  if (!rubric) return "";
  if (typeof rubric === "string") {
    return formatMathAndMarkdown(rubric);
  }
  if (Array.isArray(rubric)) {
    return `<ul class="space-y-1.5 list-disc pl-4">${rubric
      .map((item) => {
        if (typeof item === "string") {
          return `<li>${formatMathAndMarkdown(item)}</li>`;
        }
        const desc = item?.criteria || item?.description || item?.text || "";
        const pts = item?.points ?? item?.point;
        const ptsBadge =
          pts !== undefined
            ? `<span class="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">+${escapeHtml(pts)} pt${Number(pts) === 1 ? "" : "s"}</span>`
            : "";
        return `<li>${formatMathAndMarkdown(desc)}${ptsBadge}</li>`;
      })
      .join("")}</ul>`;
  }
  return formatMathAndMarkdown(JSON.stringify(rubric));
}

function renderLatexInElement(el) {
  if (!el) return;
  if (typeof window.renderMathInElement === "function") {
    try {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render warning:", e);
    }
  }
}

/**
 * Auto-wraps plain math / LaTeX fragments when dollar delimiters ($...$) are omitted
 * so expressions like `\frac{a}{b}`, `\sqrt{x}`, `\Delta x = x_2 - x_1`, or `x^2`
 * render as formatted KaTeX math automatically.
 */
function autoWrapMathFragments(rawLine) {
  const trimmed = String(rawLine || "").trim();
  if (!trimmed) return "";

  // Protect any existing explicit $...$, $$...$$, \(...\), \[...\] blocks first
  const explicitBlocks = [];
  const delimiterRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;
  const protectedLine = trimmed.replace(delimiterRegex, (match) => {
    const idx = explicitBlocks.length;
    explicitBlocks.push(match);
    return `@@EXPLICIT_MATH_${idx}@@`;
  });

  // Check if the line has no explicit delimiters and is primarily a mathematical expression/equation
  if (explicitBlocks.length === 0) {
    const hasLatexOrMathOps =
      /\\[a-zA-Z]+|[_^]|\b[fghy]\([a-zA-Z0-9,+\-\s]+\)|[=<>≤≥±]|(\d+\s*[\+\-\*\/]\s*[a-zA-Z0-9])/.test(trimmed);
    // Count purely alphabetical English words (>= 4 letters) that aren't standard math function names
    const mathFuncWords = new Set(["sqrt", "frac", "delta", "theta", "alpha", "beta", "gamma", "cdot", "times", "approx", "infty", "left", "right", "text"]);
    const proseWords = (trimmed.replace(/\\[a-zA-Z]+/g, " ").match(/\b[a-zA-Z]{4,}\b/g) || []).filter(
      (w) => !mathFuncWords.has(w.toLowerCase())
    );

    if (hasLatexOrMathOps && proseWords.length <= 1) {
      return `$${trimmed}$`;
    }
  }

  // Otherwise, auto-wrap inline LaTeX commands and algebraic math fragments inside mixed text
  const fragmentRegex =
    /((?:\\[a-zA-Z]+(?:\s*\{[^{}]*\})*|[a-zA-Z0-9()]+(?:[_^](?:\{[^{}]*\}|[a-zA-Z0-9+\-]+))+|\b[fghy]\([a-zA-Z0-9,+\-\s]+\))(?:\s*(?:[=<>+\-*/^_]|\\(?:Delta|frac|sqrt|cdot|times|pm|le|ge|neq|approx|to|rightarrow|infty|pi|theta)(?:\s*\{[^{}]*\})*)\s*(?:\\[a-zA-Z]+(?:\s*\{[^{}]*\})*|[a-zA-Z0-9()._^+\-/*{}]+))*)/g;

  const autoWrapped = protectedLine.replace(fragmentRegex, (match) => {
    if (match.includes("@@EXPLICIT_MATH_")) return match;
    return `$${match.trim()}$`;
  });

  return autoWrapped.replace(/@@EXPLICIT_MATH_(\d+)@@/g, (_m, idxStr) => {
    return explicitBlocks[Number(idxStr)] || "";
  });
}

/**
 * Real-time Live Math Preview renderer for FRQ student work textareas.
 */
function renderLiveFrqMathPreview(rawValue, previewEl) {
  if (!previewEl) return;
  const text = String(rawValue ?? "");

  if (!text.trim()) {
    previewEl.innerHTML = `<span class="frq-preview-placeholder">Your mathematical formulas and work will preview live here...</span>`;
    return;
  }

  const lines = text.split("\n");
  const processedLines = lines.map((line) => autoWrapMathFragments(line));
  const combined = processedLines.join("\n");

  previewEl.innerHTML = formatMathAndMarkdown(combined);
  renderLatexInElement(previewEl);
}

window.renderLiveFrqMathPreview = renderLiveFrqMathPreview;

/**
 * Strictly orders all Multiple-Choice Questions (MCQs) first,
 * followed by all Free-Response Questions (FRQs) second (never interleaved).
 */
function sortQuestionsMcqFirstThenFrq(questions) {
  if (!Array.isArray(questions)) return [];
  return [...questions].sort((a, b) => {
    const orderA = a?.type === "MCQ" ? 0 : 1;
    const orderB = b?.type === "MCQ" ? 0 : 1;
    if (orderA !== orderB) return orderA - orderB;
    const topicCmp = compareTopicIds(a?.topic_id, b?.topic_id);
    if (topicCmp !== 0) return topicCmp;
    return String(a?.id || "").localeCompare(String(b?.id || ""));
  });
}

/**
 * Normalizes any question's difficulty string into canonical tier:
 * 'Easy' (Foundational math and direct formula use) |
 * 'Medium' (Standard AP-level multi-step problems) |
 * 'Hard' (Complex synthesis and score-5 level challenges)
 */
function normalizeDifficultyTier(rawDiff) {
  const val = String(rawDiff || "Medium").trim().toLowerCase();
  if (val === "easy" || val === "foundational" || val.includes("easy") || val.includes("foundational")) {
    return "Easy";
  }
  if (val === "hard" || val === "challenge" || val.includes("hard") || val.includes("challenge") || val.includes("score-5")) {
    return "Hard";
  }
  return "Medium";
}

function getDifficultyDisplayLabel(tier) {
  if (!tier || tier === "all") return "All Difficulties";
  const norm = normalizeDifficultyTier(tier);
  if (norm === "Easy") return "🟢 Easy / Foundational";
  if (norm === "Hard") return "🔴 Hard / Challenge";
  return "🟡 Medium / AP Standard";
}

function renderQuestionDifficultyBadgeHtml(rawDiff, compact = false) {
  const norm = normalizeDifficultyTier(rawDiff);
  if (norm === "Easy") {
    return `<span class="question-diff-badge question-diff-badge-easy" title="Easy: Foundational math and direct formula use">🟢 Easy${
      compact ? "" : " • Foundational"
    }</span>`;
  }
  if (norm === "Hard") {
    return `<span class="question-diff-badge question-diff-badge-hard" title="Hard: Complex synthesis and score-5 level challenges">🔴 Hard${
      compact ? "" : " • Challenge"
    }</span>`;
  }
  return `<span class="question-diff-badge question-diff-badge-medium" title="Medium: Standard AP-level multi-step problems">🟡 Medium${
    compact ? "" : " • AP Standard"
  }</span>`;
}

function notify(msg, type = "success") {
  if (typeof window.showToast === "function") {
    window.showToast(msg, type);
  } else {
    console.log(`[Practice ${type}]`, msg);
  }
}

function formatTimeMMSS(totalSec) {
  const sec = Math.max(0, Math.floor(totalSec));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const rem = sec % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function compareTopicIds(a, b) {
  const [uA, tA] = String(a).split(".").map(Number);
  const [uB, tB] = String(b).split(".").map(Number);
  if (uA !== uB) return (uA || 0) - (uB || 0);
  return (tA || 0) - (tB || 0);
}

// ============================================================================
// 4. MASTERY & TELEMETRY PERSISTENCE (LOCALSTORAGE + FIRESTORE)
// ============================================================================
function loadLocalMastery() {
  try {
    const raw = localStorage.getItem(STORAGE_MASTERY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        practiceState.masteryMap = parsed;
      }
    }
    const rawTel = localStorage.getItem(STORAGE_TELEMETRY_KEY);
    if (rawTel) {
      const parsedTel = JSON.parse(rawTel);
      if (parsedTel && typeof parsedTel === "object") {
        if (Array.isArray(parsedTel.telemetryLog)) {
          practiceState.telemetryLog = parsedTel.telemetryLog;
        }
        if (parsedTel.topicStats && typeof parsedTel.topicStats === "object") {
          practiceState.topicStats = parsedTel.topicStats;
        }
        if (parsedTel.subTopicStats && typeof parsedTel.subTopicStats === "object") {
          practiceState.subTopicStats = parsedTel.subTopicStats;
        }
      }
    }
    recomputeAggregatedTelemetry();
  } catch (err) {
    console.warn("Failed to read local practice mastery/telemetry:", err);
  }
}

function saveLocalMastery() {
  try {
    localStorage.setItem(STORAGE_MASTERY_KEY, JSON.stringify(practiceState.masteryMap));
    localStorage.setItem(
      STORAGE_TELEMETRY_KEY,
      JSON.stringify({
        telemetryLog: practiceState.telemetryLog.slice(-500),
        topicStats: practiceState.topicStats,
        subTopicStats: practiceState.subTopicStats
      })
    );
  } catch (err) {
    console.warn("Failed to save local practice mastery:", err);
  }
}

function computeMasteryStatusLabel(totalAttempted, accuracyRate, consecutiveErrors) {
  if (!totalAttempted || totalAttempted <= 0) return "Unattempted";
  if (consecutiveErrors >= 3 || accuracyRate < 60) {
    return "Struggling / Needs Review";
  }
  if (accuracyRate >= 80) {
    return "Mastered";
  }
  return "In Progress";
}

function recomputeAggregatedTelemetry() {
  const topicAgg = {};
  const subTopicAgg = {};

  // Build question lookup map
  const qById = new Map();
  (practiceState.allQuestions || []).forEach((q) => {
    if (q && q.id) qById.set(q.id, q);
  });

  // Seed all known topics from TOPIC_TITLES
  Object.entries(TOPIC_TITLES).forEach(([topicId, title]) => {
    const unitNum = String(topicId).split(".")[0] || "1";
    topicAgg[topicId] = {
      topic_id: topicId,
      unit_id: `unit_${unitNum}`,
      title,
      total_attempted: 0,
      total_correct: 0,
      mcq_attempted: 0,
      mcq_correct: 0,
      frq_attempted: 0,
      frq_completed: 0,
      accuracy_rate: 0,
      consecutive_errors: 0,
      exam_traps_triggered: 0,
      mastery_status: "Unattempted"
    };
  });

  // Incorporate both telemetryLog attempts and existing masteryMap entries
  const recordedQuestionIdsInLog = new Set();

  practiceState.telemetryLog.forEach((entry) => {
    if (!entry || !entry.question_id) return;
    recordedQuestionIdsInLog.add(entry.question_id);
    const q = qById.get(entry.question_id);
    const topicId = entry.topic_id || q?.topic_id || "1.1";
    const subTopicId = entry.sub_topic_id || q?.sub_topic_id || `${topicId}.A`;
    const subTopicTitle = entry.sub_topic_title || q?.sub_topic_title || subTopicId;
    const qType = entry.question_type || q?.type || "MCQ";
    const isCorrect = Boolean(entry.is_correct);

    if (!topicAgg[topicId]) {
      const uNum = String(topicId).split(".")[0] || "1";
      topicAgg[topicId] = {
        topic_id: topicId,
        unit_id: `unit_${uNum}`,
        title: TOPIC_TITLES[topicId] || `Topic ${topicId}`,
        total_attempted: 0,
        total_correct: 0,
        mcq_attempted: 0,
        mcq_correct: 0,
        frq_attempted: 0,
        frq_completed: 0,
        accuracy_rate: 0,
        consecutive_errors: 0,
        exam_traps_triggered: 0,
        mastery_status: "Unattempted"
      };
    }

    const tStat = topicAgg[topicId];
    tStat.total_attempted += 1;
    if (isCorrect) {
      tStat.total_correct += 1;
      tStat.consecutive_errors = 0;
    } else {
      tStat.consecutive_errors += 1;
    }
    if (entry.exam_trap_triggered) {
      tStat.exam_traps_triggered += 1;
    }
    if (qType === "MCQ") {
      tStat.mcq_attempted += 1;
      if (isCorrect) tStat.mcq_correct += 1;
    } else {
      tStat.frq_attempted += 1;
      if (isCorrect) tStat.frq_completed += 1;
    }

    if (!subTopicAgg[subTopicId]) {
      subTopicAgg[subTopicId] = {
        sub_topic_id: subTopicId,
        topic_id: topicId,
        topic_title: TOPIC_TITLES[topicId] || `Topic ${topicId}`,
        title: subTopicTitle,
        total_attempted: 0,
        total_correct: 0,
        accuracy_rate: 0,
        consecutive_errors: 0,
        exam_traps_triggered: 0,
        mastery_status: "Unattempted"
      };
    }

    const sStat = subTopicAgg[subTopicId];
    sStat.total_attempted += 1;
    if (isCorrect) {
      sStat.total_correct += 1;
      sStat.consecutive_errors = 0;
    } else {
      sStat.consecutive_errors += 1;
    }
    if (entry.exam_trap_triggered) {
      sStat.exam_traps_triggered += 1;
    }
  });

  // Also fold in any masteryMap items that predate telemetryLog
  Object.entries(practiceState.masteryMap || {}).forEach(([qId, mEntry]) => {
    if (recordedQuestionIdsInLog.has(qId) || !mEntry || !mEntry.status || mEntry.status === "unattempted") {
      return;
    }
    const q = qById.get(qId);
    if (!q) return;
    const topicId = q.topic_id || "1.1";
    const subTopicId = q.sub_topic_id || `${topicId}.A`;
    const isCorrect = mEntry.status === "mastered";

    if (topicAgg[topicId]) {
      const tStat = topicAgg[topicId];
      tStat.total_attempted += 1;
      if (isCorrect) {
        tStat.total_correct += 1;
        tStat.consecutive_errors = 0;
      } else {
        tStat.consecutive_errors += 1;
      }
      if (q.type === "MCQ") {
        tStat.mcq_attempted += 1;
        if (isCorrect) tStat.mcq_correct += 1;
      } else {
        tStat.frq_attempted += 1;
        if (isCorrect) tStat.frq_completed += 1;
      }
    }

    if (!subTopicAgg[subTopicId]) {
      subTopicAgg[subTopicId] = {
        sub_topic_id: subTopicId,
        topic_id: topicId,
        topic_title: TOPIC_TITLES[topicId] || `Topic ${topicId}`,
        title: q.sub_topic_title || subTopicId,
        total_attempted: 0,
        total_correct: 0,
        accuracy_rate: 0,
        consecutive_errors: 0,
        exam_traps_triggered: 0,
        mastery_status: "Unattempted"
      };
    }
    const sStat = subTopicAgg[subTopicId];
    sStat.total_attempted += 1;
    if (isCorrect) {
      sStat.total_correct += 1;
      sStat.consecutive_errors = 0;
    } else {
      sStat.consecutive_errors += 1;
    }
  });

  Object.values(topicAgg).forEach((t) => {
    t.accuracy_rate = t.total_attempted > 0 ? Math.round((t.total_correct / t.total_attempted) * 100) : 0;
    t.mastery_status = computeMasteryStatusLabel(t.total_attempted, t.accuracy_rate, t.consecutive_errors);
  });

  Object.values(subTopicAgg).forEach((s) => {
    s.accuracy_rate = s.total_attempted > 0 ? Math.round((s.total_correct / s.total_attempted) * 100) : 0;
    s.mastery_status = computeMasteryStatusLabel(s.total_attempted, s.accuracy_rate, s.consecutive_errors);
  });

  practiceState.topicStats = topicAgg;
  practiceState.subTopicStats = subTopicAgg;

  window.dispatchEvent(
    new CustomEvent("mathprep:telemetry-updated", {
      detail: getStudentTelemetrySnapshot()
    })
  );
}

function getStudentTelemetrySnapshot() {
  // Compute weakest sub-topics / topics for Priority Review
  const attemptedSubTopics = Object.values(practiceState.subTopicStats || {}).filter(
    (s) => s.total_attempted > 0
  );
  const weakSubTopics = [...attemptedSubTopics]
    .filter((s) => s.mastery_status === "Struggling / Needs Review" || s.accuracy_rate < 75)
    .sort((a, b) => {
      if (a.accuracy_rate !== b.accuracy_rate) return a.accuracy_rate - b.accuracy_rate;
      return b.consecutive_errors - a.consecutive_errors;
    })
    .slice(0, 3);

  return {
    masteryMap: practiceState.masteryMap,
    telemetryLog: practiceState.telemetryLog,
    topicStats: practiceState.topicStats,
    subTopicStats: practiceState.subTopicStats,
    weakSubTopics,
    unitMetadata: UNIT_METADATA,
    topicTitles: TOPIC_TITLES,
    totalQuestionsInBank: (practiceState.allQuestions || []).length
  };
}

window.getStudentTelemetryData = getStudentTelemetrySnapshot;

async function syncMasteryFromFirestore(user) {
  if (!user || !user.uid) return;
  try {
    const ref = doc(db, "user_progress", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.questionMastery && typeof data.questionMastery === "object") {
        practiceState.masteryMap = {
          ...practiceState.masteryMap,
          ...data.questionMastery
        };
      }
      if (data && Array.isArray(data.telemetryLog) && data.telemetryLog.length > 0) {
        // Merge by timestamp + question_id
        const existingKeys = new Set(
          practiceState.telemetryLog.map((e) => `${e.question_id}_${e.timestamp}`)
        );
        data.telemetryLog.forEach((e) => {
          if (e && !existingKeys.has(`${e.question_id}_${e.timestamp}`)) {
            practiceState.telemetryLog.push(e);
          }
        });
      }
      recomputeAggregatedTelemetry();
      saveLocalMastery();
      applyHubFiltersAndRender();
    }
  } catch (err) {
    // Silent fallback to localStorage if Firestore rule/network unavailable
  }
}

async function syncMasteryToFirestore() {
  const user = practiceState.currentUser;
  if (!user || !user.uid) return;
  try {
    const ref = doc(db, "user_progress", user.uid);
    await setDoc(
      ref,
      {
        userId: user.uid,
        questionMastery: practiceState.masteryMap,
        telemetryLog: practiceState.telemetryLog.slice(-300),
        topicStats: practiceState.topicStats,
        subTopicStats: practiceState.subTopicStats,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    // Keep in localStorage if offline
  }
}

function getQuestionMasteryStatus(qId) {
  const entry = practiceState.masteryMap[qId];
  if (!entry || !entry.status) return "unattempted";
  return entry.status; // 'mastered' | 'missed' | 'unattempted'
}

function recordQuestionMastery(qId, status, extra = {}) {
  const prev = practiceState.masteryMap[qId] || { attempts: 0 };
  const nowMs = Date.now();
  practiceState.masteryMap[qId] = {
    status,
    attempts: (prev.attempts || 0) + 1,
    ...extra,
    updatedAt: nowMs
  };

  // Lookup question metadata for telemetry logging
  const q =
    (practiceState.session?.questions || []).find((item) => item.id === qId) ||
    (practiceState.allQuestions || []).find((item) => item.id === qId);

  if (q) {
    const startedAt = practiceState.questionStartTimes[qId] || nowMs - 25000;
    const elapsedSec = Math.max(2, Math.min(900, Math.round((nowMs - startedAt) / 1000)));
    const isCorrect = status === "mastered";
    const examTrapTriggered = Boolean(!isCorrect && q.content?.exam_trap);

    practiceState.telemetryLog.push({
      topic_id: q.topic_id || "1.1",
      sub_topic_id: q.sub_topic_id || `${q.topic_id || "1.1"}.A`,
      sub_topic_title: q.sub_topic_title || "",
      question_id: qId,
      question_type: q.type || "MCQ",
      is_correct: isCorrect,
      timestamp: new Date(nowMs).toISOString(),
      time_spent_seconds: elapsedSec,
      exam_trap_triggered: examTrapTriggered
    });
    // Reset question start timer after recording
    practiceState.questionStartTimes[qId] = nowMs;
  }

  recomputeAggregatedTelemetry();
  saveLocalMastery();
  syncMasteryToFirestore();
}

// ============================================================================
// 5. QUESTION BANK LOADER (FIRESTORE + PRE-GENERATED 2,288 JSON)
// ============================================================================
async function loadPracticeQuestionBank() {
  const mergedMap = new Map();

  // 1. Load pre-generated 2,288 questions (52 per topic across 44 topics) from /data/massive_question_bank.json
  try {
    const res = await fetch("/data/massive_question_bank.json");
    if (res.ok) {
      const payload = await res.json();
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.questions)
        ? payload.questions
        : [];
      items.forEach((q) => {
        if (q && q.id && q.is_published !== false) {
          mergedMap.set(q.id, {
            ...q,
            difficulty: normalizeDifficultyTier(q.difficulty)
          });
        }
      });
    }
  } catch (err) {
    console.warn("Could not load static massive_question_bank.json:", err);
  }

  // 2. Also load pre-made curriculum formulas for the Formula Reference Drawer
  try {
    const curRes = await fetch("/data/premade_curriculum_all_44.json");
    if (curRes.ok) {
      const curData = await curRes.json();
      const topicsArray = Array.isArray(curData?.topics)
        ? curData.topics
        : curData && typeof curData === "object"
        ? Object.values(curData).filter((v) => v && typeof v === "object" && (v.topic_id || v.formula_sheet))
        : [];
      topicsArray.forEach((pkg) => {
        const topicCode = String(pkg.topic_id || pkg.topicId || "");
        if (!topicCode) return;
        const subTopics = pkg?.formula_sheet?.sub_topics || [];
        const formulas = [];
        subTopics.forEach((st) => {
          (st.essential_formulas || []).forEach((f) => {
            formulas.push({
              subTopicId: st.sub_topic_id,
              subTopicTitle: st.sub_topic_title,
              name: f.name,
              latex: f.latex,
              description: f.description
            });
          });
        });
        practiceState.curriculumFormulasByTopic[topicCode] = formulas;
      });
    }
  } catch (err) {
    // Non-fatal
  }

  // 3. Query live Firestore `question_bank` where `is_published == true`
  try {
    const qRef = query(collection(db, "question_bank"), where("is_published", "==", true));
    const snap = await getDocs(qRef);
    if (!snap.empty) {
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          if (data.is_published === false) {
            mergedMap.delete(data.id);
          } else {
            mergedMap.set(data.id, {
              ...data,
              difficulty: normalizeDifficultyTier(data.difficulty)
            });
          }
        }
      });
    }
  } catch (err) {
    // Use static 2,288 bank if Firestore query is offline
  }

  practiceState.allQuestions = Array.from(mergedMap.values()).sort((a, b) => {
    const cmp = compareTopicIds(a.topic_id, b.topic_id);
    if (cmp !== 0) return cmp;
    return String(a.id).localeCompare(String(b.id));
  });

  applyHubFiltersAndRender();
}

/**
 * Dynamic Firestore query helper matching Requirement 4:
 * Dynamically constructs a Firestore query against `question_bank` using the user's selected filters
 * and merges with the in-memory published bank.
 */
async function queryFilteredQuestionsFromFirestore(criteria = {}) {
  const {
    unit = "all",
    topic = "all",
    subTopics = [],
    type = "all",
    difficulties = [],
    calculator = "all"
  } = criteria;

  try {
    const constraints = [where("is_published", "==", true)];
    if (topic && topic !== "all" && !Array.isArray(topic)) {
      constraints.push(where("topic_id", "==", String(topic)));
    } else if (unit && unit !== "all") {
      constraints.push(where("unit_id", "==", String(unit)));
    }
    if (calculator === "calc") {
      constraints.push(where("calculator_active", "==", true));
    } else if (calculator === "nocalc") {
      constraints.push(where("calculator_active", "==", false));
    }

    const qRef = query(collection(db, "question_bank"), ...constraints);
    const snap = await getDocs(qRef);
    if (!snap.empty) {
      const existingIds = new Set(practiceState.allQuestions.map((q) => q.id));
      snap.forEach((d) => {
        const item = d.data();
        if (item && item.id && item.is_published !== false && !existingIds.has(item.id)) {
          practiceState.allQuestions.push({
            ...item,
            difficulty: normalizeDifficultyTier(item.difficulty)
          });
          existingIds.add(item.id);
        }
      });
    }
  } catch (err) {
    // Continue with loaded bank
  }

  const normalizedAllowedDiffs = difficulties.map((d) => normalizeDifficultyTier(d));

  return practiceState.allQuestions.filter((q) => {
    if (q.is_published === false) return false;
    if (unit !== "all" && q.unit_id !== unit) return false;
    if (Array.isArray(topic) && topic.length > 0 && !topic.includes(String(q.topic_id))) return false;
    if (!Array.isArray(topic) && topic !== "all" && String(q.topic_id) !== String(topic)) return false;
    if (subTopics.length > 0 && !subTopics.includes(String(q.sub_topic_id))) return false;
    if (type !== "all" && q.type !== type) return false;
    if (normalizedAllowedDiffs.length > 0 && !normalizedAllowedDiffs.includes(normalizeDifficultyTier(q.difficulty))) return false;
    if (calculator === "calc" && !q.calculator_active) return false;
    if (calculator === "nocalc" && q.calculator_active) return false;
    return true;
  });
}

// ============================================================================
// 6. PRACTICE HUB FILTER & DIRECTORY ENGINE
// ============================================================================
function populateHubTopicDropdowns() {
  const unitSel = document.getElementById("practice-filter-unit");
  const topicSel = document.getElementById("practice-filter-topic");
  const subTopicSel = document.getElementById("practice-filter-subtopic");
  if (!topicSel || !subTopicSel) return;

  const selectedUnit = unitSel ? unitSel.value : practiceState.filters.unit;
  const allTopics = Object.keys(TOPIC_TITLES).sort(compareTopicIds);
  const filteredTopics =
    selectedUnit === "all"
      ? allTopics
      : allTopics.filter((t) => `unit_${t.split(".")[0]}` === selectedUnit);

  const prevTopic = practiceState.filters.topic;
  topicSel.innerHTML =
    `<option value="all">All Topics (${filteredTopics.length})</option>` +
    filteredTopics
      .map((code) => `<option value="${code}">Topic ${code}: ${escapeHtml(TOPIC_TITLES[code])}</option>`)
      .join("");

  if (prevTopic !== "all" && filteredTopics.includes(prevTopic)) {
    topicSel.value = prevTopic;
  } else {
    practiceState.filters.topic = "all";
    topicSel.value = "all";
  }

  // Populate sub-topics based on selected unit/topic
  const activeTopic = practiceState.filters.topic;
  const subTopicMap = new Map();
  practiceState.allQuestions.forEach((q) => {
    if (selectedUnit !== "all" && q.unit_id !== selectedUnit) return;
    if (activeTopic !== "all" && String(q.topic_id) !== String(activeTopic)) return;
    if (q.sub_topic_id && !subTopicMap.has(q.sub_topic_id)) {
      subTopicMap.set(q.sub_topic_id, q.sub_topic_title || q.sub_topic_id);
    }
  });

  const subTopicIds = Array.from(subTopicMap.keys()).sort();
  const prevSub = practiceState.filters.subTopic;
  subTopicSel.innerHTML =
    `<option value="all">All Sub-Topics (${subTopicIds.length})</option>` +
    subTopicIds
      .map((stId) => `<option value="${stId}">${stId} — ${escapeHtml(subTopicMap.get(stId))}</option>`)
      .join("");

  if (prevSub !== "all" && subTopicIds.includes(prevSub)) {
    subTopicSel.value = prevSub;
  } else {
    practiceState.filters.subTopic = "all";
    subTopicSel.value = "all";
  }
}

function questionMatchesHubFilters(q, ignoreDifficulty = false) {
  const f = practiceState.filters;
  if (q.is_published === false) return false;
  if (f.unit !== "all" && q.unit_id !== f.unit) return false;
  if (f.topic !== "all" && String(q.topic_id) !== String(f.topic)) return false;
  if (f.subTopic !== "all" && String(q.sub_topic_id) !== String(f.subTopic)) return false;
  if (f.type !== "all" && q.type !== f.type) return false;
  if (!ignoreDifficulty && f.difficulty !== "all" && normalizeDifficultyTier(q.difficulty) !== normalizeDifficultyTier(f.difficulty)) {
    return false;
  }
  if (f.calculator === "calc" && !q.calculator_active) return false;
  if (f.calculator === "nocalc" && q.calculator_active) return false;

  if (f.status !== "all") {
    const status = getQuestionMasteryStatus(q.id);
    if (status !== f.status) return false;
  }

  if (f.search.trim() !== "") {
    const term = f.search.trim().toLowerCase();
    const hay = [
      q.id,
      q.topic_id,
      q.sub_topic_id,
      q.sub_topic_title,
      TOPIC_TITLES[q.topic_id] || "",
      q.content?.prompt_latex || "",
      q.content?.scenario_latex || ""
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(term)) return false;
  }

  return true;
}

function applyHubFiltersAndRender() {
  // Enforce mandatory sorting: all filtered MCQs first, followed by all filtered FRQs second
  const matched = practiceState.allQuestions.filter((q) => questionMatchesHubFilters(q, false));
  practiceState.filteredQuestions = sortQuestionsMcqFirstThenFrq(matched);
  updateHubFilterCountersUI();
  renderPracticeHubDirectory();
  updateFloatingSelectionBar();
}

function updateHubFilterCountersUI() {
  const countEl = document.getElementById("practice-results-counter");
  const mcqCountEl = document.getElementById("practice-stat-mcq");
  const frqCountEl = document.getElementById("practice-stat-frq");
  const masteredCountEl = document.getElementById("practice-stat-mastered");
  const missedCountEl = document.getElementById("practice-stat-missed");
  const unattemptedCountEl = document.getElementById("practice-stat-unattempted");

  // Compute pool matching all non-difficulty filters so each difficulty pill badge shows live count
  const basePoolIgnoringDiff = practiceState.allQuestions.filter((q) => questionMatchesHubFilters(q, true));
  const easyCount = basePoolIgnoringDiff.filter((q) => normalizeDifficultyTier(q.difficulty) === "Easy").length;
  const mediumCount = basePoolIgnoringDiff.filter((q) => normalizeDifficultyTier(q.difficulty) === "Medium").length;
  const hardCount = basePoolIgnoringDiff.filter((q) => normalizeDifficultyTier(q.difficulty) === "Hard").length;

  const hubDiffAllEl = document.getElementById("hub-diff-count-all");
  const hubDiffEasyEl = document.getElementById("hub-diff-count-easy");
  const hubDiffMediumEl = document.getElementById("hub-diff-count-medium");
  const hubDiffHardEl = document.getElementById("hub-diff-count-hard");

  if (hubDiffAllEl) hubDiffAllEl.textContent = String(basePoolIgnoringDiff.length);
  if (hubDiffEasyEl) hubDiffEasyEl.textContent = String(easyCount);
  if (hubDiffMediumEl) hubDiffMediumEl.textContent = String(mediumCount);
  if (hubDiffHardEl) hubDiffHardEl.textContent = String(hardCount);

  const list = practiceState.filteredQuestions;
  const mcqCount = list.filter((q) => q.type === "MCQ").length;
  const frqCount = list.filter((q) => q.type === "FRQ").length;

  let mastered = 0;
  let missed = 0;
  let unattempted = 0;
  list.forEach((q) => {
    const st = getQuestionMasteryStatus(q.id);
    if (st === "mastered") mastered++;
    else if (st === "missed") missed++;
    else unattempted++;
  });

  const activeDiffLabel = getDifficultyDisplayLabel(practiceState.filters.difficulty);
  if (countEl) {
    countEl.innerHTML = `Showing <strong class="text-blue-600 font-extrabold">${list.length}</strong> of <strong>${basePoolIgnoringDiff.length}</strong> questions matching <strong>${escapeHtml(activeDiffLabel)}</strong>`;
  }
  if (mcqCountEl) mcqCountEl.textContent = String(mcqCount);
  if (frqCountEl) frqCountEl.textContent = String(frqCount);
  if (masteredCountEl) masteredCountEl.textContent = String(mastered);
  if (missedCountEl) missedCountEl.textContent = String(missed);
  if (unattemptedCountEl) unattemptedCountEl.textContent = String(unattempted);

  // Sync active classes on pill buttons
  document.querySelectorAll("[data-practice-type]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-practice-type") === practiceState.filters.type);
  });
  document.querySelectorAll("[data-practice-difficulty]").forEach((btn) => {
    const btnDiff = btn.getAttribute("data-practice-difficulty") || "all";
    const curDiff = practiceState.filters.difficulty || "all";
    const isMatch =
      btnDiff === curDiff ||
      (btnDiff !== "all" && curDiff !== "all" && normalizeDifficultyTier(btnDiff) === normalizeDifficultyTier(curDiff));
    btn.classList.toggle("active", isMatch);
  });
  document.querySelectorAll("[data-practice-calc]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-practice-calc") === practiceState.filters.calculator);
  });
  document.querySelectorAll("[data-practice-status]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-practice-status") === practiceState.filters.status);
  });
}

function renderPracticeHubDirectory() {
  const container = document.getElementById("practice-units-directory");
  if (!container) return;

  const filteredByTopic = new Map();
  practiceState.filteredQuestions.forEach((q) => {
    const tId = String(q.topic_id);
    if (!filteredByTopic.has(tId)) filteredByTopic.set(tId, []);
    filteredByTopic.get(tId).push(q);
  });

  const unitKeys = ["unit_1", "unit_2", "unit_3", "unit_4"].filter(
    (uKey) => practiceState.filters.unit === "all" || practiceState.filters.unit === uKey
  );

  let html = "";

  unitKeys.forEach((uKey) => {
    const uMeta = UNIT_METADATA[uKey];
    const unitTopics = Object.keys(TOPIC_TITLES)
      .filter((code) => `unit_${code.split(".")[0]}` === uKey)
      .filter((code) => practiceState.filters.topic === "all" || practiceState.filters.topic === code)
      .sort(compareTopicIds);

    // Count matching questions across this unit
    let unitQuestionCount = 0;
    let unitMasteredCount = 0;
    let unitMissedCount = 0;
    const topicsWithMatches = [];

    unitTopics.forEach((tCode) => {
      const qList = filteredByTopic.get(tCode) || [];
      unitQuestionCount += qList.length;
      qList.forEach((q) => {
        const st = getQuestionMasteryStatus(q.id);
        if (st === "mastered") unitMasteredCount++;
        else if (st === "missed") unitMissedCount++;
      });
      if (qList.length > 0 || (practiceState.filters.status === "all" && !practiceState.filters.search)) {
        topicsWithMatches.push({ code: tCode, questions: qList });
      }
    });

    if (topicsWithMatches.length === 0) return;

    const isExpanded = Boolean(practiceState.expandedUnits[uKey]);
    const allTopicsInUnitSelected =
      topicsWithMatches.length > 0 &&
      topicsWithMatches.every((t) => practiceState.selectedTopics.has(t.code));
    const masteryPct = unitQuestionCount > 0 ? Math.round((unitMasteredCount / unitQuestionCount) * 100) : 0;

    html += `
      <div class="practice-unit-accordion bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
        <!-- Unit Accordion Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-slate-50/70 border-b border-slate-200/80">
          <div class="flex items-center gap-3.5">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              ${allTopicsInUnitSelected ? "checked" : ""}
              onclick="window.togglePracticeUnitSelection('${uKey}', event)"
              title="Select all topics in ${escapeHtml(uMeta.title)}"
            />
            <button
              type="button"
              onclick="window.togglePracticeUnitAccordion('${uKey}')"
              class="text-left flex items-center gap-3 cursor-pointer group"
            >
              <span class="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                ${uMeta.num}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    ${escapeHtml(uMeta.title)}
                  </h3>
                  ${
                    uMeta.num >= 2 && !window.mathprepIsPremium
                      ? `<span class="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">🔒 Premium</span>`
                      : ""
                  }
                </div>
                <p class="text-xs text-slate-500 font-medium">
                  ${topicsWithMatches.length} subtopics • <span class="text-slate-700 font-semibold">${unitQuestionCount} questions</span> • ${escapeHtml(uMeta.weight)}
                </p>
              </div>
            </button>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-auto">
            <!-- Unit Mastery Mini-Pill -->
            <div class="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <span class="font-semibold text-emerald-700">${masteryPct}% Mastered</span>
              ${unitMissedCount > 0 ? `<span class="text-rose-600 font-semibold">• ${unitMissedCount} Needs Review</span>` : ""}
            </div>

            ${
              uMeta.num >= 2 && !window.mathprepIsPremium
                ? `<button
                    type="button"
                    onclick="window.openPremiumModal('AP Precalculus Unit ${uMeta.num}', 'Practice question sets for Unit ${uMeta.num} are locked on the Free tier. Upgrade to MathPrep Premium for full access!')"
                    class="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🔒 Unlock Unit ${uMeta.num}</span>
                  </button>`
                : `<button
                    type="button"
                    onclick="window.openPracticeLauncher({ unitId: '${uKey}', label: '${escapeHtml(uMeta.title)}' })"
                    class="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Practice Unit ${uMeta.num}
                  </button>`
            }

            <button
              type="button"
              onclick="window.togglePracticeUnitAccordion('${uKey}')"
              class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Expand or collapse Unit ${uMeta.num}"
            >
              <svg class="w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Topic Rows List (Shown when expanded) -->
        <div class="${isExpanded ? "divide-y divide-slate-100" : "hidden"}">
          ${topicsWithMatches
            .map(({ code, questions }) => {
              const title = TOPIC_TITLES[code] || `Topic ${code}`;
              const isChecked = practiceState.selectedTopics.has(code);
              const mcqs = questions.filter((q) => q.type === "MCQ").length;
              const frqs = questions.filter((q) => q.type === "FRQ").length;
              const calcCount = questions.filter((q) => q.calculator_active).length;

              let tMastered = 0;
              let tMissed = 0;
              questions.forEach((q) => {
                const st = getQuestionMasteryStatus(q.id);
                if (st === "mastered") tMastered++;
                else if (st === "missed") tMissed++;
              });

              // Collect distinct sub-topics (.A, .B)
              const subMap = new Map();
              questions.forEach((q) => {
                if (q.sub_topic_id && !subMap.has(q.sub_topic_id)) {
                  subMap.set(q.sub_topic_id, q.sub_topic_title || q.sub_topic_id);
                }
              });

              return `
                <div class="practice-topic-row flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/90 transition-colors ${isChecked ? "bg-blue-50/40" : ""}">
                  <div class="flex items-start gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      class="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      ${isChecked ? "checked" : ""}
                      onchange="window.togglePracticeTopicCheckbox('${code}', this.checked)"
                    />
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                          Topic ${code}
                        </span>
                        <span
                          onclick="window.openPracticeLauncher({ topicId: '${code}', label: 'Topic ${code}: ${escapeHtml(title)}' })"
                          class="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          ${escapeHtml(title)}
                        </span>
                      </div>

                      <!-- Sub-Topics & Metadata Tags -->
                      <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        ${Array.from(subMap.entries())
                          .map(
                            ([stId, stTitle]) => `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              <strong class="font-mono text-slate-900">${escapeHtml(stId)}:</strong> ${escapeHtml(stTitle)}
                            </span>
                          `
                          )
                          .join("")}
                      </div>
                    </div>
                  </div>

                  <!-- Right Side: Question Breakdown, Mastery Status & "Practice" Trigger Button -->
                  <div class="flex flex-wrap items-center gap-2.5 self-end md:self-center shrink-0">
                    <div class="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">${questions.length} questions</span>
                      <span class="hidden sm:inline text-slate-400">(${mcqs} MCQ · ${frqs} FRQ · ${calcCount} Calc)</span>
                    </div>

                    ${
                      tMastered > 0 || tMissed > 0
                        ? `<div class="flex items-center gap-1 text-[11px] font-bold">
                            ${tMastered > 0 ? `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">✓ ${tMastered} Mastered</span>` : ""}
                            ${tMissed > 0 ? `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">⚠ ${tMissed} Missed</span>` : ""}
                          </div>`
                        : `<span class="text-[11px] font-medium text-slate-400 hidden lg:inline">Unattempted</span>`
                    }

                    <button
                      type="button"
                      onclick="window.openPracticeLauncher({ topicId: '${code}', label: 'Topic ${code}: ${escapeHtml(title)}' })"
                      class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Practice</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  });

  if (!html || practiceState.filteredQuestions.length === 0) {
    html = `
      <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
        <div class="text-base sm:text-lg font-extrabold text-slate-900">
          No questions found for this difficulty tier yet. Try selecting [All] or a different level.
        </div>
        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Current difficulty filter: <strong>${escapeHtml(getDifficultyDisplayLabel(practiceState.filters.difficulty))}</strong>. Switch to another difficulty level or reset all filters below:
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onclick="window.setPracticeHubDifficulty('all')"
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Select [All Difficulties]
          </button>
          <button
            type="button"
            onclick="window.resetPracticeHubFilters()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function updateFloatingSelectionBar() {
  const bar = document.getElementById("practice-floating-selection-bar");
  const summaryEl = document.getElementById("practice-floating-selection-summary");
  if (!bar || !summaryEl) return;

  const selectedTopicsArr = Array.from(practiceState.selectedTopics);
  if (selectedTopicsArr.length === 0) {
    bar.classList.add("hidden");
    return;
  }

  const matchingQuestions = practiceState.filteredQuestions.filter((q) =>
    practiceState.selectedTopics.has(String(q.topic_id))
  );

  bar.classList.remove("hidden");
  summaryEl.textContent = `${selectedTopicsArr.length} ${
    selectedTopicsArr.length === 1 ? "topic" : "topics"
  } selected • ${matchingQuestions.length} questions`;
}

// ============================================================================
// 7. SIMPLIFIED "PRACTICE CONFIGURATION" / SESSION LAUNCHER MODAL
// ============================================================================
function openPracticeLauncher(options = {}) {
  const { topicId = null, unitId = null, customTopics = null, label = null } = options;

  let targetTopics = [];
  let sourceLabel = label || "AP Precalculus Practice";

  if (topicId) {
    targetTopics = [String(topicId)];
    const tTitle = TOPIC_TITLES[topicId] || `Topic ${topicId}`;
    sourceLabel = label || `Topic ${topicId}: ${tTitle}`;
  } else if (Array.isArray(customTopics) && customTopics.length > 0) {
    targetTopics = customTopics.map(String).sort(compareTopicIds);
    sourceLabel =
      label ||
      (targetTopics.length === 1
        ? `Topic ${targetTopics[0]}: ${TOPIC_TITLES[targetTopics[0]] || ""}`
        : `${targetTopics.length} Selected Topics (${targetTopics.slice(0, 4).join(", ")}${
            targetTopics.length > 4 ? "…" : ""
          })`);
  } else if (unitId) {
    targetTopics = Object.keys(TOPIC_TITLES)
      .filter((code) => `unit_${code.split(".")[0]}` === unitId)
      .sort(compareTopicIds);
    sourceLabel = label || UNIT_METADATA[unitId]?.title || `Unit Practice`;
  } else if (practiceState.selectedTopics.size > 0) {
    targetTopics = Array.from(practiceState.selectedTopics).sort(compareTopicIds);
    sourceLabel = `${targetTopics.length} Selected Topics`;
  } else if (practiceState.filters.topic !== "all") {
    targetTopics = [practiceState.filters.topic];
    sourceLabel = `Topic ${practiceState.filters.topic}: ${TOPIC_TITLES[practiceState.filters.topic] || ""}`;
  } else if (practiceState.filters.unit !== "all") {
    const uId = practiceState.filters.unit;
    targetTopics = Object.keys(TOPIC_TITLES)
      .filter((code) => `unit_${code.split(".")[0]}` === uId)
      .sort(compareTopicIds);
    sourceLabel = UNIT_METADATA[uId]?.title || "Unit Practice";
  }

  // Premium Tier Gate for Unit 2+
  const hasUnit2Plus = targetTopics.some((t) => {
    const u = parseInt(String(t).split(".")[0], 10);
    return u >= 2;
  });
  if (hasUnit2Plus && !window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "AP Precalculus Units 2–4 Practice Bank",
        "Practice question sets for Unit 2 (Exponential/Logarithmic), Unit 3 (Trigonometric/Polar), and Unit 4 (Parametric/Vectors/Matrices) are locked on the Free tier. Upgrade to MathPrep Premium for full access!"
      );
    }
    return;
  }

  const initialFormat =
    practiceState.filters.type === "MCQ"
      ? "MCQ"
      : practiceState.filters.type === "FRQ"
      ? "FRQ"
      : "both";

  // Premium Tier Gate for FRQ
  if (initialFormat === "FRQ" && !window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "Advanced AP Free-Response Questions",
        "Multi-part FRQs with official College Board scoring rubrics and model solutions are reserved for Premium members."
      );
    }
    return;
  }

  practiceState.launcher = {
    isOpen: true,
    sourceLabel,
    targetTopics,
    mode: "study",
    questionCount: "all",
    questionType: initialFormat, // 'MCQ' | 'FRQ' | 'both'
    calculatorFilter: "all",
    availableSubTopics: [],
    selectedSubTopics: new Set(),
    selectedDifficulties: new Set(["Foundational", "AP Standard", "Challenge"]),
    enableTi84: true,
    enableScratchpad: true
  };

  renderPracticeLauncherModal();
}

function getLauncherMatchingPool(overrideFormat = null) {
  const l = practiceState.launcher;
  const activeFormat = overrideFormat || l.questionType || "both";

  const filtered = practiceState.allQuestions.filter((q) => {
    if (q.is_published === false) return false;
    if (l.targetTopics.length > 0 && !l.targetTopics.includes(String(q.topic_id))) return false;
    if (activeFormat === "MCQ" && q.type !== "MCQ") return false;
    if (activeFormat === "FRQ" && q.type !== "FRQ") return false;
    return true;
  });

  // Always sort all MCQs first, followed by all FRQs second (never interleave randomly)
  return sortQuestionsMcqFirstThenFrq(filtered);
}

function renderPracticeLauncherModal() {
  const modal = document.getElementById("practice-launcher-modal");
  if (!modal) return;

  if (!practiceState.launcher.isOpen) {
    modal.classList.add("hidden");
    return;
  }

  modal.classList.remove("hidden");
  const l = practiceState.launcher;
  const selectedFormat = l.questionType === "all" ? "both" : l.questionType || "both";
  const pool = getLauncherMatchingPool(selectedFormat);

  const titleEl = document.getElementById("launcher-source-title");
  if (titleEl) titleEl.textContent = l.sourceLabel;

  const bodyEl = document.getElementById("launcher-modal-body");
  if (!bodyEl) return;

  const formatChoices = [
    {
      val: "MCQ",
      label: "🔘 Multiple-Choice (MCQ)",
      badge: "Free & Premium"
    },
    {
      val: "FRQ",
      label: "🔘 Free-Response (FRQ)",
      badge: !window.mathprepIsPremium ? "🔒 Premium Only" : null
    },
    {
      val: "both",
      label: "🔘 Both (MCQ + FRQ)",
      badge: !window.mathprepIsPremium ? "🔒 Premium Only" : null
    }
  ];

  bodyEl.innerHTML = `
    <div>
      <h3 class="text-base font-extrabold text-slate-900">
        Choose Practice Format
      </h3>
      <p class="text-xs text-slate-500 mt-0.5">
        ${escapeHtml(l.sourceLabel)}
      </p>
    </div>

    <div class="space-y-3" role="radiogroup" aria-label="Choose Practice Format">
      ${formatChoices
        .map((opt) => {
          const isSelected = selectedFormat === opt.val;
          return `
            <button
              type="button"
              role="radio"
              aria-checked="${isSelected ? "true" : "false"}"
              onclick="window.updateLauncherSetting('questionType', '${opt.val}')"
              class="practice-format-option-card ${isSelected ? "selected" : ""}"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm sm:text-base font-bold text-slate-900">
                  ${opt.label}
                </span>
                ${
                  opt.badge
                    ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        opt.badge.includes("🔒")
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-slate-100 text-slate-600"
                      }">${opt.badge}</span>`
                    : ""
                }
              </div>
              <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }">
                ✓
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  const launchBtn = document.getElementById("btn-launch-practice-session");
  if (launchBtn) {
    launchBtn.innerHTML = `<span>🚀 Start Practice</span>`;
    launchBtn.disabled = pool.length === 0;
    launchBtn.classList.toggle("opacity-50", pool.length === 0);
  }
}

// ============================================================================
// 8. LAUNCH & RUNNER ENGINE (TOPIC PRACTICE ARENA)
// ============================================================================
async function launchPracticeSessionFromModal() {
  const l = practiceState.launcher;
  const formatFilter = l.questionType === "MCQ" || l.questionType === "FRQ" ? l.questionType : "all";

  // Query Firestore + merged pool for the selected topic & format
  await queryFilteredQuestionsFromFirestore({
    topic: l.targetTopics,
    type: formatFilter
  });

  const pool = getLauncherMatchingPool();
  if (pool.length === 0) {
    notify("No practice questions are available for this format yet.", "warning");
    return;
  }

  // Strictly sort MCQs first, followed by FRQs second when Both is selected
  const orderedQuestions = sortQuestionsMcqFirstThenFrq(pool);

  startPracticeSessionWithQuestions(orderedQuestions, {
    mode: "study",
    title: l.sourceLabel,
    enableTi84: true,
    enableScratchpad: true
  });
}

function startPracticeSessionWithQuestions(questions, config = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    notify("No practice questions available to start session.", "warning");
    return;
  }

  // Enforce strict ordering rule: All MCQs first, followed by all FRQs second
  const orderedQuestions = sortQuestionsMcqFirstThenFrq(questions);
  const initialDifficulty =
    config.initialDifficulty ||
    (practiceState.filters.difficulty !== "all" ? practiceState.filters.difficulty : "all");
  const initialType =
    config.initialType ||
    (practiceState.launcher.questionType === "MCQ" || practiceState.launcher.questionType === "FRQ"
      ? practiceState.launcher.questionType
      : "all");

  // Also keep the broader topic pool so the student can toggle between Easy / Medium / Hard / All and MCQ / FRQ inside the Arena!
  const sessionTopicIds = Array.from(new Set(orderedQuestions.map((q) => String(q.topic_id))));
  const fullTopicPool = sortQuestionsMcqFirstThenFrq(
    practiceState.allQuestions.filter(
      (q) => q.is_published !== false && sessionTopicIds.includes(String(q.topic_id))
    )
  );
  const allPoolQuestions = fullTopicPool.length >= orderedQuestions.length ? fullTopicPool : orderedQuestions;

  // Close launcher modal
  practiceState.launcher.isOpen = false;
  renderPracticeLauncherModal();

  // Compute College Board time allocation (~2.8 min = 168 sec per MCQ, ~15 min = 900 sec per FRQ)
  const mcqCount = orderedQuestions.filter((q) => q.type === "MCQ").length;
  const frqCount = orderedQuestions.filter((q) => q.type === "FRQ").length;
  const allocatedSeconds = mcqCount * 168 + frqCount * 900;

  if (practiceState.session.timerInterval) {
    clearInterval(practiceState.session.timerInterval);
  }

  practiceState.session = {
    isActive: true,
    isSubmitted: false,
    mode: config.mode || "study",
    title: config.title || "AP Precalculus Practice Session",
    allPoolQuestions,
    activeDifficultyFilter: initialDifficulty,
    activeTypeFilter: initialType,
    questions: orderedQuestions,
    currentIndex: 0,
    answers: {},
    checkedMap: {},
    eliminatedMap: {},
    flaggedMap: {},
    frqNotes: {},
    frqRubricOpen: {},
    frqSelfScores: {},
    timerSeconds: (config.mode || "study") === "exam" ? allocatedSeconds : 0,
    totalAllocatedSeconds: allocatedSeconds,
    timerPaused: false,
    timerHidden: false,
    timerInterval: null,
    directionsOpen: false,
    gridPopoverOpen: false,
    ti84Open: false,
    drawerOpen: false,
    drawerTab: "formulas",
    scratchpadText: ""
  };

  applyArenaLiveFilters(false);

  // Start live timer
  practiceState.session.timerInterval = setInterval(() => {
    const s = practiceState.session;
    if (!s.isActive || s.isSubmitted || s.timerPaused) return;
    if (s.mode === "exam") {
      if (s.timerSeconds > 0) {
        s.timerSeconds--;
        updateArenaTimerDisplay();
      } else {
        // Time expired in Exam Mode -> auto-submit
        notify("⏰ Exam simulation time has expired! Submitting your session...", "warning");
        submitPracticeSession();
      }
    } else {
      s.timerSeconds++;
      updateArenaTimerDisplay();
    }
  }, 1000);

  // Show Practice Arena full-screen overlay
  const arena = document.getElementById("practice-arena-overlay");
  if (arena) {
    arena.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  renderPracticeArena();
  saveActiveSessionSnapshot();
}

function applyArenaLiveFilters(shouldRender = true) {
  const s = practiceState.session;
  if (!s) return;
  const basePool = Array.isArray(s.allPoolQuestions) && s.allPoolQuestions.length > 0
    ? s.allPoolQuestions
    : s.questions || [];

  const typeFilter = s.activeTypeFilter || "all";
  const diffFilter = s.activeDifficultyFilter || "all";

  // 1. Filter by Question Type first to compute accurate per-difficulty counts
  const typeMatchedPool = basePool.filter((q) => {
    if (typeFilter === "MCQ" && q.type !== "MCQ") return false;
    if (typeFilter === "FRQ" && q.type !== "FRQ") return false;
    return true;
  });

  const easyCount = typeMatchedPool.filter((q) => normalizeDifficultyTier(q.difficulty) === "Easy").length;
  const mediumCount = typeMatchedPool.filter((q) => normalizeDifficultyTier(q.difficulty) === "Medium").length;
  const hardCount = typeMatchedPool.filter((q) => normalizeDifficultyTier(q.difficulty) === "Hard").length;

  // 2. Apply Difficulty Filter + Mandatory Sorting Rule (all filtered MCQs first, followed by all filtered FRQs second)
  const finalPool = sortQuestionsMcqFirstThenFrq(
    typeMatchedPool.filter((q) => {
      if (diffFilter === "all") return true;
      return normalizeDifficultyTier(q.difficulty) === normalizeDifficultyTier(diffFilter);
    })
  );

  const prevQuestionId = s.questions?.[s.currentIndex]?.id;
  s.questions = finalPool;
  const preservedIdx = prevQuestionId ? finalPool.findIndex((q) => q.id === prevQuestionId) : -1;
  s.currentIndex = preservedIdx >= 0 ? preservedIdx : 0;

  // 3. Update Arena Difficulty Toolbar UI & Dynamic Results Counter
  const allBadge = document.getElementById("arena-diff-count-all");
  const easyBadge = document.getElementById("arena-diff-count-easy");
  const medBadge = document.getElementById("arena-diff-count-medium");
  const hardBadge = document.getElementById("arena-diff-count-hard");
  const counterEl = document.getElementById("arena-difficulty-results-counter");

  if (allBadge) allBadge.textContent = String(typeMatchedPool.length);
  if (easyBadge) easyBadge.textContent = String(easyCount);
  if (medBadge) medBadge.textContent = String(mediumCount);
  if (hardBadge) hardBadge.textContent = String(hardCount);

  if (counterEl) {
    const diffLabel = getDifficultyDisplayLabel(diffFilter);
    counterEl.innerHTML = `Showing <strong class="text-blue-600 font-extrabold">${finalPool.length}</strong> of <strong>${typeMatchedPool.length}</strong> questions matching <strong>${escapeHtml(diffLabel)}</strong>`;
  }

  document.querySelectorAll("[data-arena-difficulty]").forEach((btn) => {
    const btnDiff = btn.getAttribute("data-arena-difficulty") || "all";
    const isMatch =
      btnDiff === diffFilter ||
      (btnDiff !== "all" && diffFilter !== "all" && normalizeDifficultyTier(btnDiff) === normalizeDifficultyTier(diffFilter));
    btn.classList.toggle("active", isMatch);
  });

  document.querySelectorAll("[data-arena-type]").forEach((btn) => {
    const isAct = btn.getAttribute("data-arena-type") === typeFilter;
    btn.className = isAct
      ? "px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer bg-slate-900 text-white"
      : "px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-slate-600 hover:bg-slate-100";
  });

  if (shouldRender) {
    renderPracticeArena();
    saveActiveSessionSnapshot();
  }
}

function saveActiveSessionSnapshot() {
  try {
    const s = practiceState.session;
    if (!s.isActive) {
      localStorage.removeItem(STORAGE_ACTIVE_SESSION_KEY);
      return;
    }
    const serializable = {
      mode: s.mode,
      title: s.title,
      questionIds: s.questions.map((q) => q.id),
      currentIndex: s.currentIndex,
      answers: s.answers,
      checkedMap: s.checkedMap,
      flaggedMap: s.flaggedMap,
      frqNotes: s.frqNotes,
      frqSelfScores: s.frqSelfScores,
      timerSeconds: s.timerSeconds,
      isSubmitted: s.isSubmitted
    };
    localStorage.setItem(STORAGE_ACTIVE_SESSION_KEY, JSON.stringify(serializable));
  } catch (err) {
    // Non-fatal
  }
}

function updateArenaTimerDisplay() {
  const s = practiceState.session;
  const timeTextEl = document.getElementById("arena-timer-display");
  if (!timeTextEl) return;
  if (s.timerHidden) {
    timeTextEl.textContent = "••:••";
  } else {
    timeTextEl.textContent = formatTimeMMSS(s.timerSeconds);
  }
}

function renderPracticeArena() {
  const s = practiceState.session;
  const arena = document.getElementById("practice-arena-overlay");
  if (!arena || !s.isActive) return;

  if (s.isSubmitted) {
    renderSessionSummaryReport();
    return;
  }

  // Ensure Arena difficulty toolbar counters and active states are synced
  applyArenaLiveFilters(false);

  const stageEl = document.getElementById("arena-question-stage");
  if (!stageEl) return;

  // 3. EMPTY STATE HANDLING inside Practice Arena if selected difficulty tier has 0 questions
  if (!s.questions || s.questions.length === 0) {
    const activeDiffLabel = getDifficultyDisplayLabel(s.activeDifficultyFilter);
    stageEl.innerHTML = `
      <div class="max-w-2xl mx-auto my-12 bg-white rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center space-y-4 shadow-2xs">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto text-2xl">
          🎯
        </div>
        <h3 class="text-lg sm:text-xl font-extrabold text-slate-900">
          No questions found for this difficulty tier yet. Try selecting [All] or a different level.
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          There are currently 0 matching items for <strong>${escapeHtml(activeDiffLabel)}</strong>${
            s.activeTypeFilter && s.activeTypeFilter !== "all" ? ` (${escapeHtml(s.activeTypeFilter)} Only)` : ""
          } in this session. Choose another difficulty tier below:
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onclick="window.setArenaDifficultyFilter('all')"
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Select [All Difficulties]
          </button>
          <button
            type="button"
            onclick="window.setArenaDifficultyFilter('Easy')"
            class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
          >
            🟢 Easy / Foundational
          </button>
          <button
            type="button"
            onclick="window.setArenaDifficultyFilter('Medium')"
            class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
          >
            🟡 Medium / AP Standard
          </button>
          <button
            type="button"
            onclick="window.setArenaDifficultyFilter('Hard')"
            class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
          >
            🔴 Hard / Challenge
          </button>
        </div>
      </div>
    `;
    const navPillText = document.getElementById("arena-grid-pill-label");
    if (navPillText) navPillText.textContent = `0 of 0`;
    return;
  }

  const q = s.questions[s.currentIndex];
  if (!q) return;

  // Record start timestamp when question is first displayed in arena
  if (!practiceState.questionStartTimes[q.id]) {
    practiceState.questionStartTimes[q.id] = Date.now();
  }

  const total = s.questions.length;
  const idx = s.currentIndex;
  const topicTitle = TOPIC_TITLES[q.topic_id] || `Topic ${q.topic_id}`;
  const isFlagged = Boolean(s.flaggedMap[q.id]);
  const isChecked = Boolean(s.checkedMap[q.id]);
  const selectedAns = s.answers[q.id];
  const eliminatedSet = s.eliminatedMap[q.id] || new Set();
  const progressPct = Math.round(((idx + 1) / total) * 100);

  // 1. Update Top Bar
  const breadcrumbEl = document.getElementById("arena-top-breadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <span class="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
        Topic ${escapeHtml(q.topic_id)} (${escapeHtml(q.sub_topic_id || q.topic_id)})
      </span>
      <span class="hidden md:inline font-semibold text-slate-700 truncate max-w-[240px]">
        ${formatMathAndMarkdown(q.sub_topic_title || topicTitle)}
      </span>
      <span class="text-slate-300">•</span>
      ${renderQuestionDifficultyBadgeHtml(q.difficulty, false)}
    `;
  }

  const calcBadgeEl = document.getElementById("arena-calc-badge");
  if (calcBadgeEl) {
    if (q.calculator_active) {
      calcBadgeEl.className =
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer";
      calcBadgeEl.innerHTML = `<span>🟢 Calculator Permitted</span><span class="hidden sm:inline text-[10px] underline ml-0.5">— Open TI-84</span>`;
    } else {
      calcBadgeEl.className =
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer";
      calcBadgeEl.innerHTML = `<span>🔴 No Calculator</span>`;
    }
  }

  const progressFillEl = document.getElementById("arena-progress-fill");
  if (progressFillEl) {
    progressFillEl.style.width = `${progressPct}%`;
  }

  updateArenaTimerDisplay();

  // 2. Render Main Question Stage (MCQ vs FRQ)
  if (q.type === "MCQ") {
    const options = q.content?.options || [];
    const correctIndex = Number(q.content?.correct_index) || 0;
    const showStudyFeedback = s.mode === "study" && isChecked;

    stageEl.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6 pb-12">
        <!-- Question Header Strip with Color-Coded Difficulty Badge -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
              ${idx + 1}
            </span>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Multiple-Choice Question • ${s.mode === "exam" ? "Timed Exam Simulation" : "Study & Learn Mode"}
            </span>
            ${renderQuestionDifficultyBadgeHtml(q.difficulty, false)}
          </div>

          <button
            type="button"
            onclick="window.toggleArenaFlagCurrent()"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              isFlagged
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }"
          >
            <span>🚩</span>
            <span>${isFlagged ? "Flagged for Review" : "Mark for Review"}</span>
          </button>
        </div>

        <!-- Problem Stem -->
        <div class="text-base sm:text-lg text-slate-900 leading-relaxed math-content bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          ${formatMathAndMarkdown(q.content?.prompt_latex || "")}
        </div>

        <!-- 4 Option Cards (A, B, C, D) with Strikethrough Eliminator -->
        <div class="space-y-3">
          ${options
            .map((optLatex, optIdx) => {
              const letter = ["A", "B", "C", "D"][optIdx] || String(optIdx + 1);
              const isSelected = selectedAns === optIdx;
              const isEliminated = eliminatedSet.has(optIdx);
              const isCorrectChoice = optIdx === correctIndex;

              let cardClasses =
                "border-slate-200 bg-white hover:border-slate-300 text-slate-900";
              let badgeClasses =
                "border-slate-300 bg-slate-50 text-slate-700";

              if (showStudyFeedback) {
                if (isCorrectChoice) {
                  cardClasses = "border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500";
                  badgeClasses = "border-emerald-600 bg-emerald-600 text-white";
                } else if (isSelected && !isCorrectChoice) {
                  cardClasses = "border-rose-500 bg-rose-50/70 text-rose-950 ring-1 ring-rose-500";
                  badgeClasses = "border-rose-600 bg-rose-600 text-white";
                }
              } else if (isSelected) {
                cardClasses = "border-blue-600 bg-blue-50/50 text-slate-900 ring-1 ring-blue-600";
                badgeClasses = "border-blue-600 bg-blue-600 text-white";
              }

              return `
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    onclick="window.selectArenaMcqOption(${optIdx})"
                    class="flex-1 text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${cardClasses} ${
                      isEliminated && !isSelected ? "opacity-45 line-through" : ""
                    }"
                  >
                    <div class="flex items-center gap-3.5 min-w-0">
                      <span class="w-7 h-7 rounded-full border-2 font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${badgeClasses}">
                        ${letter}
                      </span>
                      <div class="text-sm sm:text-base math-content break-words">
                        ${formatMathAndMarkdown(String(optLatex).replace(/^\([A-D]\)\s*/i, ""))}
                      </div>
                    </div>

                    ${
                      showStudyFeedback && isCorrectChoice
                        ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shrink-0">✓ Correct</span>`
                        : showStudyFeedback && isSelected && !isCorrectChoice
                        ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white shrink-0">✗ Your Choice</span>`
                        : ""
                    }
                  </button>

                  <!-- Option Eliminator / Strikethrough Button -->
                  <button
                    type="button"
                    onclick="window.toggleArenaEliminateOption(${optIdx})"
                    class="px-2.5 py-2 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                      isEliminated
                        ? "bg-slate-800 text-white border-slate-800 line-through"
                        : "bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:border-slate-300"
                    }"
                    title="Cross out / eliminate option ${letter}"
                  >
                    ${letter}
                  </button>
                </div>
              `;
            })
            .join("")}
        </div>

        <!-- Study Mode Instant Feedback: Step-by-Step KaTeX Derivation & AP Exam Trap Alert -->
        ${
          showStudyFeedback
            ? `
            <div class="space-y-4 pt-3 animate-fade-in">
              <!-- Result Banner -->
              <div class="p-4 rounded-xl border ${
                selectedAns === correctIndex
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              } flex items-center justify-between">
                <div class="font-bold text-sm">
                  ${
                    selectedAns === correctIndex
                      ? "🎉 Spot On! You selected the correct College Board response."
                      : `💡 Not quite. The correct answer is Option ${["A", "B", "C", "D"][correctIndex]}.`
                  }
                </div>
                <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-white/80">
                  Status: ${selectedAns === correctIndex ? "Mastered" : "Needs Review"}
                </span>
              </div>

              <!-- Full Step-by-Step Algebraic Derivation Accordion -->
              <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <div class="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <span>📐 Step-by-Step Mathematical Derivation</span>
                </div>
                <div class="text-sm text-slate-800 leading-relaxed math-content">
                  ${formatMathAndMarkdown(q.content?.explanation_latex || "")}
                </div>
              </div>

              <!-- ⚠️ AP Exam Trap Alert Box -->
              ${
                q.content?.exam_trap
                  ? `
                  <div class="ap-exam-trap-box space-y-1">
                    <div class="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <span>⚠️ AP Exam Trap Alert</span>
                    </div>
                    <div class="text-xs sm:text-sm text-amber-950 leading-relaxed math-content">
                      ${formatMathAndMarkdown(q.content.exam_trap)}
                    </div>
                  </div>
                `
                  : ""
              }
            </div>
          `
            : ""
        }

        <!-- Context-Aware AI Tutoring: Ask Teacher Limmy (Rendered Inline Beneath Active Question Card) -->
        ${s.mode === "study" ? renderLimmyStudyLoungeHtml(q) : ""}
      </div>
    `;
  } else {
    // FRQ Interactive Runner Interface
    const parts = q.content?.parts || [];
    const currentSelfScore = s.frqSelfScores[q.id];

    stageEl.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6 pb-12">
        <!-- FRQ Header Strip with Color-Coded Difficulty Badge -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-purple-700 text-white font-mono text-xs font-bold flex items-center justify-center">
              ${idx + 1}
            </span>
            <span class="text-xs font-bold uppercase tracking-wider text-purple-700">
              Multi-Part Free-Response Question (FRQ) • 6 Points Total
            </span>
            ${renderQuestionDifficultyBadgeHtml(q.difficulty, false)}
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick="window.revealAllArenaFrqRubrics('${q.id}')"
              class="px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 cursor-pointer"
            >
              📖 Toggle All Scoring Rubrics & Model Solutions
            </button>
            <button
              type="button"
              onclick="window.toggleArenaFlagCurrent()"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isFlagged
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }"
            >
              <span>🚩</span>
              <span>${isFlagged ? "Flagged" : "Flag"}</span>
            </button>
          </div>
        </div>

        <!-- FRQ Scenario Stem -->
        <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Problem Scenario & Mathematical Setup
          </div>
          <div class="text-base text-slate-900 leading-relaxed math-content">
            ${formatMathAndMarkdown(q.content?.scenario_latex || "")}
          </div>
        </div>

        <!-- Multi-Part Prompts (Parts A, B, C, D) -->
        <div class="space-y-4">
          ${parts
            .map((part, pIdx) => {
              const pLabel = part.part_label || ["Part A", "Part B", "Part C", "Part D"][pIdx] || `Part ${pIdx + 1}`;
              const noteKey = `${q.id}_${pIdx}`;
              const savedNote = s.frqNotes[noteKey] || "";
              const isRubricOpen = Boolean(s.frqRubricOpen[noteKey]);

              return `
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs">
                      ${escapeHtml(pLabel)}
                    </span>
                    <button
                      type="button"
                      onclick="window.toggleArenaFrqPartRubric('${noteKey}')"
                      class="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                    >
                      ${isRubricOpen ? "Hide Scoring Rubric & Solution" : "Reveal Scoring Rubric & Model Solution"}
                    </button>
                  </div>

                  <div class="text-sm sm:text-base text-slate-900 leading-relaxed math-content">
                    ${formatMathAndMarkdown(part.prompt_latex || "")}
                  </div>

                  <!-- Algebraic Scratchpad Textarea + Live Auto-Render KaTeX Preview -->
                  <div>
                    <label
                      for="frq-textarea-${escapeHtml(noteKey)}"
                      class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1"
                    >
                      Your Algebraic Work & Justification (${escapeHtml(pLabel)}):
                    </label>
                    <textarea
                      id="frq-textarea-${escapeHtml(noteKey)}"
                      data-frq-note-key="${escapeHtml(noteKey)}"
                      rows="3"
                      placeholder="Write your equations, difference quotients (e.g. \\frac{f(b)-f(a)}{b-a}, \\Delta x = x_2 - x_1, \\sqrt{x}), limits, or justifications here..."
                      class="frq-work-textarea w-full text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    >${escapeHtml(savedNote)}</textarea>

                    <!-- Real-Time Live Math Preview Box -->
                    <div class="frq-live-preview-box">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                          <span>✨ Live Math Preview</span>
                        </span>
                        <span class="text-[10px] font-mono text-purple-500">
                          Auto-renders LaTeX (\\frac{a}{b}, \\sqrt{x}, \\Delta x, x^2, $...$)
                        </span>
                      </div>
                      <div
                        id="frq-live-preview-${escapeHtml(noteKey)}"
                        class="frq-live-math-preview math-content"
                      >
                        <span class="frq-preview-placeholder">Your mathematical formulas and work will preview live here...</span>
                      </div>
                    </div>
                  </div>

                  <!-- Revealed Scoring Rubric & Model Solution -->
                  ${
                    isRubricOpen
                      ? `
                      <div class="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3 animate-fade-in">
                        <div>
                          <div class="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1">
                            Official College Board Scoring Guidelines
                          </div>
                          <div class="text-xs sm:text-sm text-slate-800 math-content">
                            ${formatScoringRubricHtml(part.scoring_rubric)}
                          </div>
                        </div>
                        <div class="pt-2 border-t border-purple-200/80">
                          <div class="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                            Model Solution
                          </div>
                          <div class="text-xs sm:text-sm text-slate-900 math-content">
                            ${formatMathAndMarkdown(part.model_solution_latex || "")}
                          </div>
                        </div>
                      </div>
                    `
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </div>

        <!-- FRQ Self-Evaluation Score Bar (0 to 6 Points) -->
        <div class="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-bold uppercase tracking-wider text-purple-300">
              FRQ Self-Evaluation Rubric Score
            </div>
            <p class="text-xs text-slate-300 mt-0.5">
              Compare your work against the scoring guidelines and record your earned points (out of 6):
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            ${[0, 1, 2, 3, 4, 5, 6]
              .map(
                (pts) => `
                <button
                  type="button"
                  onclick="window.recordArenaFrqSelfScore('${q.id}', ${pts})"
                  class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    currentSelfScore === pts
                      ? "bg-emerald-500 text-slate-950 ring-2 ring-white"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }"
                >
                  ${pts}/6
                </button>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Post-Check AI Tutoring: Teacher Limmy's Study Lounge for FRQ -->
        ${renderLimmyStudyLoungeHtml(q)}
      </div>
    `;
  }

  // 3. Update Bottom Bar & Question Grid Navigator Popover
  const navPillText = document.getElementById("arena-grid-pill-label");
  if (navPillText) {
    navPillText.textContent = `${idx + 1} of ${total}`;
  }

  renderArenaGridPopover();
  renderArenaBottomActionButtons();
  renderArenaSideDrawer();

  renderLatexInElement(stageEl);
  if (breadcrumbEl) renderLatexInElement(breadcrumbEl);

  // 4. Bind real-time `input` event listeners for FRQ Live Math Preview
  if (q.type === "FRQ") {
    stageEl.querySelectorAll(".frq-work-textarea").forEach((textareaEl) => {
      const noteKey = textareaEl.getAttribute("data-frq-note-key");
      const previewEl = document.getElementById(`frq-live-preview-${noteKey}`);

      // Render initial preview if saved work exists
      renderLiveFrqMathPreview(textareaEl.value, previewEl);

      // Attach live input event listener
      textareaEl.addEventListener("input", (e) => {
        const val = e.target.value;
        if (noteKey) {
          practiceState.session.frqNotes[noteKey] = val;
          saveActiveSessionSnapshot();
        }
        renderLiveFrqMathPreview(val, previewEl);
      });
    });
  }
}

function renderArenaGridPopover() {
  const s = practiceState.session;
  const pop = document.getElementById("arena-grid-popover");
  if (!pop) return;

  if (!s.gridPopoverOpen) {
    pop.classList.add("hidden");
    return;
  }

  pop.classList.remove("hidden");
  const gridContainer = document.getElementById("arena-grid-squares");
  if (!gridContainer) return;

  gridContainer.innerHTML = s.questions
    .map((q, i) => {
      const isCurrent = i === s.currentIndex;
      const isFlagged = Boolean(s.flaggedMap[q.id]);
      const isChecked = Boolean(s.checkedMap[q.id]);
      const hasAns =
        q.type === "MCQ"
          ? s.answers[q.id] !== undefined
          : s.frqSelfScores[q.id] !== undefined ||
            Object.keys(s.frqNotes).some((k) => k.startsWith(`${q.id}_`) && s.frqNotes[k]);

      let boxClass = "border-slate-300 border-dashed text-slate-700 bg-white hover:bg-slate-50";

      if (s.mode === "study" && isChecked && q.type === "MCQ") {
        const isCorrect = s.answers[q.id] === Number(q.content?.correct_index || 0);
        boxClass = isCorrect
          ? "bg-emerald-600 text-white border-emerald-600 font-bold"
          : "bg-rose-600 text-white border-rose-600 font-bold";
      } else if (hasAns) {
        boxClass = "bg-blue-600 text-white border-blue-600 font-bold";
      }

      if (isCurrent) {
        boxClass += " ring-2 ring-offset-2 ring-slate-900";
      }

      return `
        <button
          type="button"
          onclick="window.jumpToArenaQuestion(${i})"
          class="relative w-9 h-9 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center transition-all cursor-pointer ${boxClass}"
        >
          <span>${i + 1}</span>
          ${
            isFlagged
              ? `<span class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 text-[9px] flex items-center justify-center shadow-2xs">🚩</span>`
              : ""
          }
        </button>
      `;
    })
    .join("");
}

function renderArenaBottomActionButtons() {
  const s = practiceState.session;
  const q = s.questions[s.currentIndex];
  const container = document.getElementById("arena-bottom-actions");
  if (!container || !q) return;

  const isFirst = s.currentIndex === 0;
  const isLast = s.currentIndex === s.questions.length - 1;
  const hasSelectedMcq = q.type === "MCQ" && s.answers[q.id] !== undefined;
  const isChecked = Boolean(s.checkedMap[q.id]);

  let checkBtnHtml = "";
  if (s.mode === "study" && q.type === "MCQ" && !isChecked) {
    checkBtnHtml = `
      <button
        type="button"
        onclick="window.checkCurrentArenaAnswer()"
        ${!hasSelectedMcq ? "disabled" : ""}
        class="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
          hasSelectedMcq
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }"
      >
        ✓ Check Answer
      </button>
    `;
  }

  container.innerHTML = `
    ${checkBtnHtml}

    <button
      type="button"
      onclick="window.navigateArenaQuestion(-1)"
      ${isFirst ? "disabled" : ""}
      class="px-4 py-2 rounded-full text-xs font-bold border border-slate-300 transition-colors cursor-pointer ${
        isFirst ? "text-slate-300 bg-slate-50 cursor-not-allowed" : "text-slate-700 bg-white hover:bg-slate-100"
      }"
    >
      ← Previous
    </button>

    ${
      !isLast
        ? `
        <button
          type="button"
          onclick="window.navigateArenaQuestion(1)"
          class="px-5 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          Next →
        </button>
      `
        : ""
    }

    <button
      type="button"
      onclick="window.submitPracticeSession()"
      class="px-4 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
    >
      🏁 ${isLast ? "Finish & View Report" : "Submit Session"}
    </button>
  `;
}

// ============================================================================
// 9. SESSION SUMMARY & REVIEW REPORT (REQUIREMENT 5)
// ============================================================================
function submitPracticeSession() {
  const s = practiceState.session;
  if (!s.isActive) return;

  if (s.timerInterval) {
    clearInterval(s.timerInterval);
    s.timerInterval = null;
  }

  // Evaluate all questions & persist mastery
  s.questions.forEach((q) => {
    if (q.type === "MCQ") {
      const chosen = s.answers[q.id];
      const correct = Number(q.content?.correct_index) || 0;
      if (chosen !== undefined) {
        recordQuestionMastery(q.id, chosen === correct ? "mastered" : "missed", {
          selectedOption: chosen
        });
      }
    } else if (q.type === "FRQ") {
      const score = s.frqSelfScores[q.id];
      if (score !== undefined) {
        recordQuestionMastery(q.id, score >= 4 ? "mastered" : "missed", {
          frqScore: score
        });
      }
    }
  });

  s.isSubmitted = true;
  s.gridPopoverOpen = false;
  applyHubFiltersAndRender();
  renderSessionSummaryReport();
  saveActiveSessionSnapshot();
}

function renderSessionSummaryReport() {
  const s = practiceState.session;
  const stageEl = document.getElementById("arena-question-stage");
  const bottomActions = document.getElementById("arena-bottom-actions");
  if (!stageEl) return;

  if (bottomActions) {
    bottomActions.innerHTML = `
      <button
        type="button"
        onclick="window.closePracticeArena()"
        class="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
      >
        ← Return to Practice Hub
      </button>
    `;
  }

  let totalEarned = 0;
  let totalPossible = 0;
  const missedQuestions = [];

  const diffStats = {
    "Easy (Foundational)": { correct: 0, total: 0 },
    "Medium (AP Standard)": { correct: 0, total: 0 },
    "Hard (Challenge)": { correct: 0, total: 0 }
  };

  s.questions.forEach((q) => {
    const normTier = normalizeDifficultyTier(q.difficulty);
    const diffKey =
      normTier === "Easy"
        ? "Easy (Foundational)"
        : normTier === "Hard"
        ? "Hard (Challenge)"
        : "Medium (AP Standard)";
    diffStats[diffKey].total++;
    const diff = diffKey;

    if (q.type === "MCQ") {
      totalPossible += 1;
      const isRight = s.answers[q.id] === Number(q.content?.correct_index || 0);
      if (isRight) {
        totalEarned += 1;
        diffStats[diff].correct++;
      } else {
        missedQuestions.push(q);
      }
    } else {
      totalPossible += 1;
      const pts = s.frqSelfScores[q.id];
      if (pts !== undefined && pts >= 4) {
        totalEarned += 1;
        diffStats[diff].correct++;
      } else {
        missedQuestions.push(q);
      }
    }
  });

  const pct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  let apProjection = "AP Score 3 Pace — Solid Foundation";
  let badgeColor = "bg-blue-600 text-white";
  if (pct >= 80) {
    apProjection = "Solid AP 5 Pace! — Elite Mastery";
    badgeColor = "bg-emerald-600 text-white";
  } else if (pct >= 65) {
    apProjection = "Strong AP 4 Pace — High Proficiency";
    badgeColor = "bg-teal-600 text-white";
  } else if (pct < 50) {
    apProjection = "AP Score 1–2 Pace — Review Core Theorems & Traps";
    badgeColor = "bg-amber-600 text-white";
  }

  stageEl.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      <!-- Hero Score Card -->
      <div class="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${badgeColor}">
              <span>🏆 ${apProjection}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ${totalEarned}/${totalPossible} • ${pct}% Accuracy
            </h2>
            <p class="text-xs sm:text-sm text-slate-300">
              Session: <strong>${escapeHtml(s.title)}</strong> • Mode: ${
                s.mode === "exam" ? "Timed Exam Simulation" : "Study & Learn"
              }
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            ${
              missedQuestions.length > 0
                ? `
                <button
                  type="button"
                  onclick="window.reviewMissedSessionQuestions()"
                  class="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>🔄 Review Missed Questions (${missedQuestions.length})</span>
                </button>
              `
                : ""
            }
            <button
              type="button"
              onclick="window.closePracticeArena()"
              class="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Done & Return to Hub
            </button>
          </div>
        </div>

        <!-- Breakdown by Difficulty Level -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          ${Object.entries(diffStats)
            .map(([level, stat]) => {
              const dPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return `
                <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80">
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">${level}</div>
                  <div class="mt-1 flex items-baseline justify-between">
                    <span class="text-xl font-extrabold text-white">${stat.correct}/${stat.total}</span>
                    <span class="text-xs font-mono font-bold text-blue-400">${dPct}%</span>
                  </div>
                  <div class="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" style="width: ${dPct}%"></div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <!-- Item-by-Item Question Review List -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-slate-900">
          Complete Question-by-Question Review & Solutions
        </h3>
        ${s.questions
          .map((q, i) => {
            if (q.type === "MCQ") {
              const userAns = s.answers[q.id];
              const correctAns = Number(q.content?.correct_index || 0);
              const isRight = userAns === correctAns;
              const letters = ["A", "B", "C", "D"];
              return `
                <div class="bg-white rounded-2xl border-2 ${
                  isRight ? "border-emerald-200" : "border-rose-200"
                } p-5 space-y-3 shadow-2xs">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold ${
                        isRight ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }">
                        Q${i + 1} • ${isRight ? "✓ Correct" : "✗ Missed"}
                      </span>
                      <span class="text-xs font-bold text-slate-600">
                        Topic ${escapeHtml(q.topic_id)} (${escapeHtml(q.sub_topic_id || "")}) • ${escapeHtml(q.difficulty || "AP Standard")}
                      </span>
                    </div>
                    <div class="text-xs font-semibold text-slate-600">
                      Your Answer: <strong>${userAns !== undefined ? letters[userAns] : "Unanswered"}</strong> |
                      Correct: <strong class="text-emerald-700">${letters[correctAns]}</strong>
                    </div>
                  </div>

                  <div class="text-sm sm:text-base text-slate-900 math-content">
                    ${formatMathAndMarkdown(q.content?.prompt_latex || "")}
                  </div>

                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 math-content">
                    <strong class="text-blue-700 block mb-1">Step-by-Step Solution:</strong>
                    ${formatMathAndMarkdown(q.content?.explanation_latex || "")}
                  </div>

                  ${
                    q.content?.exam_trap
                      ? `<div class="ap-exam-trap-box text-xs math-content">
                          <strong>⚠️ AP Exam Trap:</strong> ${formatMathAndMarkdown(q.content.exam_trap)}
                        </div>`
                      : ""
                  }
                </div>
              `;
            } else {
              const pts = s.frqSelfScores[q.id];
              return `
                <div class="bg-white rounded-2xl border-2 border-purple-200 p-5 space-y-3 shadow-2xs">
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-purple-100 text-purple-900">
                      Q${i + 1} • Multi-Part FRQ (${pts !== undefined ? `${pts}/6 pts` : "Ungraded"})
                    </span>
                    <span class="text-xs font-bold text-slate-600">Topic ${escapeHtml(q.topic_id)}</span>
                  </div>
                  <div class="text-sm text-slate-900 math-content">
                    ${formatMathAndMarkdown(q.content?.scenario_latex || "")}
                  </div>
                </div>
              `;
            }
          })
          .join("")}
      </div>
    </div>
  `;

  renderLatexInElement(stageEl);
}

// ============================================================================
// 10. TI-84 GRAPHING CALCULATOR SIMULATOR & FORMULA/SCRATCHPAD DRAWER
// ============================================================================
function renderArenaSideDrawer() {
  const s = practiceState.session;
  const drawer = document.getElementById("arena-side-drawer");
  if (!drawer) return;

  if (!s.drawerOpen) {
    drawer.classList.add("hidden");
    return;
  }

  drawer.classList.remove("hidden");
  const q = s.questions[s.currentIndex];
  const topicCode = q?.topic_id || "1.1";
  const formulas = practiceState.curriculumFormulasByTopic[topicCode] || [];

  const contentEl = document.getElementById("arena-drawer-content");
  if (!contentEl) return;

  if (s.drawerTab === "formulas") {
    contentEl.innerHTML = `
      <div class="space-y-3">
        <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
          <strong>Topic ${escapeHtml(topicCode)} Reference Sheet:</strong> ${escapeHtml(TOPIC_TITLES[topicCode] || "")}
        </div>
        ${
          formulas.length > 0
            ? formulas
                .map(
                  (f) => `
                  <div class="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div class="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      ${escapeHtml(f.subTopicId || "")} • ${formatMathAndMarkdown(f.name)}
                    </div>
                    <div class="text-xs sm:text-sm font-mono bg-slate-50 p-2 rounded border border-slate-100 math-content overflow-x-auto">
                      $$${escapeHtml(f.latex)}$$
                    </div>
                    <div class="text-xs text-slate-600 math-content">
                      ${formatMathAndMarkdown(f.description || "")}
                    </div>
                  </div>
                `
                )
                .join("")
            : `<div class="text-xs text-slate-500 p-4 text-center">Standard AP Precalculus formulas apply for Topic ${escapeHtml(topicCode)}.</div>`
        }
      </div>
    `;
    renderLatexInElement(contentEl);
  } else {
    contentEl.innerHTML = `
      <div class="space-y-3">
        <div class="text-xs text-slate-600">
          Jot down intermediate algebraic steps, sign charts, or secant slopes for this session:
        </div>
        <textarea
          rows="14"
          placeholder="Session Scratchpad Notes..."
          class="w-full text-xs sm:text-sm font-mono bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          oninput="window.updateSessionScratchpadText(this.value)"
        >${escapeHtml(s.scratchpadText || "")}</textarea>
      </div>
    `;
  }
}

function plotTi84Graph() {
  const canvas = document.getElementById("ti84-graph-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const y1Input = document.getElementById("ti84-y1-input")?.value || "x^2 - 4";
  const y2Input = document.getElementById("ti84-y2-input")?.value || "";
  const xMin = parseFloat(document.getElementById("ti84-xmin")?.value) || -10;
  const xMax = parseFloat(document.getElementById("ti84-xmax")?.value) || 10;
  const yMin = parseFloat(document.getElementById("ti84-ymin")?.value) || -10;
  const yMax = parseFloat(document.getElementById("ti84-ymax")?.value) || 10;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, w, h);

  const toScreenX = (x) => ((x - xMin) / (xMax - xMin)) * w;
  const toScreenY = (y) => h - ((y - yMin) / (yMax - yMin)) * h;

  // Grid lines
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
    const sx = toScreenX(gx);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, h);
    ctx.stroke();
  }
  for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy++) {
    const sy = toScreenY(gy);
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(w, sy);
    ctx.stroke();
  }

  // Coordinate Axes
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.5;
  const x0 = toScreenX(0);
  const y0 = toScreenY(0);
  ctx.beginPath();
  ctx.moveTo(x0, 0);
  ctx.lineTo(x0, h);
  ctx.moveTo(0, y0);
  ctx.lineTo(w, y0);
  ctx.stroke();

  const evalMathExpr = (exprStr, xVal) => {
    if (!exprStr || !exprStr.trim()) return NaN;
    const sanitized = exprStr
      .toLowerCase()
      .replace(/\^/g, "**")
      .replace(/(\d)(x)/g, "$1*$2")
      .replace(/\bsin\(/g, "Math.sin(")
      .replace(/\bcos\(/g, "Math.cos(")
      .replace(/\btan\(/g, "Math.tan(")
      .replace(/\bln\(/g, "Math.log(")
      .replace(/\blog\(/g, "Math.log10(")
      .replace(/\bsqrt\(/g, "Math.sqrt(")
      .replace(/\babs\(/g, "Math.abs(")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");
    try {
      const fn = new Function("x", `return (${sanitized});`);
      return Number(fn(xVal));
    } catch {
      return NaN;
    }
  };

  const drawCurve = (expr, color) => {
    if (!expr.trim()) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    let penDown = false;
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const xv = xMin + (i / steps) * (xMax - xMin);
      const yv = evalMathExpr(expr, xv);
      if (Number.isFinite(yv) && yv >= yMin - 50 && yv <= yMax + 50) {
        const sx = toScreenX(xv);
        const sy = toScreenY(yv);
        if (!penDown) {
          ctx.moveTo(sx, sy);
          penDown = true;
        } else {
          ctx.lineTo(sx, sy);
        }
      } else {
        penDown = false;
      }
    }
    ctx.stroke();
  };

  drawCurve(y1Input, "#2563eb");
  drawCurve(y2Input, "#e11d48");
}

function evaluateTi84Scientific() {
  const input = document.getElementById("ti84-sci-input");
  const output = document.getElementById("ti84-sci-output");
  if (!input || !output) return;
  const raw = input.value.trim();
  if (!raw) return;

  try {
    const sanitized = raw
      .toLowerCase()
      .replace(/\^/g, "**")
      .replace(/\bsin\(/g, "Math.sin(")
      .replace(/\bcos\(/g, "Math.cos(")
      .replace(/\btan\(/g, "Math.tan(")
      .replace(/\basin\(/g, "Math.asin(")
      .replace(/\bacos\(/g, "Math.acos(")
      .replace(/\batan\(/g, "Math.atan(")
      .replace(/\bln\(/g, "Math.log(")
      .replace(/\blog\(/g, "Math.log10(")
      .replace(/\bsqrt\(/g, "Math.sqrt(")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");
    const val = new Function(`return (${sanitized});`)();
    const formatted = Number.isFinite(val) ? Number(val.toFixed(6)) : "Undefined";
    output.innerHTML = `<div class="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800"><span class="text-slate-400">${escapeHtml(raw)}</span><span class="text-emerald-400 font-bold">= ${formatted}</span></div>` + output.innerHTML;
  } catch {
    output.innerHTML = `<div class="text-xs font-mono text-rose-400 py-1">Syntax Error: ${escapeHtml(raw)}</div>` + output.innerHTML;
  }
}

// ============================================================================
// 11. GLOBAL WINDOW HANDLERS & KEYBOARD NAVIGATION
// ============================================================================
window.openPracticeLauncher = openPracticeLauncher;

window.setPracticeHubDifficulty = function (tier) {
  practiceState.filters.difficulty = tier || "all";
  applyHubFiltersAndRender();
};

window.setArenaDifficultyFilter = function (tier) {
  if (!practiceState.session) return;
  practiceState.session.activeDifficultyFilter = tier || "all";
  applyArenaLiveFilters(true);
};

window.setArenaTypeFilter = function (typeVal) {
  if (!practiceState.session) return;
  practiceState.session.activeTypeFilter = typeVal || "all";
  applyArenaLiveFilters(true);
};

window.resetPracticeHubFilters = function () {
  practiceState.filters = {
    unit: "all",
    topic: "all",
    subTopic: "all",
    type: "all",
    difficulty: "all",
    calculator: "all",
    status: "all",
    search: ""
  };
  const unitSel = document.getElementById("practice-filter-unit");
  const searchIn = document.getElementById("practice-filter-search");
  if (unitSel) unitSel.value = "all";
  if (searchIn) searchIn.value = "";
  populateHubTopicDropdowns();
  applyHubFiltersAndRender();
};

window.togglePracticeUnitAccordion = function (unitKey) {
  if (unitKey !== "unit_1" && !window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "AP Precalculus Units 2–4 Practice Bank",
        "Practice sets for Unit 2 (Exponential/Logarithmic), Unit 3 (Trigonometric/Polar), and Unit 4 (Parametric/Vectors/Matrices) are locked on the Free tier. Upgrade to MathPrep Premium for complete access!"
      );
    }
    return;
  }
  practiceState.expandedUnits[unitKey] = !practiceState.expandedUnits[unitKey];
  renderPracticeHubDirectory();
};

window.togglePracticeUnitSelection = function (unitKey, ev) {
  if (ev) ev.stopPropagation();
  if (unitKey !== "unit_1" && !window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "AP Precalculus Units 2–4 Practice Bank",
        "Selecting and launching practice sets for Unit 2, 3, or 4 requires MathPrep Premium."
      );
    }
    return;
  }
  const unitTopics = Object.keys(TOPIC_TITLES).filter((code) => `unit_${code.split(".")[0]}` === unitKey);
  const allSelected = unitTopics.every((c) => practiceState.selectedTopics.has(c));
  unitTopics.forEach((c) => {
    if (allSelected) practiceState.selectedTopics.delete(c);
    else practiceState.selectedTopics.add(c);
  });
  renderPracticeHubDirectory();
  updateFloatingSelectionBar();
};

window.togglePracticeTopicCheckbox = function (topicCode, checked) {
  const uNum = parseInt(String(topicCode).split(".")[0], 10);
  if (uNum >= 2 && !window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "AP Precalculus Units 2–4 Practice Bank",
        "Topic " + topicCode + " is in Unit " + uNum + ". Upgrade to MathPrep Premium to practice questions for Units 2–4."
      );
    }
    return;
  }
  if (checked) practiceState.selectedTopics.add(String(topicCode));
  else practiceState.selectedTopics.delete(String(topicCode));
  renderPracticeHubDirectory();
  updateFloatingSelectionBar();
};

window.clearPracticeTopicSelections = function () {
  practiceState.selectedTopics.clear();
  renderPracticeHubDirectory();
  updateFloatingSelectionBar();
};

window.updateLauncherSetting = function (key, value) {
  if (key === "questionType" && (value === "FRQ" || value === "both") && !window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "Advanced AP Free-Response Questions",
        "Multi-part FRQs with official College Board scoring rubrics, point breakdowns, and live KaTeX preview are reserved for Premium members."
      );
    }
    return;
  }
  practiceState.launcher[key] = value;
  renderPracticeLauncherModal();
};

window.toggleLauncherDifficulty = function (diffId, checked) {
  if (checked) practiceState.launcher.selectedDifficulties.add(diffId);
  else practiceState.launcher.selectedDifficulties.delete(diffId);
  renderPracticeLauncherModal();
};

window.toggleLauncherSubTopic = function (stId, checked) {
  if (checked) practiceState.launcher.selectedSubTopics.add(stId);
  else practiceState.launcher.selectedSubTopics.delete(stId);
  renderPracticeLauncherModal();
};

window.toggleAllLauncherSubTopics = function (selectAll) {
  if (selectAll) {
    practiceState.launcher.selectedSubTopics = new Set(
      practiceState.launcher.availableSubTopics.map((s) => s.id)
    );
  } else {
    practiceState.launcher.selectedSubTopics.clear();
  }
  renderPracticeLauncherModal();
};

window.closePracticeLauncher = function () {
  practiceState.launcher.isOpen = false;
  renderPracticeLauncherModal();
};

window.launchPracticeSession = launchPracticeSessionFromModal;

window.selectArenaMcqOption = function (optIdx) {
  const s = practiceState.session;
  const q = s.questions[s.currentIndex];
  if (!q || q.type !== "MCQ") return;
  // In Study Mode, if already checked, allow re-selecting or keep locked
  s.answers[q.id] = optIdx;
  if (s.mode === "study") {
    // Instant feedback on selection in Study & Learn Mode
    s.checkedMap[q.id] = true;
    const isCorrect = optIdx === Number(q.content?.correct_index || 0);
    recordQuestionMastery(q.id, isCorrect ? "mastered" : "missed", { selectedOption: optIdx });
    applyHubFiltersAndRender();
  }
  renderPracticeArena();
  saveActiveSessionSnapshot();
};

window.checkCurrentArenaAnswer = function () {
  const s = practiceState.session;
  const q = s.questions[s.currentIndex];
  if (!q || q.type !== "MCQ") return;
  const chosen = s.answers[q.id];
  if (chosen === undefined) return;
  s.checkedMap[q.id] = true;
  const isCorrect = chosen === Number(q.content?.correct_index || 0);
  recordQuestionMastery(q.id, isCorrect ? "mastered" : "missed", { selectedOption: chosen });
  applyHubFiltersAndRender();
  renderPracticeArena();
  saveActiveSessionSnapshot();
};

window.toggleArenaEliminateOption = function (optIdx) {
  const s = practiceState.session;
  const q = s.questions[s.currentIndex];
  if (!q) return;
  if (!s.eliminatedMap[q.id]) s.eliminatedMap[q.id] = new Set();
  if (s.eliminatedMap[q.id].has(optIdx)) {
    s.eliminatedMap[q.id].delete(optIdx);
  } else {
    s.eliminatedMap[q.id].add(optIdx);
  }
  renderPracticeArena();
};

window.toggleArenaFlagCurrent = function () {
  const s = practiceState.session;
  const q = s.questions[s.currentIndex];
  if (!q) return;
  s.flaggedMap[q.id] = !s.flaggedMap[q.id];
  renderPracticeArena();
  saveActiveSessionSnapshot();
};

window.navigateArenaQuestion = function (delta) {
  const s = practiceState.session;
  const next = s.currentIndex + delta;
  if (next >= 0 && next < s.questions.length) {
    s.currentIndex = next;
    renderPracticeArena();
    saveActiveSessionSnapshot();
  }
};

window.jumpToArenaQuestion = function (index) {
  const s = practiceState.session;
  if (index >= 0 && index < s.questions.length) {
    s.currentIndex = index;
    s.gridPopoverOpen = false;
    renderPracticeArena();
    saveActiveSessionSnapshot();
  }
};

window.toggleArenaGridPopover = function () {
  practiceState.session.gridPopoverOpen = !practiceState.session.gridPopoverOpen;
  renderArenaGridPopover();
};

window.toggleArenaDirections = function () {
  const pop = document.getElementById("arena-directions-popover");
  if (pop) pop.classList.toggle("hidden");
};

window.toggleArenaTimerPause = function () {
  practiceState.session.timerPaused = !practiceState.session.timerPaused;
  const btn = document.getElementById("arena-timer-pause-btn");
  if (btn) btn.textContent = practiceState.session.timerPaused ? "▶" : "⏸";
};

window.toggleArenaTimerHide = function () {
  practiceState.session.timerHidden = !practiceState.session.timerHidden;
  const btn = document.getElementById("arena-timer-hide-btn");
  if (btn) btn.textContent = practiceState.session.timerHidden ? "Show" : "Hide";
  updateArenaTimerDisplay();
};

window.toggleArenaTi84Modal = function () {
  if (typeof window.toggleTi84Calculator === "function") {
    window.toggleTi84Calculator();
    return;
  }
  const modal = document.getElementById("ti84-calculator-modal");
  if (!modal) return;
  modal.classList.toggle("ti84-modal-hidden");
  modal.style.display = modal.classList.contains("ti84-modal-hidden") ? "none" : "flex";
};

window.plotTi84Graph = plotTi84Graph;
window.evaluateTi84Scientific = evaluateTi84Scientific;

window.toggleArenaSideDrawer = function (tab) {
  const s = practiceState.session;
  if (tab && s.drawerOpen && s.drawerTab === tab) {
    s.drawerOpen = false;
  } else {
    s.drawerOpen = true;
    if (tab) s.drawerTab = tab;
  }
  renderArenaSideDrawer();
};

window.updateSessionScratchpadText = function (val) {
  practiceState.session.scratchpadText = val;
};

window.updateArenaFrqNote = function (noteKey, val) {
  practiceState.session.frqNotes[noteKey] = val;
  saveActiveSessionSnapshot();
};

window.toggleArenaFrqPartRubric = function (noteKey) {
  practiceState.session.frqRubricOpen[noteKey] = !practiceState.session.frqRubricOpen[noteKey];
  renderPracticeArena();
};

window.revealAllArenaFrqRubrics = function (qId) {
  const s = practiceState.session;
  const q = s.questions.find((item) => item.id === qId);
  if (!q || !Array.isArray(q.content?.parts)) return;
  const anyClosed = q.content.parts.some((_, idx) => !s.frqRubricOpen[`${qId}_${idx}`]);
  q.content.parts.forEach((_, idx) => {
    s.frqRubricOpen[`${qId}_${idx}`] = anyClosed;
  });
  renderPracticeArena();
};

window.recordArenaFrqSelfScore = function (qId, pts) {
  practiceState.session.frqSelfScores[qId] = pts;
  recordQuestionMastery(qId, pts >= 4 ? "mastered" : "missed", { frqScore: pts });
  applyHubFiltersAndRender();
  renderPracticeArena();
  saveActiveSessionSnapshot();
};

window.submitPracticeSession = submitPracticeSession;

window.reviewMissedSessionQuestions = function () {
  const s = practiceState.session;
  const missed = s.questions.filter((q) => {
    if (q.type === "MCQ") {
      return s.answers[q.id] !== Number(q.content?.correct_index || 0);
    }
    const pts = s.frqSelfScores[q.id];
    return pts === undefined || pts < 4;
  });

  if (missed.length === 0) {
    notify("All questions in this session are already mastered!", "success");
    return;
  }

  startPracticeSessionWithQuestions(missed, {
    mode: "study",
    title: `Missed Questions Review (${missed.length} Items)`
  });
};

window.closePracticeArena = function () {
  const s = practiceState.session;
  if (s.timerInterval) {
    clearInterval(s.timerInterval);
    s.timerInterval = null;
  }
  s.isActive = false;
  const arena = document.getElementById("practice-arena-overlay");
  if (arena) arena.classList.add("hidden");
  document.body.style.overflow = "";
  saveActiveSessionSnapshot();
};

// ============================================================================
// 11B. INTERACTIVE AI TUTORING ("ASK TEACHER LIMMY") & WEAKNESS DRILLS
// ============================================================================
function buildActiveQuestionTelemetryPayload(q) {
  const s = practiceState.session || {};
  const letters = ["A", "B", "C", "D"];
  const topicId = q?.topic_id || "1.1";
  const topicName = `Topic ${topicId}: ${TOPIC_TITLES[topicId] || q?.topic_title || `Topic ${topicId}`}`;
  const subTopicId = q?.sub_topic_id || `${topicId}.A`;
  const subTopicName = q?.sub_topic_title || "";
  const difficulty = normalizeDifficultyTier(q?.difficulty);
  const questionType = q?.type || "MCQ";

  let questionText = "";
  let optionsArray = [];
  let studentSubmittedAnswer = "Not yet submitted";
  let studentSelectedLetter = "";
  let correctAnswer = "";
  let correctOptionLetter = "";
  let isCorrect = false;
  let hasSubmittedAnswer = false;
  let specificDistractorTrap = "";
  let rubricSummary = "";

  if (questionType === "MCQ") {
    questionText = q?.content?.prompt_latex || "";
    optionsArray = Array.isArray(q?.content?.options) ? q.content.options.map(String) : [];
    const selIdx = s.answers ? s.answers[q.id] : undefined;
    const corrIdx = Number(q?.content?.correct_index || 0);
    correctOptionLetter = letters[corrIdx] || "A";
    if (optionsArray[corrIdx] !== undefined) {
      correctAnswer = `Option ${correctOptionLetter}: ${String(optionsArray[corrIdx]).replace(/^\([A-D]\)\s*/i, "")}`;
    } else {
      correctAnswer = `Option ${correctOptionLetter}`;
    }

    if (selIdx !== undefined && optionsArray[selIdx] !== undefined) {
      hasSubmittedAnswer = true;
      studentSelectedLetter = letters[selIdx] || String(selIdx + 1);
      studentSubmittedAnswer = `Option ${studentSelectedLetter}: ${String(optionsArray[selIdx]).replace(/^\([A-D]\)\s*/i, "")}`;
      isCorrect = selIdx === corrIdx;
      const diagMap = q?.content?.distractor_diagnostics || {};
      if (!isCorrect && diagMap[studentSelectedLetter]) {
        specificDistractorTrap = diagMap[studentSelectedLetter];
      }
    }
    rubricSummary = optionsArray.map((o, i) => `(${letters[i]}) ${String(o).replace(/^\([A-D]\)\s*/i, "")}`).join(" | ");
  } else {
    questionText = q?.content?.scenario_latex || "";
    const parts = Array.isArray(q?.content?.parts) ? q.content.parts : [];
    const notesSummary = parts
      .map((p, idx) => {
        const note = s.frqNotes?.[`${q.id}_${idx}`] || "(no work entered)";
        return `${p.part_label || `Part ${idx + 1}`}: ${note}`;
      })
      .join("\n");
    const selfScore = s.frqSelfScores?.[q.id];
    const hasAnyNotes = parts.some((_, idx) => Boolean((s.frqNotes?.[`${q.id}_${idx}`] || "").trim()));
    hasSubmittedAnswer = selfScore !== undefined || hasAnyNotes;
    studentSubmittedAnswer = `Self-Score: ${selfScore !== undefined ? `${selfScore}/6` : "Unscored"}\nStudent Work:\n${notesSummary}`;
    correctAnswer = parts
      .map((p, idx) => `${p.part_label || `Part ${idx + 1}`} Model Solution: ${p.model_solution_latex || ""}`)
      .join("\n");
    rubricSummary = parts
      .map((p, idx) => `${p.part_label || `Part ${idx + 1}`} Prompt: ${p.prompt_latex || ""}`)
      .join("\n");
    optionsArray = parts.map((p, idx) => `${p.part_label || `Part ${idx + 1}`}: ${p.prompt_latex || ""}`);
    isCorrect = selfScore !== undefined && selfScore >= 4;
  }

  return {
    questionId: q?.id || "",
    topicId,
    topicName,
    subTopicId,
    subTopicName,
    difficulty,
    questionType,
    calculatorActive: Boolean(q?.calculator_active),
    questionText,
    options: optionsArray,
    correctAnswer,
    correctOptionLetter,
    studentSubmittedAnswer,
    studentSelectedLetter,
    isCorrect,
    hasSubmittedAnswer,
    examTrap: q?.content?.exam_trap || "",
    distractorDiagnostics: q?.content?.distractor_diagnostics || {},
    specificDistractorTrap: specificDistractorTrap || q?.content?.exam_trap || "",
    explanationLatex: q?.content?.explanation_latex || "",
    rubricSummary
  };
}

function renderLimmyStudyLoungeHtml(q) {
  if (!q || !q.id) return "";
  const lounge = practiceState.limmyLoungeMap[q.id] || {
    isOpen: false,
    isMinimized: false,
    isLoading: false,
    messages: []
  };

  const telemetry = buildActiveQuestionTelemetryPayload(q);

  const messagesHtml = (lounge.messages || [])
    .map((m) => {
      if (m.role === "user") {
        return `
          <div class="flex justify-end">
            <div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-2.5 text-xs sm:text-sm shadow-2xs math-content">
              ${formatMathAndMarkdown(m.text)}
            </div>
          </div>
        `;
      }
      return `
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
            🧑‍🏫
          </div>
          <div class="flex-1 bg-white border border-indigo-100 rounded-2xl rounded-tl-xs p-4 shadow-2xs space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                Teacher Limmy • ${escapeHtml(m.modeLabel || "AP Precalculus Socratic Tutor")}
              </span>
              ${
                m.telemetryBadge
                  ? `<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      m.wasCorrect
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }">${escapeHtml(m.telemetryBadge)}</span>`
                  : ""
              }
            </div>
            <div class="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 math-content">
              ${formatMathAndMarkdown(m.text)}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="pt-2 space-y-3" id="limmy-tutor-container-${escapeHtml(q.id)}">
      <!-- Action Bar: Ask Limmy for a Hint / Ask Limmy to Explain + Quick Follow-up -->
      <div class="bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/90 border border-indigo-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-base shadow-xs">
              🧑‍🏫
            </span>
            <div>
              <div class="text-xs font-extrabold uppercase tracking-wider text-indigo-950 flex flex-wrap items-center gap-2">
                <span>Ask Teacher Limmy — Context-Aware AI Tutor</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  ${
                    telemetry.hasSubmittedAnswer
                      ? telemetry.isCorrect
                        ? `✓ Sees Your Answer: ${telemetry.studentSelectedLetter || "Correct"}`
                        : `🎯 Diagnosing Your Choice: Option ${telemetry.studentSelectedLetter || "Submitted"}`
                      : "Live Question Context Ready"
                  }
                </span>
              </div>
              <div class="text-[11px] text-indigo-700">
                Limmy sees the full question, all options, AP exam traps, and your exact submitted answer to diagnose mistakes Socratically.
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onclick="window.askArenaLimmyTutor('${escapeHtml(q.id)}', 'hint')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>💡</span>
              <span>Ask Limmy for a Hint</span>
            </button>
            <button
              type="button"
              onclick="window.askArenaLimmyTutor('${escapeHtml(q.id)}', 'explain')"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>🧑‍🏫</span>
              <span>Ask Limmy to Explain</span>
            </button>
          </div>
        </div>

        <!-- Quick-Reply Follow-Up Input Box -->
        <form
          onsubmit="event.preventDefault(); window.submitArenaLimmyFollowup('${escapeHtml(q.id)}');"
          class="flex items-center gap-2"
        >
          <input
            type="text"
            id="limmy-followup-input-${escapeHtml(q.id)}"
            placeholder="Ask Limmy a follow-up question about this problem (e.g., 'Why did my choice fail?')..."
            class="flex-1 bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Ask Limmy →
          </button>
        </form>
      </div>

      <!-- Inline Expandable "Teacher Limmy's Study Lounge" Card Beneath Active Question Card -->
      ${
        lounge.isOpen
          ? `
          <div class="limmy-study-lounge-card rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-white to-indigo-50/40 shadow-md overflow-hidden animate-fade-in">
            <div class="bg-indigo-950 text-white px-4 py-2.5 flex items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm">✨</span>
                <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-100">
                  Teacher Limmy's Diagnostic & Socratic Feedback
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
                  ${escapeHtml(telemetry.topicName)} • ${escapeHtml(telemetry.difficulty)}
                </span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onclick="window.toggleLimmyLoungeMinimize('${escapeHtml(q.id)}')"
                  class="px-2 py-0.5 rounded text-xs font-bold text-indigo-200 hover:bg-indigo-800 hover:text-white cursor-pointer"
                  title="${lounge.isMinimized ? "Expand Feedback" : "Minimize Feedback"}"
                >
                  ${lounge.isMinimized ? "Expand ▲" : "Minimize —"}
                </button>
                <button
                  type="button"
                  onclick="window.closeLimmyLounge('${escapeHtml(q.id)}')"
                  class="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer"
                  title="Dismiss Teacher Limmy's response"
                >
                  Dismiss ✕
                </button>
              </div>
            </div>

            ${
              !lounge.isMinimized
                ? `
                <div class="p-4 sm:p-5 space-y-4 max-h-[30rem] overflow-y-auto" id="limmy-lounge-messages-${escapeHtml(q.id)}">
                  ${messagesHtml}
                  ${
                    lounge.isLoading
                      ? `
                      <div class="flex items-center gap-3 text-xs font-semibold text-indigo-700 bg-indigo-50/90 border border-indigo-200 rounded-xl px-4 py-3 animate-pulse">
                        <span class="text-base">🧑‍🏫</span>
                        <span>Teacher Limmy is inspecting your submitted answer (${escapeHtml(
                          telemetry.studentSubmittedAnswer
                        )}) and preparing a tailored KaTeX walkthrough...</span>
                      </div>
                    `
                      : ""
                  }
                </div>
                <div class="px-4 py-2.5 bg-slate-50 border-t border-indigo-100 flex items-center justify-between gap-2">
                  <span class="text-[11px] text-slate-500">
                    All mathematical expressions are rendered live with KaTeX.
                  </span>
                  <button
                    type="button"
                    onclick="window.closeLimmyLounge('${escapeHtml(q.id)}')"
                    class="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Dismiss & Continue Practice ✕
                  </button>
                </div>
              `
                : ""
            }
          </div>
        `
          : ""
      }
    </div>
  `;
}

window.toggleLimmyLoungeMinimize = function (qId) {
  if (!practiceState.limmyLoungeMap[qId]) return;
  practiceState.limmyLoungeMap[qId].isMinimized = !practiceState.limmyLoungeMap[qId].isMinimized;
  renderPracticeArena();
};

window.closeLimmyLounge = function (qId) {
  if (!practiceState.limmyLoungeMap[qId]) return;
  practiceState.limmyLoungeMap[qId].isOpen = false;
  renderPracticeArena();
};

window.submitArenaLimmyFollowup = function (qId) {
  const inputEl = document.getElementById(`limmy-followup-input-${qId}`);
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  window.askArenaLimmyTutor(qId, "followup", text);
};

window.askArenaLimmyTutor = async function (qId, mode = "explain", followUpQuestion = "") {
  const s = practiceState.session;
  const q =
    (s.questions || []).find((item) => item.id === qId) ||
    (practiceState.allQuestions || []).find((item) => item.id === qId);
  if (!q) return;

  // Free Tier Limmy AI Credit Check
  if (!window.mathprepIsPremium) {
    const credits = window.mathprepLimmyCredits ?? 5;
    if (credits <= 0) {
      if (typeof window.openPremiumModal === "function") {
        window.openPremiumModal(
          "Out of Limmy AI Credits",
          "You have used all 5 free Limmy AI tutoring prompts. Upgrade to MathPrep Premium for unlimited 24/7 Socratic guidance across all 4 units!"
        );
      }
      return;
    }
    if (typeof window.deductLimmyCredit === "function") {
      const allowed = await window.deductLimmyCredit();
      if (!allowed) return;
    }
  }

  // If the student already selected an MCQ option in Study Mode and asks Limmy to Explain, mark it checked
  if (s.mode === "study" && q.type === "MCQ" && mode === "explain" && s.answers[q.id] !== undefined) {
    s.checkedMap[q.id] = true;
  }

  if (!practiceState.limmyLoungeMap[qId]) {
    practiceState.limmyLoungeMap[qId] = {
      isOpen: true,
      isMinimized: false,
      isLoading: false,
      messages: []
    };
  }

  const lounge = practiceState.limmyLoungeMap[qId];
  lounge.isOpen = true;
  lounge.isMinimized = false;
  lounge.isLoading = true;

  if (mode === "followup" && followUpQuestion) {
    lounge.messages.push({
      role: "user",
      text: followUpQuestion
    });
  }

  renderPracticeArena();

  // Construct complete telemetry payload of the active question state
  const telemetryPayload = buildActiveQuestionTelemetryPayload(q);

  const modeLabel =
    mode === "hint"
      ? "Socratic Hint"
      : mode === "followup"
      ? "Follow-Up Coaching"
      : telemetryPayload.hasSubmittedAnswer && !telemetryPayload.isCorrect
      ? `Distractor Diagnosis (Your Choice: ${telemetryPayload.studentSelectedLetter || "Submitted"})`
      : "Step-by-Step Tailored Explanation";

  const telemetryBadge = telemetryPayload.hasSubmittedAnswer
    ? telemetryPayload.isCorrect
      ? `✓ Answered ${telemetryPayload.studentSelectedLetter || "Correctly"}`
      : `✗ Submitted ${telemetryPayload.studentSelectedLetter || "Answer"} → Correct: ${telemetryPayload.correctOptionLetter || "Model"}`
    : "Walkthrough";

  try {
    const response = await fetch("/api/limmy/practice-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        telemetry: telemetryPayload,
        topicId: telemetryPayload.topicId,
        topicTitle: telemetryPayload.topicName,
        subTopicId: telemetryPayload.subTopicId,
        subTopicTitle: telemetryPayload.subTopicName,
        difficulty: telemetryPayload.difficulty,
        questionType: telemetryPayload.questionType,
        questionStem: telemetryPayload.questionText,
        options: telemetryPayload.options,
        optionsOrRubric: telemetryPayload.rubricSummary,
        studentAnswer: telemetryPayload.studentSubmittedAnswer,
        studentSelectedLetter: telemetryPayload.studentSelectedLetter,
        correctAnswer: telemetryPayload.correctAnswer,
        correctOptionLetter: telemetryPayload.correctOptionLetter,
        isCorrect: telemetryPayload.isCorrect,
        hasSubmittedAnswer: telemetryPayload.hasSubmittedAnswer,
        examTrap: telemetryPayload.examTrap,
        distractorDiagnostics: telemetryPayload.distractorDiagnostics,
        specificDistractorTrap: telemetryPayload.specificDistractorTrap,
        explanationLatex: telemetryPayload.explanationLatex,
        followUpQuestion,
        history: lounge.messages.slice(-6)
      })
    });

    const data = await response.json();
    lounge.isLoading = false;
    lounge.messages.push({
      role: "assistant",
      modeLabel,
      telemetryBadge,
      wasCorrect: telemetryPayload.isCorrect,
      text:
        data?.reply ||
        "Let's inspect the core mathematical structure of this problem together. Check your rate of change and domain constraints first!"
    });
  } catch (err) {
    lounge.isLoading = false;
    const fallbackText =
      mode === "hint"
        ? `**💡 Socratic Hint (${telemetryPayload.topicName}):**\n\n${
            telemetryPayload.hasSubmittedAnswer && !telemetryPayload.isCorrect
              ? `You chose **${telemetryPayload.studentSubmittedAnswer}**. Notice why that distractor is a trap: ${telemetryPayload.specificDistractorTrap}\n\n`
              : ""
          }Ask yourself: what is the governing algebraic formula for **${telemetryPayload.subTopicName || telemetryPayload.topicName}** before substituting numerical values?`
        : `### 🎯 Diagnostic Breakdown of Your Answer (${telemetryPayload.studentSubmittedAnswer})\n\n${
            telemetryPayload.hasSubmittedAnswer && !telemetryPayload.isCorrect
              ? `**Why ${telemetryPayload.studentSubmittedAnswer} Is Incorrect:** ${telemetryPayload.specificDistractorTrap}\n\n`
              : ""
          }#### Step-by-Step Mathematical Derivation (Correct: ${telemetryPayload.correctAnswer})\n${
            telemetryPayload.explanationLatex || "Compare your setup carefully against the official scoring guidelines."
          }${
            telemetryPayload.examTrap ? `\n\n**⚠️ AP Exam Trap:** ${telemetryPayload.examTrap}` : ""
          }`;
    lounge.messages.push({
      role: "assistant",
      modeLabel,
      telemetryBadge,
      wasCorrect: telemetryPayload.isCorrect,
      text: fallbackText
    });
  }

  renderPracticeArena();
};

/**
 * Launches a targeted 10-question practice drill focused on the student's
 * weakest / struggling sub-topics or missed questions.
 */
window.launchTargetedWeaknessDrill = function (specificSubTopicId = null) {
  if (!window.mathprepIsPremium) {
    if (typeof window.openPremiumModal === "function") {
      window.openPremiumModal(
        "Targeted Weakness Remediation Drills",
        "AI-guided drills targeting your specific missed questions, error diagnostics, and struggling topics are reserved for Premium members."
      );
    }
    return;
  }

  const allQs = practiceState.allQuestions || [];
  if (allQs.length === 0) {
    notify("Loading question bank... please try again in a moment.", "warning");
    return;
  }

  let pool = [];
  let sessionTitle = "⚡ Targeted Drill: Fix My Weak Spots";

  if (specificSubTopicId) {
    pool = allQs.filter(
      (q) => q.sub_topic_id === specificSubTopicId || q.topic_id === specificSubTopicId
    );
    sessionTitle = `⚡ Targeted Drill: ${specificSubTopicId}`;
  } else {
    // 1. Prioritize missed questions first
    const missedQs = allQs.filter((q) => getQuestionMasteryStatus(q.id) === "missed");
    // 2. Include questions from struggling sub-topics or topics
    const snap = getStudentTelemetrySnapshot();
    const weakSubIds = new Set((snap.weakSubTopics || []).map((s) => s.sub_topic_id));
    const weakTopicIds = new Set(
      Object.values(practiceState.topicStats || {})
        .filter((t) => t.mastery_status === "Struggling / Needs Review" || (t.total_attempted > 0 && t.accuracy_rate < 75))
        .map((t) => t.topic_id)
    );

    const weakPool = allQs.filter(
      (q) =>
        weakSubIds.has(q.sub_topic_id) ||
        weakTopicIds.has(q.topic_id)
    );

    const combinedMap = new Map();
    missedQs.forEach((q) => combinedMap.set(q.id, q));
    weakPool.forEach((q) => {
      if (getQuestionMasteryStatus(q.id) !== "mastered") {
        combinedMap.set(q.id, q);
      }
    });
    pool = Array.from(combinedMap.values());

    // Fallback if student has no missed/weak items yet: pick high-yield AP Standard & Challenge items across Units 1-4
    if (pool.length === 0) {
      pool = allQs.filter((q) => getQuestionMasteryStatus(q.id) !== "mastered");
      sessionTitle = "⚡ High-Yield AP Mastery Drill";
    }
  }

  if (pool.length === 0) {
    pool = [...allQs];
  }

  const selected = shuffleArray(pool).slice(0, 10);

  // Switch to Practice view if currently on Progress page
  if (window.location.hash !== "#/practice") {
    window.location.hash = "#/practice";
  }

  setTimeout(() => {
    startPracticeSessionWithQuestions(selected, {
      mode: "study",
      title: `${sessionTitle} (${selected.length} Items)`
    });
  }, 80);
};

// ============================================================================
// 12. DOM EVENT WIRING & INITIALIZATION
// ============================================================================
function bindPracticeHubEvents() {
  const unitSel = document.getElementById("practice-filter-unit");
  const topicSel = document.getElementById("practice-filter-topic");
  const subTopicSel = document.getElementById("practice-filter-subtopic");
  const searchIn = document.getElementById("practice-filter-search");

  if (unitSel) {
    unitSel.addEventListener("change", (e) => {
      const uVal = e.target.value;
      if (uVal !== "all" && uVal !== "unit_1" && !window.mathprepIsPremium) {
        if (typeof window.openPremiumModal === "function") {
          window.openPremiumModal(
            "AP Precalculus Units 2–4 Practice Bank",
            "Access to Unit 2 (Exponential/Logarithmic), Unit 3 (Trigonometric/Polar), and Unit 4 (Parametric/Vectors/Matrices) question banks is reserved for Premium members."
          );
        }
        unitSel.value = "unit_1";
        practiceState.filters.unit = "unit_1";
        populateHubTopicDropdowns();
        applyHubFiltersAndRender();
        return;
      }
      practiceState.filters.unit = uVal;
      if (uVal !== "all") {
        practiceState.expandedUnits[uVal] = true;
      }
      populateHubTopicDropdowns();
      applyHubFiltersAndRender();
    });
  }

  if (topicSel) {
    topicSel.addEventListener("change", (e) => {
      practiceState.filters.topic = e.target.value;
      populateHubTopicDropdowns();
      applyHubFiltersAndRender();
    });
  }

  if (subTopicSel) {
    subTopicSel.addEventListener("change", (e) => {
      practiceState.filters.subTopic = e.target.value;
      applyHubFiltersAndRender();
    });
  }

  if (searchIn) {
    searchIn.addEventListener("input", (e) => {
      practiceState.filters.search = e.target.value;
      applyHubFiltersAndRender();
    });
  }

  document.querySelectorAll("[data-practice-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const typeVal = btn.getAttribute("data-practice-type") || "all";
      if (typeVal === "FRQ" && !window.mathprepIsPremium) {
        if (typeof window.openPremiumModal === "function") {
          window.openPremiumModal(
            "Advanced AP Free-Response Questions",
            "Multi-part FRQs with official College Board scoring rubrics, point breakdowns, and live KaTeX preview are reserved for Premium members."
          );
        }
        return;
      }
      practiceState.filters.type = typeVal;
      applyHubFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-practice-difficulty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      practiceState.filters.difficulty = btn.getAttribute("data-practice-difficulty") || "all";
      applyHubFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-practice-calc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      practiceState.filters.calculator = btn.getAttribute("data-practice-calc") || "all";
      applyHubFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-practice-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const statusVal = btn.getAttribute("data-practice-status") || "all";
      if (statusVal === "missed" && !window.mathprepIsPremium) {
        if (typeof window.openPremiumModal === "function") {
          window.openPremiumModal(
            "Personalized Weakness Remediation",
            "Filtering by missed questions and targeted error diagnostics is reserved for Premium members. Upgrade to isolate and remediate your AP Precalc weaknesses."
          );
        }
        return;
      }
      practiceState.filters.status = statusVal;
      applyHubFiltersAndRender();
    });
  });

  // Keyboard shortcuts inside the Practice Arena
  window.addEventListener("keydown", (e) => {
    const s = practiceState.session;
    if (!s.isActive || s.isSubmitted) return;
    const tag = (e.target?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    const key = e.key.toUpperCase();
    if (["A", "B", "C", "D"].includes(key)) {
      const idx = ["A", "B", "C", "D"].indexOf(key);
      window.selectArenaMcqOption(idx);
    } else if (e.key === "ArrowRight") {
      window.navigateArenaQuestion(1);
    } else if (e.key === "ArrowLeft") {
      window.navigateArenaQuestion(-1);
    }
  });
}

// Listen for Auth changes to sync student mastery progress from/to Firestore
onAuthStateChanged(auth, (user) => {
  practiceState.currentUser = user || null;
  if (user) {
    syncMasteryFromFirestore(user);
  }
});

// Listen for Question Bank updates from admin-bank.js
window.addEventListener("mathprep:question-bank-updated", (ev) => {
  const items = ev.detail?.allQuestions;
  if (Array.isArray(items) && items.length > 0) {
    practiceState.allQuestions = items.filter((q) => q && q.is_published !== false);
    populateHubTopicDropdowns();
    applyHubFiltersAndRender();
  }
});

// Initialize on DOMContentLoaded
function initPracticeEngine() {
  loadLocalMastery();
  bindPracticeHubEvents();
  loadPracticeQuestionBank().then(() => {
    recomputeAggregatedTelemetry();
    populateHubTopicDropdowns();
    applyHubFiltersAndRender();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPracticeEngine);
} else {
  initPracticeEngine();
}
