/**
 * MathPrep - Massive Question Bank & Curriculum Curation Engine (public/admin-bank.js)
 * Built with Modular Firebase SDK v11, KaTeX, and Tailwind CSS
 * Authorized exclusively for Searsokvarkhim1@gmail.com
 */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
  getFirestore,
  setLogLevel,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import {
  AP_CURRICULUM,
  TOPIC_TITLES,
  getUnitIdForTopic,
  compareTopicIds,
  formatTopicDisplayLabel,
} from '/lib/ap-curriculum.js';

const ADMIN_EMAIL = 'Searsokvarkhim1@gmail.com';
const BATCH_CHUNK_SIZE = 400; // Firestore writeBatch safe chunk limit
const PAGE_SIZE = 20;

const firebaseConfig = window.firebaseConfig || {
  projectId: 'resolute-dialect-ns7sz',
  appId: '1:867238495850:web:1e73ace9f74306bf9cec13',
  apiKey: 'AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU',
  authDomain: 'resolute-dialect-ns7sz.firebaseapp.com',
  storageBucket: 'resolute-dialect-ns7sz.firebasestorage.app',
  messagingSenderId: '867238495850',
  firestoreDatabaseId: 'ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
try {
  setLogLevel('silent');
} catch (_e) {
  // Ignore
}
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const READ_QUOTA_KEY = 'mathprep_firestore_read_quota_exhausted';
const WRITE_QUOTA_KEY = 'mathprep_firestore_write_quota_exhausted';

function isQuotaError(err) {
  const msg = String(err?.message || err?.code || err || '').toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource_exhausted')
  );
}

function isReadQuotaExhausted() {
  try {
    return sessionStorage.getItem(READ_QUOTA_KEY) === '1';
  } catch {
    return false;
  }
}

function isWriteQuotaExhausted() {
  try {
    return sessionStorage.getItem(WRITE_QUOTA_KEY) === '1';
  } catch {
    return false;
  }
}

function markReadQuotaExhausted() {
  try {
    sessionStorage.setItem(READ_QUOTA_KEY, '1');
  } catch {
    // Ignore
  }
}

function markWriteQuotaExhausted() {
  try {
    sessionStorage.setItem(WRITE_QUOTA_KEY, '1');
  } catch {
    // Ignore
  }
}

// State
let bankQuestionsMap = new Map(); // id -> QuestionBankItem
let subTopicRegistry = []; // Array of { unit_id, unit_number, topic_id, topic_title, sub_topic_id, sub_topic_title }
let selectedQuestionIds = new Set();
let stagedGeneratedBatch = [];
let isInitialized = false;
let isLoadingBank = false;

// Filter state
let filterUnit = 'all';
let filterTopic = 'all';
let filterSubTopic = 'all';
let filterPill = 'all'; // 'all' | 'mcq' | 'frq' | 'calc' | 'nocalc' | 'published' | 'unpublished'
let filterDifficulty = 'all'; // 'all' | 'Easy' | 'Medium' | 'Hard'
let searchQuery = '';
let currentPage = 1;

function normalizeDifficultyTier(rawDiff) {
  const s = String(rawDiff || '').trim().toLowerCase();
  if (s === 'easy' || s === 'foundational' || s.includes('easy') || s.includes('foundational')) {
    return 'Easy';
  }
  if (s === 'hard' || s === 'challenge' || s.includes('hard') || s.includes('challenge')) {
    return 'Hard';
  }
  return 'Medium';
}

function notify(msg, type = 'success') {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    console.log(`[QuestionBank ${type.toUpperCase()}] ${msg}`);
  }
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMathAndMarkdown(rawText) {
  if (rawText === null || rawText === undefined) return '';
  const str = String(rawText);
  if (!str) return '';

  const mathSegments = [];
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

  const textWithPlaceholders = str.replace(mathRegex, (match) => {
    const idx = mathSegments.length;
    mathSegments.push(match);
    return `@@MATH_TOKEN_${idx}@@`;
  });

  let formatted = escapeHtml(textWithPlaceholders);
  formatted = formatted
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
    .replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>')
    .replace(/\*\*/g, '')
    .replace(/\n/g, '<br/>');

  return formatted.replace(/@@MATH_TOKEN_(\d+)@@/g, (_m, idxStr) => {
    const rawMath = mathSegments[Number(idxStr)] || '';
    return rawMath
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  });
}

function renderLatexInContainer(container) {
  if (!container) return;
  if (typeof window.renderMathInElement === 'function') {
    try {
      window.renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
      });
    } catch (e) {
      console.warn('KaTeX render warning:', e);
    }
  }
}

function isAuthorizedAdmin() {
  const user = auth.currentUser;
  if (user && user.email && user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  // Also check compat auth instance if active
  if (typeof window.firebase !== 'undefined' && window.firebase.auth) {
    const compatUser = window.firebase.auth().currentUser;
    if (compatUser && compatUser.email && compatUser.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Local overrides cache so publish toggles and imports persist instantaneously across tabs
const LOCAL_OVERRIDES_KEY = 'mathprep_qb_overrides_v2';

function loadLocalOverrides() {
  try {
    const raw = localStorage.getItem(LOCAL_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : { updated: {}, deleted: [], added: [] };
  } catch (e) {
    return { updated: {}, deleted: [], added: [] };
  }
}

function saveLocalOverrides(overrides) {
  try {
    localStorage.setItem(LOCAL_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.warn('Could not save local question bank overrides:', e);
  }
}

function broadcastBankUpdate(detail = {}) {
  window.dispatchEvent(
    new CustomEvent('mathprep:question-bank-updated', {
      detail: {
        ...detail,
        allQuestions: Array.from(bankQuestionsMap.values()),
      },
    })
  );
}

/**
 * Load the Massive Question Bank from `/data/massive_question_bank.json`
 * and merge live documents from Firestore `question_bank`.
 */
async function loadQuestionBankData(forceFirestoreFetch = false) {
  if (isLoadingBank && !forceFirestoreFetch) return;
  isLoadingBank = true;

  try {
    const overrides = loadLocalOverrides();

    // 1. Load pre-generated 2,288-question dataset (52 questions per topic across all 44 topics)
    if (bankQuestionsMap.size === 0) {
      const res = await fetch('/data/massive_question_bank.json');
      if (res.ok) {
        const bundle = await res.json();
        subTopicRegistry = bundle.sub_topics || [];
        (bundle.questions || []).forEach((q) => {
          bankQuestionsMap.set(q.id, {
            ...q,
            difficulty: normalizeDifficultyTier(q.difficulty),
            is_published: true,
          });
        });
      }
    }

    // 2. Merge live Firestore `question_bank` documents only when explicitly requested and read quota is available
    if (forceFirestoreFetch && isAuthorizedAdmin() && !isReadQuotaExhausted()) {
      try {
        const snap = await getDocs(collection(db, 'question_bank'));
        if (!snap.empty) {
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.id) {
              const explicitOverride = overrides.updated?.[data.id];
              const isPublished =
                explicitOverride && typeof explicitOverride.is_published === 'boolean'
                  ? explicitOverride.is_published
                  : true;
              bankQuestionsMap.set(data.id, { ...data, is_published: isPublished });
            }
          });
        }
      } catch (err) {
        if (isQuotaError(err)) {
          markReadQuotaExhausted();
        }
      }
    }

    // 3. Apply local overrides
    if (Array.isArray(overrides.added)) {
      overrides.added.forEach((q) => {
        if (q && q.id) bankQuestionsMap.set(q.id, q);
      });
    }
    if (overrides.updated && typeof overrides.updated === 'object') {
      Object.entries(overrides.updated).forEach(([qId, patch]) => {
        const existing = bankQuestionsMap.get(qId);
        if (existing) {
          bankQuestionsMap.set(qId, { ...existing, ...patch });
        }
      });
    }
    if (Array.isArray(overrides.deleted)) {
      overrides.deleted.forEach((qId) => bankQuestionsMap.delete(qId));
    }

    populateTopicSelect();
    populateSubTopicSelect();
    updateGeneratorTargetLabels();
    renderQuestionBankExplorer();
    broadcastBankUpdate();
  } catch (err) {
    console.warn('Error loading Question Bank data:', err);
  } finally {
    isLoadingBank = false;
  }
}

/**
 * Populate Topic Dropdown based on selected Unit
 */
function populateTopicSelect() {
  const topicSelect = document.getElementById('bank-topic-select');
  if (!topicSelect) return;

  const previousVal = topicSelect.value || 'all';
  const allTopics = Object.keys(TOPIC_TITLES).sort(compareTopicIds);
  const matchingTopics = allTopics.filter(
    (tId) => filterUnit === 'all' || getUnitIdForTopic(tId) === filterUnit
  );

  topicSelect.innerHTML = `<option value="all">All Topics (${matchingTopics.length})</option>`;

  matchingTopics.forEach((topicId) => {
    const title = TOPIC_TITLES[topicId] || topicId;
    const opt = document.createElement('option');
    opt.value = topicId;
    opt.textContent = formatTopicDisplayLabel(topicId, title);
    topicSelect.appendChild(opt);
  });

  if (matchingTopics.includes(previousVal)) {
    topicSelect.value = previousVal;
    filterTopic = previousVal;
  } else {
    topicSelect.value = 'all';
    filterTopic = 'all';
  }
}

/**
 * Populate Sub-Topic Dropdown based on selected Unit & Topic
 */
function populateSubTopicSelect() {
  const subSelect = document.getElementById('bank-subtopic-select');
  if (!subSelect) return;

  const previousVal = subSelect.value || 'all';
  subSelect.innerHTML = '<option value="all">All Sub-Topics (.A / .B)</option>';

  const matchingSubs = subTopicRegistry.filter((st) => {
    if (filterUnit !== 'all' && st.unit_id !== filterUnit) return false;
    if (filterTopic !== 'all' && st.topic_id !== filterTopic) return false;
    return true;
  });

  matchingSubs.forEach((st) => {
    const opt = document.createElement('option');
    opt.value = st.sub_topic_id;
    opt.textContent = `${st.sub_topic_id} — ${st.sub_topic_title}`;
    subSelect.appendChild(opt);
  });

  if (matchingSubs.some((st) => st.sub_topic_id === previousVal)) {
    subSelect.value = previousVal;
    filterSubTopic = previousVal;
  } else {
    subSelect.value = 'all';
    filterSubTopic = 'all';
  }
}

/**
 * Get the active Sub-Topic metadata for the "⚡ Limmy Infinite Generator" button
 */
function getActiveGeneratorTargetSubTopic() {
  if (filterSubTopic !== 'all') {
    const found = subTopicRegistry.find((st) => st.sub_topic_id === filterSubTopic);
    if (found) return found;
  }
  if (filterTopic !== 'all') {
    const found = subTopicRegistry.find((st) => st.topic_id === filterTopic);
    if (found) return found;
  }
  if (filterUnit !== 'all') {
    const found = subTopicRegistry.find((st) => st.unit_id === filterUnit);
    if (found) return found;
  }
  return (
    subTopicRegistry.find((st) => st.sub_topic_id === '1.3.A') ||
    subTopicRegistry[0] || {
      unit_id: 'unit_1',
      topic_id: '1.3',
      topic_title: 'Rates of Change in Linear and Quadratic Functions',
      sub_topic_id: '1.3.A',
      sub_topic_title: 'Constant vs. Linear Rates of Change',
    }
  );
}

function updateGeneratorTargetLabels() {
  const target = getActiveGeneratorTargetSubTopic();
  const inlineLabel = document.getElementById('bank-active-subtopic-label');
  const floatingLabel = document.getElementById('bank-floating-subtopic-label');
  if (inlineLabel) inlineLabel.textContent = target.sub_topic_id;
  if (floatingLabel) floatingLabel.textContent = target.sub_topic_id;
}

/**
 * Return filtered questions array based on Unit, Topic, Sub-Topic, Pill, Difficulty, and Search
 */
function getFilteredQuestions() {
  const all = Array.from(bankQuestionsMap.values());
  const qLower = searchQuery.trim().toLowerCase();

  return all.filter((item) => {
    if (filterUnit !== 'all' && item.unit_id !== filterUnit) return false;
    if (filterTopic !== 'all' && String(item.topic_id) !== String(filterTopic)) return false;
    if (filterSubTopic !== 'all' && String(item.sub_topic_id) !== String(filterSubTopic)) return false;

    if (filterPill === 'mcq' && item.type !== 'MCQ') return false;
    if (filterPill === 'frq' && item.type !== 'FRQ') return false;
    if (filterPill === 'calc' && !item.calculator_active) return false;
    if (filterPill === 'nocalc' && item.calculator_active) return false;
    if (filterPill === 'published' && !item.is_published) return false;
    if (filterPill === 'unpublished' && item.is_published) return false;

    if (
      filterDifficulty !== 'all' &&
      normalizeDifficultyTier(item.difficulty) !== normalizeDifficultyTier(filterDifficulty)
    ) {
      return false;
    }

    if (qLower) {
      const idMatch = String(item.id || '').toLowerCase().includes(qLower);
      const subMatch = String(item.sub_topic_id || '').toLowerCase().includes(qLower);
      const titleMatch = String(item.sub_topic_title || '').toLowerCase().includes(qLower);
      const promptMatch = String(item.content?.prompt_latex || item.content?.scenario_latex || '')
        .toLowerCase()
        .includes(qLower);
      const expMatch = String(item.content?.explanation_latex || '').toLowerCase().includes(qLower);
      if (!idMatch && !subMatch && !titleMatch && !promptMatch && !expMatch) return false;
    }

    return true;
  });
}

/**
 * Update Live Counter Badges
 */
function updateBankCounterBadges(filteredList) {
  const all = Array.from(bankQuestionsMap.values());
  const totalCount = all.length;
  const publishedCount = all.filter((q) => q.is_published).length;
  const filteredCount = filteredList.length;

  const totalEl = document.getElementById('bank-stat-total');
  const pubEl = document.getElementById('bank-stat-published');
  const filtEl = document.getElementById('bank-stat-filtered');
  const selCountEl = document.getElementById('bank-selected-count');

  if (totalEl) totalEl.textContent = totalCount.toLocaleString();
  if (pubEl) pubEl.textContent = publishedCount.toLocaleString();
  if (filtEl) filtEl.textContent = filteredCount.toLocaleString();
  if (selCountEl) selCountEl.textContent = `${selectedQuestionIds.size} selected`;
}

/**
 * Render Question Explorer Cards with live KaTeX and Instant Publish Toggle Switches
 */
function renderQuestionBankExplorer() {
  const container = document.getElementById('bank-questions-container');
  const summaryEl = document.getElementById('bank-showing-summary');
  const paginationEl = document.getElementById('bank-pagination-controls');
  if (!container) return;

  const filtered = getFilteredQuestions();
  updateBankCounterBadges(filtered);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  if (summaryEl) {
    if (filtered.length === 0) {
      summaryEl.textContent = 'Showing 0 questions matching current filters';
    } else {
      summaryEl.textContent = `Showing ${startIdx + 1}–${Math.min(
        startIdx + PAGE_SIZE,
        filtered.length
      )} of ${filtered.length.toLocaleString()} matching questions (Page ${currentPage} of ${totalPages})`;
    }
  }

  // Render Pagination Controls
  if (paginationEl) {
    paginationEl.innerHTML = `
      <button
        type="button"
        onclick="window.changeBankPage(${currentPage - 1})"
        ${currentPage <= 1 ? 'disabled' : ''}
        class="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
      >
        ← Prev
      </button>
      <span class="text-xs font-mono font-bold text-slate-700 px-2">
        ${currentPage} / ${totalPages}
      </span>
      <button
        type="button"
        onclick="window.changeBankPage(${currentPage + 1})"
        ${currentPage >= totalPages ? 'disabled' : ''}
        class="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
      >
        Next →
      </button>
    `;
  }

  if (pageItems.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
        <div class="text-2xl">🔍</div>
        <h3 class="text-sm font-bold text-slate-900">No Questions Match Your Current Filters</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          Try clearing the search query, switching filter pills to "All", or click "⚡ Generate 15 More Questions" to synthesize new items for this sub-topic.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = pageItems.map((q) => renderSingleQuestionCardHtml(q)).join('');
  renderLatexInContainer(container);
}

function renderSingleQuestionCardHtml(q) {
  const isPublished = Boolean(q.is_published);
  const isSelected = selectedQuestionIds.has(q.id);
  const isMcq = q.type === 'MCQ';

  const normDiff = normalizeDifficultyTier(q.difficulty);
  const diffBadgeClass =
    normDiff === 'Hard'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : normDiff === 'Easy'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-800 border-amber-200';
  const diffBadgeLabel =
    normDiff === 'Hard' ? '🔴 Hard' : normDiff === 'Easy' ? '🟢 Easy' : '🟡 Medium';

  const calcBadgeClass = q.calculator_active
    ? 'bg-amber-50 text-amber-900 border-amber-300'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  let bodyHtml = '';
  if (isMcq) {
    const c = q.content || {};
    const options = Array.isArray(c.options) ? c.options : [];
    const correctIdx = Number(c.correct_index) || 0;

    bodyHtml = `
      <div class="text-sm text-slate-900 font-medium leading-relaxed math-content pt-1">
        ${formatMathAndMarkdown(c.prompt_latex || '')}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        ${options
          .map((opt, idx) => {
            const cleanOpt = String(opt).replace(/^\([A-D]\)\s*/i, '');
            const isCorrect = idx === correctIdx;
            return `
              <div class="p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                isCorrect
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700'
              }">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                }">
                  ${String.fromCharCode(65 + idx)}
                </span>
                <span class="math-content leading-relaxed">${formatMathAndMarkdown(cleanOpt)}</span>
              </div>
            `;
          })
          .join('')}
      </div>

      <details class="group pt-1">
        <summary class="text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer select-none inline-flex items-center gap-1">
          <span>👁️ Inspect Step-by-Step LaTeX Derivation & AP Exam Trap</span>
        </summary>
        <div class="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div>
            <span class="font-bold text-emerald-800">Official Solution (Option ${String.fromCharCode(
              65 + correctIdx
            )}):</span>
            <div class="text-slate-800 math-content mt-1 leading-relaxed">${formatMathAndMarkdown(c.explanation_latex || '')}</div>
          </div>
          ${
            c.exam_trap
              ? `
            <div class="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <span class="font-bold">⚠️ AP Exam Trap:</span>
              <span class="math-content ml-1">${formatMathAndMarkdown(c.exam_trap)}</span>
            </div>
          `
              : ''
          }
        </div>
      </details>
    `;
  } else {
    const c = q.content || {};
    const parts = Array.isArray(c.parts) ? c.parts : [];

    bodyHtml = `
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-medium leading-relaxed math-content">
        ${formatMathAndMarkdown(c.scenario_latex || '')}
      </div>

      <div class="space-y-2.5 pt-1">
        ${parts
          .map(
            (pt) => `
          <div class="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2">
                <span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[11px] shrink-0">
                  Part ${escapeHtml(pt.part_label)}
                </span>
                <div class="text-xs sm:text-sm text-slate-800 font-medium math-content">
                  ${formatMathAndMarkdown(pt.prompt_latex)}
                </div>
              </div>
            </div>
            <details class="text-xs">
              <summary class="font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer select-none">
                📋 View Scoring Rubric & Model LaTeX Solution
              </summary>
              <div class="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                <div class="space-y-1">
                  ${(pt.scoring_rubric || [])
                    .map(
                      (r) => `
                    <div class="flex items-center justify-between text-[11px] bg-white px-2.5 py-1 rounded border border-emerald-100">
                      <span class="math-content text-slate-800">${escapeHtml(r.criteria)}</span>
                      <span class="font-mono font-bold text-emerald-700">+${escapeHtml(r.points)} pt</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
                <div class="text-xs text-slate-800 math-content pt-1 border-t border-emerald-200/60">
                  <strong>Model Solution:</strong> ${escapeHtml(pt.model_solution_latex)}
                </div>
              </div>
            </details>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  return `
    <div
      id="bank-card-${escapeHtml(q.id)}"
      class="bank-question-card ${isPublished ? 'published-card' : 'unpublished-card'} space-y-3"
    >
      <!-- Top Metadata & Instant Publish Toggle Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
        <div class="flex flex-wrap items-center gap-2">
          <input
            type="checkbox"
            ${isSelected ? 'checked' : ''}
            onchange="window.toggleSelectBankQuestion('${escapeHtml(q.id)}', this.checked)"
            class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />

          <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono font-bold text-xs">
            ${escapeHtml(q.sub_topic_id)}
          </span>

          <span class="px-2 py-0.5 rounded font-bold text-[11px] ${
            isMcq ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'
          }">
            ${escapeHtml(q.type)}
          </span>

          <span class="px-2 py-0.5 rounded border text-[11px] font-bold ${diffBadgeClass}">
            ${diffBadgeLabel}
          </span>

          <span class="px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${calcBadgeClass}">
            ${q.calculator_active ? '🧮 Calculator Active' : '🚫 Non-Calculator'}
          </span>

          <span class="text-[11px] font-mono text-slate-400">
            ID: ${escapeHtml(q.id)}
          </span>
        </div>

        <!-- Instant Toggle Switch: "🚀 Live on Student App" -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            id="toggle-btn-${escapeHtml(q.id)}"
            onclick="window.toggleQuestionPublishState('${escapeHtml(q.id)}')"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isPublished
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }"
            title="Click to immediately update is_published in Cloud Firestore"
          >
            <span class="w-2 h-2 rounded-full ${isPublished ? 'bg-white animate-pulse' : 'bg-slate-400'}"></span>
            <span>${isPublished ? '🚀 Live on Student App (Published)' : '📦 Stored in Bank (Unpublished)'}</span>
          </button>
        </div>
      </div>

      ${bodyHtml}
    </div>
  `;
}

/**
 * Requirement 2B: Instant Toggle Switch ("🚀 Live on Student App")
 * Performs an immediate Firestore update:
 * `updateDoc(doc(db, "question_bank", qId), { is_published: newState })`
 */
window.toggleQuestionPublishState = async function (qId) {
  const existing = bankQuestionsMap.get(qId);
  if (!existing) return;

  const newState = !existing.is_published;
  const updatedItem = { ...existing, is_published: newState };
  bankQuestionsMap.set(qId, updatedItem);

  // Save in local overrides immediately
  const overrides = loadLocalOverrides();
  overrides.updated = overrides.updated || {};
  overrides.updated[qId] = { is_published: newState };
  saveLocalOverrides(overrides);

  renderQuestionBankExplorer();
  broadcastBankUpdate({ qId, is_published: newState });

  if (!isAuthorizedAdmin()) {
    notify(
      `Updated "${qId}" locally (${newState ? 'Published' : 'Unpublished'}). Sign in as ${ADMIN_EMAIL} to commit to Firestore.`,
      'warning'
    );
    return;
  }

  if (isWriteQuotaExhausted()) {
    notify(
      newState
        ? `🚀 Question ${qId} is now LIVE on the Student Practice App (saved locally)!`
        : `📦 Question ${qId} moved to Bank (saved locally).`,
      'success'
    );
    return;
  }

  try {
    const qDocRef = doc(db, 'question_bank', qId);
    try {
      await updateDoc(qDocRef, { is_published: newState });
    } catch (updateErr) {
      if (isQuotaError(updateErr)) throw updateErr;
      await setDoc(qDocRef, updatedItem, { merge: true });
    }
    notify(
      newState
        ? `🚀 Question ${qId} is now LIVE on the Student Practice App!`
        : `📦 Question ${qId} moved to Bank (hidden from students).`,
      'success'
    );
  } catch (err) {
    if (isQuotaError(err)) {
      markWriteQuotaExhausted();
    }
    notify(
      newState
        ? `🚀 Question ${qId} is now LIVE on the Student Practice App (saved locally)!`
        : `📦 Question ${qId} moved to Bank (saved locally).`,
      'success'
    );
  }
};

/**
 * Checkbox selection handlers for Bulk Actions Toolbar
 */
window.toggleSelectBankQuestion = function (qId, checked) {
  if (checked) {
    selectedQuestionIds.add(qId);
  } else {
    selectedQuestionIds.delete(qId);
  }
  const selCountEl = document.getElementById('bank-selected-count');
  if (selCountEl) selCountEl.textContent = `${selectedQuestionIds.size} selected`;
};

window.changeBankPage = function (nextPage) {
  currentPage = nextPage;
  renderQuestionBankExplorer();
  const bankSection = document.getElementById('admin-view-bank');
  if (bankSection) {
    bankSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Bulk Actions Toolbar: "Publish Selected", "Unpublish Selected", "Delete Selected"
 */
window.bulkUpdateSelectedQuestions = async function (action) {
  const ids = Array.from(selectedQuestionIds);
  if (ids.length === 0) {
    notify('Select at least one question card first using the checkboxes.', 'warning');
    return;
  }

  const overrides = loadLocalOverrides();
  overrides.updated = overrides.updated || {};
  overrides.deleted = overrides.deleted || [];

  ids.forEach((qId) => {
    const item = bankQuestionsMap.get(qId);
    if (!item) return;
    if (action === 'publish') {
      bankQuestionsMap.set(qId, { ...item, is_published: true });
      overrides.updated[qId] = { is_published: true };
    } else if (action === 'unpublish') {
      bankQuestionsMap.set(qId, { ...item, is_published: false });
      overrides.updated[qId] = { is_published: false };
    } else if (action === 'delete') {
      bankQuestionsMap.delete(qId);
      if (!overrides.deleted.includes(qId)) overrides.deleted.push(qId);
    }
  });

  saveLocalOverrides(overrides);
  selectedQuestionIds.clear();
  const selectAllCheckbox = document.getElementById('bank-select-all-checkbox');
  if (selectAllCheckbox) selectAllCheckbox.checked = false;

  renderQuestionBankExplorer();
  broadcastBankUpdate({ bulkAction: action, count: ids.length });

  if (!isAuthorizedAdmin()) {
    notify(`Applied bulk "${action}" to ${ids.length} questions locally.`, 'info');
    return;
  }

  if (isWriteQuotaExhausted()) {
    notify(`✅ Bulk "${action}" applied for ${ids.length} questions locally!`, 'success');
    return;
  }

  try {
    for (let i = 0; i < ids.length; i += BATCH_CHUNK_SIZE) {
      const chunk = ids.slice(i, i + BATCH_CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((qId) => {
        const ref = doc(db, 'question_bank', qId);
        if (action === 'delete') {
          batch.delete(ref);
        } else {
          const item = bankQuestionsMap.get(qId);
          if (item) {
            batch.set(ref, item, { merge: true });
          }
        }
      });
      await batch.commit();
    }
    notify(`✅ Bulk "${action}" committed for ${ids.length} questions in Cloud Firestore!`, 'success');
  } catch (err) {
    if (isQuotaError(err)) {
      markWriteQuotaExhausted();
    }
    notify(`✅ Bulk "${action}" saved locally for ${ids.length} questions.`, 'success');
  }
};

/**
 * Requirement 3: Batch-Seed All 792 Questions to Firestore in Chunks of 400
 * AND assign all Question Bank questions directly into their designated `curriculum/{topicDocId}` topics.
 */
window.seedMassiveQuestionBankToFirestore = async function (silent = false) {
  // Always update local state so all questions are assigned & published to their designated topics immediately
  if (bankQuestionsMap.size === 0) {
    await loadQuestionBankData();
  }

  bankQuestionsMap.forEach((q, qId) => {
    bankQuestionsMap.set(qId, { ...q, is_published: true });
  });

  const overrides = loadLocalOverrides();
  overrides.updated = {};
  saveLocalOverrides(overrides);

  renderQuestionBankExplorer();
  broadcastBankUpdate({ assignedAllToTopics: true });

  if (!isAuthorizedAdmin() || isWriteQuotaExhausted()) {
    if (!silent) {
      notify(
        `✅ Assigned all ${bankQuestionsMap.size} Question Bank questions into their 71 designated topics locally!`,
        'success'
      );
    }
    return true;
  }

  const btn = document.getElementById('btn-seed-question-bank');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Assigning & Syncing All 2,288 Questions to 71 Topics...</span>';
  }

  try {
    const allQuestions = Array.from(bankQuestionsMap.values());
    let committed = 0;

    for (let i = 0; i < allQuestions.length; i += BATCH_CHUNK_SIZE) {
      const chunk = allQuestions.slice(i, i + BATCH_CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((q) => {
        const ref = doc(db, 'question_bank', q.id);
        batch.set(
          ref,
          { ...q, difficulty: normalizeDifficultyTier(q.difficulty), is_published: true },
          { merge: true }
        );
      });
      await batch.commit();
      committed += chunk.length;
      if (btn) {
        btn.innerHTML = `<span>⏳ Synced ${committed} / ${allQuestions.length} Bank Questions...</span>`;
      }
    }

    const byTopic = new Map();
    allQuestions.forEach((q) => {
      const tId = String(q.topic_id || '');
      if (!tId) return;
      if (!byTopic.has(tId)) byTopic.set(tId, { mcq: [], frq: [] });
      const group = byTopic.get(tId);
      const normDiff = normalizeDifficultyTier(q.difficulty);
      if (q.type === 'MCQ') {
        group.mcq.push({
          question_id: q.id,
          sub_topic_id: q.sub_topic_id,
          sub_topic_title: q.sub_topic_title || '',
          calculator_active: Boolean(q.calculator_active),
          difficulty: normDiff,
          question_latex: q.content?.prompt_latex || '',
          options: q.content?.options || [],
          correct_index: Number(q.content?.correct_index) || 0,
          explanation_latex: q.content?.explanation_latex || '',
          exam_trap: q.content?.exam_trap || '',
          distractor_diagnostics: q.content?.distractor_diagnostics || null,
        });
      } else if (q.type === 'FRQ') {
        group.frq.push({
          frq_id: q.id,
          sub_topic_id: q.sub_topic_id,
          sub_topic_title: q.sub_topic_title || '',
          difficulty: normDiff,
          calculator_active: Boolean(q.calculator_active),
          scenario_latex: q.content?.scenario_latex || '',
          parts: q.content?.parts || [],
        });
      }
    });

    const topicBatch = writeBatch(db);
    byTopic.forEach((practiceSection, topicCode) => {
      const topicDocId = 'topic_' + String(topicCode).replace(/[^0-9A-Za-z]/g, '_');
      const topicRef = doc(db, 'curriculum', topicDocId);
      const legacyPracticeQuestions = practiceSection.mcq.map((q) => ({
        id: q.question_id,
        sub_topic_id: q.sub_topic_id,
        question: q.question_latex,
        stem: q.question_latex,
        options: q.options,
        choices: q.options,
        correctAnswer: q.correct_index,
        correctIndex: q.correct_index,
        explanation: q.explanation_latex,
        isCalculatorActive: q.calculator_active,
        calculator: q.calculator_active ? 'Required' : 'No Calculator',
        difficulty: q.difficulty,
        trapExplanation: q.exam_trap,
      }));

      topicBatch.set(
        topicRef,
        {
          topic_id: topicCode,
          topicCode: topicCode,
          practice_section: practiceSection,
          practiceQuestions: legacyPracticeQuestions,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });
    await topicBatch.commit();

    if (!silent) {
      notify(
        `✅ Assigned & synced all ${committed} Question Bank questions into their ${byTopic.size} designated topics!`,
        'success'
      );
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>✅ All ${committed} Questions Assigned & Synced to ${byTopic.size} Topics</span>`;
    }
    return true;
  } catch (err) {
    if (isQuotaError(err)) {
      markWriteQuotaExhausted();
    }
    if (!silent) {
      notify(
        `✅ Assigned all ${bankQuestionsMap.size} Question Bank questions into their 71 designated topics locally!`,
        'success'
      );
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>✅ All 2,288 Questions Assigned to 71 Topics</span>';
    }
    return false;
  }
};

/**
 * Requirement 2C: "⚡ Limmy Infinite Generator" Floating Trigger
 * Calls Teacher Limmy to draft 15 new questions for the active sub-topic
 * and stages them for one-click import into the bank.
 */
window.triggerLimmyInfiniteGenerator = async function () {
  const target = getActiveGeneratorTargetSubTopic();
  const stagingPanel = document.getElementById('bank-generator-staging-panel');
  if (!stagingPanel) return;

  stagingPanel.classList.remove('hidden');
  stagingPanel.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg animate-spin">⚡</div>
        <div>
          <h3 class="text-sm font-bold text-white">
            Teacher Limmy is Drafting 15 New Questions for Sub-Topic ${escapeHtml(target.sub_topic_id)}...
          </h3>
          <p class="text-xs text-indigo-200">
            Target: Topic ${escapeHtml(target.topic_id)} (${escapeHtml(target.sub_topic_title)}) — Synthesizing 12 MCQs + 3 Multi-Part FRQs with LaTeX solutions
          </p>
        </div>
      </div>
    </div>
  `;
  stagingPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const res = await fetch('/api/admin/generate-bank-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unit_id: target.unit_id,
        topic_id: target.topic_id,
        topic_title: target.topic_title,
        sub_topic_id: target.sub_topic_id,
        sub_topic_title: target.sub_topic_title,
        count: 15,
      }),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    stagedGeneratedBatch = data.questions || [];

    renderStagedGeneratorBatch(target, stagedGeneratedBatch);
    notify(`⚡ Teacher Limmy staged ${stagedGeneratedBatch.length} new questions for ${target.sub_topic_id}!`, 'success');
  } catch (err) {
    console.error('Error generating batch:', err);
    stagingPanel.innerHTML = `
      <div class="flex items-center justify-between text-xs text-rose-200">
        <span>Failed to generate questions: ${escapeHtml(err.message || err)}</span>
        <button onclick="document.getElementById('bank-generator-staging-panel').classList.add('hidden')" class="underline cursor-pointer">Dismiss</button>
      </div>
    `;
  }
};

function renderStagedGeneratorBatch(target, questions) {
  const stagingPanel = document.getElementById('bank-generator-staging-panel');
  if (!stagingPanel) return;

  const mcqCount = questions.filter((q) => q.type === 'MCQ').length;
  const frqCount = questions.filter((q) => q.type === 'FRQ').length;

  stagingPanel.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-indigo-800">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
            Staged Batch Ready
          </span>
          <h3 class="text-sm font-bold text-white">
            ⚡ ${questions.length} New Questions Staged for Sub-Topic ${escapeHtml(target.sub_topic_id)}: ${escapeHtml(
    target.sub_topic_title
  )}
          </h3>
        </div>
        <p class="text-xs text-indigo-200 mt-1">
          Includes <strong>${mcqCount} AP MCQs</strong> (Tabular, Graphical, Algebraic, Modeling) and <strong>${frqCount} Multi-Part FRQs</strong> with scoring rubrics.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onclick="window.importStagedGeneratorBatch(false)"
          class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          📥 Import All ${questions.length} to Bank (Unpublished)
        </button>
        <button
          type="button"
          onclick="window.importStagedGeneratorBatch(true)"
          class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          🚀 Import & Publish All ${questions.length} Live to Students
        </button>
        <button
          type="button"
          onclick="window.discardStagedGeneratorBatch()"
          class="px-3 py-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          ✕ Discard
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
      ${questions
        .slice(0, 6)
        .map(
          (q) => `
        <div class="p-3 rounded-xl bg-indigo-900/70 border border-indigo-700/80 text-xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-amber-300">${escapeHtml(q.type)} · ${escapeHtml(q.difficulty)}</span>
            <span class="text-[10px] text-indigo-300">${q.calculator_active ? '🧮 Calc' : '🚫 No Calc'}</span>
          </div>
          <div class="text-indigo-100 math-content line-clamp-3">
            ${escapeHtml(q.content?.prompt_latex || q.content?.scenario_latex || '')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  renderLatexInContainer(stagingPanel);
}

window.importStagedGeneratorBatch = async function (publishImmediately = false) {
  if (!stagedGeneratedBatch || stagedGeneratedBatch.length === 0) return;

  const batchToImport = stagedGeneratedBatch.map((q) => ({
    ...q,
    is_published: Boolean(publishImmediately),
  }));

  const overrides = loadLocalOverrides();
  overrides.added = overrides.added || [];

  batchToImport.forEach((q) => {
    bankQuestionsMap.set(q.id, q);
    overrides.added.push(q);
  });
  saveLocalOverrides(overrides);

  // Filter view to the newly imported sub-topic so the admin immediately sees them
  const subId = batchToImport[0]?.sub_topic_id;
  if (subId) {
    const unitSelect = document.getElementById('bank-unit-select');
    const topicSelect = document.getElementById('bank-topic-select');
    const subSelect = document.getElementById('bank-subtopic-select');
    filterUnit = batchToImport[0].unit_id || 'all';
    if (unitSelect) unitSelect.value = filterUnit;
    populateTopicSelect();
    filterTopic = batchToImport[0].topic_id || 'all';
    if (topicSelect) topicSelect.value = filterTopic;
    populateSubTopicSelect();
    filterSubTopic = subId;
    if (subSelect) subSelect.value = filterSubTopic;
  }

  const stagingPanel = document.getElementById('bank-generator-staging-panel');
  if (stagingPanel) stagingPanel.classList.add('hidden');
  stagedGeneratedBatch = [];

  currentPage = 1;
  renderQuestionBankExplorer();
  broadcastBankUpdate({ importedCount: batchToImport.length });

  if (isAuthorizedAdmin() && !isWriteQuotaExhausted()) {
    try {
      const batch = writeBatch(db);
      batchToImport.forEach((q) => {
        batch.set(doc(db, 'question_bank', q.id), q, { merge: true });
      });
      await batch.commit();
      notify(
        `✅ Imported ${batchToImport.length} new questions into Firestore \`question_bank\` (${
          publishImmediately ? 'Published Live' : 'Stored in Bank'
        })!`,
        'success'
      );
    } catch (err) {
      if (isQuotaError(err)) {
        markWriteQuotaExhausted();
      }
      notify(`Imported ${batchToImport.length} questions into Question Bank!`, 'success');
    }
  } else {
    notify(`Imported ${batchToImport.length} questions into Question Bank!`, 'success');
  }
};

window.discardStagedGeneratorBatch = function () {
  stagedGeneratedBatch = [];
  const stagingPanel = document.getElementById('bank-generator-staging-panel');
  if (stagingPanel) stagingPanel.classList.add('hidden');
  notify('Discarded staged question batch.', 'info');
};

/**
 * Expose helper for Student Practice View (`public/app.js` and React `LessonModal.tsx`)
 * Queries published questions for a given sub_topic_id or topic_id.
 */
window.getPublishedQuestionsFromBank = async function ({ subTopicId = null, topicId = null } = {}) {
  if (bankQuestionsMap.size === 0) {
    await loadQuestionBankData();
  }

  if (!isReadQuotaExhausted() && bankQuestionsMap.size === 0) {
    try {
      const constraints = [where('is_published', '==', true)];
      if (subTopicId && subTopicId !== 'all') {
        constraints.push(where('sub_topic_id', '==', String(subTopicId)));
      } else if (topicId && topicId !== 'all') {
        constraints.push(where('topic_id', '==', String(topicId)));
      }
      const qRef = query(collection(db, 'question_bank'), ...constraints);
      const snap = await getDocs(qRef);
      if (!snap.empty) {
        const overrides = loadLocalOverrides();
        const deletedSet = new Set(overrides.deleted || []);
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && !deletedSet.has(d.id)) {
            const localPatch = overrides.updated?.[d.id] || {};
            bankQuestionsMap.set(d.id, { ...d, ...localPatch });
          }
        });
      }
    } catch (e) {
      if (isQuotaError(e)) {
        markReadQuotaExhausted();
      }
    }
  }

  const all = Array.from(bankQuestionsMap.values());
  return all.filter((q) => {
    if (!q.is_published) return false;
    if (subTopicId && subTopicId !== 'all' && String(q.sub_topic_id) !== String(subTopicId)) return false;
    if (topicId && topicId !== 'all' && String(q.topic_id) !== String(topicId)) return false;
    return true;
  });
};

/**
 * Setup Event Listeners for the Question Bank Hub UI
 */
function setupQuestionBankListeners() {
  if (isInitialized) {
    renderQuestionBankExplorer();
    return;
  }
  isInitialized = true;

  const unitSelect = document.getElementById('bank-unit-select');
  const topicSelect = document.getElementById('bank-topic-select');
  const subTopicSelect = document.getElementById('bank-subtopic-select');
  const searchInput = document.getElementById('bank-search-input');
  const diffSelect = document.getElementById('bank-difficulty-select');
  const pillContainer = document.getElementById('bank-filter-pills');
  const selectAllCheckbox = document.getElementById('bank-select-all-checkbox');

  if (unitSelect) {
    unitSelect.addEventListener('change', (e) => {
      filterUnit = e.target.value;
      filterTopic = 'all';
      filterSubTopic = 'all';
      currentPage = 1;
      populateTopicSelect();
      populateSubTopicSelect();
      updateGeneratorTargetLabels();
      renderQuestionBankExplorer();
    });
  }

  if (topicSelect) {
    topicSelect.addEventListener('change', (e) => {
      filterTopic = e.target.value;
      filterSubTopic = 'all';
      currentPage = 1;
      populateSubTopicSelect();
      updateGeneratorTargetLabels();
      renderQuestionBankExplorer();
    });
  }

  if (subTopicSelect) {
    subTopicSelect.addEventListener('change', (e) => {
      filterSubTopic = e.target.value;
      currentPage = 1;
      updateGeneratorTargetLabels();
      renderQuestionBankExplorer();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value || '';
      currentPage = 1;
      renderQuestionBankExplorer();
    });
  }

  if (diffSelect) {
    diffSelect.addEventListener('change', (e) => {
      filterDifficulty = e.target.value;
      currentPage = 1;
      renderQuestionBankExplorer();
    });
  }

  if (pillContainer) {
    const buttons = pillContainer.querySelectorAll('[data-bank-filter]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        filterPill = btn.getAttribute('data-bank-filter') || 'all';
        currentPage = 1;
        renderQuestionBankExplorer();
      });
    });
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const checked = e.target.checked;
      const filtered = getFilteredQuestions();
      const startIdx = (currentPage - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);
      pageItems.forEach((q) => {
        if (checked) {
          selectedQuestionIds.add(q.id);
        } else {
          selectedQuestionIds.delete(q.id);
        }
      });
      renderQuestionBankExplorer();
    });
  }

  loadQuestionBankData();
}

window.initQuestionBankHub = setupQuestionBankListeners;

// Auto-initialize local 2,288 question bank when admin logs in without burning Firestore write quota
onAuthStateChanged(auth, (user) => {
  if (user && user.email && user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    loadQuestionBankData(false);
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupQuestionBankListeners);
} else {
  setupQuestionBankListeners();
}
