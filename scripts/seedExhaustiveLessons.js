/**
 * MathPrep - Lean AP Precalculus Lesson Seeder (Modular Firebase SDK v11)
 * Seeds all 44 standalone lean topic guides (Topics 1.1 – 4.10) into `curriculum/{topicId}`
 * using Firestore `writeBatch`, enforcing the strict 3-part schema:
 * 1. Concept Description
 * 2. Core Formula
 * 3. Simple Explanation
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';

export const TOPIC_1_3_EXEMPLAR = {
  topic_id: '1.3',
  topic_title: 'Rates of Change in Linear and Quadratic Functions',
  lesson: {
    reading_time_minutes: 5,
    concept_description:
      'Linear functions change at a steady, constant rate (their average rate of change is the same on every interval), while quadratic functions have an average rate of change that increases or decreases at a steady linear pace. This matters on the AP Precalculus exam because checking whether the rate of change is constant or changing by a constant amount lets you instantly tell linear and quadratic tables and graphs apart.',
    core_formula: [
      '**Linear Function (Constant Rate of Change):**',
      '$$L(x) = mx + b, \\qquad \\text{AROC}_{[x_1, x_2]} = \\frac{L(x_2) - L(x_1)}{x_2 - x_1} = m$$',
      '- $m$: The constant slope (rate of change on every interval).',
      '- $b$: The vertical $y$-intercept $L(0)$.',
      '- $x_1, x_2$: Any two distinct input values ($x_1 \\neq x_2$).',
      '',
      '**Quadratic Function (Linearly Changing Rate of Change):**',
      '$$Q(x) = ax^2 + bx + c, \\qquad \\text{AROC}_{[x_1, x_2]} = a(x_1 + x_2) + b, \\qquad a = \\frac{\\Delta^2 y}{2(\\Delta x)^2}$$',
      '- $a$: The leading coefficient (controls concavity: $a > 0$ is concave up, $a < 0$ is concave down).',
      '- $\\Delta x$: The equal step size between consecutive $x$-values in a table.',
      '- $\\Delta^2 y$: The constant second difference (the change in the first differences $\\Delta y$).',
    ].join('\n'),
    simple_explanation: [
      'Think of a **linear function** like walking up a ramp with a steady tilt: every step forward raises your height by the exact same amount $m$.',
      '',
      'Think of a **quadratic function** like tossing a ball into the air: the slope changes by the exact same amount over every equal time step. Here is how to apply the formulas directly to practice problems:',
      '1. **From a Table:** Check the $x$-step $\\Delta x$. Find the first differences $\\Delta y$. If $\\Delta y$ is constant, the function is linear with slope $m = \\frac{\\Delta y}{\\Delta x}$. If the *second* differences $\\Delta^2 y$ are constant, the function is quadratic and you can find $a$ right away using $a = \\frac{\\Delta^2 y}{2(\\Delta x)^2}$.',
      '2. **Shortcut for Quadratic Average Rate of Change:** Instead of plugging both endpoints into $ax^2 + bx + c$, just use $\\text{AROC}_{[x_1, x_2]} = a(x_1 + x_2) + b$. For example, on $f(x) = 3x^2 - 4x + 5$ over $[1, 5]$, $\\text{AROC} = 3(1 + 5) - 4 = 14$.',
      '3. **Finding the Vertex from Symmetry:** Whenever two inputs give the exact same output ($Q(x_1) = Q(x_2)$), the parabola\'s vertex sits dead center at the midpoint $h = \\frac{x_1 + x_2}{2}$.',
    ].join('\n'),
    table_of_contents: ['Concept Description', 'Core Formula', 'Simple Explanation'],
    conceptual_sections: [
      {
        section_id: 'concept_description',
        title: 'Concept Description',
        body_markdown:
          'Linear functions change at a steady, constant rate (their average rate of change is the same on every interval), while quadratic functions have an average rate of change that increases or decreases at a steady linear pace. This matters on the AP Precalculus exam because checking whether the rate of change is constant or changing by a constant amount lets you instantly tell linear and quadratic tables and graphs apart.',
      },
      {
        section_id: 'core_formula',
        title: 'Core Formula',
        body_markdown: [
          '**Linear Function (Constant Rate of Change):**',
          '$$L(x) = mx + b, \\qquad \\text{AROC}_{[x_1, x_2]} = \\frac{L(x_2) - L(x_1)}{x_2 - x_1} = m$$',
          '- $m$: The constant slope (rate of change on every interval).',
          '- $b$: The vertical $y$-intercept $L(0)$.',
          '- $x_1, x_2$: Any two distinct input values ($x_1 \\neq x_2$).',
          '',
          '**Quadratic Function (Linearly Changing Rate of Change):**',
          '$$Q(x) = ax^2 + bx + c, \\qquad \\text{AROC}_{[x_1, x_2]} = a(x_1 + x_2) + b, \\qquad a = \\frac{\\Delta^2 y}{2(\\Delta x)^2}$$',
          '- $a$: The leading coefficient (controls concavity: $a > 0$ is concave up, $a < 0$ is concave down).',
          '- $\\Delta x$: The equal step size between consecutive $x$-values in a table.',
          '- $\\Delta^2 y$: The constant second difference (the change in the first differences $\\Delta y$).',
        ].join('\n'),
      },
      {
        section_id: 'simple_explanation',
        title: 'Simple Explanation',
        body_markdown: [
          'Think of a **linear function** like walking up a ramp with a steady tilt: every step forward raises your height by the exact same amount $m$.',
          '',
          'Think of a **quadratic function** like tossing a ball into the air: the slope changes by the exact same amount over every equal time step. Here is how to apply the formulas directly to practice problems:',
          '1. **From a Table:** Check the $x$-step $\\Delta x$. Find the first differences $\\Delta y$. If $\\Delta y$ is constant, the function is linear with slope $m = \\frac{\\Delta y}{\\Delta x}$. If the *second* differences $\\Delta^2 y$ are constant, the function is quadratic and you can find $a$ right away using $a = \\frac{\\Delta^2 y}{2(\\Delta x)^2}$.',
          '2. **Shortcut for Quadratic Average Rate of Change:** Instead of plugging both endpoints into $ax^2 + bx + c$, just use $\\text{AROC}_{[x_1, x_2]} = a(x_1 + x_2) + b$. For example, on $f(x) = 3x^2 - 4x + 5$ over $[1, 5]$, $\\text{AROC} = 3(1 + 5) - 4 = 14$.',
          '3. **Finding the Vertex from Symmetry:** Whenever two inputs give the exact same output ($Q(x_1) = Q(x_2)$), the parabola\'s vertex sits dead center at the midpoint $h = \\frac{x_1 + x_2}{2}$.',
        ].join('\n'),
      },
    ],
    formula_theorem_vault: [],
    model_mcqs: [],
    model_frqs: [],
    synthesis_summary: '',
  },
};

export const TOPIC_3_4_EXEMPLAR = {
  topic_id: '3.4',
  topic_title: 'Sine and Cosine Function Graphs',
  lesson: {
    reading_time_minutes: 5,
    concept_description:
      'Sine and cosine graphs unwrap the circular motion of the unit circle into smooth, repeating waves along the horizontal radian axis. This matters because they are the parent functions for modeling every repeating cycle on the AP Precalculus exam—from ocean tides and daily temperatures to Ferris wheels and sound waves.',
    core_formula: [
      '**Parent Wave Equations & Features:**',
      '$$f(\\theta) = \\sin(\\theta), \\qquad g(\\theta) = \\cos(\\theta)$$',
      '- $\\theta$: Input angle measured in radians (Domain: $(-\\infty, \\infty)$).',
      '- $\\text{Range} = [-1, 1]$: Output values always stay between a minimum of $-1$ and a maximum of $1$, centered on the midline $y = 0$ with amplitude $1$.',
      '- $P = 2\\pi$: The period (horizontal length of one full repeating cycle).',
      '',
      '**Symmetry & Phase-Shift Relationships:**',
      '$$\\cos(-\\theta) = \\cos(\\theta) \\text{ (Even)}, \\qquad \\sin(-\\theta) = -\\sin(\\theta) \\text{ (Odd)}, \\qquad \\cos(\\theta) = \\sin\\left(\\theta + \\frac{\\pi}{2}\\right)$$',
    ].join('\n'),
    simple_explanation: [
      'Think of unwrapping a bicycle wheel along a road: tracking the vertical height of a point on the rim draws $y = \\sin(\\theta)$ (which starts at the midline $(0, 0)$ and climbs first), while tracking the horizontal coordinate draws $y = \\cos(\\theta)$ (which starts at the top peak $(0, 1)$ and goes down first).',
      '',
      'Here are the three core mechanics to solve any Topic 3.4 question:',
      '1. **Use the 5 Quarter-Cycle Points:** Split one period $[0, 2\\pi]$ into four equal steps of $\\frac{\\pi}{2}$ radians ($0, \\frac{\\pi}{2}, \\pi, \\frac{3\\pi}{2}, 2\\pi$). Sine goes *Midline $(0) \\to$ Max $(1) \\to$ Midline $(0) \\to$ Min $(-1) \\to$ Midline $(0)$*, while Cosine goes *Max $(1) \\to$ Midline $(0) \\to$ Min $(-1) \\to$ Midline $(0) \\to$ Max $(1)$*.',
      '2. **Midline Concavity Shortcut:** Whenever the wave is **above the midline** ($y > 0$), it arches downward like an umbrella (**concave down**). Whenever the wave is **below the midline** ($y < 0$), it cups upward like a bowl (**concave up**). Every midline crossing ($y = 0$) is a **point of inflection**.',
      '3. **Shifting Between Sine and Cosine:** Because $\\cos(\\theta)$ hits its peak at $\\theta = 0$ while $\\sin(\\theta)$ hits its peak at $\\theta = \\frac{\\pi}{2}$, shifting the sine graph left by $\\frac{\\pi}{2}$ radians turns it into the cosine graph.',
    ].join('\n'),
    table_of_contents: ['Concept Description', 'Core Formula', 'Simple Explanation'],
    conceptual_sections: [
      {
        section_id: 'concept_description',
        title: 'Concept Description',
        body_markdown:
          'Sine and cosine graphs unwrap the circular motion of the unit circle into smooth, repeating waves along the horizontal radian axis. This matters because they are the parent functions for modeling every repeating cycle on the AP Precalculus exam—from ocean tides and daily temperatures to Ferris wheels and sound waves.',
      },
      {
        section_id: 'core_formula',
        title: 'Core Formula',
        body_markdown: [
          '**Parent Wave Equations & Features:**',
          '$$f(\\theta) = \\sin(\\theta), \\qquad g(\\theta) = \\cos(\\theta)$$',
          '- $\\theta$: Input angle measured in radians (Domain: $(-\\infty, \\infty)$).',
          '- $\\text{Range} = [-1, 1]$: Output values always stay between a minimum of $-1$ and a maximum of $1$, centered on the midline $y = 0$ with amplitude $1$.',
          '- $P = 2\\pi$: The period (horizontal length of one full repeating cycle).',
          '',
          '**Symmetry & Phase-Shift Relationships:**',
          '$$\\cos(-\\theta) = \\cos(\\theta) \\text{ (Even)}, \\qquad \\sin(-\\theta) = -\\sin(\\theta) \\text{ (Odd)}, \\qquad \\cos(\\theta) = \\sin\\left(\\theta + \\frac{\\pi}{2}\\right)$$',
        ].join('\n'),
      },
      {
        section_id: 'simple_explanation',
        title: 'Simple Explanation',
        body_markdown: [
          'Think of unwrapping a bicycle wheel along a road: tracking the vertical height of a point on the rim draws $y = \\sin(\\theta)$ (which starts at the midline $(0, 0)$ and climbs first), while tracking the horizontal coordinate draws $y = \\cos(\\theta)$ (which starts at the top peak $(0, 1)$ and goes down first).',
          '',
          'Here are the three core mechanics to solve any Topic 3.4 question:',
          '1. **Use the 5 Quarter-Cycle Points:** Split one period $[0, 2\\pi]$ into four equal steps of $\\frac{\\pi}{2}$ radians ($0, \\frac{\\pi}{2}, \\pi, \\frac{3\\pi}{2}, 2\\pi$). Sine goes *Midline $(0) \\to$ Max $(1) \\to$ Midline $(0) \\to$ Min $(-1) \\to$ Midline $(0)$*, while Cosine goes *Max $(1) \\to$ Midline $(0) \\to$ Min $(-1) \\to$ Midline $(0) \\to$ Max $(1)$*.',
          '2. **Midline Concavity Shortcut:** Whenever the wave is **above the midline** ($y > 0$), it arches downward like an umbrella (**concave down**). Whenever the wave is **below the midline** ($y < 0$), it cups upward like a bowl (**concave up**). Every midline crossing ($y = 0$) is a **point of inflection**.',
          '3. **Shifting Between Sine and Cosine:** Because $\\cos(\\theta)$ hits its peak at $\\theta = 0$ while $\\sin(\\theta)$ hits its peak at $\\theta = \\frac{\\pi}{2}$, shifting the sine graph left by $\\frac{\\pi}{2}$ radians turns it into the cosine graph.',
        ].join('\n'),
      },
    ],
    formula_theorem_vault: [],
    model_mcqs: [],
    model_frqs: [],
    synthesis_summary: '',
  },
};

/**
 * Batch seed all 44 lean AP Precalculus lessons into Firestore `curriculum/{topicDocId}`
 * using Modular Firebase SDK v11 `writeBatch`.
 */
export async function seedExhaustiveLessonsToFirestore(firebaseConfig) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = firebaseConfig?.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

  const res = await fetch('/data/premade_curriculum_all_44.json');
  if (!res.ok) {
    throw new Error(`Failed to fetch /data/premade_curriculum_all_44.json: ${res.status}`);
  }
  const bundle = await res.json();
  const topics = bundle.topics || [];

  const batch = writeBatch(db);
  const nowIso = new Date().toISOString();

  topics.forEach((topicObj) => {
    const code = String(topicObj.topic_id || topicObj.topicCode);
    const docId = 'topic_' + code.replace(/[^0-9]/g, '_');

    let finalLesson = topicObj.lesson;
    if (code === '1.3') {
      finalLesson = { ...topicObj.lesson, ...TOPIC_1_3_EXEMPLAR.lesson };
    } else if (code === '3.4') {
      finalLesson = { ...topicObj.lesson, ...TOPIC_3_4_EXEMPLAR.lesson };
    }

    const ref = doc(collection(db, 'curriculum'), docId);
    batch.set(
      ref,
      {
        ...topicObj,
        topicId: docId,
        topicCode: code,
        lesson: finalLesson,
        status: 'published',
        lastUpdated: nowIso,
      },
      { merge: true }
    );
  });

  await batch.commit();
  return { seededCount: topics.length };
}
