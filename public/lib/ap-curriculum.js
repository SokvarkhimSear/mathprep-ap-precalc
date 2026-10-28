/**
 * Single Source of Truth: AP Precalculus Curriculum Configuration (public/lib/ap-curriculum.js)
 *
 * Includes standard topics for Units 1 and 3, splits Units 2 and 4 into A/B sections
 * (Unit 2A, Unit 2B, Unit 4A, Unit 4B), breaks larger topics into multiple parts,
 * and includes comprehensive Unit REVIEW sections.
 */

export const AP_CURRICULUM = [
  {
    id: 'unit_1',
    unitId: 'unit-1',
    unitKey: '1',
    number: 1,
    shortTitle: 'Unit 1',
    title: 'Unit 1 - Polynomial and Rational Functions',
    name: 'Polynomial and Rational Functions',
    subtitle: 'Rates of change, polynomial zeros, end behavior, rational asymptotes, holes, transformations & modeling (Topics 1.1–1.14 + Review)',
    examWeight: '30%–40% Exam Weight',
    description:
      'Master all 15 modules of Unit 1: covariation in tandem, average rate of change, linear/quadratic/polynomial functions, complex zeros, rational end behavior, vertical asymptotes, holes, Binomial Theorem, transformations, and function modeling.',
    color: 'blue',
    accent: 'from-blue-600 to-indigo-700',
    isPremium: false,
    topics: [
      { id: '1.1', code: '1.1', title: 'Change in Tandem', unitId: 'unit_1', unitKey: '1' },
      { id: '1.2', code: '1.2', title: 'Rates of Change', unitId: 'unit_1', unitKey: '1' },
      { id: '1.3', code: '1.3', title: 'Rates of Change in Linear and Quadratic Functions', unitId: 'unit_1', unitKey: '1' },
      { id: '1.4', code: '1.4', title: 'Polynomial Functions and Rates of Change', unitId: 'unit_1', unitKey: '1' },
      { id: '1.5', code: '1.5', title: 'Polynomial Functions and Complex Zeros', unitId: 'unit_1', unitKey: '1' },
      { id: '1.6', code: '1.6', title: 'Polynomial Functions and End Behavior', unitId: 'unit_1', unitKey: '1' },
      { id: '1.7', code: '1.7', title: 'Rational Functions and End Behavior', unitId: 'unit_1', unitKey: '1' },
      { id: '1.8', code: '1.8', title: 'Rational Functions and Zeros', unitId: 'unit_1', unitKey: '1' },
      { id: '1.9', code: '1.9', title: 'Rational Functions and Vertical Asymptotes', unitId: 'unit_1', unitKey: '1' },
      { id: '1.10', code: '1.10', title: 'Rational Functions and Holes', unitId: 'unit_1', unitKey: '1' },
      { id: '1.11', code: '1.11', title: 'Equivalent Representations of Polynomial and Rational Expressions', unitId: 'unit_1', unitKey: '1' },
      { id: '1.12', code: '1.12', title: 'Transformations of Functions', unitId: 'unit_1', unitKey: '1' },
      { id: '1.13', code: '1.13', title: 'Function Model Selection and Assumption Articulation', unitId: 'unit_1', unitKey: '1' },
      { id: '1.14', code: '1.14', title: 'Function Model Construction and Application', unitId: 'unit_1', unitKey: '1' },
      { id: 'Unit 1 REVIEW', code: 'Unit 1 REVIEW', title: 'Unit 1 REVIEW', isReview: true, unitId: 'unit_1', unitKey: '1' },
    ],
  },
  {
    id: 'unit_2a',
    unitId: 'unit-2a',
    unitKey: '2A',
    number: 2,
    shortTitle: 'Unit 2A',
    title: 'Unit 2A - Exponential and Logarithmic Functions',
    name: 'Exponential and Logarithmic Functions (Part A)',
    subtitle: 'Sequences, exponential growth/manipulation, data modeling, model validation, compositions & inverses (Topics 2.1–2.8 + Review)',
    examWeight: '27%–40% Exam Weight',
    description:
      'Master all 11 modules of Unit 2A: arithmetic and geometric sequences, linear vs. exponential change, exponential function manipulation, two-part context and data modeling, residual model validation, two-part function composition, and inverse functions.',
    color: 'indigo',
    accent: 'from-emerald-600 to-teal-700',
    isPremium: true,
    topics: [
      { id: '2.1', code: '2.1', title: 'Change in Arithmetic and Geometric Sequences', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.2', code: '2.2', title: 'Change in Linear and Exponential Functions', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.3', code: '2.3', title: 'Exponential Functions', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.4', code: '2.4', title: 'Exponential Function Manipulation', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.5A', code: '2.5A', title: 'Exponential Function Context and Data Modeling', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.5B', code: '2.5B', title: 'Exponential Function Context and Data Modeling', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.6', code: '2.6', title: 'Competing Function Model Validation', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.7A', code: '2.7A', title: 'Composition of Functions', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.7B', code: '2.7B', title: 'Composition of Functions', unitId: 'unit_2a', unitKey: '2A' },
      { id: '2.8', code: '2.8', title: 'Inverse Functions', unitId: 'unit_2a', unitKey: '2A' },
      { id: 'Unit 2A REVIEW', code: 'Unit 2A REVIEW', title: 'Unit 2A REVIEW', isReview: true, unitId: 'unit_2a', unitKey: '2A' },
    ],
  },
  {
    id: 'unit_2b',
    unitId: 'unit-2b',
    unitKey: '2B',
    number: 2,
    shortTitle: 'Unit 2B',
    title: 'Unit 2B - Exponential and Logarithmic Functions',
    name: 'Exponential and Logarithmic Functions (Part B)',
    subtitle: 'Logarithmic expressions, exponential inverses, log functions, log equations/inequalities & semi-log plots (Topics 2.9–2.15 + Review)',
    examWeight: '27%–40% Exam Weight',
    description:
      'Master all 9 modules of Unit 2B: logarithmic expressions, inverses of exponential functions, logarithmic function graphs and properties, two-part exponential/logarithmic equations and inequalities, logarithmic context modeling, and semi-log plots.',
    color: 'teal',
    accent: 'from-teal-600 to-cyan-700',
    isPremium: true,
    topics: [
      { id: '2.9', code: '2.9', title: 'Logarithmic Expressions', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.10', code: '2.10', title: 'Inverses of Exponential Functions', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.11', code: '2.11', title: 'Logarithmic Functions', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.12', code: '2.12', title: 'Logarithmic Function Manipulation', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.13A', code: '2.13A', title: 'Exponential and Logarithmic Equations and Inequalities', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.13B', code: '2.13B', title: 'Exponential and Logarithmic Equations and Inequalities', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.14', code: '2.14', title: 'Logarithmic Function Context and Data Modeling', unitId: 'unit_2b', unitKey: '2B' },
      { id: '2.15', code: '2.15', title: 'Semi-log Plots', unitId: 'unit_2b', unitKey: '2B' },
      { id: 'Unit 2B REVIEW', code: 'Unit 2B REVIEW', title: 'Unit 2B REVIEW', isReview: true, unitId: 'unit_2b', unitKey: '2B' },
    ],
  },
  {
    id: 'unit_3',
    unitId: 'unit-3',
    unitKey: '3',
    number: 3,
    shortTitle: 'Unit 3',
    title: 'Unit 3 - Trigonometric and Polar Functions',
    name: 'Trigonometric and Polar Functions',
    subtitle: 'Periodic phenomena, unit circle radians, sinusoidal waves, inverse trig, identities & polar functions (Topics 3.1–3.15 + Review)',
    examWeight: '30%–35% Exam Weight',
    description:
      'Master all 16 modules of Unit 3: periodic phenomena, radian measure, unit circle values, sine/cosine/tangent graphs, sinusoidal transformations and modeling, inverse trig, trig equations/identities, reciprocal functions, polar coordinates, polar graphs, and polar rates of change.',
    color: 'sky',
    accent: 'from-purple-600 to-indigo-700',
    isPremium: true,
    topics: [
      { id: '3.1', code: '3.1', title: 'Periodic Phenomena', unitId: 'unit_3', unitKey: '3' },
      { id: '3.2', code: '3.2', title: 'Sine, Cosine, and Tangent', unitId: 'unit_3', unitKey: '3' },
      { id: '3.3', code: '3.3', title: 'Sine and Cosine Function Values', unitId: 'unit_3', unitKey: '3' },
      { id: '3.4', code: '3.4', title: 'Sine and Cosine Function Graphs', unitId: 'unit_3', unitKey: '3' },
      { id: '3.5', code: '3.5', title: 'Sinusoidal Functions', unitId: 'unit_3', unitKey: '3' },
      { id: '3.6', code: '3.6', title: 'Sinusoidal Function Transformations', unitId: 'unit_3', unitKey: '3' },
      { id: '3.7', code: '3.7', title: 'Sinusoidal Function Context and Data Modeling', unitId: 'unit_3', unitKey: '3' },
      { id: '3.8', code: '3.8', title: 'The Tangent Function', unitId: 'unit_3', unitKey: '3' },
      { id: '3.9', code: '3.9', title: 'Inverse Trigonometric Functions', unitId: 'unit_3', unitKey: '3' },
      { id: '3.10', code: '3.10', title: 'Trigonometric Equations and Inequalities', unitId: 'unit_3', unitKey: '3' },
      { id: '3.11', code: '3.11', title: 'The Secant, Cosecant, and Cotangent Functions', unitId: 'unit_3', unitKey: '3' },
      { id: '3.12', code: '3.12', title: 'Equivalent Representations of Trigonometric Functions', unitId: 'unit_3', unitKey: '3' },
      { id: '3.13', code: '3.13', title: 'Trigonometry and Polar Coordinates', unitId: 'unit_3', unitKey: '3' },
      { id: '3.14', code: '3.14', title: 'Polar Function Graphs', unitId: 'unit_3', unitKey: '3' },
      { id: '3.15', code: '3.15', title: 'Rates of Change in Polar Functions', unitId: 'unit_3', unitKey: '3' },
      { id: 'Unit 3 REVIEW', code: 'Unit 3 REVIEW', title: 'Unit 3 REVIEW', isReview: true, unitId: 'unit_3', unitKey: '3' },
    ],
  },
  {
    id: 'unit_4a',
    unitId: 'unit-4a',
    unitKey: '4A',
    number: 4,
    shortTitle: 'Unit 4A',
    title: 'Unit 4A - Functions Involving Parameters, Vectors, and Matrices',
    name: 'Functions Involving Parameters, Vectors, and Matrices (Part A)',
    subtitle: 'Parametric planar motion, rates of change, circles/lines, implicit functions & conic sections (Topics 4.1–4.7 + Review)',
    examWeight: 'Additional AP Topics',
    description:
      'Master all 10 modules of Unit 4A: parametric functions, planar motion modeling, parametric rates of change, parametrically defined circles and lines, implicitly defined functions, conic sections (parabolas, ellipses, hyperbolas), and conic parametrization.',
    color: 'amber',
    accent: 'from-amber-600 to-orange-700',
    isPremium: true,
    topics: [
      { id: '4.1', code: '4.1', title: 'Parametric Functions', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.2', code: '4.2', title: 'Parametric Functions Modeling Planar Motion', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.3', code: '4.3', title: 'Parametric Functions and Rates of Change', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.4', code: '4.4', title: 'Parametrically Defined Circles and Lines', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.5', code: '4.5', title: 'Implicitly Defined Functions', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.6A', code: '4.6A', title: 'Conic Sections - Parabolas', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.6B', code: '4.6B', title: 'Conic Sections - Ellipses', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.6C', code: '4.6C', title: 'Conic Sections - Hyperbolas', unitId: 'unit_4a', unitKey: '4A' },
      { id: '4.7', code: '4.7', title: 'Parametrization of Implicitly Defined Functions', unitId: 'unit_4a', unitKey: '4A' },
      { id: 'Unit 4A REVIEW', code: 'Unit 4A REVIEW', title: 'Unit 4A REVIEW', isReview: true, unitId: 'unit_4a', unitKey: '4A' },
    ],
  },
  {
    id: 'unit_4b',
    unitId: 'unit-4b',
    unitKey: '4B',
    number: 4,
    shortTitle: 'Unit 4B',
    title: 'Unit 4B - Functions Involving Parameters, Vectors, and Matrices',
    name: 'Functions Involving Parameters, Vectors, and Matrices (Part B)',
    subtitle: '2D vectors, vector-valued functions, matrix algebra, determinants/inverses, linear transformations & Markov models (Topics 4.8A–4.14 + Review)',
    examWeight: 'Additional AP Topics',
    description:
      'Master all 10 modules of Unit 4B: two-part 2D vectors and dot products, vector-valued functions, matrix operations, matrix inverse and determinants, linear transformations, two-part matrices as functions, and Markov chain contextual modeling.',
    color: 'slate',
    accent: 'from-rose-600 to-pink-700',
    isPremium: true,
    topics: [
      { id: '4.8A', code: '4.8A', title: 'Vectors', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.8B', code: '4.8B', title: 'Vectors', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.9', code: '4.9', title: 'Vector-Valued Functions', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.10', code: '4.10', title: 'Matrices', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.11', code: '4.11', title: 'The Inverse and Determinant of a Matrix', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.12', code: '4.12', title: 'Linear Transformations and Matrices', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.13A', code: '4.13A', title: 'Matrices as Functions', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.13B', code: '4.13B', title: 'Matrices as Functions', unitId: 'unit_4b', unitKey: '4B' },
      { id: '4.14', code: '4.14', title: 'Matrices Modeling Contexts', unitId: 'unit_4b', unitKey: '4B' },
      { id: 'Unit 4B REVIEW', code: 'Unit 4B REVIEW', title: 'Unit 4B REVIEW', isReview: true, unitId: 'unit_4b', unitKey: '4B' },
    ],
  },
];

// Derived lookup maps & helper utilities
export const UNIT_METADATA = {};
export const TOPIC_TITLES = {};
export const TOPIC_TO_UNIT_ID = {};
export const TOPIC_TO_UNIT_KEY = {};
export const VALID_TOPIC_IDS = [];
export const TOPIC_ORDER_INDEX = {};

let globalTopicOrder = 0;
AP_CURRICULUM.forEach((unit) => {
  UNIT_METADATA[unit.id] = {
    id: unit.id,
    unitId: unit.unitId,
    unitKey: unit.unitKey,
    num: unit.number,
    shortTitle: unit.shortTitle,
    title: unit.title,
    name: unit.name,
    weight: unit.examWeight,
    description: unit.description,
    accent: unit.accent,
    color: unit.color,
    isPremium: unit.isPremium,
  };

  unit.topics.forEach((topic) => {
    TOPIC_TITLES[topic.id] = topic.title;
    TOPIC_TO_UNIT_ID[topic.id] = unit.id;
    TOPIC_TO_UNIT_KEY[topic.id] = unit.unitKey;
    VALID_TOPIC_IDS.push(topic.id);
    TOPIC_ORDER_INDEX[topic.id] = globalTopicOrder++;
  });
});

export function getUnitIdForTopic(topicId) {
  const key = String(topicId || '').trim();
  if (TOPIC_TO_UNIT_ID[key]) return TOPIC_TO_UNIT_ID[key];
  const lower = key.toLowerCase();
  for (const [k, uId] of Object.entries(TOPIC_TO_UNIT_ID)) {
    if (k.toLowerCase() === lower) return uId;
  }
  if (lower.startsWith('2.9') || lower.startsWith('2.10') || lower.startsWith('2.11') || lower.startsWith('2.12') || lower.startsWith('2.13') || lower.startsWith('2.14') || lower.startsWith('2.15') || lower.includes('2b')) {
    return 'unit_2b';
  }
  if (lower.startsWith('2.') || lower.includes('2a')) {
    return 'unit_2a';
  }
  if (lower.startsWith('4.8') || lower.startsWith('4.9') || lower.startsWith('4.10') || lower.startsWith('4.11') || lower.startsWith('4.12') || lower.startsWith('4.13') || lower.startsWith('4.14') || lower.includes('4b')) {
    return 'unit_4b';
  }
  if (lower.startsWith('4.') || lower.includes('4a')) {
    return 'unit_4a';
  }
  if (lower.startsWith('3.')) {
    return 'unit_3';
  }
  return 'unit_1';
}

export function getUnitKeyForTopic(topicId) {
  const uId = getUnitIdForTopic(topicId);
  return UNIT_METADATA[uId]?.unitKey || '1';
}

export function isValidTopicId(topicId) {
  return Object.prototype.hasOwnProperty.call(TOPIC_ORDER_INDEX, String(topicId || '').trim());
}

export function compareTopicIds(a, b) {
  const sA = String(a || '').trim();
  const sB = String(b || '').trim();
  const idxA = TOPIC_ORDER_INDEX[sA];
  const idxB = TOPIC_ORDER_INDEX[sB];
  if (idxA !== undefined && idxB !== undefined) {
    return idxA - idxB;
  }
  if (idxA !== undefined) return -1;
  if (idxB !== undefined) return 1;
  return sA.localeCompare(sB, undefined, { numeric: true });
}

export function formatTopicDisplayLabel(topicId, title) {
  const code = String(topicId || '').trim();
  const t = title || TOPIC_TITLES[code] || code;
  if (code.toUpperCase().includes('REVIEW')) {
    return code;
  }
  return `${code} ${t}`;
}

if (typeof window !== 'undefined') {
  window.AP_CURRICULUM = AP_CURRICULUM;
  window.AP_UNIT_METADATA = UNIT_METADATA;
  window.AP_TOPIC_TITLES = TOPIC_TITLES;
  window.AP_TOPIC_TO_UNIT_ID = TOPIC_TO_UNIT_ID;
  window.AP_VALID_TOPIC_IDS = VALID_TOPIC_IDS;
  window.getUnitIdForTopic = getUnitIdForTopic;
  window.getUnitKeyForTopic = getUnitKeyForTopic;
  window.isValidTopicId = isValidTopicId;
  window.compareTopicIds = compareTopicIds;
  window.formatTopicDisplayLabel = formatTopicDisplayLabel;
}
