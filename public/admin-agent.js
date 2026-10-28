/**
 * MathPrep - Teacher Limmy Admin Studio Agent
 * Principal AP Precalculus Curriculum Architect & Live Student Preview
 * Authorized exclusively for Searsokvarkhim1@gmail.com
 */

(function () {
  'use strict';

  const ADMIN_EMAIL = 'Searsokvarkhim1@gmail.com';

  // Strict Lean AP Precalculus Curriculum Generation System Prompt
  const CURRICULUM_GENERATION_SYSTEM_PROMPT = `You are Teacher Limmy, the Principal AP Precalculus Curriculum Architect for MathPrep.
Enforce this strict, simplified 3-part content schema for every single topic (NO Roman numeral headings like "I. Overview & The Rule of Four" or "II. Algebraic Proofs, Structural Derivations", NO deep structural derivations, NO historical overviews, and NO complex academic bloat):
1. Concept Description: A brief, plain-English summary of what the concept is and why it matters.
2. Core Formula: The essential equation(s) formatted in KaTeX ($...$ inline, $$...$$ display), with variables clearly defined.
3. Simple Explanation: A direct, intuitive breakdown of how to apply the formula, using simple analogies.`;
  window.CURRICULUM_GENERATION_SYSTEM_PROMPT = CURRICULUM_GENERATION_SYSTEM_PROMPT;

  // 1. Official 71-Topic AP Precalculus Curriculum Registry (Units 1, 2A, 2B, 3, 4A, 4B)
  const AP_CURRICULUM_REGISTRY = {
    '1': [
      { id: '1.1', title: 'Change in Tandem' },
      { id: '1.2', title: 'Rates of Change' },
      { id: '1.3', title: 'Rates of Change in Linear and Quadratic Functions' },
      { id: '1.4', title: 'Polynomial Functions and Rates of Change' },
      { id: '1.5', title: 'Polynomial Functions and Complex Zeros' },
      { id: '1.6', title: 'Polynomial Functions and End Behavior' },
      { id: '1.7', title: 'Rational Functions and End Behavior' },
      { id: '1.8', title: 'Rational Functions and Zeros' },
      { id: '1.9', title: 'Rational Functions and Vertical Asymptotes' },
      { id: '1.10', title: 'Rational Functions and Holes' },
      { id: '1.11', title: 'Equivalent Representations of Polynomial and Rational Expressions' },
      { id: '1.12', title: 'Transformations of Functions' },
      { id: '1.13', title: 'Function Model Selection and Assumption Articulation' },
      { id: '1.14', title: 'Function Model Construction and Application' },
      { id: 'Unit 1 REVIEW', title: 'Unit 1 REVIEW' },
    ],
    '2A': [
      { id: '2.1', title: 'Change in Arithmetic and Geometric Sequences' },
      { id: '2.2', title: 'Change in Linear and Exponential Functions' },
      { id: '2.3', title: 'Exponential Functions' },
      { id: '2.4', title: 'Exponential Function Manipulation' },
      { id: '2.5A', title: 'Exponential Function Context and Data Modeling' },
      { id: '2.5B', title: 'Exponential Function Context and Data Modeling' },
      { id: '2.6', title: 'Competing Function Model Validation' },
      { id: '2.7A', title: 'Composition of Functions' },
      { id: '2.7B', title: 'Composition of Functions' },
      { id: '2.8', title: 'Inverse Functions' },
      { id: 'Unit 2A REVIEW', title: 'Unit 2A REVIEW' },
    ],
    '2B': [
      { id: '2.9', title: 'Logarithmic Expressions' },
      { id: '2.10', title: 'Inverses of Exponential Functions' },
      { id: '2.11', title: 'Logarithmic Functions' },
      { id: '2.12', title: 'Logarithmic Function Manipulation' },
      { id: '2.13A', title: 'Exponential and Logarithmic Equations and Inequalities' },
      { id: '2.13B', title: 'Exponential and Logarithmic Equations and Inequalities' },
      { id: '2.14', title: 'Logarithmic Function Context and Data Modeling' },
      { id: '2.15', title: 'Semi-log Plots' },
      { id: 'Unit 2B REVIEW', title: 'Unit 2B REVIEW' },
    ],
    '3': [
      { id: '3.1', title: 'Periodic Phenomena' },
      { id: '3.2', title: 'Sine, Cosine, and Tangent' },
      { id: '3.3', title: 'Sine and Cosine Function Values' },
      { id: '3.4', title: 'Sine and Cosine Function Graphs' },
      { id: '3.5', title: 'Sinusoidal Functions' },
      { id: '3.6', title: 'Sinusoidal Function Transformations' },
      { id: '3.7', title: 'Sinusoidal Function Context and Data Modeling' },
      { id: '3.8', title: 'The Tangent Function' },
      { id: '3.9', title: 'Inverse Trigonometric Functions' },
      { id: '3.10', title: 'Trigonometric Equations and Inequalities' },
      { id: '3.11', title: 'The Secant, Cosecant, and Cotangent Functions' },
      { id: '3.12', title: 'Equivalent Representations of Trigonometric Functions' },
      { id: '3.13', title: 'Trigonometry and Polar Coordinates' },
      { id: '3.14', title: 'Polar Function Graphs' },
      { id: '3.15', title: 'Rates of Change in Polar Functions' },
      { id: 'Unit 3 REVIEW', title: 'Unit 3 REVIEW' },
    ],
    '4A': [
      { id: '4.1', title: 'Parametric Functions' },
      { id: '4.2', title: 'Parametric Functions Modeling Planar Motion' },
      { id: '4.3', title: 'Parametric Functions and Rates of Change' },
      { id: '4.4', title: 'Parametrically Defined Circles and Lines' },
      { id: '4.5', title: 'Implicitly Defined Functions' },
      { id: '4.6A', title: 'Conic Sections - Parabolas' },
      { id: '4.6B', title: 'Conic Sections - Ellipses' },
      { id: '4.6C', title: 'Conic Sections - Hyperbolas' },
      { id: '4.7', title: 'Parametrization of Implicitly Defined Functions' },
      { id: 'Unit 4A REVIEW', title: 'Unit 4A REVIEW' },
    ],
    '4B': [
      { id: '4.8A', title: 'Vectors' },
      { id: '4.8B', title: 'Vectors' },
      { id: '4.9', title: 'Vector-Valued Functions' },
      { id: '4.10', title: 'Matrices' },
      { id: '4.11', title: 'The Inverse and Determinant of a Matrix' },
      { id: '4.12', title: 'Linear Transformations and Matrices' },
      { id: '4.13A', title: 'Matrices as Functions' },
      { id: '4.13B', title: 'Matrices as Functions' },
      { id: '4.14', title: 'Matrices Modeling Contexts' },
      { id: 'Unit 4B REVIEW', title: 'Unit 4B REVIEW' },
    ],
  };

  const UNIT_SECTION_KEYS = ['1', '2A', '2B', '3', '4A', '4B'];
  const TOTAL_SYLLABUS_TOPICS = UNIT_SECTION_KEYS.reduce(
    (sum, k) => sum + (AP_CURRICULUM_REGISTRY[k] ? AP_CURRICULUM_REGISTRY[k].length : 0),
    0
  ); // 71

  // State
  let activeUnit = '1';
  let activeTopicCode = '1.1';
  let activeTopicTitle = 'Change in Tandem';
  let activeTopicDocId = 'topic_1_1';
  let liveTopicContent = null;
  let stagedContent = null;
  let stagedBatchMap = new Map(); // topicCode -> normalized payload when full curriculum is staged
  let premadeCurriculumCache = null; // cached /data/premade_curriculum_all_44.json
  let isGenerating = false;
  let chatHistory = [];
  let previewActiveTab = 'lesson'; // 'lesson' | 'formulas' | 'mcq' | 'frq'

  // Raw Knowledge Vault State
  let activeVaultUnit = 'unit_1';
  const vaultKnowledgeCache = new Map();
  const VAULT_UNIT_NAMES = {
    unit_1: 'Unit 1: Polynomial & Rational Functions',
    unit_2: 'Unit 2 (2A & 2B): Exponential & Logarithmic Functions',
    unit_3: 'Unit 3: Trigonometric & Polar Functions',
    unit_4: 'Unit 4 (4A & 4B): Parameters, Vectors, Matrices',
    unit_frq: 'FRQ: Free Response Question Bank & Guidelines',
  };

  function formatUnitId(unit) {
    const str = String(unit || '1').trim();
    if (str === 'unit_frq') return 'unit_frq';
    if (str.startsWith('unit_2')) return 'unit_2';
    if (str.startsWith('unit_4')) return 'unit_4';
    if (str.startsWith('unit_')) return str;
    if (str.startsWith('2')) return 'unit_2';
    if (str.startsWith('4')) return 'unit_4';
    return `unit_${str}`;
  }

  function formatTopicDocId(topicCode) {
    return 'topic_' + String(topicCode).replace(/[^0-9A-Za-z]/g, '_');
  }

  const READ_QUOTA_KEY = 'mathprep_firestore_read_quota_exhausted';
  const WRITE_QUOTA_KEY = 'mathprep_firestore_write_quota_exhausted';

  function isQuotaError(err) {
    const msg = String(err?.message || err?.code || err || '').toLowerCase();
    return msg.includes('quota') || msg.includes('resource-exhausted') || msg.includes('resource_exhausted');
  }

  function isReadQuotaExhausted() {
    try {
      return sessionStorage.getItem(READ_QUOTA_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function isWriteQuotaExhausted() {
    try {
      return sessionStorage.getItem(WRITE_QUOTA_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function markReadQuotaExhausted() {
    try {
      sessionStorage.setItem(READ_QUOTA_KEY, '1');
    } catch (_) {}
  }

  function markWriteQuotaExhausted() {
    try {
      sessionStorage.setItem(WRITE_QUOTA_KEY, '1');
    } catch (_) {}
  }

  let firestoreSilentConfigured = false;
  function getFirestoreDb() {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
      try {
        if (!firestoreSilentConfigured && typeof firebase.firestore?.setLogLevel === 'function') {
          firebase.firestore.setLogLevel('silent');
          firestoreSilentConfigured = true;
        }
      } catch (_) {}
      try {
        const dbId = window.firebaseConfig?.firestoreDatabaseId;
        return dbId ? firebase.app().firestore(dbId) : firebase.firestore();
      } catch (e) {
        return firebase.firestore();
      }
    }
    return null;
  }

  function getAuthUser() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      return firebase.auth().currentUser;
    }
    return null;
  }

  function isAuthorizedAdmin() {
    const user = getAuthUser();
    if (!user || !user.email) return false;
    return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }

  function renderLatex(container) {
    if (!container) return;
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
          ],
          throwOnError: false,
        });
      } catch (e) {
        console.warn('KaTeX rendering note:', e);
      }
    }
  }

  function notify(msg, type = 'success') {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${msg}`);
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

  /**
   * Normalize any curriculum payload (new College Board schema or legacy schema)
   * so that `formula_sheet`, `master_lesson`, `practice_section` (mcq + frq),
   * and legacy fields (`lesson`, `practiceQuestions`, `formulas`) are all populated.
   */
  function normalizeCurriculumPayload(raw, unitNum = activeUnit, topicCode = activeTopicCode, topicTitle = activeTopicTitle) {
    if (!raw) return null;

    const code = String(raw.topic_id || raw.topicCode || topicCode);
    const cleanTitle = String(raw.topic_title || raw.title || topicTitle).replace(/^Topic\s+\d+\.\d+:\s*/i, '');
    const docId = formatTopicDocId(code);
    const uNum = Number(raw.unit || raw.unitNumber || unitNum || code.split('.')[0]) || 1;

    // 1. Formula Sheet normalization
    let subTopics = [];
    if (raw.formula_sheet && Array.isArray(raw.formula_sheet.sub_topics)) {
      subTopics = raw.formula_sheet.sub_topics.map((st, idx) => ({
        sub_topic_id: st.sub_topic_id || `${code}.${String.fromCharCode(65 + idx)}`,
        sub_topic_title: st.sub_topic_title || st.sub_topic_name || `${cleanTitle} — Part ${idx + 1}`,
        essential_formulas: Array.isArray(st.essential_formulas)
          ? st.essential_formulas.map((ef) => ({
              name: ef.name || 'Formula',
              latex: String(ef.latex || ef.formula || '').replace(/^\$\$|\$\$$/g, '').trim(),
              description: ef.description || '',
            }))
          : [],
      }));
    } else if (Array.isArray(raw.formulas) && raw.formulas.length > 0) {
      subTopics = [
        {
          sub_topic_id: `${code}.A`,
          sub_topic_title: `${cleanTitle} — Essential Formulas`,
          essential_formulas: raw.formulas.map((f, i) => {
            if (typeof f === 'string') {
              return { name: `Formula ${i + 1}`, latex: f.replace(/^\$\$|\$\$$/g, ''), description: '' };
            }
            return {
              name: f.name || `Formula ${i + 1}`,
              latex: String(f.latex || f.formula || '').replace(/^\$\$|\$\$$/g, '').trim(),
              description: f.description || '',
            };
          }),
        },
      ];
    }

    const formula_sheet = {
      topic_id: code,
      topic_name: cleanTitle,
      sub_topics: subTopics,
    };

    // 2. Master Lesson normalization (Strict Lean 3-Part Schema: Concept Description, Core Formula, Simple Explanation)
    const legacyLesson = raw.lesson || {};
    const rawMaster = raw.master_lesson || {};

    const concept_description =
      rawMaster.concept_description ||
      legacyLesson.concept_description ||
      rawMaster.conceptual_overview ||
      legacyLesson.summary ||
      legacyLesson.overview ||
      raw.summary ||
      '';

    const defaultCoreFormulaMarkdown = subTopics
      .flatMap((st) =>
        (st.essential_formulas || []).map(
          (ef) => `**${ef.name}:**\n$$${ef.latex}$$\n*Where:* ${ef.description}`
        )
      )
      .join('\n\n');

    const core_formula =
      rawMaster.core_formula ||
      legacyLesson.core_formula ||
      defaultCoreFormulaMarkdown ||
      '';

    let core_principles = [];
    if (Array.isArray(rawMaster.core_principles) && rawMaster.core_principles.length > 0) {
      core_principles = rawMaster.core_principles.map((cp, i) => ({
        heading: cp.heading || `Key Mechanic ${i + 1}`,
        content_latex: cp.content_latex || cp.content || '',
      }));
    } else if (Array.isArray(legacyLesson.keyTheorems) && legacyLesson.keyTheorems.length > 0) {
      core_principles = legacyLesson.keyTheorems.map((t, i) => ({
        heading: `Key Mechanic ${i + 1}`,
        content_latex: String(t),
      }));
    } else if (Array.isArray(legacyLesson.keyConcepts) && legacyLesson.keyConcepts.length > 0) {
      core_principles = legacyLesson.keyConcepts.map((c, i) => ({
        heading: `Key Mechanic ${i + 1}`,
        content_latex: String(c),
      }));
    }

    let worked_examples = [];
    if (Array.isArray(rawMaster.worked_examples) && rawMaster.worked_examples.length > 0) {
      worked_examples = rawMaster.worked_examples.map((we) => ({
        problem_latex: we.problem_latex || we.problem || '',
        solution_steps: Array.isArray(we.solution_steps)
          ? we.solution_steps
          : Array.isArray(we.steps)
          ? we.steps
          : [],
      }));
    } else if (legacyLesson.workedExample && typeof legacyLesson.workedExample === 'object') {
      worked_examples = [
        {
          problem_latex: legacyLesson.workedExample.problem || '',
          solution_steps: [
            ...(Array.isArray(legacyLesson.workedExample.steps) ? legacyLesson.workedExample.steps : []),
            ...(legacyLesson.workedExample.answer ? [`Final Answer: ${legacyLesson.workedExample.answer}`] : []),
          ],
        },
      ];
    }

    const defaultSimpleExplanation = [
      ...core_principles.map((cp) => `**${cp.heading}:** ${cp.content_latex}`),
      ...(worked_examples.length > 0
        ? [
            `**Step-by-Step Example:** ${worked_examples[0].problem_latex}\n` +
              (worked_examples[0].solution_steps || []).map((s, idx) => `${idx + 1}. ${s}`).join('\n'),
          ]
        : []),
    ].join('\n\n');

    const simple_explanation =
      rawMaster.simple_explanation ||
      legacyLesson.simple_explanation ||
      defaultSimpleExplanation ||
      '';

    const conceptual_overview = concept_description;

    const master_lesson = {
      concept_description,
      core_formula,
      simple_explanation,
      conceptual_overview,
      core_principles,
      worked_examples,
    };

    // 3. Practice Section (MCQ + FRQ) normalization
    const rawPractice = raw.practice_section || {};
    let mcqList = [];
    if (Array.isArray(rawPractice.mcq) && rawPractice.mcq.length > 0) {
      mcqList = rawPractice.mcq.map((q, idx) => ({
        question_id: q.question_id || `${code}_mcq_${idx + 1}`,
        sub_topic_id: q.sub_topic_id || `${code}.${idx % 2 === 0 ? 'A' : 'B'}`,
        sub_topic_title: q.sub_topic_title || '',
        calculator_active: Boolean(q.calculator_active ?? q.isCalculatorActive),
        difficulty: q.difficulty || 'AP Standard',
        question_latex: q.question_latex || q.question || q.stem || '',
        options: Array.isArray(q.options) ? q.options : Array.isArray(q.choices) ? q.choices : [],
        correct_index: typeof q.correct_index === 'number' ? q.correct_index : Number(q.correctAnswer || 0),
        explanation_latex: q.explanation_latex || q.explanation || '',
        exam_trap: q.exam_trap || q.trapExplanation || '',
      }));
    } else if (Array.isArray(raw.practiceQuestions) && raw.practiceQuestions.length > 0) {
      mcqList = raw.practiceQuestions.map((q, idx) => ({
        question_id: q.id || `${code}_mcq_${idx + 1}`,
        sub_topic_id: q.sub_topic_id || `${code}.${idx % 2 === 0 ? 'A' : 'B'}`,
        sub_topic_title: q.sub_topic_title || '',
        calculator_active: Boolean(
          q.isCalculatorActive ?? (typeof q.calculator === 'string' && q.calculator.toLowerCase().includes('req'))
        ),
        difficulty: q.difficulty || 'AP Standard',
        question_latex: q.question || q.stem || '',
        options: Array.isArray(q.options) ? q.options : Array.isArray(q.choices) ? q.choices : [],
        correct_index: typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctIndex || 0),
        explanation_latex: q.explanation || '',
        exam_trap: q.trapExplanation || '',
      }));
    }

    let frqList = [];
    if (Array.isArray(rawPractice.frq) && rawPractice.frq.length > 0) {
      frqList = rawPractice.frq.map((f, idx) => ({
        frq_id: f.frq_id || `${code}_frq_${idx + 1}`,
        sub_topic_id: f.sub_topic_id || `${code}.${idx % 2 === 0 ? 'A' : 'B'}`,
        sub_topic_title: f.sub_topic_title || '',
        difficulty: f.difficulty || 'AP Standard',
        calculator_active: Boolean(f.calculator_active),
        scenario_latex: f.scenario_latex || f.scenario || '',
        parts: Array.isArray(f.parts)
          ? f.parts.map((pt, pIdx) => ({
              part_label: pt.part_label || `(${String.fromCharCode(97 + pIdx)})`,
              prompt_latex: pt.prompt_latex || pt.prompt || '',
              scoring_rubric: Array.isArray(pt.scoring_rubric) ? pt.scoring_rubric : [],
              model_solution_latex: pt.model_solution_latex || pt.solution || '',
            }))
          : [],
      }));
    }

    const practice_section = {
      mcq: mcqList,
      frq: frqList,
    };

    // 4. Build legacy fields so Student Hub and any legacy view work automatically
    const legacyFormulas = [];
    subTopics.forEach((st) => {
      (st.essential_formulas || []).forEach((ef) => {
        legacyFormulas.push({
          name: `${ef.name} (${st.sub_topic_id})`,
          formula: `$$${ef.latex}$$`,
          description: ef.description,
        });
      });
    });

    const legacyPracticeQuestions = mcqList.map((q, idx) => ({
      id: q.question_id || `q${idx + 1}`,
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

    const firstWorked = worked_examples[0] || null;
    const rawExhaustive = raw.lesson || {};

    // Always build the strict 3-part lean conceptual_sections without Roman numeral bloat
    const leanSections = [
      {
        section_id: 'concept_description',
        title: 'Concept Description',
        body_markdown: concept_description,
      },
      {
        section_id: 'core_formula',
        title: 'Core Formula',
        body_markdown: core_formula,
      },
      {
        section_id: 'simple_explanation',
        title: 'Simple Explanation',
        body_markdown: simple_explanation,
      },
    ];

    const exhaustiveLessonBuilt = {
      reading_time_minutes: Number(rawExhaustive.reading_time_minutes) || 5,
      concept_description,
      core_formula,
      simple_explanation,
      table_of_contents: ['Concept Description', 'Core Formula', 'Simple Explanation'],
      conceptual_sections: leanSections,
      formula_theorem_vault: [],
      model_mcqs: [],
      model_frqs: [],
      synthesis_summary: '',
      // Legacy keys preserved
      title: `Topic ${code}: ${cleanTitle}`,
      summary: concept_description,
      overview: concept_description,
      keyTheorems: core_principles.map((cp) => `${cp.heading}: ${cp.content_latex}`),
      keyConcepts: core_principles.map((cp) => `${cp.heading}: ${cp.content_latex}`),
      workedExample: firstWorked
        ? {
            problem: firstWorked.problem_latex,
            steps: firstWorked.solution_steps,
            answer: firstWorked.solution_steps[firstWorked.solution_steps.length - 1] || '',
          }
        : null,
      examTip: mcqList[0]?.exam_trap || '',
    };

    return {
      topicId: docId,
      unitNumber: uNum,
      unit: uNum,
      topicCode: code,
      topic_id: code,
      topic_title: cleanTitle,
      title: `Topic ${code}: ${cleanTitle}`,
      status: raw.status || 'published',
      formula_sheet,
      master_lesson,
      practice_section,
      lesson: exhaustiveLessonBuilt,
      practiceQuestions: legacyPracticeQuestions,
      formulas: legacyFormulas,
    };
  }

  function hasPopulatedContent(data) {
    if (!data) return false;
    if (data.master_lesson && data.master_lesson.conceptual_overview) return true;
    if (data.practice_section && ((data.practice_section.mcq && data.practice_section.mcq.length > 0) || (data.practice_section.frq && data.practice_section.frq.length > 0))) return true;
    if (data.lesson && (data.lesson.summary || data.lesson.overview)) return true;
    if (Array.isArray(data.practiceQuestions) && data.practiceQuestions.length > 0) return true;
    return false;
  }

  // Fetch or get from cache raw knowledge text for a unit
  async function getRawKnowledgeForUnit(unit) {
    const unitId = formatUnitId(unit);
    if (vaultKnowledgeCache.has(unitId)) {
      return vaultKnowledgeCache.get(unitId)?.rawContent || '';
    }

    const db = getFirestoreDb();

    if (db && !isReadQuotaExhausted()) {
      try {
        const snap = await db.collection('raw_knowledge').doc(unitId).get();
        if (snap.exists) {
          const data = snap.data() || {};
          if (data.rawContent && data.rawContent.trim().length > 10) {
            vaultKnowledgeCache.set(unitId, data);
            return data.rawContent;
          }
        }
      } catch (e) {
        if (isQuotaError(e)) {
          markReadQuotaExhausted();
        }
      }
    }

    try {
      const fileRes = await fetch(`/data/vault/${unitId}.md`);
      if (fileRes.ok) {
        const text = await fileRes.text();
        if (text && text.trim().length > 20) {
          const chars = text.length;
          const words = text.trim().split(/\s+/).filter(Boolean).length;
          const unitTitle = VAULT_UNIT_NAMES[unitId] || unitId;
          const payload = {
            unitId,
            unitTitle,
            rawContent: text,
            charCount: chars,
            wordCount: words,
            lastUpdated: new Date().toISOString(),
            updatedBy: ADMIN_EMAIL,
          };
          vaultKnowledgeCache.set(unitId, payload);
          return text;
        }
      }
    } catch (err) {
      // ignore
    }

    return '';
  }

  async function updateGroundingIndicator(unit) {
    const indicator = document.getElementById('vault-grounding-indicator');
    const textEl = document.getElementById('vault-grounding-text');
    if (!indicator || !textEl) return;

    const raw = await getRawKnowledgeForUnit(unit);
    const hasNotes = raw && raw.trim().length > 20;

    if (hasNotes) {
      indicator.className =
        'px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs';
      indicator.title = 'Grounding active: Teacher Limmy references raw NotebookLM notes for this unit';
      textEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Grounded (${Math.round(raw.length / 1000)}k chars)`;
    } else {
      indicator.className =
        'px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs';
      indicator.title = 'No raw notes uploaded yet for this unit. Click to open Raw Knowledge Vault.';
      textEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Empty Vault (Click to Add)`;
    }
  }

  // Load pre-made 44-topic curriculum JSON bundle
  async function fetchPremadeCurriculumBundle() {
    if (premadeCurriculumCache && Array.isArray(premadeCurriculumCache.topics)) {
      return premadeCurriculumCache;
    }
    const res = await fetch('/data/premade_curriculum_all_44.json');
    if (!res.ok) {
      throw new Error(`Failed to load pre-made curriculum dataset (HTTP ${res.status})`);
    }
    const data = await res.json();
    premadeCurriculumCache = data;
    return data;
  }

  /**
   * BULK TRIGGER: "📚 Generate Full Pre-Made Curriculum (All Topics: Lessons, Formulas, MCQ, & FRQ)"
   * Reads the raw knowledge vault + pre-made 44-topic curriculum package, stages all 44 topics,
   * updates the Right Panel Student Preview, and presents a 1-click Batch Publish card.
   */
  window.generateFullPremadeCurriculum = async function () {
    if (!isAuthorizedAdmin()) {
      notify('Access restricted to Searsokvarkhim1@gmail.com', 'error');
      return;
    }

    const genBtn = document.getElementById('btn-generate-full-curriculum');
    const pubBtn = document.getElementById('btn-publish-full-curriculum');
    if (genBtn) {
      genBtn.disabled = true;
      genBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> <span>Synthesizing All 44 Topics (Lessons, Formulas, MCQ & FRQ)...</span>`;
    }

    try {
      // Ensure Raw Knowledge Vault is loaded/grounded
      await Promise.all([
        getRawKnowledgeForUnit(1),
        getRawKnowledgeForUnit(2),
        getRawKnowledgeForUnit(3),
        getRawKnowledgeForUnit(4),
        getRawKnowledgeForUnit('unit_frq'),
      ]);

      const bundle = await fetchPremadeCurriculumBundle();
      const topics = bundle.topics || [];

      stagedBatchMap.clear();
      let totalMcq = 0;
      let totalFrq = 0;
      let totalFormulas = 0;

      topics.forEach((rawTopic) => {
        const norm = normalizeCurriculumPayload(rawTopic, rawTopic.unit, rawTopic.topic_id, rawTopic.topic_title);
        if (norm) {
          stagedBatchMap.set(norm.topicCode, norm);
          totalMcq += norm.practice_section?.mcq?.length || 0;
          totalFrq += norm.practice_section?.frq?.length || 0;
          (norm.formula_sheet?.sub_topics || []).forEach((st) => {
            totalFormulas += st.essential_formulas?.length || 0;
          });
        }
      });

      // Stage the currently selected topic in the right-hand preview
      if (stagedBatchMap.has(activeTopicCode)) {
        stagedContent = stagedBatchMap.get(activeTopicCode);
      }

      if (pubBtn) {
        pubBtn.classList.remove('hidden');
        pubBtn.classList.add('flex');
        pubBtn.innerHTML = `<span>✅ Publish All ${stagedBatchMap.size} Staged Topics to Firestore</span>`;
      }

      // Switch to Studio view if currently in Vault view
      window.switchAdminView('studio');
      renderRightPanelPreview();

      // Append summary & interactive Batch Proposal Card in Teacher Limmy Chat
      const summaryMarkdown =
        `🎓 **Full Pre-Made AP Precalculus Curriculum Generated & Staged!**\n\n` +
        `I have synthesized the complete, College Board–aligned curriculum across **all 6 Unit Sections (${stagedBatchMap.size} Topics)** grounded in your Raw Knowledge Vault:\n` +
        `- **Unit 1 (Topics 1.1–1.14 + Review):** 15 Polynomial & Rational Function modules\n` +
        `- **Unit 2A (Topics 2.1–2.8 + Review):** 11 Exponential, Composition & Inverse Function modules\n` +
        `- **Unit 2B (Topics 2.9–2.15 + Review):** 9 Logarithmic Function & Semi-log Plot modules\n` +
        `- **Unit 3 (Topics 3.1–3.15 + Review):** 16 Trigonometric, Sinusoidal & Polar modules\n` +
        `- **Unit 4A (Topics 4.1–4.7 + Review):** 10 Parametric, Implicit & Conic Section modules\n` +
        `- **Unit 4B (Topics 4.8A–4.14 + Review):** 10 Vector & Matrix Transformation modules\n\n` +
        `**Total Staged Assets:** **${stagedBatchMap.size} Master Lessons**, **${totalFormulas} Essential LaTeX Formulas**, **${totalMcq} AP MCQs** (with calculator flags & exam traps), and **${totalFrq} Multi-Part AP FRQs** (with official scoring rubrics).\n\n` +
        `Switch between any Unit/Topic above and click the **Master Lesson**, **Formula Sheet**, **Practice: MCQ**, and **Practice: FRQ** tabs on the right to inspect any topic, or click **Accept & Batch Publish All ${stagedBatchMap.size} Topics to Firestore** below!`;

      appendBatchProposalMessage(summaryMarkdown, {
        totalTopics: stagedBatchMap.size,
        totalFormulas,
        totalMcq,
        totalFrq,
        sampleTopic: stagedContent,
      });

      notify(`Staged all ${stagedBatchMap.size} AP Precalculus topics (${totalMcq} MCQs & ${totalFrq} FRQs)!`, 'success');
    } catch (err) {
      console.error('Error generating full pre-made curriculum:', err);
      notify(`Failed to stage full curriculum: ${err.message || err}`, 'error');
    } finally {
      if (genBtn) {
        genBtn.disabled = false;
        genBtn.innerHTML = `<span>📚 Generate Full Pre-Made Curriculum (All Topics: Lessons, Formulas, MCQ, & FRQ)</span>`;
      }
    }
  };

  /**
   * Load Pre-Made Curriculum Package for ONLY the currently selected sub-unit
   */
  window.loadPremadeForCurrentTopic = async function () {
    if (!isAuthorizedAdmin()) {
      notify('Access restricted to Searsokvarkhim1@gmail.com', 'error');
      return;
    }

    try {
      const bundle = await fetchPremadeCurriculumBundle();
      const found = (bundle.topics || []).find((t) => String(t.topic_id) === String(activeTopicCode));
      if (!found) {
        notify(`No pre-made package found for Topic ${activeTopicCode}.`, 'warning');
        return;
      }

      const norm = normalizeCurriculumPayload(found, activeUnit, activeTopicCode, activeTopicTitle);
      stagedContent = norm;

      appendChatMessage(
        'assistant',
        `📦 Loaded the pre-made College Board curriculum package for **Topic ${activeTopicCode}: ${activeTopicTitle}** (Formula Sheet, Master Lesson, ${norm.practice_section.mcq.length} AP MCQs, and ${norm.practice_section.frq.length} Multi-Part FRQ). Inspect the 4 tabs in the right-hand preview or click **Accept & Publish to Firestore** below!`,
        stagedContent
      );

      renderRightPanelPreview();
      notify(`Staged pre-made curriculum for Topic ${activeTopicCode}!`, 'success');
    } catch (err) {
      console.error('Error loading pre-made topic:', err);
      notify(`Could not load pre-made topic: ${err.message || err}`, 'error');
    }
  };

  /**
   * BATCH PUBLISH ALL 44 STAGED TOPICS TO FIRESTORE (`curriculum/{topicDocId}`)
   */
  window.publishFullPremadeCurriculum = async function () {
    if (!isAuthorizedAdmin()) {
      notify('Unauthorized: Searsokvarkhim1@gmail.com required to publish.', 'error');
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      notify('Firestore connection unavailable.', 'error');
      return;
    }

    if (stagedBatchMap.size === 0) {
      await window.generateFullPremadeCurriculum();
    }

    const pubBtn = document.getElementById('btn-publish-full-curriculum');
    const cardPubBtn = document.getElementById('btn-batch-card-publish');
    if (pubBtn) {
      pubBtn.disabled = true;
      pubBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> <span>Publishing ${stagedBatchMap.size} Topics to Firestore...</span>`;
    }
    if (cardPubBtn) {
      cardPubBtn.disabled = true;
      cardPubBtn.innerHTML = `<span>⏳ Committing ${stagedBatchMap.size} Topics to Firestore...</span>`;
    }

    try {
      const batch = db.batch();
      const nowIso = new Date().toISOString();
      let count = 0;

      stagedBatchMap.forEach((topicPayload) => {
        const docId = formatTopicDocId(topicPayload.topicCode);
        const ref = db.collection('curriculum').doc(docId);
        const finalDoc = {
          ...topicPayload,
          topicId: docId,
          status: 'published',
          lastUpdated: nowIso,
          publishedBy: ADMIN_EMAIL,
        };
        batch.set(ref, finalDoc, { merge: true });
        count++;
      });

      if (!isWriteQuotaExhausted()) {
        await batch.commit();
      }

      if (stagedBatchMap.has(activeTopicCode)) {
        liveTopicContent = {
          ...stagedBatchMap.get(activeTopicCode),
          status: 'published',
          lastUpdated: nowIso,
        };
      }
      stagedContent = null;
      stagedBatchMap.clear();
      hideProposalCard();

      if (pubBtn) {
        pubBtn.classList.add('hidden');
        pubBtn.classList.remove('flex');
      }

      renderRightPanelPreview();
      initializeSkeletalCurriculum();

      appendChatMessage(
        'assistant',
        `✅ **All ${count} AP Precalculus Topics Published Live!**\n\nEvery sub-unit across **Units 1–4B** now has its Dedicated Formula Sheet, Master Lesson, AP Multiple-Choice Questions, and Multi-Part Free-Response Questions live.`
      );
      notify(`Successfully published all ${count} AP Precalculus topics!`, 'success');
    } catch (err) {
      if (isQuotaError(err)) {
        markWriteQuotaExhausted();
        notify('Saved locally! (Firestore daily free write quota reached; local curriculum bundle is active.)', 'info');
      } else {
        console.error('Error batch publishing curriculum:', err);
        notify(`Failed to batch publish curriculum: ${err.message || err}`, 'error');
      }
    } finally {
      if (pubBtn) {
        pubBtn.disabled = false;
        pubBtn.innerHTML = `<span>✅ Publish All ${TOTAL_SYLLABUS_TOPICS} Staged Topics to Firestore</span>`;
      }
      if (cardPubBtn) {
        cardPubBtn.disabled = false;
        cardPubBtn.innerHTML = `<span>✅ Accept & Batch Publish All ${TOTAL_SYLLABUS_TOPICS} Topics to Firestore</span>`;
      }
    }
  };

  function appendBatchProposalMessage(markdownText, stats) {
    const feed = document.getElementById('teacher-limmy-chat-feed');
    if (!feed) return;

    hideProposalCard();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3 text-xs leading-relaxed justify-start animate-fade-in';
    msgDiv.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
        TL
      </div>
      <div class="max-w-[90%] space-y-3">
        <div class="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-2xs text-slate-800 math-content limmy-message">
          ${formatMessageText(markdownText)}
        </div>
        <div class="proposal-card bg-indigo-50/80 border-2 border-indigo-300 rounded-2xl p-4 shadow-xs space-y-3" id="proposal-card-box">
          <div class="flex items-center justify-between border-b border-indigo-200 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-sm">📚</span>
              <span class="font-bold text-xs text-indigo-950">Full AP Precalculus Curriculum Batch (${stats.totalTopics} Topics)</span>
            </div>
            <span class="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
              All 4 Units Staged
            </span>
          </div>

          <div class="grid grid-cols-4 gap-2 text-[11px]">
            <div class="bg-white p-2 rounded-lg border border-indigo-200/70">
              <span class="block text-slate-500 font-medium">Master Lessons</span>
              <span class="font-bold text-slate-900">${stats.totalTopics} Topics</span>
            </div>
            <div class="bg-white p-2 rounded-lg border border-indigo-200/70">
              <span class="block text-slate-500 font-medium">Formula Sheet</span>
              <span class="font-bold text-slate-900">${stats.totalFormulas} Formulas</span>
            </div>
            <div class="bg-white p-2 rounded-lg border border-indigo-200/70">
              <span class="block text-slate-500 font-medium">AP Practice MCQs</span>
              <span class="font-bold text-slate-900">${stats.totalMcq} Questions</span>
            </div>
            <div class="bg-white p-2 rounded-lg border border-indigo-200/70">
              <span class="block text-slate-500 font-medium">Multi-Part FRQs</span>
              <span class="font-bold text-slate-900">${stats.totalFrq} FRQs + Rubrics</span>
            </div>
          </div>

          <div class="pt-1">
            <button
              type="button"
              onclick="window.toggleProposalRawJson()"
              class="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              🔍 Inspect Active Topic (${escapeHtml(activeTopicCode)}) Raw JSON Schema
            </button>
            <div id="proposal-raw-json" class="hidden mt-2 p-3 bg-slate-950 rounded-xl text-slate-200 font-mono text-[10px] max-h-52 overflow-y-auto border border-slate-800">
              <pre class="whitespace-pre-wrap">${escapeHtml(JSON.stringify(stats.sampleTopic || {}, null, 2))}</pre>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-200">
            <button
              id="btn-batch-card-publish"
              type="button"
              onclick="window.publishFullPremadeCurriculum()"
              class="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>✅ Accept & Batch Publish All ${stats.totalTopics} Topics to Firestore</span>
            </button>
            <button
              type="button"
              onclick="window.acceptAndPublishProposal()"
              class="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Publish only the currently previewed topic"
            >
              <span>📌 Publish Topic ${escapeHtml(activeTopicCode)} Only</span>
            </button>
            <button
              type="button"
              onclick="window.discardProposal()"
              class="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <span>❌ Discard</span>
            </button>
          </div>
        </div>
      </div>
    `;

    feed.appendChild(msgDiv);
    renderLatex(msgDiv);
    feed.scrollTop = feed.scrollHeight;
  }

  // Switch between Studio, Question Bank Hub, Raw Knowledge Vault, and Payment Approvals views
  window.switchAdminView = function (mode) {
    const studioView = document.getElementById('admin-view-studio');
    const vaultView = document.getElementById('admin-view-vault');
    const bankView = document.getElementById('admin-view-bank');
    const paymentsView = document.getElementById('admin-view-payments');
    const btnStudio = document.getElementById('btn-admin-view-studio');
    const btnVault = document.getElementById('btn-admin-view-vault');
    const btnBank = document.getElementById('btn-admin-view-bank');
    const btnPayments = document.getElementById('btn-admin-view-payments');

    if (studioView) studioView.classList.add('hidden');
    if (vaultView) vaultView.classList.add('hidden');
    if (bankView) bankView.classList.add('hidden');
    if (paymentsView) paymentsView.classList.add('hidden');
    if (btnStudio) btnStudio.classList.remove('active');
    if (btnVault) btnVault.classList.remove('active');
    if (btnBank) btnBank.classList.remove('active');
    if (btnPayments) btnPayments.classList.remove('active');

    if (mode === 'vault') {
      if (vaultView) vaultView.classList.remove('hidden');
      if (btnVault) btnVault.classList.add('active');

      const vaultSelect = document.getElementById('vault-unit-select');
      const targetUnitId = `unit_${activeUnit}`;
      if (vaultSelect && targetUnitId !== activeVaultUnit) {
        vaultSelect.value = targetUnitId;
        activeVaultUnit = targetUnitId;
      }
      loadVaultContent(activeVaultUnit);
    } else if (mode === 'bank') {
      if (bankView) bankView.classList.remove('hidden');
      if (btnBank) btnBank.classList.add('active');
      if (typeof window.initQuestionBankHub === 'function') {
        window.initQuestionBankHub();
      }
    } else if (mode === 'payments') {
      if (paymentsView) paymentsView.classList.remove('hidden');
      if (btnPayments) btnPayments.classList.add('active');
    } else {
      if (studioView) studioView.classList.remove('hidden');
      if (btnStudio) btnStudio.classList.add('active');
      updateGroundingIndicator(activeUnit);
    }
  };

  // Load Vault content for a given unitId into the editor UI
  async function loadVaultContent(unitId, forceReload = false) {
    const textarea = document.getElementById('vault-raw-text');
    const statusBadge = document.getElementById('vault-status-badge');
    const charCountEl = document.getElementById('vault-char-count');
    const wordCountEl = document.getElementById('vault-word-count');
    const lastUpdatedEl = document.getElementById('vault-last-updated');
    const liveCounter = document.getElementById('vault-live-counter');

    if (statusBadge) {
      statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 animate-pulse';
      statusBadge.textContent = 'Fetching Firestore...';
    }

    const db = getFirestoreDb();
    let data = null;

    if (!forceReload && vaultKnowledgeCache.has(unitId)) {
      data = vaultKnowledgeCache.get(unitId);
    } else if (db && !isReadQuotaExhausted()) {
      try {
        const snap = await db.collection('raw_knowledge').doc(unitId).get();
        if (snap.exists) {
          const docData = snap.data();
          if (docData && docData.rawContent && docData.rawContent.trim().length > 10) {
            data = docData;
            vaultKnowledgeCache.set(unitId, data);
          }
        }
      } catch (err) {
        if (isQuotaError(err)) {
          markReadQuotaExhausted();
        }
      }
    }

    if (!data || !data.rawContent) {
      try {
        const fileRes = await fetch(`/data/vault/${unitId}.md`);
        if (fileRes.ok) {
          const seedText = await fileRes.text();
          if (seedText && seedText.trim().length > 20) {
            const chars = seedText.length;
            const words = seedText.trim().split(/\s+/).filter(Boolean).length;
            const unitTitle = VAULT_UNIT_NAMES[unitId] || unitId;
            data = {
              unitId,
              unitTitle,
              rawContent: seedText,
              charCount: chars,
              wordCount: words,
              lastUpdated: new Date().toISOString(),
              updatedBy: ADMIN_EMAIL,
            };
            vaultKnowledgeCache.set(unitId, data);
          }
        }
      } catch (e) {
        console.warn('Could not read seed vault file:', e);
      }
    }

    if (data && data.rawContent) {
      const content = data.rawContent;
      if (textarea) textarea.value = content;
      const chars = content.length;
      const words = content.trim().split(/\s+/).filter(Boolean).length;

      if (charCountEl) charCountEl.textContent = `${chars.toLocaleString()} chars`;
      if (wordCountEl) wordCountEl.textContent = `~${words.toLocaleString()} words`;
      if (liveCounter) liveCounter.textContent = `${chars.toLocaleString()} characters`;
      if (lastUpdatedEl) {
        const dateStr = data.lastUpdated
          ? new Date(data.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Recently';
        lastUpdatedEl.textContent = dateStr;
      }
      if (statusBadge) {
        statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        statusBadge.textContent = '✅ Saved in Firestore';
      }
    } else {
      if (textarea) textarea.value = '';
      if (charCountEl) charCountEl.textContent = '0 chars';
      if (wordCountEl) wordCountEl.textContent = '0 words';
      if (liveCounter) liveCounter.textContent = '0 characters';
      if (lastUpdatedEl) lastUpdatedEl.textContent = 'Never';
      if (statusBadge) {
        statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300';
        statusBadge.textContent = '⚠️ Not Uploaded Yet';
      }
    }

    updateGroundingIndicator(activeUnit);
  }

  // Sync all 5 unit seed notes into Firestore
  window.syncAllRawNotesToFirestore = async function (silent = false) {
    if (!isAuthorizedAdmin()) {
      if (!silent) notify('Unauthorized: Searsokvarkhim1@gmail.com required to save.', 'error');
      return false;
    }

    const db = getFirestoreDb();
    if (!db) {
      if (!silent) notify('Firestore connection unavailable.', 'error');
      return false;
    }

    const syncBtn = document.getElementById('vault-sync-all-btn');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> <span>Syncing to Firestore...</span>`;
    }

    try {
      const units = ['unit_1', 'unit_2', 'unit_3', 'unit_4', 'unit_frq'];
      const batch = db.batch();
      let totalSyncedChars = 0;

      for (const uId of units) {
        let content = vaultKnowledgeCache.get(uId)?.rawContent;
        if (!content) {
          try {
            const res = await fetch(`/data/vault/${uId}.md`);
            if (res.ok) content = await res.text();
          } catch (e) {}
        }

        if (content && content.trim().length > 10) {
          const chars = content.length;
          const words = content.trim().split(/\s+/).filter(Boolean).length;
          const unitTitle = VAULT_UNIT_NAMES[uId] || uId;
          const payload = {
            unitId: uId,
            unitTitle: unitTitle,
            rawContent: content,
            charCount: chars,
            wordCount: words,
            lastUpdated: new Date().toISOString(),
            updatedBy: ADMIN_EMAIL,
          };
          batch.set(db.collection('raw_knowledge').doc(uId), payload, { merge: true });
          vaultKnowledgeCache.set(uId, payload);
          totalSyncedChars += chars;
        }
      }

      if (!isWriteQuotaExhausted()) {
        await batch.commit();
      }

      loadVaultContent(activeVaultUnit);
      updateGroundingIndicator(activeUnit);

      if (!silent) {
        notify(`Successfully stored all 5 unit notebooks (${totalSyncedChars.toLocaleString()} chars)!`, 'success');
      }
      return true;
    } catch (err) {
      if (isQuotaError(err)) {
        markWriteQuotaExhausted();
        if (!silent) notify('Raw notes cached locally (Firestore daily free write quota reached).', 'info');
        return true;
      }
      console.error('Error syncing seed notes to Firestore:', err);
      if (!silent) notify(`Failed to sync notes: ${err.message || err}`, 'error');
      return false;
    } finally {
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<span>🚀 Sync All 5 Units to Firestore</span>`;
      }
    }
  };

  async function saveVaultContent() {
    if (!isAuthorizedAdmin()) {
      notify('Unauthorized: Searsokvarkhim1@gmail.com required to save.', 'error');
      return;
    }

    const textarea = document.getElementById('vault-raw-text');
    const saveBtn = document.getElementById('vault-save-btn');
    const content = (textarea ? textarea.value : '').trim();

    if (!content) {
      notify('Please enter or drop raw text before saving.', 'warning');
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      notify('Firestore connection unavailable.', 'error');
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> <span>Saving to Firestore...</span>`;
    }

    try {
      const chars = content.length;
      const words = content.split(/\s+/).filter(Boolean).length;
      const unitTitle = VAULT_UNIT_NAMES[activeVaultUnit] || activeVaultUnit;
      const payload = {
        unitId: activeVaultUnit,
        unitTitle: unitTitle,
        rawContent: content,
        charCount: chars,
        wordCount: words,
        lastUpdated: new Date().toISOString(),
        updatedBy: ADMIN_EMAIL,
      };

      vaultKnowledgeCache.set(activeVaultUnit, payload);
      if (!isWriteQuotaExhausted()) {
        await db.collection('raw_knowledge').doc(activeVaultUnit).set(payload, { merge: true });
      }

      notify(`Saved raw knowledge for ${unitTitle} (${chars.toLocaleString()} chars)!`, 'success');
      loadVaultContent(activeVaultUnit);
    } catch (err) {
      if (isQuotaError(err)) {
        markWriteQuotaExhausted();
        notify('Saved in local session cache (Firestore daily free write quota reached).', 'info');
      } else {
        console.error('Error saving raw knowledge:', err);
        notify(`Failed to save raw knowledge: ${err.message || err}`, 'error');
      }
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<span>💾 Save Raw Knowledge to Firestore</span>`;
      }
    }
  }

  window.deleteAllRawKnowledgeFromFirestore = async function (silent = false) {
    if (!isAuthorizedAdmin()) {
      if (!silent) notify('Unauthorized: Searsokvarkhim1@gmail.com required to delete.', 'error');
      return false;
    }

    const db = getFirestoreDb();
    if (!db) {
      if (!silent) notify('Firestore connection unavailable.', 'error');
      return false;
    }

    const deleteBtn = document.getElementById('vault-delete-all-btn');
    if (deleteBtn) {
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-rose-500/30 border-t-rose-600 rounded-full animate-spin"></span> <span>Deleting from Firestore...</span>`;
    }

    try {
      if (!isWriteQuotaExhausted()) {
        const batch = db.batch();
        if (!isReadQuotaExhausted()) {
          try {
            const snap = await db.collection('raw_knowledge').get();
            snap.forEach((doc) => {
              batch.delete(doc.ref);
            });
          } catch (err) {
            if (isQuotaError(err)) markReadQuotaExhausted();
          }
        }

        const knownKeys = ['unit_1', 'unit_2', 'unit_3', 'unit_4', 'unit_frq'];
        knownKeys.forEach((key) => {
          batch.delete(db.collection('raw_knowledge').doc(key));
        });

        await batch.commit();
      }
      vaultKnowledgeCache.clear();

      const textarea = document.getElementById('vault-raw-text');
      const charCountEl = document.getElementById('vault-char-count');
      const wordCountEl = document.getElementById('vault-word-count');
      const liveCounter = document.getElementById('vault-live-counter');
      const lastUpdatedEl = document.getElementById('vault-last-updated');
      const statusBadge = document.getElementById('vault-status-badge');

      if (textarea) textarea.value = '';
      if (charCountEl) charCountEl.textContent = '0 chars';
      if (wordCountEl) wordCountEl.textContent = '0 words';
      if (liveCounter) liveCounter.textContent = '0 characters';
      if (lastUpdatedEl) lastUpdatedEl.textContent = 'Never';
      if (statusBadge) {
        statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300';
        statusBadge.textContent = '⚠️ Not Uploaded Yet';
      }

      updateGroundingIndicator(activeUnit);
      if (!silent) {
        notify('All raw notes and knowledge records have been permanently deleted from Firebase Firestore.', 'success');
      }
      return true;
    } catch (err) {
      console.error('Error deleting all raw knowledge:', err);
      if (!silent) notify(`Failed to delete raw knowledge: ${err.message || err}`, 'error');
      return false;
    } finally {
      if (deleteBtn) {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = `<span>🗑️ Purge All Notes from Firestore</span>`;
      }
    }
  };

  function handleVaultFileIngestion(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const textarea = document.getElementById('vault-raw-text');
      if (textarea) {
        textarea.value = text;
        const chars = text.length;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const charCountEl = document.getElementById('vault-char-count');
        const wordCountEl = document.getElementById('vault-word-count');
        const liveCounter = document.getElementById('vault-live-counter');
        const statusBadge = document.getElementById('vault-status-badge');

        if (charCountEl) charCountEl.textContent = `${chars.toLocaleString()} chars`;
        if (wordCountEl) wordCountEl.textContent = `~${words.toLocaleString()} words`;
        if (liveCounter) liveCounter.textContent = `${chars.toLocaleString()} characters (Unsaved)`;
        if (statusBadge) {
          statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse';
          statusBadge.textContent = '⚠️ Unsaved File Loaded';
        }
        notify(`Ingested ${file.name} (${chars.toLocaleString()} chars). Click 'Save Raw Knowledge' to commit to Firestore!`, 'info');
      }
    };
    reader.readAsText(file);
  }

  // Verify All 71 Official Topics from local pre-made bundle without automatic Firestore batch writes on startup
  async function initializeSkeletalCurriculum() {
    const statsBadge = document.getElementById('teacher-limmy-stats-badge');
    if (statsBadge) {
      statsBadge.textContent = `6 Unit Sections · ${TOTAL_SYLLABUS_TOPICS} Topics (${TOTAL_SYLLABUS_TOPICS} Populated)`;
    }
  }

  // Load topic content from Firestore (merged with premade Question Bank items so all MCQs & FRQs are always present)
  async function loadActiveTopicData() {
    const db = getFirestoreDb();
    activeTopicDocId = formatTopicDocId(activeTopicCode);

    // If bulk staging is active, load this topic from stagedBatchMap; otherwise clear single-topic staging
    if (stagedBatchMap.has(activeTopicCode)) {
      stagedContent = stagedBatchMap.get(activeTopicCode);
    } else {
      stagedContent = null;
      hideProposalCard();
    }

    const titleEl = document.getElementById('preview-topic-title');
    const topicDisplayLabel = String(activeTopicCode).includes('REVIEW')
      ? activeTopicCode
      : `Topic ${activeTopicCode}: ${activeTopicTitle}`;
    if (titleEl) titleEl.textContent = `Unit ${activeUnit} · ${topicDisplayLabel}`;

    let premadeNormalized = null;
    try {
      const bundle = await fetchPremadeCurriculumBundle();
      const found = (bundle.topics || []).find((t) => String(t.topic_id) === String(activeTopicCode));
      if (found) {
        premadeNormalized = normalizeCurriculumPayload(found, activeUnit, activeTopicCode, activeTopicTitle);
      }
    } catch (e) {
      premadeNormalized = null;
    }

    let loadedFromFirestore = null;
    if (db && !isReadQuotaExhausted()) {
      try {
        const docSnap = await db.collection('curriculum').doc(activeTopicDocId).get();
        if (docSnap.exists) {
          const rawDoc = docSnap.data();
          if (hasPopulatedContent(rawDoc)) {
            loadedFromFirestore = normalizeCurriculumPayload(rawDoc, activeUnit, activeTopicCode, activeTopicTitle);
          }
        }
      } catch (err) {
        if (isQuotaError(err)) {
          markReadQuotaExhausted();
        }
      }
    }

    if (loadedFromFirestore && premadeNormalized) {
      const mcqMap = new Map();
      (premadeNormalized.practice_section?.mcq || []).forEach((q, idx) => {
        mcqMap.set(q.question_id || `m_${idx}`, q);
      });
      (loadedFromFirestore.practice_section?.mcq || []).forEach((q, idx) => {
        const id = q.question_id || `lm_${idx}`;
        if (!mcqMap.has(id)) mcqMap.set(id, q);
      });

      const frqMap = new Map();
      (premadeNormalized.practice_section?.frq || []).forEach((f, idx) => {
        frqMap.set(f.frq_id || `f_${idx}`, f);
      });
      (loadedFromFirestore.practice_section?.frq || []).forEach((f, idx) => {
        const id = f.frq_id || `lf_${idx}`;
        if (!frqMap.has(id)) frqMap.set(id, f);
      });

      liveTopicContent = {
        ...premadeNormalized,
        ...loadedFromFirestore,
        lesson: loadedFromFirestore.lesson?.conceptual_sections?.length
          ? loadedFromFirestore.lesson
          : premadeNormalized.lesson,
        practice_section: {
          mcq: Array.from(mcqMap.values()),
          frq: Array.from(frqMap.values()),
        },
      };
    } else {
      liveTopicContent = loadedFromFirestore || premadeNormalized || null;
    }

    renderRightPanelPreview();
    updateGroundingIndicator(activeUnit);
  }

  function populateTopicDropdown(unitKey) {
    const topicSelect = document.getElementById('teacher-limmy-topic-select');
    if (!topicSelect) return;

    topicSelect.innerHTML = '';
    const key = String(unitKey || '1');
    const topics = AP_CURRICULUM_REGISTRY[key] || AP_CURRICULUM_REGISTRY['1'] || [];

    topics.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = String(t.id).includes('REVIEW') ? t.id : `Topic ${t.id}: ${t.title}`;
      if (t.id === activeTopicCode) opt.selected = true;
      topicSelect.appendChild(opt);
    });
  }

  /**
   * Render Right Panel Live Student-Facing Preview across all 4 divided tabs:
   * - 'lesson': Master Lesson (Conceptual Overview, Core Principles, Step-by-Step Worked Examples)
   * - 'formulas': Dedicated Formula Sheet per Sub-Topic
   * - 'mcq': Multiple-Choice Questions (Part A / Part B calculator badges, interactive check, exam trap)
   * - 'frq': Free-Response Questions (Multi-part scenario, interactive scoring rubric & model solution)
   */
  function renderRightPanelPreview() {
    const container = document.getElementById('student-preview-content');
    const badge = document.getElementById('preview-status-badge');
    if (!container) return;

    const rawDisplay = stagedContent || liveTopicContent;
    const isPopulated = hasPopulatedContent(rawDisplay);
    const dataToDisplay = isPopulated
      ? normalizeCurriculumPayload(rawDisplay, activeUnit, activeTopicCode, activeTopicTitle)
      : null;

    // Update Tab Button Counts if data is available
    const btnLesson = document.getElementById('btn-preview-tab-lesson');
    const btnFormulas = document.getElementById('btn-preview-tab-formulas');
    const btnMcq = document.getElementById('btn-preview-tab-mcq');
    const btnFrq = document.getElementById('btn-preview-tab-frq');

    if (dataToDisplay) {
      const mcqCount = dataToDisplay.practice_section?.mcq?.length || 0;
      const frqCount = dataToDisplay.practice_section?.frq?.length || 0;
      let fCount = 0;
      (dataToDisplay.formula_sheet?.sub_topics || []).forEach((st) => {
        fCount += st.essential_formulas?.length || 0;
      });
      if (btnLesson) btnLesson.textContent = `📖 Master Lesson`;
      if (btnFormulas) btnFormulas.textContent = `📐 Formula Sheet (${fCount})`;
      if (btnMcq) btnMcq.textContent = `📝 Practice: MCQ (${mcqCount})`;
      if (btnFrq) btnFrq.textContent = `✍️ Practice: FRQ (${frqCount})`;
    } else {
      if (btnLesson) btnLesson.textContent = `📖 Master Lesson`;
      if (btnFormulas) btnFormulas.textContent = `📐 Formula Sheet`;
      if (btnMcq) btnMcq.textContent = `📝 Practice: MCQ`;
      if (btnFrq) btnFrq.textContent = `✍️ Practice: FRQ`;
    }

    if (badge) {
      if (stagedContent) {
        badge.className =
          'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 animate-pulse';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> ${
          stagedBatchMap.size > 0 ? `Staged in Full Batch (${stagedBatchMap.size} Topics)` : 'Staged Proposal (In-Memory Draft)'
        }`;
      } else if (isPopulated) {
        badge.className =
          'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Published Live in Firestore`;
      } else {
        badge.className =
          'px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400"></span> Skeletal Sub-Unit (Unpopulated)`;
      }
    }

    if (!dataToDisplay) {
      container.innerHTML = `
        <div class="p-8 text-center space-y-4 max-w-lg mx-auto my-10 bg-white rounded-2xl border border-dashed border-slate-300">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
            📐
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900">Skeletal Unit Container (Topic ${escapeHtml(activeTopicCode)})</h4>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This sub-unit has its title and topic ID registered, but no Master Lesson, Formula Sheet, MCQs, or FRQs have been published yet.
            </p>
          </div>
          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onclick="window.loadPremadeForCurrentTopic()"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              📦 Load Pre-Made Package for Topic ${escapeHtml(activeTopicCode)}
            </button>
            <button
              onclick="window.generateFullPremadeCurriculum()"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              📚 Generate All 44 Topics
            </button>
          </div>
        </div>
      `;
      return;
    }

    // TAB 1: MASTER LESSON (LEAN 3-PART SCHEMA: CONCEPT DESCRIPTION, CORE FORMULA, SIMPLE EXPLANATION)
    if (previewActiveTab === 'lesson') {
      if (
        typeof window.renderExhaustiveTextbookChapter === 'function' &&
        dataToDisplay.lesson &&
        Array.isArray(dataToDisplay.lesson.conceptual_sections) &&
        dataToDisplay.lesson.conceptual_sections.length > 0
      ) {
        window.renderExhaustiveTextbookChapter(dataToDisplay, container);
        return;
      }

      const ml = dataToDisplay.master_lesson || {};
      const conceptDesc = ml.concept_description || ml.conceptual_overview || '';
      const coreForm = ml.core_formula || '';
      const simpleExp = ml.simple_explanation || '';

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in p-6 bg-white rounded-xl border border-slate-200">
          <!-- Lesson Header -->
          <div class="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <span>Unit ${escapeHtml(dataToDisplay.unitNumber)}</span>
                <span>·</span>
                <span>Topic ${escapeHtml(dataToDisplay.topic_id)}</span>
                <span>·</span>
                <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">Lean Study Guide</span>
              </div>
              <h2 class="text-xl font-bold text-slate-900">Topic ${escapeHtml(dataToDisplay.topic_id)}: ${escapeHtml(dataToDisplay.topic_title)}</h2>
            </div>
          </div>

          <!-- 1. Concept Description -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">1. Concept Description</h3>
            <div class="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 math-content">
              ${escapeHtml(conceptDesc)}
            </div>
          </div>

          <!-- 2. Core Formula -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Core Formula</h3>
            <div class="text-sm text-slate-800 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 math-content">
              ${escapeHtml(coreForm)}
            </div>
          </div>

          <!-- 3. Simple Explanation -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">3. Simple Explanation</h3>
            <div class="text-sm text-slate-800 leading-relaxed bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/80 math-content">
              ${escapeHtml(simpleExp)}
            </div>
          </div>
        </div>
      `;
    }
    // TAB 2: DEDICATED FORMULA SHEET
    else if (previewActiveTab === 'formulas') {
      const subTopics = dataToDisplay.formula_sheet?.sub_topics || [];

      container.innerHTML = `
        <div class="space-y-5 animate-fade-in">
          <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900">📐 Dedicated Formula Sheet — Topic ${escapeHtml(dataToDisplay.topic_id)}: ${escapeHtml(dataToDisplay.topic_title)}</h3>
              <p class="text-xs text-slate-500 mt-0.5">Essential identities, domain/range constraints, and graphical conditions organized by sub-topic</p>
            </div>
          </div>

          ${
            subTopics.length > 0
              ? subTopics
                  .map(
                    (st) => `
              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs">
                    ${escapeHtml(st.sub_topic_id)}
                  </span>
                  <h4 class="text-sm font-bold text-slate-900 math-content">${escapeHtml(st.sub_topic_title)}</h4>
                </div>

                <div class="grid grid-cols-1 gap-3">
                  ${(st.essential_formulas || [])
                    .map(
                      (ef) => `
                    <div class="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                      <div class="text-xs font-bold text-slate-900 math-content">${escapeHtml(ef.name)}</div>
                      <div class="text-sm text-blue-800 bg-white p-3 rounded-lg border border-blue-100 math-content overflow-x-auto text-center">
                        $$${escapeHtml(ef.latex)}$$
                      </div>
                      <div class="text-xs text-slate-600 leading-relaxed math-content">
                        ${escapeHtml(ef.description)}
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                  )
                  .join('')
              : `
              <div class="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                No formula sheet entries found for this topic.
              </div>
            `
          }
        </div>
      `;
    }
    // TAB 3: PRACTICE: MULTIPLE-CHOICE QUESTIONS (MCQ)
    else if (previewActiveTab === 'mcq') {
      const questions = dataToDisplay.practice_section?.mcq || [];

      if (questions.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No Multiple-Choice Questions generated yet for this topic.
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="space-y-5 animate-fade-in">
          <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900">📝 Section I: AP Multiple-Choice Questions (${questions.length} Items)</h3>
              <p class="text-xs text-slate-500 mt-0.5">Click any option (A–D) to test interactive grading, view full LaTeX derivations, and inspect common AP Exam Traps</p>
            </div>
          </div>

          <div class="space-y-4">
            ${questions
              .map(
                (q, qIdx) => `
              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5" id="preview-q-${qIdx}">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      MCQ #${qIdx + 1} (${escapeHtml(q.question_id)})
                    </span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'Hard'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }">
                      ${escapeHtml(q.difficulty || 'Medium')}
                    </span>
                  </div>
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    q.calculator_active
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }">
                    ${q.calculator_active ? '🧮 Part B: Graphing Calculator Active' : '🚫 Part A: No Calculator Allowed'}
                  </span>
                </div>

                <div class="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed math-content pt-1">
                  ${escapeHtml(q.question_latex)}
                </div>

                <!-- 4 Options (A-D) -->
                <div class="grid grid-cols-1 gap-2 pt-1">
                  ${(q.options || [])
                    .map((opt, optIdx) => {
                      const cleanOpt = String(opt).replace(/^\([A-D]\)\s*/i, '');
                      return `
                      <button
                        onclick="window.testCheckAnswer(${qIdx}, ${optIdx}, ${q.correct_index})"
                        class="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs sm:text-sm text-slate-800 transition-all flex items-start gap-3 cursor-pointer option-btn-${qIdx}"
                        id="opt-${qIdx}-${optIdx}"
                      >
                        <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-slate-300">
                          ${String.fromCharCode(65 + optIdx)}
                        </span>
                        <span class="math-content leading-relaxed">${escapeHtml(cleanOpt)}</span>
                      </button>
                    `;
                    })
                    .join('')}
                </div>

                <!-- Toggle Solution Button -->
                <div class="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onclick="window.testCheckAnswer(${qIdx}, ${q.correct_index}, ${q.correct_index})"
                    class="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    👁️ Reveal Answer & AP Exam Trap
                  </button>
                </div>

                <!-- Explanation & Exam Trap Container -->
                <div id="explanation-${qIdx}" class="hidden p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs space-y-2.5">
                  <div class="font-bold flex items-center gap-1.5 text-emerald-900">
                    <span>✓ Official Solution (Correct Answer: ${String.fromCharCode(65 + (q.correct_index || 0))}):</span>
                  </div>
                  <div class="math-content text-slate-800 leading-relaxed">${escapeHtml(q.explanation_latex)}</div>
                  ${
                    q.exam_trap
                      ? `
                    <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 math-content">
                      <strong>⚠️ Common AP Exam Trap:</strong> ${escapeHtml(q.exam_trap)}
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }
    // TAB 4: PRACTICE: FREE-RESPONSE QUESTIONS (FRQ)
    else if (previewActiveTab === 'frq') {
      const frqs = dataToDisplay.practice_section?.frq || [];

      if (frqs.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No Free-Response Questions (FRQ) found for this topic.
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="space-y-5 animate-fade-in">
          <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900">✍️ Section II: Multi-Part AP Free-Response Questions (${frqs.length} FRQ)</h3>
              <p class="text-xs text-slate-500 mt-0.5">Includes College Board scenario stem, multi-part prompts, point-by-point scoring rubrics, and complete LaTeX model solutions</p>
            </div>
          </div>

          ${frqs
            .map(
              (frq, fIdx) => `
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs">
                    FRQ #${fIdx + 1} (${escapeHtml(frq.frq_id)})
                  </span>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  frq.calculator_active
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }">
                  ${frq.calculator_active ? '🧮 Part A: Graphing Calculator Required' : '🚫 Part B: No Calculator Allowed'}
                </span>
              </div>

              <!-- Scenario Stem -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-900 leading-relaxed math-content font-medium">
                ${escapeHtml(frq.scenario_latex)}
              </div>

              <!-- FRQ Parts -->
              <div class="space-y-4">
                ${(frq.parts || [])
                  .map((pt, pIdx) => {
                    const totalPts = (pt.scoring_rubric || []).reduce((acc, r) => acc + (Number(r.points) || 0), 0);
                    const rubricId = `frq-rubric-${fIdx}-${pIdx}`;
                    return `
                    <div class="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-2.5">
                          <span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs shrink-0 mt-0.5">
                            Part ${escapeHtml(pt.part_label)}
                          </span>
                          <div class="text-xs sm:text-sm text-slate-800 leading-relaxed math-content font-medium">
                            ${escapeHtml(pt.prompt_latex)}
                          </div>
                        </div>
                        <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          ${totalPts} ${totalPts === 1 ? 'Point' : 'Points'}
                        </span>
                      </div>

                      <div class="pt-1">
                        <button
                          type="button"
                          onclick="window.toggleFrqRubric('${rubricId}')"
                          class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          📋 Show Scoring Rubric & Model Solution
                        </button>
                      </div>

                      <div id="${rubricId}" class="hidden space-y-3 pt-2 border-t border-slate-100">
                        <!-- Scoring Rubric Table -->
                        <div class="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                          <div class="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 flex items-center justify-between">
                            <span>College Board Scoring Guidelines</span>
                            <span>Points</span>
                          </div>
                          <div class="divide-y divide-slate-200/70">
                            ${(pt.scoring_rubric || [])
                              .map(
                                (rub) => `
                              <div class="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                                <span class="text-slate-800 math-content">${escapeHtml(rub.criteria)}</span>
                                <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                  +${escapeHtml(rub.points)} pt${Number(rub.points) === 1 ? '' : 's'}
                                </span>
                              </div>
                            `
                              )
                              .join('')}
                          </div>
                        </div>

                        <!-- Model Solution -->
                        <div class="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                          <div class="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Model Student Response</div>
                          <div class="text-xs sm:text-sm text-slate-800 leading-relaxed math-content">
                            ${escapeHtml(pt.model_solution_latex)}
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    renderLatex(container);
  }

  window.toggleFrqRubric = function (rubricId) {
    const el = document.getElementById(rubricId);
    if (el) {
      el.classList.toggle('hidden');
      renderLatex(el);
    }
  };

  window.testCheckAnswer = function (qIdx, chosenIdx, correctIdx) {
    const optionBtns = document.querySelectorAll(`.option-btn-${qIdx}`);
    optionBtns.forEach((btn, idx) => {
      btn.classList.remove('bg-emerald-50', 'border-emerald-500', 'text-emerald-900', 'bg-red-50', 'border-red-400', 'text-red-900');
      if (idx === correctIdx) {
        btn.classList.add('bg-emerald-50', 'border-emerald-500', 'text-emerald-900');
      } else if (idx === chosenIdx && chosenIdx !== correctIdx) {
        btn.classList.add('bg-red-50', 'border-red-400', 'text-red-900');
      }
    });

    const expEl = document.getElementById(`explanation-${qIdx}`);
    if (expEl) {
      expEl.classList.remove('hidden');
      renderLatex(expEl);
    }
  };

  // Switch Preview Tab ('lesson' | 'formulas' | 'mcq' | 'frq')
  window.switchPreviewTab = function (tab) {
    if (tab === 'practice') tab = 'mcq';
    previewActiveTab = tab;
    ['lesson', 'formulas', 'mcq', 'frq'].forEach((t) => {
      const btn = document.getElementById(`btn-preview-tab-${t}`);
      if (btn) {
        if (t === tab) {
          btn.className = 'px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer shrink-0';
        } else {
          btn.className =
            'px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer shrink-0';
        }
      }
    });
    renderRightPanelPreview();
  };

  function appendChatMessage(role, text, payload = null) {
    const feed = document.getElementById('teacher-limmy-chat-feed');
    if (!feed) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-3 text-xs leading-relaxed ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;

    if (role === 'assistant') {
      msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
          TL
        </div>
        <div class="max-w-[88%] space-y-3">
          <div class="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-2xs text-slate-800 math-content limmy-message">
            ${formatMessageText(text)}
          </div>
          ${payload ? renderProposalCardHtml(payload) : ''}
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="max-w-[85%] bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs">
          ${escapeHtml(text)}
        </div>
      `;
    }

    feed.appendChild(msgDiv);
    renderLatex(msgDiv);
    feed.scrollTop = feed.scrollHeight;
  }

  function formatMessageText(text) {
    const cleanText = String(text || '').replace(/```(?:json)?\s*[\s\S]*?```/g, '').trim();
    if (typeof marked !== 'undefined' && marked.parse) {
      try {
        return marked.parse(cleanText || text);
      } catch (e) {
        return escapeHtml(cleanText || text);
      }
    }
    return escapeHtml(cleanText || text);
  }

  function renderProposalCardHtml(payload) {
    const norm = normalizeCurriculumPayload(payload, activeUnit, activeTopicCode, activeTopicTitle);
    const mcqCount = norm?.practice_section?.mcq?.length || 0;
    const frqCount = norm?.practice_section?.frq?.length || 0;
    const principlesCount = norm?.master_lesson?.core_principles?.length || 0;
    let formulasCount = 0;
    (norm?.formula_sheet?.sub_topics || []).forEach((st) => {
      formulasCount += st.essential_formulas?.length || 0;
    });

    return `
      <div class="proposal-card bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 shadow-xs space-y-3" id="proposal-card-box">
        <div class="flex items-center justify-between border-b border-amber-200/80 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">📋</span>
            <span class="font-bold text-xs text-amber-950">Curriculum Proposal: Topic ${escapeHtml(norm?.topic_id || activeTopicCode)} — ${escapeHtml(norm?.topic_title || activeTopicTitle)}</span>
          </div>
          <span class="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
            Ready to Stage
          </span>
        </div>

        <div class="grid grid-cols-4 gap-2 text-[11px] text-amber-950">
          <div class="bg-white/80 p-2 rounded-lg border border-amber-200/60">
            <span class="block text-slate-500 font-medium">Formulas</span>
            <span class="font-bold text-slate-800">${formulasCount} LaTeX</span>
          </div>
          <div class="bg-white/80 p-2 rounded-lg border border-amber-200/60">
            <span class="block text-slate-500 font-medium">Principles</span>
            <span class="font-bold text-slate-800">${principlesCount} Core</span>
          </div>
          <div class="bg-white/80 p-2 rounded-lg border border-amber-200/60">
            <span class="block text-slate-500 font-medium">AP MCQs</span>
            <span class="font-bold text-slate-800">${mcqCount} Items</span>
          </div>
          <div class="bg-white/80 p-2 rounded-lg border border-amber-200/60">
            <span class="block text-slate-500 font-medium">AP FRQs</span>
            <span class="font-bold text-slate-800">${frqCount} Multi-Part</span>
          </div>
        </div>

        <div class="text-[11px] text-slate-600 line-clamp-2 bg-white/60 p-2 rounded-lg border border-amber-100 math-content">
          ${escapeHtml(norm?.master_lesson?.conceptual_overview || 'Complete curriculum payload ready for preview.')}
        </div>

        <div class="pt-1">
          <button
            type="button"
            onclick="window.toggleProposalRawJson()"
            class="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
          >
            🔍 Toggle Raw JSON Schema
          </button>
          <div id="proposal-raw-json" class="hidden mt-2 p-3 bg-slate-950 rounded-xl text-slate-200 font-mono text-[10px] max-h-48 overflow-y-auto border border-slate-800">
            <pre class="whitespace-pre-wrap">${escapeHtml(JSON.stringify(norm, null, 2))}</pre>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-amber-200/80">
          <button
            type="button"
            onclick="window.acceptAndPublishProposal()"
            class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>✅ Accept & Publish to Firestore</span>
          </button>
          <button
            type="button"
            onclick="window.discardProposal()"
            class="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <span>❌ Discard</span>
          </button>
        </div>
      </div>
    `;
  }

  window.toggleProposalRawJson = function () {
    const rawBox = document.getElementById('proposal-raw-json');
    if (rawBox) rawBox.classList.toggle('hidden');
  };

  function hideProposalCard() {
    const card = document.getElementById('proposal-card-box');
    if (card) card.remove();
  }

  // Call Teacher Limmy Backend Agent
  async function callTeacherLimmy(promptText) {
    if (!promptText.trim() || isGenerating) return;

    if (!isAuthorizedAdmin()) {
      notify('Access restricted to Searsokvarkhim1@gmail.com', 'warning');
      return;
    }

    isGenerating = true;
    appendChatMessage('user', promptText);

    const input = document.getElementById('teacher-limmy-chat-input');
    if (input) input.value = '';

    const sendBtn = document.getElementById('teacher-limmy-send-btn');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>`;
    }

    let rawKnowledge = '';
    try {
      rawKnowledge = await getRawKnowledgeForUnit(activeUnit);
    } catch (e) {
      console.warn('Could not retrieve raw grounding notes:', e);
    }

    const feed = document.getElementById('teacher-limmy-chat-feed');
    const thinkingId = 'thinking-indicator-' + Date.now();
    if (feed) {
      const thinkingDiv = document.createElement('div');
      thinkingDiv.id = thinkingId;
      thinkingDiv.className = 'flex gap-3 text-xs text-slate-500 items-center';
      const isGrounded = rawKnowledge && rawKnowledge.trim().length > 20;
      thinkingDiv.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">TL</div>
        <div class="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl text-slate-600">
          <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>${
            isGrounded
              ? 'Teacher Limmy is synthesizing AP curriculum grounded in NotebookLM notes...'
              : 'Teacher Limmy is formulating AP curriculum with LaTeX...'
          }</span>
        </div>
      `;
      feed.appendChild(thinkingDiv);
      feed.scrollTop = feed.scrollHeight;
    }

    try {
      const response = await fetch('/api/admin/teacher-limmy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          unit: activeUnit,
          topicId: activeTopicCode,
          topicTitle: activeTopicTitle,
          currentTopicData: stagedContent || liveTopicContent,
          history: chatHistory,
          rawKnowledge: rawKnowledge || '',
        }),
      });

      const indicator = document.getElementById(thinkingId);
      if (indicator) indicator.remove();

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Curriculum generated.';

      if (data.stagedContent) {
        stagedContent = normalizeCurriculumPayload(data.stagedContent, activeUnit, activeTopicCode, activeTopicTitle);
        appendChatMessage('assistant', reply, stagedContent);
        window.switchPreviewTab('lesson');
        notify('Staged proposal ready! Review live preview on the right.', 'success');
      } else {
        appendChatMessage('assistant', reply);
      }

      chatHistory.push({ role: 'user', content: promptText });
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      console.warn('Teacher Limmy agent request note:', err);
      const indicator = document.getElementById(thinkingId);
      if (indicator) indicator.remove();
      appendChatMessage(
        'assistant',
        `I encountered a brief network hiccup communicating with the curriculum synthesis server. You can also click **📦 Load Pre-Made Topic Package** above to stage this topic immediately!`
      );
    } finally {
      isGenerating = false;
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<span>Send</span>`;
      }
    }
  }

  window.sendPromptToTeacherLimmy = function (prompt) {
    const input = document.getElementById('teacher-limmy-chat-input');
    if (input) input.value = prompt;
    callTeacherLimmy(prompt);
  };

  // ACCEPT & PUBLISH SINGLE TOPIC TO FIRESTORE
  window.acceptAndPublishProposal = async function () {
    if (!stagedContent) {
      notify('No staged proposal to publish.', 'warning');
      return;
    }

    if (!isAuthorizedAdmin()) {
      notify('Unauthorized: Admin credentials required to publish.', 'error');
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      notify('Firebase Firestore is not initialized.', 'error');
      return;
    }

    try {
      const normalized = normalizeCurriculumPayload(stagedContent, activeUnit, activeTopicCode, activeTopicTitle);
      const publishPayload = {
        ...normalized,
        topicId: activeTopicDocId,
        status: 'published',
        lastUpdated: new Date().toISOString(),
        publishedBy: ADMIN_EMAIL,
      };

      if (!isWriteQuotaExhausted()) {
        await db.collection('curriculum').doc(activeTopicDocId).set(publishPayload, { merge: true });
      }

      liveTopicContent = publishPayload;
      stagedBatchMap.delete(activeTopicCode);
      stagedContent = null;
      if (stagedBatchMap.size === 0) {
        hideProposalCard();
        const pubBtn = document.getElementById('btn-publish-full-curriculum');
        if (pubBtn) {
          pubBtn.classList.add('hidden');
          pubBtn.classList.remove('flex');
        }
      }

      notify(`Topic ${activeTopicCode} published live! Students can now see this lesson, formula sheet, MCQs, and FRQs.`, 'success');
      appendChatMessage(
        'assistant',
        `✅ **Topic ${activeTopicCode} (${activeTopicTitle})** has been published!`
      );

      renderRightPanelPreview();
      initializeSkeletalCurriculum();
    } catch (err) {
      if (isQuotaError(err)) {
        markWriteQuotaExhausted();
        notify(`Saved Topic ${activeTopicCode} in active session (Firestore daily free write quota reached).`, 'info');
      } else {
        console.error('Error publishing to Firestore:', err);
        notify(`Failed to publish: ${err.message || err}`, 'error');
      }
    }
  };

  // DISCARD PROPOSAL
  window.discardProposal = function () {
    stagedContent = null;
    stagedBatchMap.clear();
    hideProposalCard();
    const pubBtn = document.getElementById('btn-publish-full-curriculum');
    if (pubBtn) {
      pubBtn.classList.add('hidden');
      pubBtn.classList.remove('flex');
    }
    notify('Proposal discarded. Preview reverted to current state.', 'info');
    appendChatMessage('assistant', 'Staged proposal discarded. What would you like to refine, expand, or draft next?');
    renderRightPanelPreview();
  };

  function setupAdminAgentListeners() {
    const unitSelect = document.getElementById('teacher-limmy-unit-select');
    const topicSelect = document.getElementById('teacher-limmy-topic-select');
    const chatInput = document.getElementById('teacher-limmy-chat-input');
    const sendBtn = document.getElementById('teacher-limmy-send-btn');

    if (unitSelect) {
      unitSelect.addEventListener('change', (e) => {
        activeUnit = String(e.target.value || '1');
        populateTopicDropdown(activeUnit);
        const firstTopic = (AP_CURRICULUM_REGISTRY[activeUnit] || [])[0];
        if (firstTopic) {
          activeTopicCode = firstTopic.id;
          activeTopicTitle = firstTopic.title;
        }
        loadActiveTopicData();
      });
    }

    if (topicSelect) {
      topicSelect.addEventListener('change', (e) => {
        activeTopicCode = e.target.value;
        const currentList = AP_CURRICULUM_REGISTRY[activeUnit] || [];
        const found = currentList.find((t) => t.id === activeTopicCode);
        activeTopicTitle = found ? found.title : `${activeTopicCode}`;
        loadActiveTopicData();
      });
    }

    if (sendBtn && chatInput) {
      sendBtn.addEventListener('click', () => {
        callTeacherLimmy(chatInput.value);
      });

      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          callTeacherLimmy(chatInput.value);
        }
      });
    }

    // Vault Controls
    const vaultUnitSelect = document.getElementById('vault-unit-select');
    const vaultSaveBtn = document.getElementById('vault-save-btn');
    const vaultReloadBtn = document.getElementById('vault-reload-btn');
    const vaultClearBtn = document.getElementById('vault-clear-btn');
    const vaultTextarea = document.getElementById('vault-raw-text');
    const vaultFileInput = document.getElementById('vault-file-input');
    const vaultDropzone = document.getElementById('vault-dropzone');
    const vaultLiveCounter = document.getElementById('vault-live-counter');
    const vaultCharCountEl = document.getElementById('vault-char-count');
    const vaultWordCountEl = document.getElementById('vault-word-count');

    if (vaultUnitSelect) {
      vaultUnitSelect.addEventListener('change', (e) => {
        activeVaultUnit = e.target.value;
        loadVaultContent(activeVaultUnit);
      });
    }

    if (vaultSaveBtn) {
      vaultSaveBtn.addEventListener('click', saveVaultContent);
    }

    if (vaultReloadBtn) {
      vaultReloadBtn.addEventListener('click', () => {
        loadVaultContent(activeVaultUnit, true);
        notify('Reloaded raw knowledge for ' + (VAULT_UNIT_NAMES[activeVaultUnit] || activeVaultUnit), 'info');
      });
    }

    if (vaultClearBtn) {
      vaultClearBtn.addEventListener('click', () => {
        if (vaultTextarea) vaultTextarea.value = '';
        if (vaultCharCountEl) vaultCharCountEl.textContent = '0 chars';
        if (vaultWordCountEl) vaultWordCountEl.textContent = '0 words';
        if (vaultLiveCounter) vaultLiveCounter.textContent = '0 characters (Cleared)';
        notify('Editor cleared. Click Save to persist empty vault or paste new notes.', 'info');
      });
    }

    if (vaultTextarea) {
      vaultTextarea.addEventListener('input', (e) => {
        const text = e.target.value || '';
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        if (vaultLiveCounter) vaultLiveCounter.textContent = `${chars.toLocaleString()} characters`;
        if (vaultCharCountEl) vaultCharCountEl.textContent = `${chars.toLocaleString()} chars`;
        if (vaultWordCountEl) vaultWordCountEl.textContent = `~${words.toLocaleString()} words`;
      });
    }

    if (vaultFileInput) {
      vaultFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleVaultFileIngestion(e.target.files[0]);
        }
      });
    }

    if (vaultDropzone) {
      vaultDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        vaultDropzone.classList.add('dragover');
      });

      vaultDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        vaultDropzone.classList.remove('dragover');
      });

      vaultDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        vaultDropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleVaultFileIngestion(e.dataTransfer.files[0]);
        }
      });
    }

    const vaultDeleteAllBtn = document.getElementById('vault-delete-all-btn');
    if (vaultDeleteAllBtn) {
      vaultDeleteAllBtn.addEventListener('click', () => {
        window.deleteAllRawKnowledgeFromFirestore(false);
      });
    }

    // Initial population
    populateTopicDropdown('1');
    loadActiveTopicData();
    initializeSkeletalCurriculum();
    loadVaultContent(activeVaultUnit);

    setTimeout(() => {
      appendChatMessage(
        'assistant',
        `👋 Welcome to **Teacher Limmy Admin Studio**!\n\nClick **"📚 Generate Full Pre-Made Curriculum (All Topics: Lessons, Formulas, MCQ, & FRQ)"** at the top to stage all **71 AP Precalculus topics** across Units 1, 2A, 2B, 3, 4A, and 4B at once, or select any individual sub-unit above to customize its Master Lesson, Formula Sheet, MCQs, and Multi-Part FRQs!`
      );
    }, 400);
  }

  function executeAutoSyncIfPending() {
    // Disabled automatic background Firestore writes on startup to preserve free-tier daily write quota
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAdminAgentListeners);
  } else {
    setupAdminAgentListeners();
  }

  function checkAdminRouteAccess() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#admin-studio' || hash === '#/admin-studio') {
      if (!isAuthorizedAdmin()) {
        const adminSection = document.getElementById('admin-studio');
        if (adminSection) adminSection.classList.add('hidden');
        window.location.hash = '';
        notify('Access restricted to Searsokvarkhim1@gmail.com. Redirecting to home...', 'warning');
      }
    }
  }

  window.addEventListener('hashchange', checkAdminRouteAccess);

  window.addEventListener('mathprep:admin-status', (e) => {
    if (e.detail?.isAdmin) {
      initializeSkeletalCurriculum();
      executeAutoSyncIfPending();
    } else {
      checkAdminRouteAccess();
    }
  });

  /**
   * Global Lesson Telemetry Guidance helper
   * Dispatches request_type: "LESSON_GUIDANCE" to /api/tutor
   */
  window.askLimmyLessonGuidance = async function (topicTitle, lessonContent, studentQuestion, history = []) {
    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'LESSON_GUIDANCE',
          topic_title: topicTitle,
          lesson_content: lessonContent,
          student_question: studentQuestion,
          history,
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('Error in askLimmyLessonGuidance:', err);
      return {
        reply: "Teacher Limmy ran into a temporary connection issue. Please try again!",
        request_type: 'LESSON_GUIDANCE',
        error: true,
      };
    }
  };

  window.initTeacherLimmyStudio = setupAdminAgentListeners;
})();
