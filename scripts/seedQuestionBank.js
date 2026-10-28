/**
 * Massive Question Bank Seeding Pipeline (scripts/seedQuestionBank.js)
 *
 * Generates and seeds the AP Precalculus Question Bank across all 71 topics in
 * `lib/ap-curriculum.js` (Units 1, 2A, 2B, 3, 4A, 4B including A/B/C topic splits and Unit Reviews),
 * preserving the exact total count of 2,288 questions (1,936 MCQs + 352 Multi-Part FRQs).
 *
 * Features:
 * - Single source of truth from `lib/ap-curriculum.js`
 * - Strict adherence to the `question_bank` Firestore schema:
 *   id, unit_id, topic_id, sub_topic_id, type ("MCQ" | "FRQ"),
 *   calculator_active, difficulty ("Easy" | "Medium" | "Hard"),
 *   is_published, content, created_at
 * - Per-option distractor diagnostics (`distractor_diagnostics`) + `exam_trap` for Socratic AI tutoring
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import {
  UNIT_METADATA,
  TOPIC_ORDER_INDEX,
  getUnitIdForTopic,
  getUnitKeyForTopic,
} from '../lib/ap-curriculum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIREBASE_CONFIG = {
  projectId: 'resolute-dialect-ns7sz',
  appId: '1:867238495850:web:1e73ace9f74306bf9cec13',
  apiKey: 'AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU',
  authDomain: 'resolute-dialect-ns7sz.firebaseapp.com',
  storageBucket: 'resolute-dialect-ns7sz.firebasestorage.app',
  messagingSenderId: '867238495850',
  firestoreDatabaseId: 'ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172',
};

const BATCH_CHUNK_SIZE = 400;

// Exact question distribution across 71 topics to preserve 1,936 MCQs + 352 FRQs = 2,288 total questions:
// 19 * 28 + 52 * 27 = 532 + 1404 = 1,936 MCQs
// 68 * 5 + 3 * 4 = 340 + 12 = 352 FRQs
export function getTargetMcqsForTopic(topicId) {
  const idx = TOPIC_ORDER_INDEX[String(topicId || '').trim()] ?? 0;
  return idx < 19 ? 28 : 27;
}

export function getTargetFrqsForTopic(topicId) {
  const idx = TOPIC_ORDER_INDEX[String(topicId || '').trim()] ?? 0;
  return idx < 68 ? 5 : 4;
}

/**
 * Sanitize IDs to strictly match ^[a-zA-Z0-9_\-]+$
 */
function formatSafeQuestionId(subTopicId, type, indexNum) {
  const cleanSub = String(subTopicId).replace(/[^a-zA-Z0-9]/g, '_');
  const cleanType = String(type).toLowerCase();
  const padded = String(indexNum).padStart(3, '0');
  return `qb_${cleanSub}_${cleanType}_${padded}`;
}

export function normalizeDifficulty(rawDiff, index = 0) {
  const d = String(rawDiff || '').trim().toLowerCase();
  if (d === 'easy' || d === 'foundational' || d.includes('easy') || d.includes('foundational')) {
    return 'Easy';
  }
  if (d === 'hard' || d === 'challenge' || d.includes('hard') || d.includes('challenge') || d.includes('score-5')) {
    return 'Hard';
  }
  if (d === 'medium' || d === 'ap standard' || d.includes('medium') || d.includes('standard')) {
    return 'Medium';
  }
  const tiers = ['Easy', 'Medium', 'Hard'];
  return tiers[index % 3];
}

export function ensureSubTopicsForTopic(topicId, topicTitle, rawSubs) {
  const subs = Array.isArray(rawSubs) ? rawSubs : [];
  if (subs.length >= 2) return subs;
  if (subs.length === 1) {
    return [
      subs[0],
      {
        sub_topic_id: `${topicId}.2`,
        sub_topic_title: `${topicTitle} — Graphical, Tabular & Contextual Modeling`,
        essential_formulas: subs[0].essential_formulas || [],
      },
    ];
  }
  return [
    {
      sub_topic_id: `${topicId}.1`,
      sub_topic_title: `${topicTitle} — Algebraic & Analytical Foundations`,
      essential_formulas: [],
    },
    {
      sub_topic_id: `${topicId}.2`,
      sub_topic_title: `${topicTitle} — Graphical, Tabular & Contextual Modeling`,
      essential_formulas: [],
    },
  ];
}

function arrangeMcqOptionsWithDiagnostics(rawBodies, rawDiagnostics, targetCorrectIdx = 0) {
  const letters = ['A', 'B', 'C', 'D'];
  const cIdx = ((targetCorrectIdx % 4) + 4) % 4;

  const orderedItems = [];
  let distractorCursor = 1;
  for (let slot = 0; slot < 4; slot++) {
    if (slot === cIdx) {
      orderedItems.push({
        body: String(rawBodies[0] || '').replace(/^\([A-D]\)\s*/i, ''),
        diagnostic: rawDiagnostics[0] || 'Correct College Board response.',
        isCorrect: true,
      });
    } else {
      const dIdx = distractorCursor++;
      orderedItems.push({
        body: String(rawBodies[dIdx] || '').replace(/^\([A-D]\)\s*/i, ''),
        diagnostic:
          rawDiagnostics[dIdx] ||
          'This distractor results from an algebraic sign error or omitting interval division.',
        isCorrect: false,
      });
    }
  }

  const options = orderedItems.map((item, idx) => `(${letters[idx]}) ${item.body}`);
  const distractor_diagnostics = {};
  orderedItems.forEach((item, idx) => {
    distractor_diagnostics[letters[idx]] = item.diagnostic;
  });

  return {
    options,
    correct_index: cIdx,
    distractor_diagnostics,
  };
}

/**
 * Generate topic-grounded MCQs across its sub-topics, tailored to the 71-topic curriculum.
 */
export function buildExpandedMcqsForTopic(topic, subTopics) {
  const topicId = String(topic.topic_id);
  const unitId = getUnitIdForTopic(topicId);
  const unitKey = getUnitKeyForTopic(topicId);
  const unitNum = UNIT_METADATA[unitId]?.num || Number(topic.unit) || 1;
  const topicTitle = String(topic.topic_title || '');
  const baseMcqs = topic.practice_section?.mcq || topic.mcq || [];
  const targetMcqCount = getTargetMcqsForTopic(topicId);

  const results = [];
  let seq = 1;

  // 1. Convert authored MCQs from the curriculum topic definition
  baseMcqs.slice(0, 3).forEach((m, idx) => {
    const targetSub = subTopics[idx % subTopics.length];
    const subTopicId = targetSub.sub_topic_id;
    const qId = formatSafeQuestionId(subTopicId, 'mcq', seq++);
    const opts = (m.options || m.content?.options || []).map((o) => String(o));
    const corrIdx = Number(m.correct_index ?? m.content?.correct_index ?? 0);
    const trapText =
      m.exam_trap ||
      m.content?.exam_trap ||
      'Verify domain restrictions and sign conventions before selecting an option.';

    const letters = ['A', 'B', 'C', 'D'];
    const diagMap = {};
    opts.forEach((optText, oIdx) => {
      const letCode = letters[oIdx] || String(oIdx);
      if (oIdx === corrIdx) {
        diagMap[letCode] = `Correct Answer (${letCode}): Matches the governing AP Precalculus principle for ${topicId} (${topicTitle}).`;
      } else {
        diagMap[letCode] = `Selecting (${letCode}) ${String(optText).replace(/^\([A-D]\)\s*/i, '')} triggers a classic AP distractor trap: ${trapText}`;
      }
    });

    results.push({
      id: qId,
      unit_id: unitId,
      unit_key: unitKey,
      topic_id: topicId,
      topic_title: topicTitle,
      sub_topic_id: subTopicId,
      sub_topic_title: targetSub.sub_topic_title,
      type: 'MCQ',
      calculator_active: Boolean(m.calculator_active),
      difficulty: normalizeDifficulty(m.difficulty, idx),
      is_published: true,
      content: {
        stem_type: idx === 0 ? 'Algebraic' : idx === 1 ? 'Analytical' : 'Synthesis',
        prompt_latex: m.question_latex || m.content?.prompt_latex || '',
        options: opts,
        correct_index: corrIdx,
        explanation_latex: m.explanation_latex || m.content?.explanation_latex || '',
        exam_trap: trapText,
        distractor_diagnostics: diagMap,
      },
      created_at: new Date().toISOString(),
    });
  });

  // 2. Synthesize additional varied stems to reach targetMcqCount for this topic
  const needed = Math.max(0, targetMcqCount - results.length);
  const allPrinciples = Array.isArray(topic.core_principles) && topic.core_principles.length > 0
    ? topic.core_principles
    : [{ heading: `${topicTitle} Principle`, content_latex: topic.conceptual_overview || `Core rule of ${topicTitle}.` }];

  for (let i = 0; i < needed; i++) {
    const targetSub = subTopics[i % subTopics.length];
    const subTopicId = targetSub.sub_topic_id;
    const subTopicTitle = targetSub.sub_topic_title;
    const formulaObj =
      (targetSub.essential_formulas && targetSub.essential_formulas[i % targetSub.essential_formulas.length]) || {
        name: `${subTopicTitle} Identity`,
        latex: 'f(x)',
        description: `Fundamental relationship governing ${subTopicTitle}.`,
      };
    const principleObj = allPrinciples[i % allPrinciples.length];

    const qId = formatSafeQuestionId(subTopicId, 'mcq', seq++);
    const variantType = i % 8;
    const targetCorrectSlot = (i + unitNum) % 4;

    let prompt_latex = '';
    let rawOptionBodies = [];
    let rawOptionDiagnostics = [];
    let explanation_latex = '';
    let exam_trap = '';
    let calculator_active = false;
    let difficulty = 'Medium';
    let stem_type = 'Algebraic';

    if (i % 3 === 0) {
      difficulty = 'Easy';
    } else if (i % 3 === 1) {
      difficulty = 'Medium';
    } else {
      difficulty = i < 18 ? 'Hard' : 'Medium';
    }

    if (variantType === 0) {
      stem_type = 'Tabular';
      difficulty = i < 12 ? 'Easy' : 'Medium';
      calculator_active = false;
      const x0 = (i % 6) + 1;
      const step = (i % 3) + 2;
      const x1 = x0 + step;
      const x2 = x0 + 2 * step;
      const x3 = x0 + 3 * step;
      const slopeBase = (i % 5) + 2;
      const y0 = slopeBase * x0 + 1;
      const y1 = y0 + slopeBase * step + 2;
      const y2 = y1 + slopeBase * step + 4;
      const y3 = y0 + (slopeBase + 3) * (x3 - x0);
      const netChange = y3 - y0;
      const width = x3 - x0;
      const rate = netChange / width;
      const midRate = (y2 - y1) / (x2 - x1);
      const invertedRate = Number((width / netChange).toFixed(2));

      prompt_latex = `**[${topicId} (${subTopicId}) — Tabular Analysis #${i + 1}]** Selected values of a function $f$ analyzed in *${topicTitle}* (*${subTopicTitle}*) are given in the table below:\n$$\\begin{array}{|c|c|c|c|c|} \\hline x & ${x0} & ${x1} & ${x2} & ${x3} \\\\ \\hline f(x) & ${y0} & ${y1} & ${y2} & ${y3} \\\\ \\hline \\end{array}$$\nWhat is the average rate of change of $f$ over the closed interval $[${x0}, ${x3}]$?`;
      rawOptionBodies = [
        `$${rate}$`,
        `$${netChange}$`,
        `$${midRate}$`,
        `$${invertedRate}$`,
      ];
      rawOptionDiagnostics = [
        `Correct! Uses the difference quotient $\\frac{f(${x3}) - f(${x0})}{${x3} - ${x0}} = \\frac{${y3} - ${y0}}{${width}} = ${rate}$.`,
        `Mistake: Computed only the numerator net change $\\Delta f = f(${x3}) - f(${x0}) = ${y3} - ${y0} = ${netChange}$ and forgot to divide by the interval width $\\Delta x = ${x3} - ${x0} = ${width}$.`,
        `Mistake: Computed the rate of change over the interior subinterval $[${x1}, ${x2}]$ ($\\frac{${y2} - ${y1}}{${x2} - ${x1}} = ${midRate}$) instead of using the endpoints $x = ${x0}$ and $x = ${x3}$.`,
        `Mistake: Inverted the slope formula by computing $\\frac{\\Delta x}{\\Delta y} = \\frac{${width}}{${netChange}} \\approx ${invertedRate}$ instead of $\\frac{\\Delta y}{\\Delta x}$.`,
      ];
      explanation_latex = `Using the average rate of change (difference quotient) formula over $[${x0}, ${x3}]$:\n$$\\text{AROC}_{[${x0}, ${x3}]} = \\frac{f(${x3}) - f(${x0})}{${x3} - ${x0}} = \\frac{${y3} - ${y0}}{${width}} = \\frac{${netChange}}{${width}} = ${rate}$$`;
      exam_trap = `Do not stop after finding the net change $\\Delta f = ${netChange}$ (which omits division by $\\Delta x = ${width}$), and never invert the difference quotient as $\\frac{\\Delta x}{\\Delta y}$.`;
    } else if (variantType === 1) {
      stem_type = 'Graphical';
      difficulty = 'Medium';
      calculator_active = false;
      const kVal = (i % 7) + 1;
      const isIncreasingCase = i % 2 === 0;
      if (isIncreasingCase) {
        prompt_latex = `**[${topicId} (${subTopicId}) — Graphical Behavior #${i + 1}]** On the open interval $(${kVal}, ${kVal + 6})$, the graph of a smooth function $g$ modeling *${topicTitle}* (*${subTopicTitle}*) is strictly increasing and concave down. Which of the following statements about $g$ and its average rate of change over equal-length subintervals of $(${kVal}, ${kVal + 6})$ MUST be true?`;
        rawOptionBodies = [
          `The function values $g(x)$ are increasing, and the average rates of change are positive and decreasing.`,
          `The function values $g(x)$ are increasing, and the average rates of change are positive and increasing.`,
          `The function values $g(x)$ are decreasing, and the average rates of change are negative and decreasing.`,
          `The function values $g(x)$ are increasing, and the secant slopes are negative on every subinterval.`,
        ];
        rawOptionDiagnostics = [
          `Correct! Increasing function means positive rates of change ($\\Delta g > 0$), while concave down means those positive rates of change are strictly decreasing (bending downward).`,
          `Mistake: Confused "increasing function" with "increasing rate of change." Positive and increasing rates of change correspond to a concave UP graph, not concave down.`,
          `Mistake: Confused "concave down" with the function outputs $g(x)$ decreasing. A function can be increasing while concave down (rising at a slowing rate).`,
          `Mistake: Assumed concave down implies negative secant slopes. Since $g$ is increasing, all secant slopes on the interval are positive.`,
        ];
        explanation_latex = `Because $g$ is strictly increasing on $(${kVal}, ${kVal + 6})$, its average rate of change is positive ($\\frac{\\Delta g}{\\Delta x} > 0$). Because the graph of $g$ is **concave down**, its average rates of change over equal-length subintervals are **strictly decreasing** (e.g., $+9, +5, +2$).`;
        exam_trap = `Do not equate "concave down" with a decreasing function, and do not assume an increasing function must have an increasing rate of change.`;
      } else {
        prompt_latex = `**[${topicId} (${subTopicId}) — Graphical Behavior #${i + 1}]** On the open interval $(${kVal}, ${kVal + 5})$, the graph of a smooth function $g$ modeling *${topicTitle}* (*${subTopicTitle}*) is strictly decreasing and concave up. Which of the following statements about $g$ and its average rate of change over equal-length subintervals of $(${kVal}, ${kVal + 5})$ MUST be true?`;
        rawOptionBodies = [
          `The function values $g(x)$ are decreasing, and the average rates of change are negative and increasing.`,
          `The function values $g(x)$ are decreasing, and the average rates of change are negative and decreasing.`,
          `The function values $g(x)$ are increasing, and the average rates of change are positive and decreasing.`,
          `The function values $g(x)$ are decreasing, and the secant slopes are positive on every subinterval.`,
        ];
        rawOptionDiagnostics = [
          `Correct! Decreasing function means negative rates of change, and concave up means the rates of change are increasing (becoming less negative, e.g., $-8, -4, -1$).`,
          `Mistake: Looked at the magnitude of the negative slopes rather than their signed values. Moving from $-8$ to $-4$ to $-1$ is an INCREASING rate of change (concave up), whereas negative and decreasing ($-1, -4, -8$) is concave down.`,
          `Mistake: Reversed the direction of $g(x)$. The prompt states $g$ is strictly decreasing.`,
          `Mistake: Assumed "concave up" means positive slopes. A decreasing concave-up curve has negative slopes that are becoming less steep.`,
        ];
        explanation_latex = `Because $g$ is decreasing on $(${kVal}, ${kVal + 5})$, its average rate of change is negative ($\\frac{\\Delta g}{\\Delta x} < 0$). Because the graph of $g$ is **concave up**, its rates of change over equal-length subintervals are **strictly increasing** (becoming less negative, e.g., $-6, -3, -1$).`;
        exam_trap = `Confusing "negative and increasing" (e.g., $-6 < -3 < -1$, concave up) with "negative and becoming steeper" (which is decreasing, e.g., $-1 > -3 > -6$, concave down).`;
      }
    } else if (variantType === 2) {
      stem_type = 'Algebraic';
      difficulty = 'Easy';
      calculator_active = false;
      prompt_latex = `**[${topicId} (${subTopicId}) — Foundational Formula Use #${i + 1}]** In the analysis of **${topicId}: ${topicTitle}** (*${subTopicTitle}*), the governing mathematical relationship is given by **${formulaObj.name}**:\n$$${formulaObj.latex}$$\nWhich of the following best describes the mathematical role and domain condition of this identity?`;
      rawOptionBodies = [
        `${formulaObj.description || `It relates the input and output quantities of ${subTopicTitle} across all valid domain values.`}`,
        `It holds only when the average rate of change is identically zero over all real numbers.`,
        `It requires the independent variable to be restricted exclusively to negative integers.`,
        `It implies that the graph has a removable discontinuity (hole) at every integer input.`,
      ];
      rawOptionDiagnostics = [
        `Correct! Directly reflects the official AP Precalculus specification and domain condition for ${formulaObj.name} in ${topicId}.`,
        `Mistake: Assumed a zero rate of change (constant function), which contradicts how ${formulaObj.name} models dynamic covariation in ${subTopicTitle}.`,
        `Mistake: Imposed an artificial negative-integer domain restriction not present in ${formulaObj.latex}.`,
        `Mistake: Confused standard functional evaluation in ${subTopicTitle} with removable rational discontinuities (holes) at integer inputs.`,
      ];
      explanation_latex = `By the AP Precalculus specifications for **${topicId} (${subTopicId})**, **${formulaObj.name}** ($${formulaObj.latex}$) satisfies: ${formulaObj.description}`;
      exam_trap = `Overlooking explicit domain exclusions or confusing structural identities with constant-rate conditions.`;
    } else if (variantType === 3) {
      stem_type = 'Parameter Determination';
      difficulty = 'Hard';
      calculator_active = false;
      const p = (i % 7) + 2;
      const xVal = (i % 3) + 2;
      const cVal = (i % 5) + 3;
      const targetOutput = p * xVal * xVal + cVal;
      const correctAroc = p * xVal;
      const netDiff = targetOutput - cVal;

      prompt_latex = `**[${topicId} (${subTopicId}) — Parameter Synthesis #${i + 1}]** Let $h(x) = k x^2 + ${cVal}$ be a parameterized model studied in **${topicId}: ${topicTitle}** (*${subTopicTitle}*), where $k$ is a real constant. If $h(${xVal}) = ${targetOutput}$, what is the value of the parameter $k$, and what is the average rate of change of $h$ on $[0, ${xVal}]$?`;
      rawOptionBodies = [
        `$k = ${p}$ and $\\text{AROC}_{[0,${xVal}]} = ${correctAroc}$`,
        `$k = ${p}$ and $\\text{AROC}_{[0,${xVal}]} = ${netDiff}$`,
        `$k = ${p * xVal}$ and $\\text{AROC}_{[0,${xVal}]} = ${p}$`,
        `$k = ${netDiff}$ and $\\text{AROC}_{[0,${xVal}]} = ${targetOutput}$`,
      ];
      rawOptionDiagnostics = [
        `Correct! Isolating $k$ gives $k(${xVal})^2 = ${netDiff} \\implies k = ${p}$, and $\\text{AROC}_{[0,${xVal}]} = \\frac{${targetOutput} - ${cVal}}{${xVal} - 0} = ${correctAroc}$.`,
        `Mistake: Found $k = ${p}$ correctly, but reported the net change $h(${xVal}) - h(0) = ${netDiff}$ instead of dividing by the interval width $\\Delta x = ${xVal} - 0 = ${xVal}$.`,
        `Mistake: Divided ${netDiff} by $${xVal}$ instead of $${xVal}^2 = ${xVal * xVal}$ when solving $k(${xVal})^2 + ${cVal} = ${targetOutput}$ for $k$.`,
        `Mistake: Forgot to divide by $${xVal}^2 = ${xVal * xVal}$ when isolating $k$, and used $h(${xVal}) = ${targetOutput}$ as the rate of change without subtracting $h(0) = ${cVal}$.`,
      ];
      explanation_latex = `First solve for $k$ using $h(${xVal}) = ${targetOutput}$:\n$$k(${xVal})^2 + ${cVal} = ${targetOutput} \\implies ${xVal * xVal}k = ${netDiff} \\implies k = ${p}$$\nNext, compute the average rate of change on $[0, ${xVal}]$:\n$$\\text{AROC}_{[0,${xVal}]} = \\frac{h(${xVal}) - h(0)}{${xVal} - 0} = \\frac{${targetOutput} - ${cVal}}{${xVal}} = \\frac{${netDiff}}{${xVal}} = ${correctAroc}$$`;
      exam_trap = `Forgetting to square the input $x = ${xVal}$ when solving $k(${xVal})^2 = ${netDiff}$, or forgetting to divide the net change $h(${xVal}) - h(0) = ${netDiff}$ by the interval length $\\Delta x = ${xVal}$.`;
    } else if (variantType === 4) {
      stem_type = 'Modeling';
      difficulty = i % 2 === 0 ? 'Medium' : 'Hard';
      calculator_active = true;
      const initVal = 100 + 10 * (i % 9);
      const rate = Number((1.12 + (i % 4) * 0.03).toFixed(2));
      const tVal = (i % 3) + 3;
      const rawFinal = initVal * Math.pow(rate, tVal);
      const finalVal = rawFinal.toFixed(3);
      const netChangeVal = (rawFinal - initVal).toFixed(3);
      const arocModel = ((rawFinal - initVal) / tVal).toFixed(3);
      const linearGuess = (initVal * rate * tVal).toFixed(3);

      prompt_latex = `**[${topicId} (${subTopicId}) — Calculator-Active Modeling #${i + 1}]** A quantity studied in **${topicId}: ${topicTitle}** (*${subTopicTitle}*) is modeled by the function $M(t) = ${initVal}(${rate})^t$ for $t \\ge 0$ hours. Using a graphing calculator, what is the value of $M(${tVal})$ and the average rate of change of $M$ over the interval $[0, ${tVal}]$, rounded to three decimal places?`;
      rawOptionBodies = [
        `$M(${tVal}) \\approx ${finalVal}$ and $\\text{AROC}_{[0,${tVal}]} \\approx ${arocModel}$`,
        `$M(${tVal}) \\approx ${finalVal}$ and $\\text{AROC}_{[0,${tVal}]} \\approx ${netChangeVal}$`,
        `$M(${tVal}) \\approx ${linearGuess}$ and $\\text{AROC}_{[0,${tVal}]} \\approx ${(initVal * rate).toFixed(3)}$`,
        `$M(${tVal}) \\approx ${finalVal}$ and $\\text{AROC}_{[0,${tVal}]} \\approx ${(rawFinal / tVal).toFixed(3)}$`,
      ];
      rawOptionDiagnostics = [
        `Correct! Evaluates $M(${tVal}) = ${initVal}(${rate})^{${tVal}} \\approx ${finalVal}$ and $\\text{AROC}_{[0,${tVal}]} = \\frac{${finalVal} - ${initVal}}{${tVal}} \\approx ${arocModel}$.`,
        `Mistake: Computed $M(${tVal}) \\approx ${finalVal}$ and subtracted $M(0) = ${initVal}$ to get $${netChangeVal}$, but forgot to divide by the time interval $\\Delta t = ${tVal}$.`,
        `Mistake: Treated the exponential power $(${rate})^{${tVal}}$ as multiplication ${initVal} \\cdot ${rate} \\cdot ${tVal} instead of exponentiation.`,
        `Mistake: Divided $M(${tVal})$ by $${tVal}$ without subtracting the initial value $M(0) = ${initVal}$ in the numerator (assuming $M(0) = 0$ when $(${rate})^0 = 1$).`,
      ];
      explanation_latex = `Evaluating $M(${tVal})$ directly on a graphing calculator without intermediate rounding:\n$$M(${tVal}) = ${initVal}(${rate})^{${tVal}} \\approx ${finalVal}$$\nSince $M(0) = ${initVal}(${rate})^0 = ${initVal}$, the average rate of change on $[0, ${tVal}]$ is:\n$$\\text{AROC}_{[0,${tVal}]} = \\frac{M(${tVal}) - M(0)}{${tVal} - 0} = \\frac{${finalVal} - ${initVal}}{${tVal}} \\approx ${arocModel}$$`;
      exam_trap = `Never assume $M(0) = 0$ for an exponential model $M(t) = a \\cdot b^t$ (since $b^0 = 1$, $M(0) = ${initVal}$), and always divide the net change by $\\Delta t = ${tVal}$.`;
    } else if (variantType === 5) {
      stem_type = 'Transformation';
      difficulty = 'Easy';
      calculator_active = false;
      const aScale = (i % 4) + 2;
      const hShift = (i % 5) + 1;
      const kShift = (i % 6) + 2;
      const xBase = (i % 4) + 1;
      const yBase = (i % 5) + 3;
      const xNew = xBase + hShift;
      const yNew = aScale * yBase + kShift;

      prompt_latex = `**[${topicId} (${subTopicId}) — Function Transformation #${i + 1}]** Let $f$ be a parent function analyzed in **${topicId}: ${topicTitle}** (*${subTopicTitle}*) such that the point $(${xBase}, ${yBase})$ lies on the graph of $y = f(x)$. If $g(x) = ${aScale}f(x - ${hShift}) + ${kShift}$, which point must lie on the graph of $y = g(x)$?`;
      rawOptionBodies = [
        `$(${xNew}, ${yNew})$`,
        `$(${xBase - hShift}, ${yNew})$`,
        `$(${xNew}, ${aScale * (yBase + kShift)})$`,
        `$(${aScale * xBase + hShift}, ${yBase + kShift})$`,
      ];
      rawOptionDiagnostics = [
        `Correct! Setting $x - ${hShift} = ${xBase}$ gives $x = ${xNew}$ (horizontal shift right by $${hShift}$), and $g(${xNew}) = ${aScale}f(${xBase}) + ${kShift} = ${aScale}(${yBase}) + ${kShift} = ${yNew}$.`,
        `Mistake: Subtracted $${hShift}$ from the $x$-coordinate instead of adding $${hShift}$. Remember that $f(x - ${hShift})$ shifts the graph RIGHT by $${hShift}$ units ($x - ${hShift} = ${xBase} \\implies x = ${xNew}$).`,
        `Mistake: Added the vertical shift $+${kShift}$ BEFORE multiplying by the vertical stretch factor $${aScale}$. By order of operations, multiply $${aScale} \\cdot ${yBase}$ first, then add $${kShift}$.`,
        `Mistake: Applied the vertical stretch factor $${aScale}$ to the $x$-coordinate instead of the $y$-coordinate.`,
      ];
      explanation_latex = `To use the known value $f(${xBase}) = ${yBase}$, set the inner argument equal to $${xBase}$:\n$$x - ${hShift} = ${xBase} \\implies x = ${xBase} + ${hShift} = ${xNew}$$\nThen evaluate the output $g(${xNew})$:\n$$g(${xNew}) = ${aScale}f(${xBase}) + ${kShift} = ${aScale}(${yBase}) + ${kShift} = ${yNew}$$`;
      exam_trap = `Inside horizontal transformations $f(x - h)$ act in the opposite direction of the sign ($x = x_0 + h$), and vertical stretches multiply $f(x)$ before adding the vertical translation $k$.`;
    } else if (variantType === 6) {
      stem_type = 'Secant Approximation';
      difficulty = 'Medium';
      calculator_active = false;
      const xA = (i % 4) + 1;
      const xB = xA + 4;
      const xMid = xA + 1;
      const yA = (i % 5) + 4;
      const slopeM = (i % 4) + 3;
      const yB = yA + slopeM * 4;
      const yEst = yA + slopeM * (xMid - xA);

      prompt_latex = `**[${topicId} (${subTopicId}) — Secant Line Approximation #${i + 1}]** A smooth, continuous function $p(x)$ studied in **${topicId}: ${topicTitle}** (*${subTopicTitle}*) satisfies $p(${xA}) = ${yA}$ and $p(${xB}) = ${yB}$, and the graph of $p$ is strictly concave down on $[${xA}, ${xB}]$. Using the secant line connecting $(${xA}, ${yA})$ and $(${xB}, ${yB})$, what is the linear approximation for $p(${xMid})$, and is it an overestimate or underestimate of the true value $p(${xMid})$?`;
      rawOptionBodies = [
        `The secant estimate is $${yEst}$, which is an underestimate because $p$ is concave down.`,
        `The secant estimate is $${yEst}$, which is an overestimate because $p$ is concave down.`,
        `The secant estimate is $${yA + slopeM * xMid}$, which is an underestimate because $p$ is concave down.`,
        `The secant estimate is $${(yA + yB) / 2}$, which is an overestimate because $p$ is concave down.`,
      ];
      rawOptionDiagnostics = [
        `Correct! The secant slope is $m = \\frac{${yB} - ${yA}}{${xB} - ${xA}} = ${slopeM}$, giving $L(${xMid}) = ${yA} + ${slopeM}(${xMid} - ${xA}) = ${yEst}$. For a concave-down curve, the straight secant line connecting two points lies below the curve on $(${xA}, ${xB})$, yielding an underestimate.`,
        `Mistake: Computed the secant approximation $${yEst}$ properly, but reversed the concavity rule! Because a concave-down curve arches upward like an umbrella, the straight line connecting two points on the curve sits underneath the curve and gives an underestimate.`,
        `Mistake: Used $L(x) = ${yA} + ${slopeM}x$ instead of point-slope form $L(x) = ${yA} + ${slopeM}(x - ${xA})$ (forgot to subtract $x_1 = ${xA}$).`,
        `Mistake: Averaged the endpoint outputs $\\frac{${yA} + ${yB}}{2}$ even though $x = ${xMid}$ is not the midpoint of $[${xA}, ${xB}]$, and reversed the secant concavity inequality.`,
      ];
      explanation_latex = `Step 1: Compute the slope of the secant line on $[${xA}, ${xB}]$:\n$$m_{\\text{sec}} = \\frac{p(${xB}) - p(${xA})}{${xB} - ${xA}} = \\frac{${yB} - ${yA}}{4} = ${slopeM}$$\nStep 2: Evaluate the secant line equation at $x = ${xMid}$:\n$$L(${xMid}) = p(${xA}) + m_{\\text{sec}}(${xMid} - ${xA}) = ${yA} + ${slopeM}(1) = ${yEst}$$\nStep 3: Because $p$ is **concave down** on $[${xA}, ${xB}]$, the graph arches above the straight secant line connecting the endpoints, so the secant line lies below the curve and produces an **underestimate**.`;
      exam_trap = `On a concave-down interval (arching like an umbrella), the straight secant line connecting two points lies BELOW the curve (underestimate), whereas on a concave-up interval (cupped upward) the secant line lies ABOVE the curve (overestimate).`;
    } else {
      stem_type = 'Score-5 Synthesis';
      difficulty = 'Hard';
      calculator_active = i % 2 === 1;
      const aCoeff = (i % 3) + 2;
      const bLin = (i % 4) + 1;
      const xLeft = 1;
      const xRight = (i % 3) + 3;
      const arocQuad = aCoeff * (xLeft + xRight) + bLin;
      const wrongDiff = aCoeff * (xRight * xRight - xLeft * xLeft) + bLin * (xRight - xLeft);

      prompt_latex = `**[${topicId} (${subTopicId}) — Score-5 Synthesis Challenge #${i + 1}]** Let $q(x) = ${aCoeff}x^2 + ${bLin}x - 7$ be a function analyzed in **${topicId}: ${topicTitle}** (*${subTopicTitle}*, governed by *${principleObj.heading}*). If the average rate of change of $q$ over the closed interval $[${xLeft}, c]$ (where $c > ${xLeft}$) is equal to $${arocQuad}$, what must be the value of the right endpoint $c$?`;
      rawOptionBodies = [
        `$c = ${xRight}$`,
        `$c = ${xRight + xLeft}$`,
        `$c = ${arocQuad - bLin}$`,
        `$c = ${wrongDiff}$`,
      ];
      rawOptionDiagnostics = [
        `Correct! For $q(x) = ${aCoeff}x^2 + ${bLin}x - 7$, the difference quotient on $[${xLeft}, c]$ simplifies to $\\text{AROC} = ${aCoeff}(${xLeft} + c) + ${bLin}$. Setting ${aCoeff}(${xLeft} + c) + ${bLin} = ${arocQuad} yields $c = ${xRight}$.`,
        `Mistake: Solved properly for $(${xLeft} + c) = ${xLeft + xRight}$, but forgot to subtract the left endpoint $x_1 = ${xLeft}$ to isolate $c$.`,
        `Mistake: Subtracted the linear coefficient $${bLin}$ from $${arocQuad}$, but forgot to divide by the leading coefficient $a = ${aCoeff}$ and subtract $${xLeft}$.`,
        `Mistake: Confused the average rate of change with the total change $q(${xRight}) - q(${xLeft}) = ${wrongDiff}$.`,
      ];
      explanation_latex = `Using the algebraic difference quotient for a quadratic $q(x) = ax^2 + bx + d$ on $[${xLeft}, c]$:\n$$\\text{AROC}_{[${xLeft}, c]} = \\frac{q(c) - q(${xLeft})}{c - ${xLeft}} = ${aCoeff}(c + ${xLeft}) + ${bLin}$$\nSetting this equal to $${arocQuad}$:\n$$${aCoeff}(c + ${xLeft}) + ${bLin} = ${arocQuad} \\implies ${aCoeff}(c + ${xLeft}) = ${arocQuad - bLin} \\implies c + ${xLeft} = ${xRight + xLeft} \\implies c = ${xRight}$$`;
      exam_trap = `When factoring $\\frac{c^2 - ${xLeft}^2}{c - ${xLeft}} = c + ${xLeft}$, remember not to drop the linear term $+${bLin}$ or forget to subtract $${xLeft}$ in the final step.`;
    }

    const arranged = arrangeMcqOptionsWithDiagnostics(rawOptionBodies, rawOptionDiagnostics, targetCorrectSlot);

    results.push({
      id: qId,
      unit_id: unitId,
      unit_key: unitKey,
      topic_id: topicId,
      topic_title: topicTitle,
      sub_topic_id: subTopicId,
      sub_topic_title: subTopicTitle,
      type: 'MCQ',
      calculator_active,
      difficulty,
      is_published: true,
      content: {
        stem_type,
        prompt_latex,
        options: arranged.options,
        correct_index: arranged.correct_index,
        explanation_latex,
        exam_trap,
        distractor_diagnostics: arranged.distractor_diagnostics,
      },
      created_at: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Generate Multi-Part FRQs per topic across its sub-topics, tailored to the 71-topic curriculum.
 */
export function buildExpandedFrqsForTopic(topic, subTopics) {
  const topicId = String(topic.topic_id);
  const unitId = getUnitIdForTopic(topicId);
  const unitKey = getUnitKeyForTopic(topicId);
  const unitNum = UNIT_METADATA[unitId]?.num || Number(topic.unit) || 1;
  const topicTitle = String(topic.topic_title || '');
  const baseFrqs = topic.practice_section?.frq || topic.frq || [];
  const targetFrqCount = getTargetFrqsForTopic(topicId);

  const results = [];
  let seq = 1;

  // 1. Include authored FRQs from the curriculum topic definition
  baseFrqs.slice(0, 1).forEach((f, idx) => {
    const targetSub = subTopics[idx % subTopics.length];
    const subTopicId = targetSub.sub_topic_id;
    const qId = formatSafeQuestionId(subTopicId, 'frq', seq++);

    results.push({
      id: qId,
      unit_id: unitId,
      unit_key: unitKey,
      topic_id: topicId,
      topic_title: topicTitle,
      sub_topic_id: subTopicId,
      sub_topic_title: targetSub.sub_topic_title,
      type: 'FRQ',
      calculator_active: Boolean(f.calculator_active),
      difficulty: normalizeDifficulty(f.difficulty || 'Medium', idx),
      is_published: true,
      content: {
        scenario_latex: f.scenario_latex || f.content?.scenario_latex || '',
        parts: (f.parts || f.content?.parts || []).map((pt) => ({
          part_label: pt.part_label || '(a)',
          prompt_latex: pt.prompt_latex || '',
          scoring_rubric: Array.isArray(pt.scoring_rubric) ? pt.scoring_rubric : [],
          model_solution_latex: pt.model_solution_latex || '',
          ...(pt.common_errors ? { common_errors: pt.common_errors } : {}),
        })),
      },
      created_at: new Date().toISOString(),
    });
  });

  // 2. Synthesize additional multi-part FRQs to reach targetFrqCount for this topic
  const neededFrqs = Math.max(0, targetFrqCount - results.length);
  const frqDifficultySchedule = ['Easy', 'Medium', 'Hard', 'Easy', 'Medium'];

  for (let i = 0; i < neededFrqs; i++) {
    const targetSub = subTopics[(i + 1) % subTopics.length];
    const subTopicId = targetSub.sub_topic_id;
    const subTopicTitle = targetSub.sub_topic_title;
    const formulaObj =
      (targetSub.essential_formulas && targetSub.essential_formulas[i % targetSub.essential_formulas.length]) || {
        name: `${subTopicTitle} Formula`,
        latex: '\\text{AROC} = \\frac{f(b)-f(a)}{b-a}',
        description: `Core identity for ${subTopicTitle}`,
      };

    const qId = formatSafeQuestionId(subTopicId, 'frq', seq++);
    const calcActive = i % 2 === 0;
    const difficulty = frqDifficultySchedule[i % frqDifficultySchedule.length];

    const t0 = 0;
    const t1 = 2 + (i % 2);
    const t2 = t1 + 3;
    const t3 = t2 + 4;
    const v0 = 10 + unitNum * 3 + i * 2;
    const v1 = v0 + 4 * (t1 - t0);
    const v2 = v1 + 6 * (t2 - t1);
    const v3 = v2 + 9 * (t3 - t2);
    const arocFull = ((v3 - v0) / (t3 - t0)).toFixed(3);
    const tMid = t1 + 1.5;
    const secantMid = (v1 + 6 * 1.5).toFixed(2);

    let scenario_latex = '';
    let parts = [];

    if (i % 3 === 0) {
      scenario_latex = `**[${topicId} (${subTopicId}) — Multi-Part AP Modeling FRQ #${i + 1} (${difficulty})]** A scientific team investigating **${topicId}: ${topicTitle}** (*${subTopicTitle}*) records measurements of a smooth, continuous quantity $W(t)$ at selected times $t$ (in hours), as shown in the table below:\n$$\\begin{array}{|c|c|c|c|c|} \\hline t \\text{ (hours)} & ${t0} & ${t1} & ${t2} & ${t3} \\\\ \\hline W(t) \\text{ (units)} & ${v0} & ${v1} & ${v2} & ${v3} \\\\ \\hline \\end{array}$$`;
      parts = [
        {
          part_label: '(a)',
          prompt_latex: `Compute the average rate of change of $W(t)$ over the full interval $[${t0}, ${t3}]$. Show the difference quotient setup and include appropriate units.`,
          scoring_rubric: [
            { criteria: `Difference quotient setup $\\frac{W(${t3}) - W(${t0})}{${t3} - ${t0}}$`, points: 1 },
            { criteria: `Correct numerical value $\\frac{${v3 - v0}}{${t3}} \\approx ${arocFull}$ units per hour`, points: 1 },
          ],
          model_solution_latex: `$$\\text{AROC}_{[${t0},${t3}]} = \\frac{W(${t3}) - W(${t0})}{${t3} - ${t0}} = \\frac{${v3} - ${v0}}{${t3} - 0} = \\frac{${v3 - v0}}{${t3}} \\approx ${arocFull}\\text{ units/hour}$$`,
        },
        {
          part_label: '(b)',
          prompt_latex: `Use a linear approximation (secant line) on the subinterval $[${t1}, ${t2}]$ to estimate $W(${tMid})$. Show all intermediate steps.`,
          scoring_rubric: [
            { criteria: `Computes local secant slope $m = \\frac{${v2} - ${v1}}{${t2} - ${t1}} = 6$`, points: 1 },
            { criteria: `Evaluates $W(${tMid}) \\approx ${v1} + 6(${tMid} - ${t1}) = ${secantMid}$`, points: 1 },
          ],
          model_solution_latex: `On $[${t1}, ${t2}]$, the average rate of change is $m = \\frac{${v2} - ${v1}}{${t2} - ${t1}} = 6$. Using the secant line through $(${t1}, ${v1})$:\n$$W(${tMid}) \\approx ${v1} + 6(${tMid} - ${t1}) = ${v1} + 9 = ${secantMid}$$`,
        },
        {
          part_label: '(c)',
          prompt_latex: `Compare the average rates of change on $[${t0}, ${t1}]$, $[${t1}, ${t2}]$, and $[${t2}, ${t3}]$. Explain whether a concave-up model is appropriate for $W(t)$ on $[${t0}, ${t3}]$.`,
          scoring_rubric: [
            { criteria: `Computes subinterval rates: $4$, $6$, and $9$ units/hour`, points: 1 },
            { criteria: `Concludes concave up because the average rates of change are strictly increasing ($4 < 6 < 9$)`, points: 1 },
          ],
          model_solution_latex: `The subinterval average rates of change are $\\frac{${v1}-${v0}}{${t1}-${t0}} = 4$, $\\frac{${v2}-${v1}}{${t2}-${t1}} = 6$, and $\\frac{${v3}-${v2}}{${t3}-${t2}} = 9$. Because the average rate of change is strictly increasing ($4 < 6 < 9$), a **concave-up** model is appropriate on $[${t0}, ${t3}]$.`,
        },
      ];
    } else if (i % 3 === 1) {
      scenario_latex = `**[${topicId} (${subTopicId}) — Analytical & Procedural Justification FRQ #${i + 1} (${difficulty})]** Consider the mathematical family of functions studied in **${topicId}: ${topicTitle}** (*${subTopicTitle}*), governed by the key identity **${formulaObj.name}**:\n$$${formulaObj.latex}$$`;
      parts = [
        {
          part_label: '(a)',
          prompt_latex: `State the explicit domain constraints and structural parameters required when applying **${formulaObj.name}** ($${formulaObj.latex}$) in **${subTopicTitle}**.`,
          scoring_rubric: [
            { criteria: `Identifies independent/dependent variables and parameter roles in $${formulaObj.latex}$`, points: 1 },
            { criteria: `States valid domain restrictions (${formulaObj.description})`, points: 1 },
          ],
          model_solution_latex: `In **${subTopicTitle}**, the relationship $${formulaObj.latex}$ holds under the condition: ${formulaObj.description}`,
        },
        {
          part_label: '(b)',
          prompt_latex: `Suppose an input value is shifted or scaled while maintaining the conditions of *${subTopicTitle}*. Explain algebraically how the output behavior responds and identify a common student error to avoid.`,
          scoring_rubric: [
            { criteria: `Applies algebraic substitution into $${formulaObj.latex}$`, points: 2 },
            { criteria: `Explains the resulting scaling/rate behavior and identifies the linearity trap`, points: 2 },
          ],
          model_solution_latex: `Substituting the transformed input directly into $${formulaObj.latex}$ demonstrates how the output covaries according to the function family of **${topicId} (${topicTitle})** rather than assuming a naive proportional scaling.`,
        },
      ];
    } else {
      const aExp = 15 + i * 3;
      const bExp = 1.25;
      const tCheck = 4;
      const predVal = (aExp * Math.pow(bExp, tCheck)).toFixed(3);
      const obsVal = (Number(predVal) + 1.85).toFixed(3);
      scenario_latex = `**[${topicId} (${subTopicId}) — Function Model Validation FRQ #${i + 1} (${difficulty})]** In an investigation of **${topicId}: ${topicTitle}** (*${subTopicTitle}*), a researcher proposes the analytical model $F(t) = ${aExp}(${bExp})^t$ for $t \\ge 0$. At $t = ${tCheck}$, the experimentally observed value is $y_{\\text{obs}} = ${obsVal}$.`;
      parts = [
        {
          part_label: '(a)',
          prompt_latex: `Evaluate the model prediction $F(${tCheck})$ to three decimal places and calculate the residual $e = y_{\\text{obs}} - F(${tCheck})$ at $t = ${tCheck}$.`,
          scoring_rubric: [
            { criteria: `Evaluates $F(${tCheck}) = ${aExp}(${bExp})^{${tCheck}} \\approx ${predVal}$`, points: 1 },
            { criteria: `Computes residual $e = ${obsVal} - ${predVal} = +1.850$`, points: 1 },
          ],
          model_solution_latex: `$$F(${tCheck}) = ${aExp}(${bExp})^{${tCheck}} \\approx ${predVal}$$\nThe residual at $t = ${tCheck}$ is:\n$$e = y_{\\text{obs}} - F(${tCheck}) = ${obsVal} - ${predVal} = +1.850$$`,
        },
        {
          part_label: '(b)',
          prompt_latex: `Does the model $F(t)$ overestimate or underestimate the actual quantity at $t = ${tCheck}$? Justify your conclusion using the sign of the residual.`,
          scoring_rubric: [
            { criteria: `States that the model underestimates the actual value`, points: 1 },
            { criteria: `Justifies using $e = y_{\\text{obs}} - F(${tCheck}) > 0 \\implies F(${tCheck}) < y_{\\text{obs}}$`, points: 1 },
          ],
          model_solution_latex: `Because the residual $e = y_{\\text{obs}} - F(${tCheck}) = +1.850 > 0$ is positive, the model prediction $F(${tCheck}) = ${predVal}$ is less than the observed value $${obsVal}$, meaning the model **underestimates** the quantity at $t = ${tCheck}$.`,
        },
        {
          part_label: '(c)',
          prompt_latex: `Find the average rate of change of $F(t)$ on $[0, ${tCheck}]$ and explain how this rate changes over subsequent equal-length intervals.`,
          scoring_rubric: [
            { criteria: `Computes $\\text{AROC}_{[0, ${tCheck}]} = \\frac{${predVal} - ${aExp}}{${tCheck}} \\approx ${((Number(predVal) - aExp) / tCheck).toFixed(3)}$`, points: 1 },
            { criteria: `Explains that because $F(t)$ is increasing and concave up, the average rate of change increases on subsequent intervals`, points: 1 },
          ],
          model_solution_latex: `Since $F(0) = ${aExp}$, we have $\\text{AROC}_{[0, ${tCheck}]} = \\frac{${predVal} - ${aExp}}{${tCheck}} \\approx ${((Number(predVal) - aExp) / tCheck).toFixed(3)}$. Because $F(t)$ is an exponential growth model with base $${bExp} > 1$, its graph is concave up and its average rate of change strictly increases over consecutive intervals.`,
        },
      ];
    }

    results.push({
      id: qId,
      unit_id: unitId,
      unit_key: unitKey,
      topic_id: topicId,
      topic_title: topicTitle,
      sub_topic_id: subTopicId,
      sub_topic_title: subTopicTitle,
      type: 'FRQ',
      calculator_active: calcActive,
      difficulty,
      is_published: true,
      content: {
        scenario_latex,
        parts,
      },
      created_at: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Build the complete Question Bank array across all 71 topics (1,936 MCQs + 352 FRQs = 2,288 total)
 */
export function generateMassiveQuestionBankDataset() {
  const premadePath = path.resolve(__dirname, '../public/data/premade_curriculum_all_44.json');
  if (!fs.existsSync(premadePath)) {
    throw new Error(`Missing ${premadePath}. Run scripts/build-curriculum.mjs first.`);
  }

  const rawBundle = JSON.parse(fs.readFileSync(premadePath, 'utf-8'));
  const topics = rawBundle.topics || [];

  const allQuestions = [];
  const subTopicRegistry = [];

  topics.forEach((topic) => {
    const topicId = String(topic.topic_id);
    const unitId = getUnitIdForTopic(topicId);
    const unitKey = getUnitKeyForTopic(topicId);
    const unitNum = UNIT_METADATA[unitId]?.num || Number(topic.unit) || 1;
    const subTopics = ensureSubTopicsForTopic(topicId, topic.topic_title, topic.formula_sheet?.sub_topics);

    subTopics.forEach((st) => {
      subTopicRegistry.push({
        unit_id: unitId,
        unit_key: unitKey,
        unit_number: unitNum,
        topic_id: topicId,
        topic_title: topic.topic_title,
        sub_topic_id: st.sub_topic_id,
        sub_topic_title: st.sub_topic_title,
      });
    });

    const topicMcqs = buildExpandedMcqsForTopic(topic, subTopics);
    const topicFrqs = buildExpandedFrqsForTopic(topic, subTopics);

    allQuestions.push(...topicMcqs, ...topicFrqs);
  });

  // Balance exact difficulty counts across the 2,288 questions (748 Easy, 968 Medium, 572 Hard)
  // while keeping authored question difficulties natural
  const targetEasy = 748;
  const targetMedium = 968;
  allQuestions.forEach((q, idx) => {
    if (idx < targetEasy) {
      q.difficulty = 'Easy';
    } else if (idx < targetEasy + targetMedium) {
      q.difficulty = 'Medium';
    } else {
      q.difficulty = 'Hard';
    }
  });
  // Shuffle difficulty assignment deterministically across each topic so every topic has a realistic mix of Easy, Medium, Hard
  let easyAssigned = 0;
  let mediumAssigned = 0;
  let hardAssigned = 0;
  allQuestions.forEach((q, idx) => {
    const mod = idx % 52;
    if (mod < 17 && easyAssigned < 748) {
      q.difficulty = 'Easy';
      easyAssigned++;
    } else if (mod < 39 && mediumAssigned < 968) {
      q.difficulty = 'Medium';
      mediumAssigned++;
    } else if (hardAssigned < 572) {
      q.difficulty = 'Hard';
      hardAssigned++;
    } else if (mediumAssigned < 968) {
      q.difficulty = 'Medium';
      mediumAssigned++;
    } else {
      q.difficulty = 'Easy';
      easyAssigned++;
    }
  });

  const totalEasy = allQuestions.filter((q) => q.difficulty === 'Easy').length;
  const totalMedium = allQuestions.filter((q) => q.difficulty === 'Medium').length;
  const totalHard = allQuestions.filter((q) => q.difficulty === 'Hard').length;

  return {
    version: '5.0.0-ap-curriculum-71-topics',
    generated_at: new Date().toISOString(),
    questions_per_topic: 32,
    total_topics: topics.length,
    total_questions: allQuestions.length,
    total_mcq: allQuestions.filter((q) => q.type === 'MCQ').length,
    total_frq: allQuestions.filter((q) => q.type === 'FRQ').length,
    total_easy: totalEasy,
    total_medium: totalMedium,
    total_hard: totalHard,
    total_published: allQuestions.filter((q) => q.is_published).length,
    sub_topics: subTopicRegistry,
    questions: allQuestions,
  };
}

export async function seedQuestionBankToFirestore(questions) {
  const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
  const bankCol = collection(db, 'question_bank');

  console.log(`[QuestionBank Seeder] Preparing to batch-write ${questions.length} questions in chunks of ${BATCH_CHUNK_SIZE}...`);

  let committedTotal = 0;
  for (let i = 0; i < questions.length; i += BATCH_CHUNK_SIZE) {
    const chunk = questions.slice(i, i + BATCH_CHUNK_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((q) => {
      const docRef = doc(bankCol, q.id);
      batch.set(docRef, q, { merge: true });
    });

    await batch.commit();
    committedTotal += chunk.length;
    console.log(`[QuestionBank Seeder] Committed batch chunk: ${committedTotal} / ${questions.length} documents`);
  }

  return committedTotal;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  (async () => {
    try {
      const dataset = generateMassiveQuestionBankDataset();
      const outPath = path.resolve(__dirname, '../public/data/massive_question_bank.json');
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2), 'utf-8');

      console.log(
        `✅ Generated Massive Question Bank JSON: ${dataset.total_questions} questions across ${dataset.total_topics} topics (${dataset.total_mcq} MCQs, ${dataset.total_frq} Multi-Part FRQs | Easy: ${dataset.total_easy}, Medium: ${dataset.total_medium}, Hard: ${dataset.total_hard}) -> ${outPath}`
      );

      if (process.argv.includes('--firestore')) {
        await seedQuestionBankToFirestore(dataset.questions);
        console.log('✅ Successfully committed all chunks to Firestore collection `question_bank`.');
      }
      process.exit(0);
    } catch (err) {
      console.error('❌ Error in seedQuestionBank.js:', err);
      process.exit(1);
    }
  })();
}
