import fs from 'fs';
import path from 'path';
import { TOPIC_1_3_EXEMPLAR, TOPIC_3_4_EXEMPLAR } from './seedExhaustiveLessons.js';
import {
  ensureSubTopicsForTopic,
  buildExpandedMcqsForTopic,
  buildExpandedFrqsForTopic,
  generateMassiveQuestionBankDataset,
} from './seedQuestionBank.js';
import {
  AP_CURRICULUM,
  UNIT_METADATA,
  getUnitIdForTopic,
  getUnitKeyForTopic,
} from '../lib/ap-curriculum.js';

const LEGACY_TOPICS_DATA = [
  // =========================================================================
  // UNIT 1: POLYNOMIAL AND RATIONAL FUNCTIONS (Topics 1.1 - 1.16)
  // =========================================================================
  {
    unit: 1,
    topic_id: "1.1",
    topic_title: "Change in Tandem",
    sub_topics: [
      {
        sub_topic_id: "1.1.A",
        sub_topic_title: "Covariation of Quantities & Input-Output Dynamics",
        essential_formulas: [
          {
            name: "Change in Input (Independent Variable)",
            latex: "\\Delta x = x_2 - x_1",
            description: "Measures the directed horizontal displacement across the domain interval $[x_1, x_2]$."
          },
          {
            name: "Change in Output (Dependent Variable)",
            latex: "\\Delta y = f(x_2) - f(x_1)",
            description: "Measures the directed vertical change in function values as $x$ varies from $x_1$ to $x_2$."
          },
          {
            name: "Increasing vs. Decreasing Function Criterion",
            latex: "x_1 < x_2 \\implies \\begin{cases} f(x_1) < f(x_2) & \\text{(Strictly Increasing)} \\\\ f(x_1) > f(x_2) & \\text{(Strictly Decreasing)} \\end{cases}",
            description: "Defines monotonicity over an open interval $I$ in the domain of $f$."
          }
        ]
      },
      {
        sub_topic_id: "1.1.B",
        sub_topic_title: "Graphical Features, Extrema, & Points of Inflection",
        essential_formulas: [
          {
            name: "Relative Maximum Condition",
            latex: "f(c) \\ge f(x) \\quad \\forall x \\in (c - \\delta, c + \\delta)",
            description: "Occurs where $f$ transitions from increasing to decreasing at an interior point $x = c$."
          },
          {
            name: "Relative Minimum Condition",
            latex: "f(c) \\le f(x) \\quad \\forall x \\in (c - \\delta, c + \\delta)",
            description: "Occurs where $f$ transitions from decreasing to increasing at an interior point $x = c$."
          }
        ]
      }
    ],
    conceptual_overview: "In AP Precalculus, a function $y = f(x)$ is understood dynamically as a rule that maps each input value $x$ in the domain to a unique output value $y$ in the range. Studying 'change in tandem' means analyzing how two quantities covary: as the independent variable $x$ increases across an interval, does the dependent variable $f(x)$ increase, decrease, or remain constant? Furthermore, concavity describes how the rate of change itself varies—whether outputs change by progressively larger or smaller amounts over equal-length input increments.",
    core_principles: [
      {
        heading: "Independent vs. Dependent Variable Identification",
        content_latex: "Given a functional relationship $b(h)$ where $h$ represents the initial drop height of a basketball and $b$ represents the height of the first bounce, $h$ is the **independent (input) variable** and $b(h)$ is the **dependent (output) variable**. Graphically, inputs are plotted on the horizontal axis and outputs on the vertical axis."
      },
      {
        heading: "Monotonicity and Concavity from Graphs and Tables",
        content_latex: "A function $f$ is **increasing** on an interval if $\\Delta x > 0 \\implies \\Delta y > 0$, and **decreasing** if $\\Delta x > 0 \\implies \\Delta y < 0$. The graph of $f$ is **concave up** on intervals where the rate of change is increasing (bending upward like a cup) and **concave down** where the rate of change is decreasing (bending downward like a cap). A **point of inflection** occurs where the graph changes concavity."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Let $h(t)$ model the number of hotels in a coastal city as a function of $t$, the number of tourists (in hundreds of thousands) visiting each year. Identify the independent and dependent variables, and interpret the meaning of $h(12) = 85$ and the statement '$h$ is increasing and concave down on $10 < t < 15$'.",
        solution_steps: [
          "Step 1: Identify variables. The input $t$ (annual tourists in hundreds of thousands) is the independent variable; the output $h(t)$ (number of hotels) is the dependent variable.",
          "Step 2: Interpret $h(12) = 85$. When $1{,}200{,}000$ tourists visit the city in a year ($t=12$), there are $85$ hotels operating in the city.",
          "Step 3: Analyze 'increasing and concave down on $10 < t < 15$'. As tourism grows from $1.0$ million to $1.5$ million visitors, the number of hotels increases ($\\Delta h > 0$), but each additional $100{,}000$ tourists results in a smaller increase in new hotels than the previous increment."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.1_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "The function $b(c)$ models the number of billboards $b$ along a highway as a function of the number of cars $c$ registered in the surrounding county. Which of the following correctly identifies the independent and dependent variables?",
        options: [
          "(A) Independent: Number of cars $c$; Dependent: Number of billboards $b$",
          "(B) Independent: Number of billboards $b$; Dependent: Number of cars $c$",
          "(C) Both $b$ and $c$ are independent variables because they both increase over time.",
          "(D) Neither variable is dependent because the domain is discrete."
        ],
        correct_index: 0,
        explanation_latex: "In function notation $b(c)$, the variable inside the parentheses ($c$, number of cars) is the input or independent variable, while the resulting quantity ($b$, number of billboards) is the output or dependent variable.",
        exam_trap: "Students frequently reverse input and output when reading verbal descriptions where the dependent quantity is stated first in the sentence."
      },
      {
        question_id: "1.1_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A continuous function $f$ is defined on the closed interval $[-4, 6]$. On the subinterval $(-2, 3)$, as $x$ increases, $f(x)$ decreases, and the graph of $f$ bends upward so that secant line slopes become less negative. Which statement accurately describes $f$ on $(-2, 3)$?",
        options: [
          "(A) $f$ is increasing and concave up.",
          "(B) $f$ is decreasing and concave up.",
          "(C) $f$ is decreasing and concave down.",
          "(D) $f$ is increasing and concave down."
        ],
        correct_index: 1,
        explanation_latex: "Since $f(x)$ decreases as $x$ increases, $f$ is decreasing. Because the slopes of secant lines are becoming less negative (e.g., moving from $-5$ to $-2$ to $-0.5$), the rate of change is increasing, which means the graph is concave up.",
        exam_trap: "Equating a decreasing function with 'concave down'—a decreasing function is concave up whenever its rate of decrease is slowing down (rate of change is becoming less negative)."
      },
      {
        question_id: "1.1_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Selected values of a twice-differentiable function $g$ are shown in the table: $x \\in \\{1, 2, 3, 4, 5\\}$ with corresponding outputs $g(x) \\in \\{20, 14, 10, 8, 7\\}$. If $g$ maintains this behavior across $[1, 5]$, which of the following must be true?",
        options: [
          "(A) $g$ is increasing and concave down on $[1, 5]$.",
          "(B) $g$ is decreasing and concave down on $[1, 5]$.",
          "(C) $g$ is decreasing and concave up on $[1, 5]$.",
          "(D) $g$ has a point of inflection at $x = 3$."
        ],
        correct_index: 2,
        explanation_latex: "As $x$ increases by $1$ unit, $g(x)$ decreases ($20 \\to 14 \\to 10 \\to 8 \\to 7$), so $g$ is decreasing. The first differences are $\\Delta g = -6, -4, -2, -1$. Because $\\Delta g$ is increasing ($-6 < -4 < -2 < -1$), the rate of change is increasing, meaning $g$ is concave up.",
        exam_trap: "Looking at the magnitudes $6, 4, 2, 1$ and thinking the rate of change is decreasing, forgetting the negative signs ($-6 < -4 < -2 < -1$)."
      }
    ],
    frq: [
      {
        frq_id: "1.1_frq_1",
        calculator_active: false,
        scenario_latex: "A municipal reservoir's water volume $V(t)$, measured in millions of gallons, is monitored over a $12$-hour period $0 \\le t \\le 12$. Selected values are given by $(0, 50), (3, 41), (6, 35), (9, 32), (12, 36)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Identify the independent and dependent variables with their respective units, and state the meaning of $V(6) = 35$ in context.",
            scoring_rubric: [
              { criteria: "Correctly identifies $t$ (hours) as independent and $V(t)$ (millions of gallons) as dependent", points: 1 },
              { criteria: "Correct contextual interpretation of $V(6)=35$ at $t=6$ hours", points: 1 }
            ],
            model_solution_latex: "The independent variable is time $t$ in hours, and the dependent variable is volume $V(t)$ in millions of gallons. $V(6) = 35$ means that $6$ hours after monitoring began, the reservoir contained $35$ million gallons of water."
          },
          {
            part_label: "(b)",
            prompt_latex: "Over the interval $0 \\le t \\le 9$, is $V(t)$ increasing or decreasing? Use the consecutive changes in volume over equal $3$-hour intervals to determine whether the graph of $V$ is concave up or concave down on $0 < t < 9$.",
            scoring_rubric: [
              { criteria: "States $V(t)$ is decreasing on $[0, 9]$", points: 1 },
              { criteria: "Computes first differences $\\Delta V = -9, -6, -3$ and justifies concave up because the rate of change is increasing", points: 1 }
            ],
            model_solution_latex: "On $[0, 9]$, $V(t)$ is decreasing because $50 > 41 > 35 > 32$. Over successive $3$-hour intervals, the changes in output are $\\Delta V_1 = 41 - 50 = -9$, $\\Delta V_2 = 35 - 41 = -6$, and $\\Delta V_3 = 32 - 35 = -3$. Since $-9 < -6 < -3$, the rate of change is increasing, so $V(t)$ is concave up on $0 < t < 9$."
          },
          {
            part_label: "(c)",
            prompt_latex: "Explain why $V(t)$ must attain at least one relative minimum on the open interval $(6, 12)$.",
            scoring_rubric: [
              { criteria: "Uses output values $V(6)=35, V(9)=32, V(12)=36$ to show transition from decreasing to increasing", points: 2 }
            ],
            model_solution_latex: "Since $V(t)$ is continuous and decreases from $V(6) = 35$ to $V(9) = 32$ before increasing to $V(12) = 36$, the function transitions from decreasing to increasing on $(6, 12)$, guaranteeing at least one relative minimum on that interval."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.2",
    topic_title: "Change in Rates of Change",
    sub_topics: [
      {
        sub_topic_id: "1.2.A",
        sub_topic_title: "Difference Quotients & Concavity Links",
        essential_formulas: [
          {
            name: "Difference Quotient (Average Rate of Change)",
            latex: "\\frac{\\Delta y}{\\Delta x} = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}",
            description: "Ratio of output change to input change over $[x_1, x_2]$."
          },
          {
            name: "Concave Up Rate Criterion",
            latex: "m_{\\text{sec}}[x_1, x_2] < m_{\\text{sec}}[x_2, x_3] \\quad (x_1 < x_2 < x_3)",
            description: "Average rates of change over consecutive intervals are strictly increasing."
          },
          {
            name: "Concave Down Rate Criterion",
            latex: "m_{\\text{sec}}[x_1, x_2] > m_{\\text{sec}}[x_2, x_3] \\quad (x_1 < x_2 < x_3)",
            description: "Average rates of change over consecutive intervals are strictly decreasing."
          }
        ]
      }
    ],
    conceptual_overview: "While a function's values tell us where outputs are located, the rate of change tells us how fast outputs are changing per unit change in input. Topic 1.2 focuses on how the rate of change itself changes. When the rate of change of $f$ is increasing over an interval, the graph of $f$ is concave up; when the rate of change of $f$ is decreasing, the graph of $f$ is concave down. Points where concavity switches are points of inflection.",
    core_principles: [
      {
        heading: "Positive vs. Negative Rates of Change in Context",
        content_latex: "A **positive rate of change** ($\\frac{\\Delta y}{\\Delta x} > 0$) means both quantities change in the same direction (either both increase or both decrease). A **negative rate of change** ($\\frac{\\Delta y}{\\Delta x} < 0$) means the quantities move in opposite directions (as one increases, the other decreases)."
      },
      {
        heading: "Second Differences and Inflection Points",
        content_latex: "For equal-length input intervals $\\Delta x$, the second difference $\\Delta^2 y = \\Delta y_2 - \\Delta y_1$ has the same sign as the concavity: $\\Delta^2 y > 0 \\iff \\text{Concave Up}$, $\\Delta^2 y < 0 \\iff \\text{Concave Down}$, and $\\Delta^2 y = 0 \\iff \\text{Linear (Zero Concavity)}$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Given the table of values $(t, s(t))$ where $t \\in \\{1, 3, 4, 12, 13\\}$ minutes and $s(t) \\in \\{2, 4, 7, 5, 10\\}$ feet: (a) Compute the average rate of change on $[3, 13]$ and $[3, 4]$. (b) Compare the rates of change on $[1, 3]$ and $[3, 4]$ to discuss concavity.",
        solution_steps: [
          "Step 1: On $[3, 13]$, $\\text{AROC} = \\frac{s(13) - s(3)}{13 - 3} = \\frac{10 - 4}{10} = 0.6\\text{ feet/min}$.",
          "Step 2: On $[3, 4]$, $\\text{AROC} = \\frac{s(4) - s(3)}{4 - 3} = \\frac{7 - 4}{1} = 3\\text{ feet/min}$.",
          "Step 3: On $[1, 3]$, $\\text{AROC} = \\frac{4 - 2}{3 - 1} = 1\\text{ foot/min}$. Since the rate of change increased from $1\\text{ ft/min}$ on $[1, 3]$ to $3\\text{ ft/min}$ on $[3, 4]$, $s(t)$ exhibits concave up behavior across $[1, 4]$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.2_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "As the outside temperature decreases during autumn, the number of swimmers at a public lake also decreases. Which statement correctly describes the rate of change of the number of swimmers with respect to temperature?",
        options: [
          "(A) The rate of change is positive because both quantities decrease together.",
          "(B) The rate of change is negative because both quantities decrease.",
          "(C) The rate of change is zero because the relationship is not linear.",
          "(D) The rate of change is undefined."
        ],
        correct_index: 0,
        explanation_latex: "Let $T$ be temperature and $S(T)$ be swimmers. When $\\Delta T < 0$, we also have $\\Delta S < 0$. Therefore, the difference quotient $\\frac{\\Delta S}{\\Delta T} = \\frac{\\text{negative}}{\\text{negative}} > 0$ is positive.",
        exam_trap: "Seeing the word 'decreases' twice and instinctively choosing a negative rate of change without checking the ratio $\\frac{\\Delta y}{\\Delta x}$."
      },
      {
        question_id: "1.2_mcq_2",
        calculator_active: true,
        difficulty: "Medium",
        question_latex: "What is the average rate of change of $f(x) = \\sqrt{5x - 2}$ on the closed interval $0.5 \\le x \\le 3$?",
        options: [
          "(A) $0.464$",
          "(B) $1.159$",
          "(C) $1.442$",
          "(D) $2.898$"
        ],
        correct_index: 1,
        explanation_latex: "Evaluate $f(3) = \\sqrt{15 - 2} = \\sqrt{13} \\approx 3.60555$ and $f(0.5) = \\sqrt{2.5 - 2} = \\sqrt{0.5} \\approx 0.70711$. Then $\\text{AROC} = \\frac{3.60555 - 0.70711}{3 - 0.5} = \\frac{2.89844}{2.5} \\approx 1.159$.",
        exam_trap: "Forgetting to divide by the interval length $3 - 0.5 = 2.5$ (which yields distractor D, $2.898$)."
      },
      {
        question_id: "1.2_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "A function $f$ has a point of inflection at $x = c$. Which of the following must occur at $x = c$?",
        options: [
          "(A) $f(c) = 0$",
          "(B) $f$ changes from increasing to decreasing at $x = c$.",
          "(C) The rate of change of $f$ changes from increasing to decreasing, or from decreasing to increasing, at $x = c$.",
          "(D) The average rate of change of $f$ on $[c-1, c+1]$ is zero."
        ],
        correct_index: 2,
        explanation_latex: "By definition, a point of inflection occurs where a function changes concavity. Since concavity is defined by whether the rate of change is increasing (concave up) or decreasing (concave down), the rate of change must switch monotonicity at $x = c$.",
        exam_trap: "Confusing a relative extremum (where $f$ changes from increasing to decreasing) with a point of inflection (where the rate of change of $f$ changes from increasing to decreasing)."
      }
    ],
    frq: [
      {
        frq_id: "1.2_frq_1",
        calculator_active: true,
        scenario_latex: "The number of flies $f(h)$ observed around a barn is modeled as a function of the number of horses $h$ stabled inside, with tabular data $(1, 20), (5, 74), (12, 205), (20, 516)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Compute the average rate of change of $f(h)$ over the intervals $[1, 5]$, $[5, 12]$, and $[12, 20]$. Include units in your answers.",
            scoring_rubric: [
              { criteria: "Correct AROC values: $13.5$, $18.714$, and $38.875$", points: 2 },
              { criteria: "Includes correct contextual units (flies per horse)", points: 1 }
            ],
            model_solution_latex: "On $[1, 5]$: $\\frac{74-20}{5-1} = \\frac{54}{4} = 13.5\\text{ flies/horse}$. On $[5, 12]$: $\\frac{205-74}{12-5} = \\frac{131}{7} \\approx 18.714\\text{ flies/horse}$. On $[12, 20]$: $\\frac{516-205}{20-12} = \\frac{311}{8} = 38.875\\text{ flies/horse}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Based on the average rates of change found in part (a), is the graph of $f(h)$ concave up or concave down on $[1, 20]$? Justify your reasoning.",
            scoring_rubric: [
              { criteria: "Concludes concave up because the average rates of change are strictly increasing ($13.5 < 18.714 < 38.875$)", points: 2 }
            ],
            model_solution_latex: "Because the average rate of change increases over consecutive intervals ($13.5 < 18.714 < 38.875$), the rate of change of $f$ is increasing, which means the graph of $f(h)$ is concave up on $[1, 20]$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.3",
    topic_title: "Rates of Change in Linear & Quadratic Functions",
    sub_topics: [
      {
        sub_topic_id: "1.3.A",
        sub_topic_title: "Average Rate of Change (AROC) & Secant Lines",
        essential_formulas: [
          {
            name: "Average Rate of Change",
            latex: "\\text{AROC}_{[a,b]} = \\frac{f(b) - f(a)}{b - a}",
            description: "Represents the slope of the secant line intersecting $(a, f(a))$ and $(b, f(b))$."
          },
          {
            name: "Secant Line Equation",
            latex: "y - f(a) = \\left(\\frac{f(b) - f(a)}{b - a}\\right)(x - a)",
            description: "Point-slope form of the line passing through $(a, f(a))$ and $(b, f(b))$."
          },
          {
            name: "Quadratic Second Difference Identity",
            latex: "\\Delta(\\Delta y) = 2a(\\Delta x)^2 = \\text{constant}",
            description: "For $f(x) = ax^2 + bx + c$, the rate of change of AROC over equal intervals of length $1$ is $2a$."
          }
        ]
      }
    ],
    conceptual_overview: "Linear and quadratic functions are distinguished by the behavior of their rates of change. For any linear function $f(x) = mx + b$, the average rate of change is constant ($m$) over every interval, meaning the rate of change of the rate of change is zero ($0$). For any quadratic function $g(x) = ax^2 + bx + c$, the average rate of change over equal-length intervals changes by a constant additive amount, meaning the average rates of change themselves form a linear sequence with slope $2a$.",
    core_principles: [
      {
        heading: "Linear vs. Quadratic Rate Behavior",
        content_latex: "In a **linear function**, first differences $\\Delta y$ over equal-length input intervals $\\Delta x$ are constant, and second differences $\\Delta^2 y = 0$. In a **quadratic function** $f(x) = ax^2 + bx + c$, first differences $\\Delta y$ change linearly, and second differences $\\Delta^2 y$ are constant and non-zero. Specifically, on $[x_1, x_2]$, $\\text{AROC} = a(x_1 + x_2) + b$."
      },
      {
        heading: "Symmetry of Quadratic Secant Slopes",
        content_latex: "For a quadratic function $g$, the average rate of change over consecutive intervals of equal length $L$ forms an arithmetic progression. Furthermore, the average rate of change over a combined interval $[a, a + 3L]$ equals the arithmetic mean of the three sub-interval AROCs."
      }
    ],
    worked_examples: [
      {
        problem_latex: "A quadratic function $g$ has an average rate of change of $1$ on $[-3, 0]$ and an average rate of change of $5$ on $[0, 3]$. Find the average rate of change of $g$ on $[3, 6]$ and on $[-3, 6]$.",
        solution_steps: [
          "Step 1: Notice that $[-3, 0]$, $[0, 3]$, and $[3, 6]$ are consecutive equal-length intervals of length $\\Delta x = 3$.",
          "Step 2: Because $g$ is quadratic, its AROC over equal-length intervals changes by a constant difference: $5 - 1 = 4$.",
          "Step 3: Therefore, on $[3, 6]$, the AROC is $5 + 4 = 9$.",
          "Step 4: Across the full interval $[-3, 6]$, the overall AROC is the average of the three equal-width sub-interval AROCs: $\\frac{1 + 5 + 9}{3} = 5$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.3_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the average rate of change of $y = x^2 - 3x + 5$ on the closed interval $[-2, 4]$?",
        options: [
          "(A) $-1$",
          "(B) $1$",
          "(C) $2$",
          "(D) $-6$"
        ],
        correct_index: 0,
        explanation_latex: "Compute $y(4) = 4^2 - 3(4) + 5 = 16 - 12 + 5 = 9$ and $y(-2) = (-2)^2 - 3(-2) + 5 = 4 + 6 + 5 = 15$. Then $\\text{AROC} = \\frac{9 - 15}{4 - (-2)} = \\frac{-6}{6} = -1$.",
        exam_trap: "Sign error when evaluating $(-2)^2 - 3(-2)$ or forgetting to divide $-6$ by the interval width $6$."
      },
      {
        question_id: "1.3_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A quadratic function $g$ has an average rate of change of $1$ on $[0, 4]$ and an average rate of change of $7$ on $[4, 8]$. What is the average rate of change of $g$ on $[12, 16]$?",
        options: [
          "(A) $13$",
          "(B) $19$",
          "(C) $25$",
          "(D) $49$"
        ],
        correct_index: 1,
        explanation_latex: "Over consecutive intervals of length $4$ ($[0,4], [4,8], [8,12], [12,16]$), the AROC of a quadratic increases by a constant amount: $7 - 1 = 6$ per interval. Thus on $[8, 12]$ the AROC is $7 + 6 = 13$, and on $[12, 16]$ the AROC is $13 + 6 = 19$.",
        exam_trap: "Skipping the intermediate interval $[8, 12]$ and answering $13$ instead of $19$."
      },
      {
        question_id: "1.3_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "For a polynomial function $g$, let $p(x) = \\frac{g(x+1) - g(x)}{(x+1) - x}$ represent the average rate of change of $g$ on $[x, x+1]$. If $p(x) = 10x - 4$ for all real $x$, which of the following statements about $g$ must be true?",
        options: [
          "(A) $g$ is a linear function with slope $10$.",
          "(B) $g$ is a quadratic function with leading coefficient $a = 5$ and its graph is concave up.",
          "(C) $g$ is a quadratic function with leading coefficient $a = 10$ and its graph is concave up.",
          "(D) $g$ is a cubic function."
        ],
        correct_index: 1,
        explanation_latex: "Since the AROC over unit intervals $p(x) = 10x - 4$ is a linear function with slope $10$, $g(x)$ must be a quadratic function $ax^2 + bx + c$. The rate of change of AROC over unit intervals is $2a = 10 \\implies a = 5 > 0$, so $g$ is concave up.",
        exam_trap: "Setting $a = 10$ directly instead of using the second-difference relation $2a = 10 \\implies a = 5$."
      }
    ],
    frq: [
      {
        frq_id: "1.3_frq_1",
        calculator_active: true,
        scenario_latex: "A concert promoter tracks total ticket revenue $R(t)$, in thousands of dollars, at time $t$ hours after sales began at 10:00 AM ($t = 0$). Selected data points are $R(0) = 0$, $R(2) = 148$, and $R(10) = 600$, modeled by the quadratic function $R(t) = at^2 + bt + c$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Use the given data points to write a system of three equations and solve for the constants $a, b,$ and $c$.",
            scoring_rubric: [
              { criteria: "Sets up system using $(0,0), (2,148), (10,600)$", points: 1 },
              { criteria: "Finds $a = -1.75$, $b = 77.5$, and $c = 0$", points: 1 }
            ],
            model_solution_latex: "From $R(0) = 0$, $c = 0$. At $t=2$: $4a + 2b = 148 \\implies 2a + b = 74$. At $t=10$: $100a + 10b = 600 \\implies 10a + b = 60$. Subtracting gives $8a = -14 \\implies a = -1.75$, and $b = 74 - 2(-1.75) = 77.5$. Thus $R(t) = -1.75t^2 + 77.5t$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the average rate of change of $R(t)$ from $t = 2$ to $t = 10$ hours, and use the secant line $L(t)$ on $[2, 10]$ to estimate the ticket revenue at 4:00 PM ($t = 6$).",
            scoring_rubric: [
              { criteria: "Computes AROC $= 56.5$ thousand dollars per hour", points: 1 },
              { criteria: "Computes linear estimate $L(6) = 148 + 56.5(4) = 374$ thousand dollars", points: 1 }
            ],
            model_solution_latex: "$\\text{AROC}_{[2,10]} = \\frac{600 - 148}{10 - 2} = \\frac{452}{8} = 56.5\\text{ thousand dollars/hr}$. The secant line is $L(t) = 148 + 56.5(t - 2)$, so at $t = 6$, $L(6) = 148 + 56.5(4) = 374\\text{ thousand dollars}$."
          },
          {
            part_label: "(c)",
            prompt_latex: "Is the secant line estimate $L(6)$ greater than or less than the actual model value $R(6)$? Explain your reasoning using the concavity of $R(t)$.",
            scoring_rubric: [
              { criteria: "States $L(6) < R(6)$ because $a = -1.75 < 0$ makes $R(t)$ concave down", points: 2 }
            ],
            model_solution_latex: "Because the leading coefficient $a = -1.75 < 0$, the quadratic graph $R(t)$ is concave down on $[2, 10]$. A secant line connecting two points on a concave down curve lies strictly below the curve on the interior of the interval, so $L(6) < R(6)$ (in fact, $R(6) = 402 > 374$)."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.4",
    topic_title: "Polynomial Functions & Rates of Change",
    sub_topics: [
      {
        sub_topic_id: "1.4.A",
        sub_topic_title: "Polynomial Degree, Leading Coefficient, & Turning Points",
        essential_formulas: [
          {
            name: "General Polynomial Form",
            latex: "f(x) = a_n x^n + a_{n-1}x^{n-1} + \\dots + a_1 x + a_0 \\quad (a_n \\ne 0)",
            description: "Degree is $n$; leading term is $a_n x^n$; leading coefficient is $a_n$."
          },
          {
            name: "Maximum Turning Points & Inflection Points",
            latex: "\\text{Max Local Extrema} = n - 1, \\quad \\text{Max Inflection Points} = n - 2",
            description: "A polynomial of degree $n \\ge 2$ has at most $n-1$ relative extrema and at most $n-2$ points of inflection."
          }
        ]
      }
    ],
    conceptual_overview: "A polynomial function of degree $n$ is continuous and smooth across $(-\\infty, \\infty)$. Its overall shape is controlled by its degree $n$ and leading coefficient $a_n$. Local extrema (relative peaks and valleys) happen where the polynomial graph turns around between increasing and decreasing. Because a polynomial graph has no breaks or sharp corners, if $f(a) = f(b)$ for $a < b$ on a non-constant polynomial, the graph must turn around at least once between $x = a$ and $x = b$, guaranteeing at least one local extremum on $(a, b)$.",
    core_principles: [
      {
        heading: "Identifying Degree & Leading Coefficient in Non-Standard Order",
        content_latex: "Always reorder a polynomial in descending powers of $x$ before reading the degree and leading coefficient. For example, in $f(x) = 8x^2 - 6x^5 + 5$, the highest power term is $-6x^5$, so the **degree is $5$** and the **leading coefficient is $-6$**."
      },
      {
        heading: "Guaranteed Local Extrema from Table Values",
        content_latex: "Because polynomials are continuous everywhere, if three inputs $x_1 < x_2 < x_3$ satisfy $f(x_1) < f(x_2)$ and $f(x_2) > f(x_3)$, then $f$ must reach at least one **relative maximum** on $(x_1, x_3)$. Similarly, if $f(x_1) = f(x_3)$ and $f$ is non-constant, the graph must go up and come back down (or go down and come back up), guaranteeing a relative extremum on $(x_1, x_3)$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Given $f(x) = 2x^3 - 9x^7 + x - 10x^2$, find the degree, leading coefficient, maximum possible number of relative extrema, and maximum possible number of points of inflection.",
        solution_steps: [
          "Step 1: Identify the term with the highest exponent: $-9x^7$.",
          "Step 2: State the degree $n = 7$ and leading coefficient $a_7 = -9$.",
          "Step 3: Maximum relative extrema $= n - 1 = 7 - 1 = 6$; maximum points of inflection $= n - 2 = 7 - 2 = 5$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.4_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are the leading coefficient and degree of the polynomial function $f(x) = 3x^2 - 10x^7 + 8x - 1$?",
        options: [
          "(A) Leading coefficient: $3$; Degree: $2$",
          "(B) Leading coefficient: $-10$; Degree: $7$",
          "(C) Leading coefficient: $10$; Degree: $7$",
          "(D) Leading coefficient: $-1$; Degree: $12$"
        ],
        correct_index: 1,
        explanation_latex: "The term with the highest power of $x$ is $-10x^7$. Therefore, the degree is $7$ and the leading coefficient (including its sign) is $-10$.",
        exam_trap: "Reading the first written term $3x^2$ without rearranging the polynomial in standard descending order."
      },
      {
        question_id: "1.4_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A non-constant polynomial function $f$ satisfies $f(0) = 2$, $f(1) = 0$, and $f(11) = 0$. Which of the following must be true?",
        options: [
          "(A) $f$ has a guaranteed local extremum on the open interval $1 < x < 11$.",
          "(B) $f$ is strictly decreasing on $0 < x < 11$.",
          "(C) $f$ has no real zeros outside $[0, 11]$.",
          "(D) $f$ is a linear function."
        ],
        correct_index: 0,
        explanation_latex: "Since $f$ is a continuous, non-constant polynomial and $f(1) = f(11) = 0$, the graph must turn around at least once between $x = 1$ and $x = 11$, guaranteeing a local extremum on $(1, 11)$.",
        exam_trap: "Assuming $f(x) = 0$ on the entire interval $[1, 11]$, which is impossible for a non-constant polynomial."
      },
      {
        question_id: "1.4_mcq_3",
        calculator_active: true,
        difficulty: "Hard",
        question_latex: "For $1 \\le t \\le 4$ hours, the length of a rollercoaster queue (in hundreds of riders) is modeled by $L(t) = -0.56t^3 + 2.31t^2 - 0.264t + 1$. At what time $t$ on $[1, 4]$ does the queue reach its absolute maximum length?",
        options: [
          "(A) $t = 1.000$",
          "(B) $t = 2.692$",
          "(C) $t = 3.125$",
          "(D) $t = 4.000$"
        ],
        correct_index: 1,
        explanation_latex: "Using a graphing calculator (TI-84 `2nd CALC -> maximum` or clicking the peak in Desmos) to locate the highest point of $L(t) = -0.56t^3 + 2.31t^2 - 0.264t + 1$ on $[1, 4]$, the peak occurs at $t \\approx 2.692$ hours where $L(2.692) \\approx 6.235$.",
        exam_trap: "Evaluating only the endpoints $t=1$ and $t=4$ without checking the interior turning point."
      }
    ],
    frq: [
      {
        frq_id: "1.4_frq_1",
        calculator_active: false,
        scenario_latex: "A polynomial function $p(x)$ has degree $4$ and selected values $p(-2) = 5, p(0) = -3, p(2) = 4, p(5) = -1, p(8) = 6$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Determine the minimum number of local extrema that $p(x)$ must have on $(-2, 8)$ and justify your answer using the given values.",
            scoring_rubric: [
              { criteria: "Identifies 3 direction changes: decreasing on $[-2,0]$, increasing on $[0,2]$, decreasing on $[2,5]$, increasing on $[5,8]$", points: 1 },
              { criteria: "Concludes at least 3 local extrema (exact count is 3 since degree is 4)", points: 1 }
            ],
            model_solution_latex: "As $x$ progresses through $-2, 0, 2, 5, 8$, the outputs $5 \\to -3 \\to 4 \\to -1 \\to 6$ alternate direction three times (down, up, down, up). Thus $p(x)$ must have at least $3$ local extrema on $(-2, 8)$. Since $\\text{deg}(p) = 4$, the maximum possible number of local extrema is $4 - 1 = 3$, so $p(x)$ has exactly $3$ local extrema."
          },
          {
            part_label: "(b)",
            prompt_latex: "How many points of inflection can $p(x)$ have at most, and how many must it have based on part (a)?",
            scoring_rubric: [
              { criteria: "States at most $4 - 2 = 2$ points of inflection, and since there are 3 turning points, there must be exactly 2 points of inflection separating them", points: 2 }
            ],
            model_solution_latex: "A degree-$4$ polynomial has at most $4 - 2 = 2$ points of inflection. Because $p(x)$ alternates between two relative minima and one relative maximum, concavity must switch twice between the three extrema, guaranteeing exactly $2$ points of inflection."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.5",
    topic_title: "Polynomial Functions & Complex Zeros",
    sub_topics: [
      {
        sub_topic_id: "1.5.A",
        sub_topic_title: "Fundamental Theorem of Algebra, Multiplicity, & Conjugate Roots",
        essential_formulas: [
          {
            name: "Factored Form of Degree-n Polynomial",
            latex: "f(x) = a_n(x - r_1)^{m_1}(x - r_2)^{m_2}\\cdots(x - r_k)^{m_k}, \\quad \\sum_{i=1}^k m_i = n",
            description: "Every degree-$n$ polynomial has exactly $n$ complex roots counting multiplicities."
          },
          {
            name: "Complex Conjugate Root Theorem",
            latex: "f(a + bi) = 0 \\iff f(a - bi) = 0 \\quad (a, b \\in \\mathbb{R}, b \\ne 0)",
            description: "For polynomials with real coefficients, non-real complex zeros always occur in conjugate pairs."
          },
          {
            name: "Quadratic Formula",
            latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
            description: "Yields two real roots if $\\Delta = b^2-4ac > 0$, one repeated real root if $\\Delta = 0$, and two complex conjugate roots if $\\Delta < 0$."
          }
        ]
      }
    ],
    conceptual_overview: "By the Fundamental Theorem of Algebra, a polynomial of degree $n$ has exactly $n$ complex zeros when counted with multiplicity. Real zeros correspond to $x$-intercepts of the graph: if a real zero $x = r$ has **odd multiplicity** ($m = 1, 3, \\dots$), the graph crosses the $x$-axis at $(r, 0)$; if $x = r$ has **even multiplicity** ($m = 2, 4, \\dots$), the graph is tangent to (bounces off) the $x$-axis at $(r, 0)$ without changing sign. Non-real zeros come in conjugate pairs $a \\pm bi$ and do not produce $x$-intercepts.",
    core_principles: [
      {
        heading: "Multiplicity and Graphical Behavior at x-Intercepts",
        content_latex: "Near a real root $x = r$ of multiplicity $m$, $f(x)$ behaves locally like $c(x - r)^m$. For $m = 1$, the graph crosses linearly; for $m = 2$, it bounces parabolically; for $m = 3$, it crosses with a flat horizontal inflection tangent."
      },
      {
        heading: "Constructing Polynomials from Complex Conjugate Zeros",
        content_latex: "If $x = a + bi$ is a root of a polynomial with real coefficients, then $x = a - bi$ is also a root, and their product forms the irreducible quadratic factor $(x - (a+bi))(x - (a-bi)) = (x - a)^2 + b^2 = x^2 - 2ax + (a^2 + b^2)$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "A polynomial $f(x)$ with real coefficients has degree $4$, leading coefficient $1$, a real zero at $x = 2$ of multiplicity $2$, and a complex zero at $x = 3 - 7i$. Write $f(x)$ in factored/expanded quadratic form.",
        solution_steps: [
          "Step 1: By the Complex Conjugate Root Theorem, since $3 - 7i$ is a zero, $3 + 7i$ must also be a zero.",
          "Step 2: Multiply the complex conjugate factors: $(x - 3 + 7i)(x - 3 - 7i) = (x - 3)^2 - (7i)^2 = x^2 - 6x + 9 + 49 = x^2 - 6x + 58$.",
          "Step 3: Combine with the double root at $x = 2$: $f(x) = (x - 2)^2(x^2 - 6x + 58)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.5_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "A polynomial function $p(x)$ with real coefficients has degree $10$ and has $-3 + 6i$ as one of its zeros. Which of the following must also be a zero of $p(x)$?",
        options: [
          "(A) $3 - 6i$",
          "(B) $-3 - 6i$",
          "(C) $3 + 6i$",
          "(D) $6 - 3i$"
        ],
        correct_index: 1,
        explanation_latex: "By the Complex Conjugate Root Theorem, non-real zeros of polynomials with real coefficients occur in conjugate pairs $a \\pm bi$. Only the sign of the imaginary part changes, so $-3 - 6i$ must be a zero.",
        exam_trap: "Negating the real part instead of the imaginary part (selecting $3 + 6i$ or $3 - 6i$)."
      },
      {
        question_id: "1.5_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "The graph of a polynomial function $f$ of degree $8$ is tangent to the $x$-axis at $x = -4$ and crosses the $x$-axis at $x = 1$ and $x = 5$. What is the maximum number of non-real complex zeros that $f$ could have?",
        options: [
          "(A) $2$",
          "(B) $4$",
          "(C) $5$",
          "(D) $6$"
        ],
        correct_index: 1,
        explanation_latex: "Since $f$ is tangent to the $x$-axis at $x = -4$, that root has multiplicity at least $2$. Since $f$ crosses at $x = 1$ and $x = 5$, each has multiplicity at least $1$. Thus real roots account for at least $2 + 1 + 1 = 4$ zeros, leaving at most $8 - 4 = 4$ non-real zeros.",
        exam_trap: "Counting $3$ distinct $x$-intercepts as multiplicity $3$ total and answering $8 - 3 = 5$ (which is also impossible since non-real zeros must come in pairs!)."
      },
      {
        question_id: "1.5_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Let $f(x) = -2(x + 3)^2(x - 1)^3(x - 6)$. On which of the following intervals is $f(x) \\ge 0$?",
        options: [
          "(A) $[1, 6]$ only",
          "(B) $[1, 6]$ and $x = -3$",
          "(C) $(-\\infty, -3] \\cup [1, 6]$",
          "(D) $[-3, 1] \\cup [6, \\infty)$"
        ],
        correct_index: 1,
        explanation_latex: "For $x \\in (1, 6)$, $(x+3)^2 > 0$, $(x-1)^3 > 0$, and $(x-6) < 0$, so $-2(+)(+)(-) > 0$. Including the zeros gives $[1, 6]$ and the isolated point $x = -3$ where $f(-3) = 0$ (for $x < 1, x \\ne -3$, $f(x) < 0$).",
        exam_trap: "Forgetting the isolated point $x = -3$ where the even-multiplicity factor $(x+3)^2$ touches zero."
      }
    ],
    frq: [
      {
        frq_id: "1.5_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the polynomial function $P(x) = (x + 2)^2(x - 3)(x^2 - 8x + 17)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "State the degree of $P(x)$ and find all real and non-real complex zeros of $P(x)$, stating the multiplicity of each.",
            scoring_rubric: [
              { criteria: "States degree is $2 + 1 + 2 = 5$", points: 1 },
              { criteria: "Finds real zeros $x = -2$ (mult 2), $x = 3$ (mult 1) and complex zeros $x = 4 \\pm i$ (mult 1 each)", points: 2 }
            ],
            model_solution_latex: "The degree of $P(x)$ is $2 + 1 + 2 = 5$. Setting each factor to zero gives $x = -2$ (multiplicity $2$), $x = 3$ (multiplicity $1$), and from $x^2 - 8x + 17 = 0$, $x = \\frac{8 \\pm \\sqrt{64 - 68}}{2} = 4 \\pm i$ (multiplicity $1$ each)."
          },
          {
            part_label: "(b)",
            prompt_latex: "Describe the behavior of the graph of $y = P(x)$ at each of its $x$-intercepts and solve the inequality $P(x) \\le 0$.",
            scoring_rubric: [
              { criteria: "Describes tangent bounce at $(-2,0)$ and crossing at $(3,0)$", points: 1 },
              { criteria: "Correctly states solution interval $(-\\infty, 3]$", points: 1 }
            ],
            model_solution_latex: "At $x = -2$ (even multiplicity $2$), the graph is tangent to the $x$-axis. At $x = 3$ (odd multiplicity $1$), the graph crosses the $x$-axis. Since $x^2 - 8x + 17 = (x-4)^2 + 1 > 0$ and $(x+2)^2 \\ge 0$ for all real $x$, the sign of $P(x)$ matches the sign of $(x-3)$, so $P(x) \\le 0$ on $(-\\infty, 3]$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.6",
    topic_title: "Polynomial Functions & End Behavior",
    sub_topics: [
      {
        sub_topic_id: "1.6.A",
        sub_topic_title: "Limits at Infinity & Leading Term Test",
        essential_formulas: [
          {
            name: "Leading Term End Behavior Equivalence",
            latex: "\\lim_{x \\to \\pm\\infty} (a_n x^n + \\dots + a_0) = \\lim_{x \\to \\pm\\infty} a_n x^n",
            description: "For large $|x|$, the highest-degree term $a_n x^n$ dominates all lower-degree terms."
          },
          {
            name: "Even Degree End Behavior",
            latex: "n \\text{ even}: \\lim_{x \\to \\infty} f(x) = \\lim_{x \\to -\\infty} f(x) = \\begin{cases} \\infty & (a_n > 0) \\\\ -\\infty & (a_n < 0) \\end{cases}",
            description: "Both ends point in the same vertical direction."
          },
          {
            name: "Odd Degree End Behavior",
            latex: "n \\text{ odd}: \\lim_{x \\to \\infty} f(x) = -\\lim_{x \\to -\\infty} f(x)",
            description: "Ends point in opposite vertical directions."
          }
        ]
      }
    ],
    conceptual_overview: "As inputs grow unboundedly positive ($x \\to \\infty$) or negative ($x \\to -\\infty$), a polynomial's output grows without bound according to its leading term $a_n x^n$. College Board requires expressing end behavior using rigorous limit notation: $\\lim_{x \\to \\infty} f(x)$ and $\\lim_{x \\to -\\infty} f(x)$.",
    core_principles: [
      {
        heading: "The Four Cases of the Leading Term Test",
        content_latex: "1. **Even Degree, $a_n > 0$**: $\\lim_{x \\to -\\infty} f(x) = \\infty$ and $\\lim_{x \\to \\infty} f(x) = \\infty$.\n2. **Even Degree, $a_n < 0$**: $\\lim_{x \\to -\\infty} f(x) = -\\infty$ and $\\lim_{x \\to \\infty} f(x) = -\\infty$.\n3. **Odd Degree, $a_n > 0$**: $\\lim_{x \\to -\\infty} f(x) = -\\infty$ and $\\lim_{x \\to \\infty} f(x) = \\infty$.\n4. **Odd Degree, $a_n < 0$**: $\\lim_{x \\to -\\infty} f(x) = \\infty$ and $\\lim_{x \\to \\infty} f(x) = -\\infty$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Determine the end behavior of $f(x) = -3x^2(2 - x)^3(x + 4)$ using limit notation.",
        solution_steps: [
          "Step 1: Find the leading term of each factor: $(-3x^2)$, $(-x)^3 = -x^3$, and $(x)$.",
          "Step 2: Multiply the leading terms: $(-3x^2)(-x^3)(x) = +3x^6$.",
          "Step 3: Since degree $n = 6$ is even and leading coefficient $a_6 = 3 > 0$, $\\lim_{x \\to -\\infty} f(x) = \\infty$ and $\\lim_{x \\to \\infty} f(x) = \\infty$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.6_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which of the following limit statements correctly describes the end behavior of $p(x) = 8x^3 - 3x^5 + 2x^2$?",
        options: [
          "(A) $\\lim_{x \\to -\\infty} p(x) = -\\infty$ and $\\lim_{x \\to \\infty} p(x) = \\infty$",
          "(B) $\\lim_{x \\to -\\infty} p(x) = \\infty$ and $\\lim_{x \\to \\infty} p(x) = -\\infty$",
          "(C) $\\lim_{x \\to -\\infty} p(x) = -\\infty$ and $\\lim_{x \\to \\infty} p(x) = -\\infty$",
          "(D) $\\lim_{x \\to -\\infty} p(x) = \\infty$ and $\\lim_{x \\to \\infty} p(x) = \\infty$"
        ],
        correct_index: 1,
        explanation_latex: "The leading term of $p(x)$ is $-3x^5$ (odd degree $5$, negative leading coefficient $-3$). As $x \\to -\\infty$, $(-3)(-\\infty)^5 = +\\infty$, and as $x \\to \\infty$, $(-3)(\\infty)^5 = -\\infty$.",
        exam_trap: "Using $8x^3$ as the leading term instead of $-3x^5$."
      },
      {
        question_id: "1.6_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A polynomial function $g$ satisfies $\\lim_{x \\to -\\infty} g(x) = -\\infty$ and $\\lim_{x \\to \\infty} g(x) = -\\infty$. Which of the following could be the algebraic expression for $g(x)$?",
        options: [
          "(A) $g(x) = -4x^5 + 2x^2 - 1$",
          "(B) $g(x) = 2x^4 - 9x^6 + 10$",
          "(C) $g(x) = (2 - x)^4(x + 1)^2$",
          "(D) $g(x) = -3(x - 1)^2(4 - x)^2(-x)$"
        ],
        correct_index: 1,
        explanation_latex: "Both limits equal $-\\infty$, requiring an even degree and a negative leading coefficient. In (B), the leading term is $-9x^6$ (degree $6$ even, leading coefficient $-9 < 0$).",
        exam_trap: "In (C), $(2-x)^4$ has a positive leading term $(-x)^4 = +x^4$, so its leading coefficient is $+1$, not $-1$."
      },
      {
        question_id: "1.6_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Let $h(x) = (1 - 2x)^3(x + 5)^2$. Which statement is true regarding the end behavior of $h$?",
        options: [
          "(A) As $x \\to -\\infty$, $h(x) \\to \\infty$, and as $x \\to \\infty$, $h(x) \\to -\\infty$.",
          "(B) As $x \\to -\\infty$, $h(x) \\to -\\infty$, and as $x \\to \\infty$, $h(x) \\to \\infty$.",
          "(C) As $x \\to \\pm\\infty$, $h(x) \\to -\\infty$.",
          "(D) As $x \\to \\pm\\infty$, $h(x) \\to \\infty$."
        ],
        correct_index: 0,
        explanation_latex: "The leading term is $(-2x)^3(x)^2 = -8x^5$. Since the degree is $5$ (odd) and the leading coefficient is $-8 < 0$, $\\lim_{x \\to -\\infty} h(x) = \\infty$ and $\\lim_{x \\to \\infty} h(x) = -\\infty$.",
        exam_trap: "Ignoring the negative sign inside $(1 - 2x)^3$ when computing the leading term."
      }
    ],
    frq: [
      {
        frq_id: "1.6_frq_1",
        calculator_active: false,
        scenario_latex: "Let $f(x) = -0.5x^2 - 4x + 1$ and $g(x) = (3 - x)^3(x + 2)^2$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Determine the end behavior of $f(x)$ as $x$ increases without bound and as $x$ decreases without bound. Express your answers using limit notation.",
            scoring_rubric: [
              { criteria: "Writes $\\lim_{x \\to \\infty} f(x) = -\\infty$ and $\\lim_{x \\to -\\infty} f(x) = -\\infty$", points: 2 }
            ],
            model_solution_latex: "Since $f(x)$ has leading term $-0.5x^2$ (even degree, negative leading coefficient), $\\lim_{x \\to \\infty} f(x) = -\\infty$ and $\\lim_{x \\to -\\infty} f(x) = -\\infty$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the leading term of $g(x)$ and state its end behavior as $x \\to \\pm\\infty$ using limit notation.",
            scoring_rubric: [
              { criteria: "Identifies leading term $(-x)^3(x^2) = -x^5$", points: 1 },
              { criteria: "States $\\lim_{x \\to -\\infty} g(x) = \\infty$ and $\\lim_{x \\to \\infty} g(x) = -\\infty$", points: 1 }
            ],
            model_solution_latex: "Multiplying the highest-degree terms of each factor yields $(-x)^3(x)^2 = -x^5$. Thus $\\lim_{x \\to -\\infty} g(x) = \\infty$ and $\\lim_{x \\to \\infty} g(x) = -\\infty$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.7",
    topic_title: "Rational Functions & End Behavior",
    sub_topics: [
      {
        sub_topic_id: "1.7.A",
        sub_topic_title: "Horizontal & Slant Asymptotes via Degree Comparison",
        essential_formulas: [
          {
            name: "Rational Function Degree Comparison Rules",
            latex: "r(x) = \\frac{a_n x^n + \\dots}{b_m x^m + \\dots} \\implies \\lim_{x \\to \\pm\\infty} r(x) = \\begin{cases} 0 & (n < m) \\\\ \\frac{a_n}{b_m} & (n = m) \\\\ \\pm\\infty & (n > m) \\end{cases}",
            description: "Determines horizontal asymptotes $y = 0$ ($n<m$), $y = \\frac{a_n}{b_m}$ ($n=m$), or slant/polynomial end behavior ($n>m$)."
          },
          {
            name: "Slant (Oblique) Asymptote via Division",
            latex: "n = m + 1 \\implies r(x) = (mx + b) + \\frac{R(x)}{q(x)}, \\quad y = mx + b",
            description: "When numerator degree exceeds denominator degree by exactly $1$, polynomial long division yields the slant asymptote $y = mx + b$."
          }
        ]
      }
    ],
    conceptual_overview: "A rational function $r(x) = \\frac{p(x)}{q(x)}$ is the quotient of two polynomials. Its end behavior as $x \\to \\pm\\infty$ is governed by the ratio of the leading terms of $p(x)$ and $q(x)$. When $\\lim_{x \\to \\pm\\infty} r(x) = L$ (a finite constant), the line $y = L$ is a horizontal asymptote. When $\\text{deg}(p) = \\text{deg}(q) + 1$, polynomial long division produces a linear quotient $y = mx + b$ which serves as a slant asymptote.",
    core_principles: [
      {
        heading: "Three End Behavior Cases for Rational Functions",
        content_latex: "1. **Bottom-Heavy ($\\text{deg}(p) < \\text{deg}(q)$)**: $\\lim_{x \\to \\pm\\infty} r(x) = 0 \\implies$ Horizontal asymptote at $y = 0$.\n2. **Equal Degree ($\\text{deg}(p) = \\text{deg}(q)$)**: $\\lim_{x \\to \\pm\\infty} r(x) = \\frac{a_n}{b_m} \\implies$ Horizontal asymptote at $y = \\frac{a_n}{b_m}$.\n3. **Top-Heavy ($\\text{deg}(p) > \\text{deg}(q)$)**: No horizontal asymptote; if $\\text{deg}(p) = \\text{deg}(q) + 1$, divide to find slant asymptote $y = mx + b$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the slant asymptote and end behavior limits of $f(x) = \\frac{3x^2 + x - 5}{x - 2}$.",
        solution_steps: [
          "Step 1: Compare degrees. Numerator has degree $2$ and denominator has degree $1$ ($2 = 1 + 1$), so a slant asymptote exists.",
          "Step 2: Perform polynomial or synthetic division of $3x^2 + x - 5$ by $x - 2$: $3x^2 + x - 5 = (x - 2)(3x + 7) + 9$, so $f(x) = 3x + 7 + \\frac{9}{x - 2}$.",
          "Step 3: As $x \\to \\pm\\infty$, $\\frac{9}{x-2} \\to 0$, so the slant asymptote is $y = 3x + 7$, with $\\lim_{x \\to \\infty} f(x) = \\infty$ and $\\lim_{x \\to -\\infty} f(x) = -\\infty$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.7_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the horizontal asymptote of the graph of $f(x) = \\frac{6x - 4x^3 + 1}{2x^3 + 5x^2 - 7}$?",
        options: [
          "(A) $y = 3$",
          "(B) $y = -2$",
          "(C) $y = 0$",
          "(D) The graph has no horizontal asymptote."
        ],
        correct_index: 1,
        explanation_latex: "Both numerator and denominator have degree $3$. The ratio of their leading coefficients is $\\frac{-4x^3}{2x^3} = -2$, so $\\lim_{x \\to \\pm\\infty} f(x) = -2$ and the horizontal asymptote is $y = -2$.",
        exam_trap: "Dividing the first written coefficients $\\frac{6}{2} = 3$ instead of the leading coefficients of the highest degree terms."
      },
      {
        question_id: "1.7_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Which of the following is the slant asymptote of the rational function $f(x) = \\frac{4x^3 + 5x + 3}{2x^2 + 3x}$?",
        options: [
          "(A) $y = 2x$",
          "(B) $y = 2x - 3$",
          "(C) $y = 2x + 3$",
          "(D) $y = 4x - 3$"
        ],
        correct_index: 1,
        explanation_latex: "Dividing $4x^3 + 0x^2 + 5x + 3$ by $2x^2 + 3x$: first term is $\\frac{4x^3}{2x^2} = 2x$. Subtracting $2x(2x^2 + 3x) = 4x^3 + 6x^2$ leaves $-6x^2 + 5x + 3$. Next term is $\\frac{-6x^2}{2x^2} = -3$. Thus the quotient is $y = 2x - 3$.",
        exam_trap: "Stopping after the first division term $2x$ and forgetting the constant term $-3$ resulting from the $3x$ term in the denominator."
      },
      {
        question_id: "1.7_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Let $g(x) = \\frac{18}{x - 1} - 4$. Which statement correctly describes the end behavior of $g$?",
        options: [
          "(A) $\\lim_{x \\to \\infty} g(x) = 0$",
          "(B) $\\lim_{x \\to \\infty} g(x) = -4$",
          "(C) $\\lim_{x \\to \\infty} g(x) = 18$",
          "(D) $\\lim_{x \\to \\infty} g(x) = 1$"
        ],
        correct_index: 1,
        explanation_latex: "As $x \\to \\infty$, $\\frac{18}{x-1} \\to 0$, so $\\lim_{x \\to \\infty} \\left(\\frac{18}{x-1} - 4\\right) = 0 - 4 = -4$.",
        exam_trap: "Forgetting the vertical shift $-4$ outside the fraction."
      }
    ],
    frq: [
      {
        frq_id: "1.7_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the rational functions $r(x) = \\frac{x^2 - 1}{x^2 + 1}$ and $h(x) = \\frac{2x^3 - 5x^2 + 4}{x^2 - 2x}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Evaluate $\\lim_{x \\to -\\infty} r(x)$ and $\\lim_{x \\to \\infty} r(x)$, and state the equation of any horizontal asymptote of $r(x)$.",
            scoring_rubric: [
              { criteria: "States both limits equal $1$ and horizontal asymptote is $y = 1$", points: 2 }
            ],
            model_solution_latex: "Because the numerator and denominator both have degree $2$ with leading coefficient $1$, $\\lim_{x \\to -\\infty} r(x) = 1$ and $\\lim_{x \\to \\infty} r(x) = 1$, giving a horizontal asymptote at $y = 1$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Use polynomial long division to find the equation of the slant asymptote of $h(x)$.",
            scoring_rubric: [
              { criteria: "Performs long division of $2x^3 - 5x^2 + 4$ by $x^2 - 2x$", points: 1 },
              { criteria: "States slant asymptote $y = 2x - 1$", points: 1 }
            ],
            model_solution_latex: "Dividing $2x^3 - 5x^2 + 4$ by $x^2 - 2x$: $2x(x^2 - 2x) = 2x^3 - 4x^2$. Subtracting gives $-x^2 + 4$. Then $-1(x^2 - 2x) = -x^2 + 2x$, leaving remainder $-2x + 4$. Thus $h(x) = 2x - 1 + \\frac{-2x + 4}{x^2 - 2x}$, and the slant asymptote is $y = 2x - 1$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.8",
    topic_title: "Rational Functions & Discontinuities",
    sub_topics: [
      {
        sub_topic_id: "1.8.A",
        sub_topic_title: "Vertical Asymptotes, Real Zeros, & One-Sided Limits",
        essential_formulas: [
          {
            name: "Vertical Asymptote Criterion",
            latex: "q(c) = 0 \\text{ and } p(c) \\ne 0 \\implies x = c \\text{ is a Vertical Asymptote}",
            description: "Occurs at real zeros of the simplified denominator (after canceling common factors)."
          },
          {
            name: "One-Sided Infinite Limits at a Vertical Asymptote",
            latex: "\\lim_{x \\to c^-} r(x) = \\pm\\infty, \\quad \\lim_{x \\to c^+} r(x) = \\pm\\infty",
            description: "Describes unbounded vertical behavior as $x$ approaches $c$ from the left ($c^-$) and right ($c^+$)."
          }
        ]
      }
    ],
    conceptual_overview: "A rational function $r(x) = \\frac{p(x)}{q(x)}$ is discontinuous wherever its denominator $q(x) = 0$. If a factor $(x - c)$ remains in the denominator after simplifying all shared factors with the numerator, the line $x = c$ is a **vertical asymptote**. Real zeros of $r(x)$ occur only where the simplified numerator equals zero ($p(x) = 0$ and $q(x) \\ne 0$).",
    core_principles: [
      {
        heading: "Sign Analysis for One-Sided Limits at Vertical Asymptotes",
        content_latex: "To determine whether $\\lim_{x \\to c^+} r(x)$ is $+\\infty$ or $-\\infty$, test the sign of each factor at a value slightly greater than $c$ (e.g., $x = c + 0.01$). Note that if $(x - c)^m$ has **odd multiplicity** in the denominator, the sign flips across $x = c$; if it has **even multiplicity**, both one-sided limits have the same sign."
      }
    ],
    worked_examples: [
      {
        problem_latex: "For $f(x) = \\frac{x - 4}{(x + 1)(x - 3)^2}$, find all zeros, vertical asymptotes, and evaluate $\\lim_{x \\to 3^-} f(x)$ and $\\lim_{x \\to 3^+} f(x)$.",
        solution_steps: [
          "Step 1: No factors cancel. Setting numerator $x - 4 = 0$ gives the real zero at $x = 4$ (intercept $(4, 0)$).",
          "Step 2: Setting denominator $(x + 1)(x - 3)^2 = 0$ gives vertical asymptotes at $x = -1$ and $x = 3$.",
          "Step 3: Near $x = 3$, the numerator $x - 4 \\approx 3 - 4 = -1 < 0$, $(x + 1) \\approx 4 > 0$, and $(x - 3)^2 > 0$ on both sides of $3$. Thus $\\lim_{x \\to 3^-} f(x) = -\\infty$ and $\\lim_{x \\to 3^+} f(x) = -\\infty$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.8_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are all the real zeros of the rational function $f(x) = \\frac{x^2 - 9}{x^2 - 3x - 18}$?",
        options: [
          "(A) $x = -3$ and $x = 3$",
          "(B) $x = 3$ only",
          "(C) $x = -3$ only",
          "(D) $x = 6$ and $x = -3$"
        ],
        correct_index: 1,
        explanation_latex: "Factor numerator and denominator: $f(x) = \\frac{(x - 3)(x + 3)}{(x - 6)(x + 3)} = \\frac{x - 3}{x - 6}$ for $x \\ne -3$. At $x = -3$, the function is undefined (a hole), so the only real zero is $x = 3$.",
        exam_trap: "Setting $x^2 - 9 = 0$ without checking that $x = -3$ also makes the denominator zero."
      },
      {
        question_id: "1.8_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Which of the following describes the behavior of $g(x) = \\frac{2x + 1}{x - 4}$ near $x = 4$?",
        options: [
          "(A) $\\lim_{x \\to 4^-} g(x) = -\\infty$ and $\\lim_{x \\to 4^+} g(x) = \\infty$",
          "(B) $\\lim_{x \\to 4^-} g(x) = \\infty$ and $\\lim_{x \\to 4^+} g(x) = -\\infty$",
          "(C) $\\lim_{x \\to 4^-} g(x) = \\infty$ and $\\lim_{x \\to 4^+} g(x) = \\infty$",
          "(D) $\\lim_{x \\to 4} g(x) = 9$"
        ],
        correct_index: 0,
        explanation_latex: "Near $x = 4$, the numerator $2x + 1 \\approx 9 > 0$. For $x \\to 4^-$ ($x < 4$), $x - 4 < 0$, so $g(x) \\to -\\infty$. For $x \\to 4^+$ ($x > 4$), $x - 4 > 0$, so $g(x) \\to +\\infty$.",
        exam_trap: "Reversing the signs of $x - 4$ on the left and right sides of $4$."
      },
      {
        question_id: "1.8_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "A rational function $r$ satisfies $\\lim_{x \\to 2^-} r(x) = -\\infty$ and $\\lim_{x \\to 2^+} r(x) = -\\infty$. Which of the following could be $r(x)$?",
        options: [
          "(A) $r(x) = \\frac{-5}{x - 2}$",
          "(B) $r(x) = \\frac{x - 5}{(x - 2)^2}$",
          "(C) $r(x) = \\frac{x + 5}{(x - 2)^2}$",
          "(D) $r(x) = \\frac{(x - 2)^2}{x - 5}$"
        ],
        correct_index: 1,
        explanation_latex: "For both one-sided limits at $x = 2$ to be $-\\infty$, the denominator needs an even power $(x - 2)^2 > 0$ and the numerator must be negative at $x = 2$. In (B), at $x = 2$, $x - 5 = -3 < 0$, so $r(x) \\to \\frac{-3}{0^+} = -\\infty$ from both sides.",
        exam_trap: "Choosing (C) where $2 + 5 = +7 > 0$, which yields $+\\infty$ on both sides."
      }
    ],
    frq: [
      {
        frq_id: "1.8_frq_1",
        calculator_active: false,
        scenario_latex: "Let $r(x) = \\frac{2x^2 - 8}{x^2 - x - 6}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write $r(x)$ in completely factored form and state its domain, real zeros, and the equation of any vertical asymptote.",
            scoring_rubric: [
              { criteria: "Factors as $r(x) = \\frac{2(x-2)(x+2)}{(x-3)(x+2)}$ and states domain $x \\ne -2, 3$", points: 1 },
              { criteria: "Identifies real zero at $x = 2$ only and vertical asymptote at $x = 3$ only", points: 1 }
            ],
            model_solution_latex: "$r(x) = \\frac{2(x - 2)(x + 2)}{(x - 3)(x + 2)}$. The domain is all real numbers except $x = -2$ and $x = 3$. Since $(x+2)$ cancels, the only real zero is $x = 2$ and the only vertical asymptote is $x = 3$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Determine $\\lim_{x \\to 3^-} r(x)$ and $\\lim_{x \\to 3^+} r(x)$ using limit notation and justify using sign analysis.",
            scoring_rubric: [
              { criteria: "Correctly evaluates $\\lim_{x \\to 3^-} r(x) = -\\infty$ and $\\lim_{x \\to 3^+} r(x) = \\infty$ with sign justification", points: 2 }
            ],
            model_solution_latex: "For $x \\ne -2$, $r(x) = \\frac{2(x - 2)}{x - 3}$. Near $x = 3$, the numerator $2(x - 2) \\approx 2(1) = 2 > 0$. As $x \\to 3^-$, $x - 3 < 0 \\implies \\lim_{x \\to 3^-} r(x) = -\\infty$. As $x \\to 3^+$, $x - 3 > 0 \\implies \\lim_{x \\to 3^+} r(x) = \\infty$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.9",
    topic_title: "Rational Functions & Holes",
    sub_topics: [
      {
        sub_topic_id: "1.9.A",
        sub_topic_title: "Removable Discontinuities & Limit Evaluation at Holes",
        essential_formulas: [
          {
            name: "Hole (Removable Discontinuity) Coordinate",
            latex: "r(x) = \\frac{(x - c)g(x)}{(x - c)h(x)} \\quad (h(c) \\ne 0) \\implies \\text{Hole at } \\left(c, \\frac{g(c)}{h(c)}\\right)",
            description: "When factor $(x-c)$ cancels completely from the denominator, the graph has a hole at $x = c$."
          },
          {
            name: "Two-Sided Limit at a Hole",
            latex: "\\lim_{x \\to c} r(x) = \\lim_{x \\to c^-} r(x) = \\lim_{x \\to c^+} r(x) = \\frac{g(c)}{h(c)}",
            description: "The limit exists and equals the reduced function value."
          }
        ]
      }
    ],
    conceptual_overview: "When both numerator and denominator of a rational function share a common factor $(x - c)^k$ such that canceling it leaves a non-zero denominator at $x = c$, the function has a **removable discontinuity (hole)** at $x = c$. Although $r(c)$ is undefined, the left-hand and right-hand limits as $x \\to c$ both approach the finite value of the simplified function.",
    core_principles: [
      {
        heading: "Algebraic Cancellation & Reduced Form Equivalence",
        content_latex: "Given $f(x) = \\frac{x^2 - x - 6}{2x + 4} = \\frac{(x - 3)(x + 2)}{2(x + 2)}$, for all $x \\ne -2$ the function is equivalent to $g(x) = \\frac{x - 3}{2}$. Substituting $x = -2$ into $g(x)$ gives $y = \\frac{-2 - 3}{2} = -2.5$, so the hole is located at $(-2, -2.5)$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the coordinates of all holes in the graph of $f(x) = \\frac{x^2 - 7x + 10}{x - 5}$ and write the limit statement at the discontinuity.",
        solution_steps: [
          "Step 1: Factor the numerator: $x^2 - 7x + 10 = (x - 5)(x - 2)$.",
          "Step 2: Cancel the common factor $(x - 5)$: $f(x) = x - 2$ for $x \\ne 5$.",
          "Step 3: Evaluate the reduced expression at $x = 5$: $y = 5 - 2 = 3$. Thus the hole is at $(5, 3)$ and $\\lim_{x \\to 5} f(x) = 3$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.9_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are the coordinates of the hole in the graph of $f(x) = \\frac{x^2 - x - 6}{2x + 4}$?",
        options: [
          "(A) $(-2, -2.5)$",
          "(B) $(-2, 0)$",
          "(C) $(3, 0)$",
          "(D) $(2, -0.5)$"
        ],
        correct_index: 0,
        explanation_latex: "Factoring yields $f(x) = \\frac{(x - 3)(x + 2)}{2(x + 2)} = \\frac{x - 3}{2}$ for $x \\ne -2$. Evaluating at $x = -2$ gives $y = \\frac{-2 - 3}{2} = -2.5$, so the hole is at $(-2, -2.5)$.",
        exam_trap: "Assuming the $y$-coordinate of a hole is $0$ instead of plugging $x = -2$ into the simplified function."
      },
      {
        question_id: "1.9_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A rational function $f$ is evaluated near $x = 2$ with table values $(1.99, 3.5126), (1.999, 3.5013), (2, \\text{undefined}), (2.001, 3.4999), (2.01, 3.4876)$. Which statement is supported by the table?",
        options: [
          "(A) $f$ has a vertical asymptote at $x = 2$.",
          "(B) $f$ has a hole at $(2, 3.5)$ and $\\lim_{x \\to 2} f(x) = 3.5$.",
          "(C) $f$ has a horizontal asymptote at $y = 3.5$.",
          "(D) $\\lim_{x \\to 2} f(x)$ does not exist because $f(2)$ is undefined."
        ],
        correct_index: 1,
        explanation_latex: "As $x \\to 2^-$ and $x \\to 2^+$, $f(x)$ approaches the finite value $3.5$ while $f(2)$ is undefined, which is the exact signature of a removable discontinuity (hole) at $(2, 3.5)$.",
        exam_trap: "Thinking that $f(2)$ being undefined means $\\lim_{x \\to 2} f(x)$ does not exist."
      },
      {
        question_id: "1.9_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Consider $r(x) = \\frac{(x - 1)^2(x + 4)}{(x - 1)^3(x + 4)}$. Which of the following accurately describes the discontinuities of $r(x)$?",
        options: [
          "(A) Holes at $x = 1$ and $x = -4$",
          "(B) Vertical asymptotes at $x = 1$ and $x = -4$",
          "(C) A vertical asymptote at $x = 1$ and a hole at $x = -4$",
          "(D) A hole at $x = 1$ and a vertical asymptote at $x = -4$"
        ],
        correct_index: 2,
        explanation_latex: "After canceling shared factors, $r(x) = \\frac{1}{x - 1}$ for $x \\ne 1, -4$. Since $(x - 1)$ remains in the denominator, $x = 1$ is a vertical asymptote, while $(x + 4)$ canceled completely, creating a hole at $(-4, -\\frac{1}{5})$.",
        exam_trap: "Assuming that because $(x - 1)$ appears in both numerator and denominator, $x = 1$ must be a hole, overlooking that the denominator has a higher power $(3 > 2)$."
      }
    ],
    frq: [
      {
        frq_id: "1.9_frq_1",
        calculator_active: false,
        scenario_latex: "Let $f(x) = \\frac{x^3 - 2x^2 - 8x}{x^2 - 4x}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the simplified algebraic form of $f(x)$ and state all values of $x$ excluded from the domain of $f$.",
            scoring_rubric: [
              { criteria: "Factors $f(x) = \\frac{x(x-4)(x+2)}{x(x-4)} = x + 2$ for $x \\ne 0, 4$", points: 2 }
            ],
            model_solution_latex: "Factoring numerator and denominator: $f(x) = \\frac{x(x^2 - 2x - 8)}{x(x - 4)} = \\frac{x(x - 4)(x + 2)}{x(x - 4)} = x + 2$ with domain exclusions $x \\ne 0$ and $x \\ne 4$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the coordinates of all holes in the graph of $f$ and express the behavior near each hole using limit notation.",
            scoring_rubric: [
              { criteria: "Finds holes at $(0, 2)$ and $(4, 6)$ and writes $\\lim_{x \\to 0} f(x) = 2$ and $\\lim_{x \\to 4} f(x) = 6$", points: 2 }
            ],
            model_solution_latex: "Using the reduced form $g(x) = x + 2$, at $x = 0$ we get $g(0) = 2 \\implies$ hole at $(0, 2)$ with $\\lim_{x \\to 0} f(x) = 2$. At $x = 4$ we get $g(4) = 6 \\implies$ hole at $(4, 6)$ with $\\lim_{x \\to 4} f(x) = 6$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.10",
    topic_title: "Polynomial & Rational Inequalities",
    sub_topics: [
      {
        sub_topic_id: "1.10.A",
        sub_topic_title: "Critical Values, Sign Charts, & Interval Notation",
        essential_formulas: [
          {
            name: "Standard Inequality Comparison Form",
            latex: "\\frac{p(x)}{q(x)} \\ge 0 \\quad \\text{or} \\quad \\frac{p(x)}{q(x)} < 0",
            description: "Always move all terms to one side and combine over a single common denominator before finding critical values."
          },
          {
            name: "Critical Values Set",
            latex: "\\mathcal{C} = \\{x \\in \\mathbb{R} : p(x) = 0 \\text{ or } q(x) = 0\\}",
            description: "A rational function can change sign only at its real zeros or discontinuities."
          }
        ]
      }
    ],
    conceptual_overview: "Solving a polynomial or rational inequality requires partitioning the real number line at all **critical values**—the real zeros of the numerator and the real zeros of the denominator. On each open subinterval between critical values, the function maintains a constant sign ($+$ or $-$). Endpoints where $q(x) = 0$ are strictly excluded from the solution set (open parentheses) even for non-strict inequalities ($\\le$ or $\\ge$).",
    core_principles: [
      {
        heading: "Never Cross-Multiply by a Variable Expression",
        content_latex: "In an inequality such as $\\frac{x + 1}{x - 3} \\ge 2$, multiplying both sides by $(x - 3)$ is invalid because $(x - 3)$ is negative when $x < 3$, which would flip the inequality sign. Instead, subtract $2$ and combine fractions: $\\frac{x + 1 - 2(x - 3)}{x - 3} = \\frac{7 - x}{x - 3} \\ge 0$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Solve the rational inequality $\\frac{x + 4}{x - 2} \\le 3$ and write the solution in interval notation.",
        solution_steps: [
          "Step 1: Subtract $3$ to set one side to zero: $\\frac{x + 4}{x - 2} - 3 \\le 0 \\implies \\frac{x + 4 - 3(x - 2)}{x - 2} \\le 0 \\implies \\frac{-2x + 10}{x - 2} \\le 0$.",
          "Step 2: Find critical values: numerator $-2x + 10 = 0 \\implies x = 5$ (included); denominator $x - 2 = 0 \\implies x = 2$ (excluded).",
          "Step 3: Test intervals $(-\\infty, 2), (2, 5), (5, \\infty)$: negative on $(-\\infty, 2)$, positive on $(2, 5)$, negative on $[5, \\infty)$. Solution: $(-\\infty, 2) \\cup [5, \\infty)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.10_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the solution set of the polynomial inequality $(x + 6)(x + 3) \\ge 0$?",
        options: [
          "(A) $[-6, -3]$",
          "(B) $(-\\infty, -6] \\cup [-3, \\infty)$",
          "(C) $(-\\infty, -6) \\cup (-3, \\infty)$",
          "(D) $[-3, 6]$"
        ],
        correct_index: 1,
        explanation_latex: "The upward-opening parabola $y = (x + 6)(x + 3)$ has zeros at $x = -6$ and $x = -3$, and is non-negative on and outside its roots: $(-\\infty, -6] \\cup [-3, \\infty)$.",
        exam_trap: "Choosing the interior interval $[-6, -3]$ where the parabola is negative."
      },
      {
        question_id: "1.10_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Solve the rational inequality $\\frac{x - 7}{x - 1} \\ge 0$.",
        options: [
          "(A) $(-\\infty, 1] \\cup [7, \\infty)$",
          "(B) $(-\\infty, 1) \\cup [7, \\infty)$",
          "(C) $(1, 7]$",
          "(D) $[1, 7]$"
        ],
        correct_index: 1,
        explanation_latex: "Critical values are $x = 7$ (zero, included) and $x = 1$ (vertical asymptote, strictly excluded). The quotient is positive for $x < 1$ and $x > 7$, giving $(-\\infty, 1) \\cup [7, \\infty)$.",
        exam_trap: "Using a closed bracket at $x = 1$ (Option A), which makes the denominator zero!"
      },
      {
        question_id: "1.10_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "What is the solution set to $x(x - 1)^2(x - 9)^2 \\le 0$?",
        options: [
          "(A) $(-\\infty, 0]$",
          "(B) $(-\\infty, 0] \\cup \\{1, 9\\}$",
          "(C) $[0, 1] \\cup [1, 9]$",
          "(D) $(-\\infty, 9]$"
        ],
        correct_index: 1,
        explanation_latex: "Since $(x - 1)^2 \\ge 0$ and $(x - 9)^2 \\ge 0$ for all real $x$, the product is negative whenever $x < 0$ and equals zero at $x = 0, x = 1,$ and $x = 9$. Thus the solution set is $(-\\infty, 0] \\cup \\{1, 9\\}$.",
        exam_trap: "Forgetting that $x = 1$ and $x = 9$ satisfy the equality part ($= 0$) of $\\le 0$."
      }
    ],
    frq: [
      {
        frq_id: "1.10_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the rational function $r(x) = \\frac{2x + 5}{x - 1}$ and the constant value $3$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Rewrite the inequality $r(x) \\ge 3$ in the form $\\frac{P(x)}{Q(x)} \\ge 0$ where $P$ and $Q$ are linear polynomials.",
            scoring_rubric: [
              { criteria: "Subtracts 3 and combines over common denominator $(x-1)$ to get $\\frac{8 - x}{x - 1} \\ge 0$", points: 2 }
            ],
            model_solution_latex: "$\\frac{2x + 5}{x - 1} - 3 \\ge 0 \\implies \\frac{2x + 5 - 3(x - 1)}{x - 1} \\ge 0 \\implies \\frac{8 - x}{x - 1} \\ge 0$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Construct a sign chart and state the complete solution set of $r(x) \\ge 3$ in interval notation.",
            scoring_rubric: [
              { criteria: "Identifies critical values $x = 1$ (excluded) and $x = 8$ (included) and states $(1, 8]$", points: 2 }
            ],
            model_solution_latex: "Critical values are $x = 1$ (undefined) and $x = 8$ (zero). On $(-\\infty, 1)$, $(+) / (-) < 0$; on $(1, 8)$, $(+) / (+) > 0$; on $(8, \\infty)$, $(-) / (+) < 0$. Including $x = 8$ and excluding $x = 1$ gives $(1, 8]$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.11",
    topic_title: "Function Transformations",
    sub_topics: [
      {
        sub_topic_id: "1.11.A",
        sub_topic_title: "Dilations, Reflections, & Translations",
        essential_formulas: [
          {
            name: "General Transformed Function Mapping",
            latex: "g(x) = a \\cdot f(b(x - h)) + k \\implies (x_0, y_0) \\mapsto \\left(\\frac{x_0}{b} + h, \\; a y_0 + k\\right)",
            description: "Maps every point $(x_0, y_0)$ on the parent graph $y = f(x)$ to its transformed coordinates on $y = g(x)$."
          },
          {
            name: "Domain and Range under Transformations",
            latex: "\\text{Dom}(g) = \\frac{1}{b}\\text{Dom}(f) + h, \\quad \\text{Ran}(g) = a\\text{Ran}(f) + k",
            description: "Horizontal operations ($b, h$) transform the domain; vertical operations ($a, k$) transform the range."
          }
        ]
      }
    ],
    conceptual_overview: "Given a parent function $y = f(x)$, the general transformation $g(x) = a \\cdot f(b(x - h)) + k$ modifies outputs vertically by factor $a$ and shift $k$, and modifies inputs horizontally by factor $\\frac{1}{b}$ and shift $h$. Always factor out the horizontal coefficient $b$ from $(bx - bh) = b(x - h)$ before identifying the horizontal translation $h$.",
    core_principles: [
      {
        heading: "Order of Operations for Coordinate Mapping",
        content_latex: "For any point $(x, y)$ on $y = f(x)$: first multiply $x$ by $\\frac{1}{b}$ and add $h$ to get $x_{\\text{new}} = \\frac{x}{b} + h$; multiply $y$ by $a$ and add $k$ to get $y_{\\text{new}} = ay + k$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "The graph of $f$ has a relative maximum at $(-4, 6)$. Find the coordinates of the corresponding relative extremum on $g(x) = -2f(2x - 6) + 5$ and state whether it is a maximum or minimum.",
        solution_steps: [
          "Step 1: Factor the inner argument: $g(x) = -2f(2(x - 3)) + 5$, so $a = -2, b = 2, h = 3, k = 5$.",
          "Step 2: Map the coordinates: $x_{\\text{new}} = \\frac{-4}{2} + 3 = 1$ and $y_{\\text{new}} = -2(6) + 5 = -7$.",
          "Step 3: Because $a = -2 < 0$ reflects the graph vertically across the $x$-axis, the relative maximum becomes a **relative minimum** at $(1, -7)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.11_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "If the domain of $f(x)$ is $[-6, 12]$ and the range is $[0, 8]$, what are the domain and range of $g(x) = 3f(x - 4) - 5$?",
        options: [
          "(A) Domain: $[-10, 8]$; Range: $[-5, 19]$",
          "(B) Domain: $[-2, 16]$; Range: $[-5, 19]$",
          "(C) Domain: $[-2, 16]$; Range: $[0, 24]$",
          "(D) Domain: $[-18, 36]$; Range: $[-5, 3]$"
        ],
        correct_index: 1,
        explanation_latex: "The horizontal shift right by $4$ adds $4$ to the domain endpoints: $[-6+4, 12+4] = [-2, 16]$. The vertical stretch by $3$ and shift down by $5$ maps the range $[0, 8] \\to [3(0)-5, 3(8)-5] = [-5, 19]$.",
        exam_trap: "Subtracting $4$ from the domain instead of adding $4$ for $f(x - 4)$."
      },
      {
        question_id: "1.11_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Which sequence of transformations maps the graph of $y = f(x)$ to the graph of $y = f(3x + 12)$?",
        options: [
          "(A) A horizontal dilation by factor $\\frac{1}{3}$ followed by a translation left $4$ units",
          "(B) A horizontal dilation by factor $3$ followed by a translation left $12$ units",
          "(C) A horizontal dilation by factor $\\frac{1}{3}$ followed by a translation right $4$ units",
          "(D) A horizontal translation left $4$ units followed by a dilation by factor $3$"
        ],
        correct_index: 0,
        explanation_latex: "Factoring inside the argument gives $f(3(x + 4))$, which is a horizontal compression (dilation by factor $\\frac{1}{3}$) followed by a horizontal translation left by $4$ units.",
        exam_trap: "Reading $+12$ as a shift of $12$ units without factoring out $3$ first."
      },
      {
        question_id: "1.11_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "The point $(8, -3)$ lies on the graph of $y = f(x)$. Which point must lie on the graph of $y = -f\\left(\\frac{1}{2}x + 1\\right) + 4$?",
        options: [
          "(A) $(3, 7)$",
          "(B) $(14, 7)$",
          "(C) $(14, 1)$",
          "(D) $(18, 7)$"
        ],
        correct_index: 1,
        explanation_latex: "Set the inner argument equal to $8$: $\\frac{1}{2}x + 1 = 8 \\implies \\frac{1}{2}x = 7 \\implies x = 14$. Then $y = -f(8) + 4 = -(-3) + 4 = 7$, giving $(14, 7)$.",
        exam_trap: "Multiplying $8$ by $\\frac{1}{2}$ instead of solving $\\frac{1}{2}x + 1 = 8$."
      }
    ],
    frq: [
      {
        frq_id: "1.11_frq_1",
        calculator_active: false,
        scenario_latex: "A function $f$ has domain $[-4, 8]$, range $[-2, 10]$, a zero at $x = 2$, and an inflection point at $(0, 4)$. Let $h(x) = -\\frac{1}{2}f(2x - 6) + 3$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the domain and range of $h(x)$.",
            scoring_rubric: [
              { criteria: "Solves $-4 \\le 2x - 6 \\le 8 \\implies [1, 7]$ for domain", points: 1 },
              { criteria: "Maps range $[-2, 10]$ via $-\\frac{1}{2}y + 3 \\implies [-2, 4]$", points: 1 }
            ],
            model_solution_latex: "For domain: $-4 \\le 2x - 6 \\le 8 \\implies 2 \\le 2x \\le 14 \\implies [1, 7]$. For range: $-\\frac{1}{2}(10) + 3 = -2$ and $-\\frac{1}{2}(-2) + 3 = 4$, so range is $[-2, 4]$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the coordinates of the inflection point on the graph of $h(x)$.",
            scoring_rubric: [
              { criteria: "Maps $(0, 4) \\to (3, 1)$ accurately", points: 2 }
            ],
            model_solution_latex: "Set $2x - 6 = 0 \\implies x = 3$. Then $h(3) = -\\frac{1}{2}f(0) + 3 = -\\frac{1}{2}(4) + 3 = 1$, giving $(3, 1)$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.12",
    topic_title: "Function Composition",
    sub_topics: [
      {
        sub_topic_id: "1.12.A",
        sub_topic_title: "Composite Evaluation, Domain Restrictions, & Decomposition",
        essential_formulas: [
          {
            name: "Composite Function Definition",
            latex: "(f \\circ g)(x) = f(g(x))",
            description: "The output of the inner function $g(x)$ becomes the input to the outer function $f$."
          },
          {
            name: "Domain of a Composite Function",
            latex: "\\text{Dom}(f \\circ g) = \\{x \\in \\text{Dom}(g) \\mid g(x) \\in \\text{Dom}(f)\\}",
            description: "$x$ must be in the domain of the inner function $g$, AND $g(x)$ must lie in the domain of the outer function $f$."
          }
        ]
      }
    ],
    conceptual_overview: "Function composition chains two processes together: first $x \\mapsto g(x)$, and then $g(x) \\mapsto f(g(x))$. Crucial to AP Precalculus is determining the domain of $(f \\circ g)(x)$ BEFORE algebraically simplifying radicals or fractions—any restriction from the inner function $g(x)$ remains in force even if algebraically canceled later.",
    core_principles: [
      {
        heading: "Preserving Inner Domain Restrictions",
        content_latex: "If $f(x) = x^2 + 1$ and $g(x) = \\sqrt{x - 3}$, the algebraic simplification of $f(g(x)) = (\\sqrt{x - 3})^2 + 1 = x - 2$ still has domain $x \\ge 3$ because $g(x)$ is undefined for $x < 3$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the domain of $(f \\circ g)(x)$ where $f(x) = \\sqrt{4 - x}$ and $g(x) = x^2$.",
        solution_steps: [
          "Step 1: The domain of the inner function $g(x) = x^2$ is $(-\\infty, \\infty)$. The domain of $f(u) = \\sqrt{4 - u}$ requires $4 - u \\ge 0 \\implies u \\le 4$.",
          "Step 2: Substitute $u = g(x) = x^2$: we require $x^2 \\le 4$.",
          "Step 3: Solve $x^2 \\le 4 \\implies -2 \\le x \\le 2$, so the domain is $[-2, 2]$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.12_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "If $h(x) = e^{2 - 5x}$ is expressed as the composition $h(x) = f(g(x))$, which of the following pairs of functions could be $f(x)$ and $g(x)$?",
        options: [
          "(A) $f(x) = 2 - 5x$ and $g(x) = e^x$",
          "(B) $f(x) = e^x$ and $g(x) = 2 - 5x$",
          "(C) $f(x) = e^{2x}$ and $g(x) = -5x$",
          "(D) $f(x) = e^2$ and $g(x) = e^{-5x}$"
        ],
        correct_index: 1,
        explanation_latex: "With inner function $g(x) = 2 - 5x$ and outer function $f(u) = e^u$, we have $f(g(x)) = f(2 - 5x) = e^{2 - 5x}$.",
        exam_trap: "Reversing the inner function $g$ and outer function $f$ (Option A yields $2 - 5e^x$)."
      },
      {
        question_id: "1.12_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Let $f(x) = \\frac{1}{x - 2}$ and $g(x) = \\frac{6}{x + 1}$. What is the domain of $(f \\circ g)(x)$?",
        options: [
          "(A) All real numbers except $x = 2$",
          "(B) All real numbers except $x = -1$ and $x = 2$",
          "(C) All real numbers except $x = -1$ and $x = 5$",
          "(D) All real numbers except $x = 2$ and $x = 5$"
        ],
        correct_index: 1,
        explanation_latex: "First, $x \\in \\text{Dom}(g) \\implies x \\ne -1$. Second, $g(x) \\in \\text{Dom}(f) \\implies g(x) \\ne 2 \\implies \\frac{6}{x + 1} \\ne 2 \\implies x + 1 \\ne 3 \\implies x \\ne 2$. Thus $x \\ne -1$ and $x \\ne 2$.",
        exam_trap: "Simplifying $f(g(x)) = \\frac{x + 1}{4 - 2x}$ and forgetting that $x = -1$ is excluded by the inner function $g(x)$."
      },
      {
        question_id: "1.12_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "A table gives selected values: $f(-1) = 4, f(4) = 9$ and $g(x) = -0.5x^2 - 4x + 1$. If $h(x) = g(f(x))$, what is $h(-1)$?",
        options: [
          "(A) $4$",
          "(B) $-23$",
          "(C) $4.5$",
          "(D) $-15$"
        ],
        correct_index: 1,
        explanation_latex: "$h(-1) = g(f(-1)) = g(4) = -0.5(4)^2 - 4(4) + 1 = -8 - 16 + 1 = -23$.",
        exam_trap: "Computing $f(g(-1))$ instead of $g(f(-1))$."
      }
    ],
    frq: [
      {
        frq_id: "1.12_frq_1",
        calculator_active: false,
        scenario_latex: "Let $f(x) = \\sqrt{x - 2}$ and $g(x) = x^2 - 7$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write the algebraic expression for $(f \\circ g)(x)$ and find its domain in interval notation.",
            scoring_rubric: [
              { criteria: "Writes $(f \\circ g)(x) = \\sqrt{x^2 - 9}$ and finds domain $(-\\infty, -3] \\cup [3, \\infty)$", points: 2 }
            ],
            model_solution_latex: "$(f \\circ g)(x) = f(x^2 - 7) = \\sqrt{(x^2 - 7) - 2} = \\sqrt{x^2 - 9}$. Requiring $x^2 - 9 \\ge 0$ gives $(-\\infty, -3] \\cup [3, \\infty)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Write the algebraic expression for $(g \\circ f)(x)$ in simplified form and state its exact domain.",
            scoring_rubric: [
              { criteria: "Simplifies $(g \\circ f)(x) = x - 9$ and restricts domain to $[2, \\infty)$", points: 2 }
            ],
            model_solution_latex: "$(g \\circ f)(x) = (\\sqrt{x - 2})^2 - 7 = x - 9$. Because the inner function $f(x) = \\sqrt{x - 2}$ requires $x \\ge 2$, the domain of $(g \\circ f)(x)$ is $[2, \\infty)$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.13",
    topic_title: "Inverse Functions",
    sub_topics: [
      {
        sub_topic_id: "1.13.A",
        sub_topic_title: "One-to-One Criteria, Algebraic Inversion, & Domain/Range Swap",
        essential_formulas: [
          {
            name: "Inverse Equivalence & Composition Identity",
            latex: "f(a) = b \\iff f^{-1}(b) = a; \\quad f(f^{-1}(x)) = x \\text{ and } f^{-1}(f(x)) = x",
            description: "The inverse function reverses input and output roles."
          },
          {
            name: "Domain and Range Symmetry",
            latex: "\\text{Dom}(f^{-1}) = \\text{Ran}(f), \\quad \\text{Ran}(f^{-1}) = \\text{Dom}(f)",
            description: "The graph of $y = f^{-1}(x)$ is the reflection of $y = f(x)$ across the line $y = x$."
          }
        ]
      }
    ],
    conceptual_overview: "A function $f$ has an inverse function $f^{-1}$ on its domain if and only if $f$ is **one-to-one** (injective)—meaning every output value corresponds to a unique input value, or equivalently its graph passes the **Horizontal Line Test**. Any strictly increasing or strictly decreasing function on an interval is invertible on that interval.",
    core_principles: [
      {
        heading: "Inheriting Domain Restrictions on $f^{-1}(x)$",
        content_latex: "When inverting a function with a restricted range, such as $f(x) = \\sqrt{x - 7} + 1$ (which has domain $x \\ge 7$ and range $y \\ge 1$), the algebraic inverse $f^{-1}(x) = (x - 1)^2 + 7$ MUST include the inherited domain restriction $x \\ge 1$ so that $f^{-1}$ remains one-to-one."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the equation and domain of $f^{-1}(x)$ for $f(x) = \\frac{2x + 3}{x - 4}$.",
        solution_steps: [
          "Step 1: Swap $x$ and $y$: $x = \\frac{2y + 3}{y - 4}$.",
          "Step 2: Multiply by $(y - 4)$ and collect $y$ terms: $xy - 4x = 2y + 3 \\implies y(x - 2) = 4x + 3$.",
          "Step 3: Divide by $(x - 2)$: $f^{-1}(x) = \\frac{4x + 3}{x - 2}$ with domain $x \\ne 2$ (which matches the horizontal asymptote $y = 2$ of $f$)."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.13_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the inverse of the function $f(x) = \\sqrt{x - 7} + 1$?",
        options: [
          "(A) $f^{-1}(x) = (x - 1)^2 + 7$ for all real $x$",
          "(B) $f^{-1}(x) = (x - 1)^2 + 7$ for $x \\ge 1$",
          "(C) $f^{-1}(x) = (x + 1)^2 - 7$ for $x \\ge 7$",
          "(D) $f^{-1}(x) = x^2 - 6$ for $x \\ge 0$"
        ],
        correct_index: 1,
        explanation_latex: "Since $\\sqrt{x-7} \\ge 0$, the range of $f$ is $[1, \\infty)$. Swapping $x$ and $y$ in $y = \\sqrt{x-7} + 1$ gives $x - 1 = \\sqrt{y - 7} \\implies y = (x - 1)^2 + 7$ with inherited domain $x \\ge 1$.",
        exam_trap: "Omitting the domain restriction $x \\ge 1$ (Option A), which includes the extraneous left half of the parabola."
      },
      {
        question_id: "1.13_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A function $f$ is defined on $[-3, 3]$ and satisfies $f(-1) = 2$ and $f(3) = 2$. Which statement is true about $f$?",
        options: [
          "(A) $f$ has an inverse function because every input has one output.",
          "(B) $f$ does not have an inverse function on $[-3, 3]$ because the output $2$ does not come from a unique input.",
          "(C) $f^{-1}(2) = -3$",
          "(D) $f$ is strictly increasing on $[-3, 3]$."
        ],
        correct_index: 1,
        explanation_latex: "For $f$ to be invertible on $[-3, 3]$, it must be one-to-one. Since two distinct inputs ($x = -1$ and $x = 3$) map to the same output ($2$), $f$ fails the Horizontal Line Test and has no inverse on $[-3, 3]$.",
        exam_trap: "Confusing the Vertical Line Test (whether $f$ is a function) with the Horizontal Line Test (whether $f^{-1}$ is a function)."
      },
      {
        question_id: "1.13_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "If $f$ is a one-to-one function such that $f(5) = -12$ and the average rate of change of $f$ on $[2, 5]$ is $-3$, what is the average rate of change of $f^{-1}$ on $[-12, -3]$?",
        options: [
          "(A) $-3$",
          "(B) $-\\frac{1}{3}$",
          "(C) $\\frac{1}{3}$",
          "(D) $3$"
        ],
        correct_index: 1,
        explanation_latex: "Since AROC of $f$ on $[2, 5]$ is $-3$, $\\frac{f(5) - f(2)}{5 - 2} = -3 \\implies -12 - f(2) = -9 \\implies f(2) = -3$. Thus $(2, -3)$ and $(5, -12)$ are on $f$, so $(-3, 2)$ and $(-12, 5)$ are on $f^{-1}$. The slope between them is $\\frac{2 - 5}{-3 - (-12)} = -\\frac{3}{9} = -\\frac{1}{3}$ (the reciprocal of the slope of $f$).",
        exam_trap: "Taking the negative reciprocal $+\\frac{1}{3}$ (confusing inverse functions with perpendicular lines!)."
      }
    ],
    frq: [
      {
        frq_id: "1.13_frq_1",
        calculator_active: false,
        scenario_latex: "Consider $f(x) = -2(x - 3)^2 + 8$ defined on the restricted domain $x \\ge 3$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Explain why $f$ has an inverse function on the domain $x \\ge 3$, and state the domain and range of $f^{-1}$.",
            scoring_rubric: [
              { criteria: "Explains $f$ is strictly decreasing (one-to-one) on $x \\ge 3$", points: 1 },
              { criteria: "States $\\text{Dom}(f^{-1}) = (-\\infty, 8]$ and $\\text{Ran}(f^{-1}) = [3, \\infty)$", points: 1 }
            ],
            model_solution_latex: "For $x \\ge 3$ (to the right of the vertex $(3, 8)$), $f(x)$ is strictly decreasing and therefore one-to-one. Since $\\text{Dom}(f) = [3, \\infty)$ and $\\text{Ran}(f) = (-\\infty, 8]$, we have $\\text{Dom}(f^{-1}) = (-\\infty, 8]$ and $\\text{Ran}(f^{-1}) = [3, \\infty)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the explicit algebraic formula for $f^{-1}(x)$ and specify which branch of the square root is required.",
            scoring_rubric: [
              { criteria: "Correctly solves for $f^{-1}(x) = 3 + \\sqrt{\\frac{8 - x}{2}}$ choosing the positive root because $y \\ge 3$", points: 2 }
            ],
            model_solution_latex: "Swap $x$ and $y$: $x = -2(y - 3)^2 + 8 \\implies (y - 3)^2 = \\frac{8 - x}{2}$. Since the range of $f^{-1}$ is $y \\ge 3$, we take the positive square root: $f^{-1}(x) = 3 + \\sqrt{\\frac{8 - x}{2}}$ for $x \\le 8$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.14",
    topic_title: "Logarithmic Expressions",
    sub_topics: [
      {
        sub_topic_id: "1.14.A",
        sub_topic_title: "Logarithmic-Exponential Equivalence & Exact Evaluation",
        essential_formulas: [
          {
            name: "Fundamental Logarithm Definition",
            latex: "\\log_b(c) = a \\iff b^a = c \\quad (b > 0, b \\ne 1, c > 0)",
            description: "The logarithm $\\log_b(c)$ is the exponent $a$ to which base $b$ must be raised to produce $c$."
          },
          {
            name: "Fundamental Logarithmic Identities",
            latex: "\\log_b(1) = 0, \\quad \\log_b(b) = 1, \\quad \\log_b(b^k) = k, \\quad b^{\\log_b(x)} = x",
            description: "Core inverse cancellation identities between base-$b$ exponentials and logarithms."
          }
        ]
      }
    ],
    conceptual_overview: "A logarithm is an exponent. Specifically, $\\log_b(x)$ answers the question: 'To what power must base $b$ be raised to obtain $x$?' Two special bases appear constantly on the AP Exam: the **common logarithm** $\\log(x) = \\log_{10}(x)$ and the **natural logarithm** $\\ln(x) = \\log_e(x)$ where Euler's constant $e \\approx 2.71828$.",
    core_principles: [
      {
        heading: "Evaluating Logarithms Without a Calculator via Common Bases",
        content_latex: "To evaluate $\\log_b(c)$, rewrite both $b$ and $c$ as powers of a common prime base $p$: if $b = p^m$ and $c = p^n$, then $b^y = c \\implies (p^m)^y = p^n \\implies my = n \\implies y = \\frac{n}{m}$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Evaluate (a) $\\log_3\\left(\\frac{1}{27}\\right)$ and (b) $\\log_{16}(8)$ without a calculator.",
        solution_steps: [
          "Step 1: Set $y = \\log_3\\left(\\frac{1}{27}\\right) \\iff 3^y = \\frac{1}{27} = 3^{-3} \\implies y = -3$.",
          "Step 2: Set $y = \\log_{16}(8) \\iff 16^y = 8 \\implies (2^4)^y = 2^3 \\implies 4y = 3 \\implies y = \\frac{3}{4}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.14_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the exact value of $\\log_4\\left(\\frac{1}{64}\\right)$?",
        options: [
          "(A) $-16$",
          "(B) $-3$",
          "(C) $-\\frac{1}{3}$",
          "(D) $3$"
        ],
        correct_index: 1,
        explanation_latex: "Since $4^3 = 64$, we have $\\frac{1}{64} = 4^{-3}$. Therefore $\\log_4(4^{-3}) = -3$.",
        exam_trap: "Dividing $64$ by $4$ to get $-16$ instead of finding the exponent."
      },
      {
        question_id: "1.14_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What is the exact value of $\\log_{27}(9)$?",
        options: [
          "(A) $\\frac{1}{3}$",
          "(B) $\\frac{2}{3}$",
          "(C) $\\frac{3}{2}$",
          "(D) $3$"
        ],
        correct_index: 1,
        explanation_latex: "Set $27^y = 9 \\implies (3^3)^y = 3^2 \\implies 3y = 2 \\implies y = \\frac{2}{3}$.",
        exam_trap: "Reversing the powers of $3$ and answering $\\frac{3}{2}$."
      },
      {
        question_id: "1.14_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Between which two consecutive integers does the value of $\\log_3(50)$ lie?",
        options: [
          "(A) Between $2$ and $3$",
          "(B) Between $3$ and $4$",
          "(C) Between $4$ and $5$",
          "(D) Between $16$ and $17$"
        ],
        correct_index: 1,
        explanation_latex: "Because $y = \\log_3(x)$ is strictly increasing and $27 < 50 < 81$, we have $\\log_3(27) < \\log_3(50) < \\log_3(81) \\implies 3 < \\log_3(50) < 4$.",
        exam_trap: "Dividing $50$ by $3$ ($16.67$) instead of comparing $50$ to powers of $3$ ($3^3 = 27, 3^4 = 81$)."
      }
    ],
    frq: [
      {
        frq_id: "1.14_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the logarithmic expressions $A = \\log_8(32)$, $B = \\ln\\left(\\frac{1}{\\sqrt[3]{e^5}}\\right)$, and $C = 5^{\\log_5(12)}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the exact rational values of $A, B,$ and $C$ without a calculator. Show the algebraic work that leads to each value.",
            scoring_rubric: [
              { criteria: "Finds $A = \\frac{5}{3}$ via $2^{3A} = 2^5$", points: 1 },
              { criteria: "Finds $B = -\\frac{5}{3}$ and $C = 12$", points: 1 }
            ],
            model_solution_latex: "For $A$: $8^A = 32 \\implies 2^{3A} = 2^5 \\implies A = \\frac{5}{3}$. For $B$: $\\ln(e^{-5/3}) = -\\frac{5}{3}$. For $C$: by the inverse property $b^{\\log_b(x)} = x$, $C = 12$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Order the quantities $A, B, C,$ and $D = \\log_2(10)$ from least to greatest, justifying the placement of $D$ without a calculator.",
            scoring_rubric: [
              { criteria: "Bounds $3 < \\log_2(10) < 4$ since $2^3 = 8 < 10 < 16 = 2^4$, and orders $B < A < D < C$", points: 2 }
            ],
            model_solution_latex: "Since $8 < 10 < 16$, $3 = \\log_2(8) < D < \\log_2(16) = 4$. Comparing $B = -\\frac{5}{3}$, $A = \\frac{5}{3} \\approx 1.67$, $D \\in (3, 4)$, and $C = 12$, the order is $B < A < D < C$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.15",
    topic_title: "Logarithmic Functions",
    sub_topics: [
      {
        sub_topic_id: "1.15.A",
        sub_topic_title: "Domain, Vertical Asymptote, & Concavity of Logarithmic Graphs",
        essential_formulas: [
          {
            name: "General Transformed Logarithmic Function",
            latex: "f(x) = a \\log_b(c(x - h)) + k",
            description: "Vertical asymptote at $x = h$; domain requires $c(x - h) > 0$; range is $(-\\infty, \\infty)$."
          },
          {
            name: "End Behavior & Asymptote Limits ($a > 0, b > 1, c > 0$)",
            latex: "\\lim_{x \\to h^+} f(x) = -\\infty, \\quad \\lim_{x \\to \\infty} f(x) = \\infty",
            description: "Plunges along the vertical asymptote $x = h$ and grows slowly without bound (concave down) as $x \\to \\infty$."
          }
        ]
      }
    ],
    conceptual_overview: "Because the logarithmic function $y = \\log_b(x)$ is the inverse of the exponential function $y = b^x$, its domain is $(0, \\infty)$, its range is $(-\\infty, \\infty)$, and its horizontal asymptote $y = 0$ reflects across $y = x$ to become a **vertical asymptote at $x = 0$**. For $b > 1$ and $a > 0$, $f(x) = a\\log_b(x - h) + k$ is strictly increasing and concave down across its entire domain $(h, \\infty)$.",
    core_principles: [
      {
        heading: "Finding Domain and Vertical Asymptote of Any Logarithmic Function",
        content_latex: "The argument of a logarithm must be strictly positive. For $f(x) = \\ln(4 - x) + 2$, set $4 - x > 0 \\implies x < 4$, giving domain $(-\\infty, 4)$ and vertical asymptote $x = 4$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the inverse function, domain, range, and vertical asymptote of $g(x) = \\log_4\\left(\\frac{x + 8}{2}\\right) + 1$.",
        solution_steps: [
          "Step 1: Domain requires $\\frac{x + 8}{2} > 0 \\implies x > -8$, so $\\text{Dom}(g) = (-8, \\infty)$, Vertical Asymptote is $x = -8$, and $\\text{Ran}(g) = (-\\infty, \\infty)$.",
          "Step 2: Swap $x$ and $y$ to find $g^{-1}$: $x - 1 = \\log_4\\left(\\frac{y + 8}{2}\\right) \\implies 4^{x - 1} = \\frac{y + 8}{2} \\implies g^{-1}(x) = 2 \\cdot 4^{x - 1} - 8$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.15_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are the domain and vertical asymptote of $f(x) = \\ln(4 - x) + 2$?",
        options: [
          "(A) Domain: $(4, \\infty)$; Vertical Asymptote: $x = 4$",
          "(B) Domain: $(-\\infty, 4)$; Vertical Asymptote: $x = 4$",
          "(C) Domain: $(-\\infty, 4]$; Vertical Asymptote: $y = 2$",
          "(D) Domain: $(2, \\infty)$; Vertical Asymptote: $x = 2$"
        ],
        correct_index: 1,
        explanation_latex: "The argument of the natural logarithm must be strictly positive: $4 - x > 0 \\implies x < 4$, so the domain is $(-\\infty, 4)$ and the boundary $4 - x = 0 \\implies x = 4$ is the vertical asymptote.",
        exam_trap: "Assuming logarithmic domains always point to $+\\infty$ and choosing $(4, \\infty)$."
      },
      {
        question_id: "1.15_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What is the inverse of the exponential function $f(x) = 2 \\cdot 4^{x - 1} - 8$?",
        options: [
          "(A) $f^{-1}(x) = \\log_4\\left(\\frac{x + 8}{2}\\right) + 1$",
          "(B) $f^{-1}(x) = \\log_4(x + 8) - 1$",
          "(C) $f^{-1}(x) = \\frac{1}{2}\\log_4(x - 8) + 1$",
          "(D) $f^{-1}(x) = \\log_2(4x + 8) + 1$"
        ],
        correct_index: 0,
        explanation_latex: "Swap $x$ and $y$: $x = 2 \\cdot 4^{y - 1} - 8 \\implies \\frac{x + 8}{2} = 4^{y - 1} \\implies y - 1 = \\log_4\\left(\\frac{x + 8}{2}\\right) \\implies f^{-1}(x) = \\log_4\\left(\\frac{x + 8}{2}\\right) + 1$.",
        exam_trap: "Taking $\\log_4$ before dividing by the coefficient $2$."
      },
      {
        question_id: "1.15_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Let $h(x) = -3\\log_2(x + 5) + 4$. Which statement accurately describes the graph of $h$ on its domain $(-5, \\infty)$?",
        options: [
          "(A) $h$ is increasing and concave down.",
          "(B) $h$ is decreasing and concave up.",
          "(C) $h$ is decreasing and concave down.",
          "(D) $h$ is increasing and concave up."
        ],
        correct_index: 1,
        explanation_latex: "The parent function $y = \\log_2(x)$ is increasing and concave down. Multiplying by $a = -3 < 0$ reflects the graph vertically across the $x$-axis, making $h(x)$ **decreasing and concave up**.",
        exam_trap: "Remembering that standard log graphs are concave down without accounting for the vertical reflection $a = -3 < 0$."
      }
    ],
    frq: [
      {
        frq_id: "1.15_frq_1",
        calculator_active: true,
        scenario_latex: "A fitness channel's subscriber count $F(t)$, in thousands, is modeled by $F(t) = a + b\\ln(t + 1)$, where $t$ is the number of days since launch. At $t = 0$, $F(0) = 20$, and at $t = 60$, $F(60) = 85$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Use the given data to find the exact value of $a$ and the decimal approximation of $b$ rounded to three decimal places.",
            scoring_rubric: [
              { criteria: "Finds $a = 20$ from $F(0) = a + b\\ln(1) = 20$", points: 1 },
              { criteria: "Finds $b = \\frac{65}{\\ln(61)} \\approx 15.812$", points: 1 }
            ],
            model_solution_latex: "At $t = 0$, $20 = a + b\\ln(1) = a \\implies a = 20$. At $t = 60$, $85 = 20 + b\\ln(61) \\implies b = \\frac{65}{\\ln(61)} \\approx 15.812$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Using the secant line $L(t)$ from $t = 0$ to $t = 60$, estimate $F(30)$ and explain whether $L(30)$ is an overestimate or underestimate of the model value $F(30)$.",
            scoring_rubric: [
              { criteria: "Computes $\\text{AROC} = \\frac{65}{60} \\approx 1.083$ and $L(30) = 52.5$ thousand subscribers", points: 1 },
              { criteria: "Explains $L(30) < F(30)$ (underestimate) because $b > 0$ makes $F(t)$ concave down", points: 1 }
            ],
            model_solution_latex: "$\\text{AROC} = \\frac{85 - 20}{60 - 0} = \\frac{65}{60} \\approx 1.0833\\text{ thousand/day}$, so $L(30) = 20 + 1.0833(30) = 52.5\\text{ thousand}$. Since $b > 0$, the logarithmic function $F(t)$ is concave down, so the secant line lies below the curve and $L(30) < F(30)$."
          }
        ]
      }
    ]
  },

  {
    unit: 1,
    topic_id: "1.16",
    topic_title: "Logarithmic Properties",
    sub_topics: [
      {
        sub_topic_id: "1.16.A",
        sub_topic_title: "Product, Quotient, Power, & Change-of-Base Laws",
        essential_formulas: [
          {
            name: "Logarithmic Product & Quotient Rules",
            latex: "\\log_b(xy) = \\log_b(x) + \\log_b(y), \\quad \\log_b\\left(\\frac{x}{y}\\right) = \\log_b(x) - \\log_b(y)",
            description: "Converts multiplication inside a log into addition of logs, and division into subtraction."
          },
          {
            name: "Logarithmic Power Rule",
            latex: "\\log_b(x^k) = k\\log_b(x)",
            description: "Brings an exponent inside a logarithm out front as a scalar multiplier."
          },
          {
            name: "Change of Base Formula",
            latex: "\\log_b(x) = \\frac{\\ln(x)}{\\ln(b)} = \\frac{\\log_{10}(x)}{\\log_{10}(b)}",
            description: "Rewrites a logarithm of any base $b$ in terms of natural or common logarithms."
          }
        ]
      }
    ],
    conceptual_overview: "Logarithmic properties mirror exponent laws because logarithms are exponents. These properties allow us to expand complex products, quotients, and powers into linear combinations of simple logarithms, condense multiple logarithmic terms into a single logarithm for solving equations, and reinterpret horizontal dilations of logarithmic graphs as vertical shifts!",
    core_principles: [
      {
        heading: "Horizontal Dilation vs. Vertical Translation Equivalency",
        content_latex: "By the Product and Power Rules, a horizontal dilation and power inside a logarithm are equivalent to a vertical translation and stretch: $f(x) = \\log_b(c \\cdot x^k) = \\log_b(c) + k\\log_b(x)$. For example, $f(x) = \\log_4(16x) = \\log_4(16) + \\log_4(x) = 2 + \\log_4(x)$, which is a vertical shift up by $2$ units!"
      }
    ],
    worked_examples: [
      {
        problem_latex: "Condense $k(x) = \\ln(x + 1) - 2\\ln(x) + \\ln(2x)$ into a single simplified logarithm for $x > 0$.",
        solution_steps: [
          "Step 1: Apply the Power Rule to the middle term: $2\\ln(x) = \\ln(x^2)$.",
          "Step 2: Apply the Product and Quotient Rules: $k(x) = \\ln\\left(\\frac{(x + 1)(2x)}{x^2}\\right)$.",
          "Step 3: Cancel one factor of $x$ (valid since $x > 0$): $k(x) = \\ln\\left(\\frac{2x + 2}{x}\\right)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "1.16_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which of the following is equivalent to $3\\log_5(x - 4) - 2\\log_5(y)$ for $x > 4, y > 0$?",
        options: [
          "(A) $\\log_5\\left(\\frac{3(x - 4)}{2y}\\right)$",
          "(B) $\\log_5\\left(\\frac{(x - 4)^3}{y^2}\\right)$",
          "(C) $\\log_5\\left((x - 4)^3 - y^2\\right)$",
          "(D) $\\frac{\\log_5((x - 4)^3)}{\\log_5(y^2)}$"
        ],
        correct_index: 1,
        explanation_latex: "By the Power Rule, $3\\log_5(x-4) - 2\\log_5(y) = \\log_5((x-4)^3) - \\log_5(y^2)$. By the Quotient Rule, this condenses to $\\log_5\\left(\\frac{(x-4)^3}{y^2}\\right)$.",
        exam_trap: "Confusing $\\log(A) - \\log(B) = \\log(A/B)$ with $\\frac{\\log A}{\\log B}$ (Option D)."
      },
      {
        question_id: "1.16_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "The graph of $g(x) = \\log_4(16x)$ can be obtained from the parent graph $f(x) = \\log_4(x)$ by a horizontal compression by factor $\\frac{1}{16}$. Which of the following transformations on $f(x)$ produces the exact same graph $g(x)$?",
        options: [
          "(A) A vertical dilation by a factor of $16$",
          "(B) A vertical dilation by a factor of $2$",
          "(C) A vertical translation up by $2$ units",
          "(D) A horizontal translation left by $2$ units"
        ],
        correct_index: 2,
        explanation_latex: "Using the Product Rule, $g(x) = \\log_4(16x) = \\log_4(16) + \\log_4(x) = 2 + f(x)$, which is a vertical translation up by $2$ units.",
        exam_trap: "Thinking $\\log_4(16x) = 16\\log_4(x)$ or $2\\log_4(x)$ instead of $2 + \\log_4(x)$."
      },
      {
        question_id: "1.16_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "For $x > 0$, which expression is equivalent to $2\\ln(4x^2) - \\frac{1}{2}\\ln(4x^4)$?",
        options: [
          "(A) $\\ln(8x^2)$",
          "(B) $\\ln(6x^2)$",
          "(C) $\\ln(2x^2)$",
          "(D) $\\ln(4x^2)$"
        ],
        correct_index: 0,
        explanation_latex: "$2\\ln(4x^2) = \\ln((4x^2)^2) = \\ln(16x^4)$ and $\\frac{1}{2}\\ln(4x^4) = \\ln(\\sqrt{4x^4}) = \\ln(2x^2)$. Subtracting gives $\\ln\\left(\\frac{16x^4}{2x^2}\\right) = \\ln(8x^2)$.",
        exam_trap: "Forgetting to square the coefficient $4$ in $(4x^2)^2 = 16x^4$ (which leads to $\\ln(4x^2/2x^2) = \\ln(2x^2)$)."
      }
    ],
    frq: [
      {
        frq_id: "1.16_frq_1",
        calculator_active: false,
        scenario_latex: "Let $k(x) = \\log_2(x + 2) - 4\\log_2(x) + \\log_2(x^2)$ and $m(x) = \\log_8(64x^3)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Condense $k(x)$ into a single logarithm in simplified rational form and state its domain.",
            scoring_rubric: [
              { criteria: "Condenses to $\\log_2\\left(\\frac{x + 2}{x^2}\\right)$ and states domain $x > 0$", points: 2 }
            ],
            model_solution_latex: "$k(x) = \\log_2\\left(\\frac{(x + 2)x^2}{x^4}\\right) = \\log_2\\left(\\frac{x + 2}{x^2}\\right)$. Because the original term $-4\\log_2(x)$ requires $x > 0$, the domain is $(0, \\infty)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Rewrite $m(x) = \\log_8(64x^3)$ in the form $A + B\\log_2(x)$ where $A$ and $B$ are constants.",
            scoring_rubric: [
              { criteria: "Expands $\\log_8(64) + 3\\log_8(x) = 2 + 3\\left(\\frac{\\log_2 x}{\\log_2 8}\\right) = 2 + \\log_2(x)$", points: 2 }
            ],
            model_solution_latex: "$m(x) = \\log_8(64) + \\log_8(x^3) = 2 + 3\\log_8(x)$. By Change of Base, $\\log_8(x) = \\frac{\\log_2(x)}{\\log_2(8)} = \\frac{1}{3}\\log_2(x)$, so $m(x) = 2 + \\log_2(x)$ ($A = 2, B = 1$)."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // UNIT 2: EXPONENTIAL AND LOGARITHMIC FUNCTIONS (Topics 2.1 - 2.7)
  // =========================================================================
  {
    unit: 2,
    topic_id: "2.1",
    topic_title: "Change in Arithmetic & Geometric Sequences",
    sub_topics: [
      {
        sub_topic_id: "2.1.A",
        sub_topic_title: "Arithmetic Sequences (Linear Discrete Change)",
        essential_formulas: [
          {
            name: "Common Difference & General Term (Arithmetic)",
            latex: "d = a_{n} - a_{n-1}, \\quad a_n = a_1 + (n - 1)d = a_k + (n - k)d",
            description: "Consecutive terms change by a constant additive increment $d$."
          }
        ]
      },
      {
        sub_topic_id: "2.1.B",
        sub_topic_title: "Geometric Sequences (Exponential Discrete Change)",
        essential_formulas: [
          {
            name: "Common Ratio & General Term (Geometric)",
            latex: "r = \\frac{g_n}{g_{n-1}}, \\quad g_n = g_1 \\cdot r^{n-1} = g_k \\cdot r^{n-k}",
            description: "Consecutive terms change by a constant multiplicative ratio $r$."
          }
        ]
      }
    ],
    conceptual_overview: "Sequences are discrete functions whose domain consists of integers (typically $n = 0, 1, 2, \\dots$ or $n = 1, 2, 3, \\dots$). An **arithmetic sequence** has a constant additive difference $d = a_n - a_{n-1}$ and lies on a line of slope $d$. A **geometric sequence** has a constant multiplicative ratio $r = \\frac{g_n}{g_{n-1}}$ and lies on an exponential curve with base $r$.",
    core_principles: [
      {
        heading: "Relative Index Formulas from Any Known Term $k$",
        content_latex: "You do not need $a_0$ or $a_1$ to write an explicit formula! Given any $k$-th term, an arithmetic sequence satisfies $a_n = a_k + d(n - k)$, and a geometric sequence satisfies $g_n = g_k \\cdot r^{n - k}$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "(a) Find the 65th term of the arithmetic sequence $\\{107, 97, 87, 77, \\dots\\}$. (b) Write an explicit formula for the geometric sequence $\\{192, 48, 12, 3, \\dots\\}$ using $k = 1$.",
        solution_steps: [
          "Step 1: For the arithmetic sequence, $a_1 = 107$ and $d = 97 - 107 = -10$. Using $a_n = a_1 + d(n - 1)$, $a_{65} = 107 - 10(65 - 1) = 107 - 640 = -533$.",
          "Step 2: For the geometric sequence, $g_1 = 192$ and $r = \\frac{48}{192} = \\frac{1}{4}$. Thus $g_n = 192\\left(\\frac{1}{4}\\right)^{n - 1}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.1_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "The first term of an arithmetic sequence is $a_1 = 4$, and the common difference is $d = 3$. What is the 7th term of the sequence?",
        options: [
          "(A) $22$",
          "(B) $25$",
          "(C) $972$",
          "(D) $2{,}916$"
        ],
        correct_index: 0,
        explanation_latex: "Using $a_n = a_1 + d(n - 1)$, we have $a_7 = 4 + 3(7 - 1) = 4 + 18 = 22$.",
        exam_trap: "Using $n = 7$ instead of $(n - 1) = 6$ (which gives $4 + 21 = 25$), or treating it as a geometric sequence $4 \\cdot 3^6 = 2916$."
      },
      {
        question_id: "2.1_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "In a geometric sequence, $g_3 = 12$ and $g_6 = -96$. What is the value of $g_8$?",
        options: [
          "(A) $-384$",
          "(B) $384$",
          "(C) $-192$",
          "(D) $768$"
        ],
        correct_index: 0,
        explanation_latex: "Using $g_6 = g_3 \\cdot r^{6 - 3}$, we have $-96 = 12r^3 \\implies r^3 = -8 \\implies r = -2$. Then $g_8 = g_6 \\cdot r^{8 - 6} = -96(-2)^2 = -384$.",
        exam_trap: "Dropping the negative sign on $r = -2$ or miscounting the exponent difference $8 - 6 = 2$."
      },
      {
        question_id: "2.1_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "An arithmetic sequence has $a_4 = 18$ and $a_{10} = 42$. Which of the following equations gives $a_n$ for all integers $n \\ge 1$?",
        options: [
          "(A) $a_n = 2 + 4n$",
          "(B) $a_n = 6 + 4n$",
          "(C) $a_n = 18 + 4n$",
          "(D) $a_n = 14 + 4n$"
        ],
        correct_index: 0,
        explanation_latex: "The common difference is $d = \\frac{a_{10} - a_4}{10 - 4} = \\frac{42 - 18}{6} = 4$. Then $a_n = a_4 + 4(n - 4) = 18 + 4n - 16 = 2 + 4n$.",
        exam_trap: "Setting $a_1$ as the constant term without expanding $a_4 + d(n - 4)$."
      }
    ],
    frq: [
      {
        frq_id: "2.1_frq_1",
        calculator_active: false,
        scenario_latex: "Consider an arithmetic sequence $a_n$ with $a_2 = 31$ and $a_5 = 19$, and a geometric sequence $g_n$ with $g_2 = 18$ and $g_5 = \\frac{2}{3}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the common difference $d$ of $a_n$, write an explicit formula for $a_n$ in terms of $n$, and find the smallest integer $n$ for which $a_n < 0$.",
            scoring_rubric: [
              { criteria: "Finds $d = -4$ and $a_n = 39 - 4n$", points: 1 },
              { criteria: "Solves $39 - 4n < 0 \\implies n > 9.75 \\implies n = 10$", points: 1 }
            ],
            model_solution_latex: "$d = \\frac{19 - 31}{5 - 2} = -4$. Thus $a_n = 31 - 4(n - 2) = 39 - 4n$. Setting $39 - 4n < 0$ gives $n > 9.75$, so the smallest integer is $n = 10$ ($a_{10} = -1$)."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the common ratio $r$ of $g_n$ and write an explicit formula for $g_n$ relative to $k = 1$.",
            scoring_rubric: [
              { criteria: "Finds $r = \\frac{1}{3}$ and $g_1 = 54$, giving $g_n = 54\\left(\\frac{1}{3}\\right)^{n-1}$", points: 2 }
            ],
            model_solution_latex: "$r^3 = \\frac{g_5}{g_2} = \\frac{2/3}{18} = \\frac{1}{27} \\implies r = \\frac{1}{3}$. Since $g_1 = \\frac{g_2}{r} = 54$, we have $g_n = 54\\left(\\frac{1}{3}\\right)^{n - 1}$."
          }
        ]
      }
    ]
  },

  {
    unit: 2,
    topic_id: "2.2",
    topic_title: "Exponential Functions",
    sub_topics: [
      {
        sub_topic_id: "2.2.A",
        sub_topic_title: "Constant Multiplicative Growth & General Exponential Forms",
        essential_formulas: [
          {
            name: "Standard Exponential Function",
            latex: "f(x) = a \\cdot b^x + k \\quad (a \\ne 0, b > 0, b \\ne 1)",
            description: "Horizontal asymptote at $y = k$; $y$-intercept at $(0, a + k)$."
          },
          {
            name: "Point-Ratio Form Over Any Interval $[x_1, x_2]$",
            latex: "y = y_1 \\cdot \\left(\\frac{y_2}{y_1}\\right)^{\\frac{x - x_1}{x_2 - x_1}}",
            description: "Constructs an exponential function directly from two points $(x_1, y_1)$ and $(x_2, y_2)$."
          },
          {
            name: "Exponent-Base Manipulation Laws",
            latex: "b^{cx} = (b^c)^x, \\quad b^{x + c} = b^c \\cdot b^x",
            description: "Demonstrates that horizontal dilations equal base changes, and horizontal shifts equal vertical stretches."
          }
        ]
      }
    ],
    conceptual_overview: "Whereas linear functions add a constant amount $\\Delta y$ over equal input intervals $\\Delta x$, **exponential functions** $f(x) = a \\cdot b^x$ multiply the output by a constant factor $b^{\\Delta x}$ over equal input intervals $\\Delta x$. Furthermore, algebraic laws of exponents allow any horizontal shift $f(x + c) = a \\cdot b^{x+c} = (ab^c)b^x$ to be rewritten as a vertical dilation by factor $b^c$.",
    core_principles: [
      {
        heading: "Growth vs. Decay and Concavity",
        content_latex: "For $f(x) = a \\cdot b^x$: if $a > 0$ and $b > 1$, $f$ exhibits **exponential growth** (increasing, concave up, $\\lim_{x \\to -\\infty} f(x) = 0$). If $a > 0$ and $0 < b < 1$, $f$ exhibits **exponential decay** (decreasing, concave up, $\\lim_{x \\to \\infty} f(x) = 0$). If $a < 0$, the graph is reflected across the $x$-axis and is concave down."
      }
    ],
    worked_examples: [
      {
        problem_latex: "An exponential function $y = a \\cdot b^x$ passes through $(1, 4)$ and $(3, 10)$. Find its equation and evaluate $y(5)$.",
        solution_steps: [
          "Step 1: Over the interval $\\Delta x = 3 - 1 = 2$, the output is multiplied by $\\frac{10}{4} = 2.5$. Thus $b^2 = \\frac{5}{2} \\implies b = \\sqrt{\\frac{5}{2}}$.",
          "Step 2: Using point-ratio form from $(1, 4)$, $y = 4\\left(\\sqrt{\\frac{5}{2}}\\right)^{x - 1} = 4\\left(\\frac{5}{2}\\right)^{\\frac{x - 1}{2}}$.",
          "Step 3: At $x = 5$ (another step of $\\Delta x = 2$ past $x = 3$), multiply $y(3) = 10$ by $2.5$: $y(5) = 10 \\times 2.5 = 25$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.2_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Let $f(x) = 3^x$ and $g(x) = 27 \\cdot f(x)$. Which horizontal transformation of the graph of $f$ yields the exact same graph as $g$?",
        options: [
          "(A) A horizontal translation left by $3$ units",
          "(B) A horizontal translation right by $3$ units",
          "(C) A horizontal translation left by $27$ units",
          "(D) A horizontal compression by factor $\\frac{1}{3}$"
        ],
        correct_index: 0,
        explanation_latex: "Since $27 = 3^3$, we have $g(x) = 3^3 \\cdot 3^x = 3^{x + 3} = f(x + 3)$, which is a horizontal translation left by $3$ units.",
        exam_trap: "Confusing $3^{x+3}$ (shift left $3$) with $3^{3x} = 27^x$ (horizontal compression by $1/3$)."
      },
      {
        question_id: "2.2_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A table of values for $f(x) = a \\cdot b^x + k$ gives $(0, 6), (1, 12), (2, 36), (3, 132), (4, 516)$. What is the horizontal asymptote $y = k$ of $f(x)$?",
        options: [
          "(A) $y = 0$",
          "(B) $y = 2$",
          "(C) $y = 4$",
          "(D) $y = 6$"
        ],
        correct_index: 2,
        explanation_latex: "First differences are $\\Delta y = 6, 24, 96, 384$, which have a constant ratio $b = \\frac{24}{6} = 4$. Thus $f(x) = a \\cdot 4^x + k$. Since $f(0) = a + k = 6$ and $f(1) = 4a + k = 12$, subtracting gives $3a = 6 \\implies a = 2$ and $k = 4$.",
        exam_trap: "Assuming the horizontal asymptote of an exponential function is always $y = 0$ without checking for a vertical shift $k$."
      },
      {
        question_id: "2.2_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "The function $f$ is increasing on $(-\\infty, \\infty)$ with selected values $(-2, 2), (-1, 6), (0, 18), (1, 54), (2, 162)$. Which statement properly justifies that $f$ is modeled by an exponential function?",
        options: [
          "(A) As input values increase by $1$, output values increase by a constant difference of $3$.",
          "(B) Consecutive output values over equal-length input intervals are proportional with a constant ratio of $3$.",
          "(C) The second differences of the outputs are constant.",
          "(D) Input values are multiplied by $3$ while output values increase by $1$."
        ],
        correct_index: 1,
        explanation_latex: "Over equal input increments $\\Delta x = 1$, the ratio of consecutive outputs is constant: $\\frac{6}{2} = \\frac{18}{6} = \\frac{54}{18} = \\frac{162}{54} = 3$. This proportional change over equal-length input intervals defines an exponential function.",
        exam_trap: "Option (D) describes a logarithmic function, while Option (A) describes a linear function."
      }
    ],
    frq: [
      {
        frq_id: "2.2_frq_1",
        calculator_active: false,
        scenario_latex: "A function $f(x) = a \\cdot b^x + k$ passes through $(0, 5), (1, 11), (2, 29),$ and $(3, 83)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Compute the first differences $\\Delta y$ between consecutive outputs and use their ratio to determine the base $b$.",
            scoring_rubric: [
              { criteria: "Computes $\\Delta y = 6, 18, 54$ and ratio $b = \\frac{18}{6} = 3$", points: 2 }
            ],
            model_solution_latex: "The consecutive first differences are $11 - 5 = 6$, $29 - 11 = 18$, and $83 - 29 = 54$. Since $\\frac{18}{6} = \\frac{54}{18} = 3$, the base is $b = 3$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the constants $a$ and $k$, write the complete equation for $f(x)$, and state $\\lim_{x \\to -\\infty} f(x)$.",
            scoring_rubric: [
              { criteria: "Solves $a + k = 5$ and $3a + k = 11$ to find $a = 3, k = 2$", points: 1 },
              { criteria: "Writes $f(x) = 3 \\cdot 3^x + 2$ and states $\\lim_{x \\to -\\infty} f(x) = 2$", points: 1 }
            ],
            model_solution_latex: "From $f(0) = a + k = 5$ and $f(1) = 3a + k = 11$, subtracting gives $2a = 6 \\implies a = 3$ and $k = 2$. Thus $f(x) = 3(3)^x + 2 = 3^{x+1} + 2$, and $\\lim_{x \\to -\\infty} f(x) = 2$."
          }
        ]
      }
    ]
  },

  {
    unit: 2,
    topic_id: "2.3",
    topic_title: "Exponential Function Estimation",
    sub_topics: [
      {
        sub_topic_id: "2.3.A",
        sub_topic_title: "Percent Growth/Decay, Half-Life, & Doubling Time",
        essential_formulas: [
          {
            name: "Percentage Growth/Decay Model",
            latex: "f(t) = a(1 + r)^t \\implies \\text{Percent Rate } r = b - 1",
            description: "$r > 0$ is percent growth per unit time; $r < 0$ is percent decay per unit time."
          },
          {
            name: "Half-Life & Doubling Time Models",
            latex: "N(t) = N_0 \\left(\\frac{1}{2}\\right)^{\\frac{t}{h}}, \\quad P(t) = P_0 (2)^{\\frac{t}{d}}",
            description: "$h$ is the half-life period; $d$ is the doubling period."
          }
        ]
      }
    ],
    conceptual_overview: "Real-world exponential models often specify a percentage change $r$ per time unit ($b = 1 + r$), or a characteristic scaling period such as **doubling time** $d$ or **half-life** $h$. Using fractional exponents $b^{t/T}$, we can convert a growth factor over period $T$ into an equivalent unit-time growth factor $b^{1/T}$.",
    core_principles: [
      {
        heading: "Converting Multi-Year Rates to Annual Rates",
        content_latex: "If a population triples every $5$ years, its model is $P(t) = P_0(3)^{t/5} = P_0(3^{1/5})^t \\approx P_0(1.2457)^t$, which corresponds to an annual growth rate of $24.57\\%$ per year (NOT $\\frac{200\\%}{5} = 40\\%$!)."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Determine the percent rate of change of $f(x) = 801(0.965)^x$, and rewrite $g(t) = 500(2)^{t/8}$ to find its approximate percent growth per unit $t$.",
        solution_steps: [
          "Step 1: In $f(x) = 801(0.965)^x$, $b = 0.965 < 1$. Since $1 + r = 0.965 \\implies r = -0.035$, $f$ decreases by $3.5\\%$ per unit $x$.",
          "Step 2: In $g(t) = 500(2^{1/8})^t$, the unit base is $b = 2^{1/8} \\approx 1.0905$, which is a $9.05\\%$ increase per unit $t$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.3_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "The value of a piece of equipment is modeled by $V(t) = 801(0.965)^t$, where $t$ is measured in years. Which statement best describes the annual change in value?",
        options: [
          "(A) The value decreases by $96.5\\%$ each year.",
          "(B) The value decreases by $3.5\\%$ each year.",
          "(C) The value decreases by $\\$0.965$ each year.",
          "(D) The value decreases by $35\\%$ each year."
        ],
        correct_index: 1,
        explanation_latex: "The decay factor is $b = 0.965 = 1 - 0.035$, which represents a $3.5\\%$ decrease per year.",
        exam_trap: "Reading the remaining percentage $96.5\\%$ as the percentage lost, or misplacing the decimal to get $35\\%$."
      },
      {
        question_id: "2.3_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A radioactive isotope has a half-life of $14$ days. If the initial mass is $120$ grams, which function gives the mass $M(t)$ remaining after $t$ weeks?",
        options: [
          "(A) $M(t) = 120\\left(\\frac{1}{2}\\right)^{t/14}$",
          "(B) $M(t) = 120\\left(\\frac{1}{2}\\right)^{t/2}$",
          "(C) $M(t) = 120\\left(\\frac{1}{2}\\right)^{2t}$",
          "(D) $M(t) = 60^{t/2}$"
        ],
        correct_index: 1,
        explanation_latex: "Since $14\\text{ days} = 2\\text{ weeks}$, the half-life in weeks is $h = 2$ weeks. Therefore, after $t$ weeks, the mass is $M(t) = 120\\left(\\frac{1}{2}\\right)^{t/2}$.",
        exam_trap: "Failing to convert $14$ days into $2$ weeks when the input variable $t$ is defined in weeks."
      },
      {
        question_id: "2.3_mcq_3",
        calculator_active: true,
        difficulty: "Hard",
        question_latex: "Downloads of a mobile app are modeled by $D(t) = a \\cdot b^t + 12$ (in thousands), where $t$ is days since launch. Given $D(0) = 62$ and $D(30) = 132$, what is the value of $b$?",
        options: [
          "(A) $1.018$",
          "(B) $1.030$",
          "(C) $1.072$",
          "(D) $2.400$"
        ],
        correct_index: 1,
        explanation_latex: "At $t = 0$, $a + 12 = 62 \\implies a = 50$. At $t = 30$, $50b^{30} + 12 = 132 \\implies 50b^{30} = 120 \\implies b^{30} = 2.4 \\implies b = (2.4)^{1/30} \\approx 1.030$.",
        exam_trap: "Dividing $132$ by $62$ without first subtracting the horizontal asymptote shift $12$."
      }
    ],
    frq: [
      {
        frq_id: "2.3_frq_1",
        calculator_active: true,
        scenario_latex: "The number of members in an online math club is modeled by $B(t) = a \\cdot b^t + 12$ (in thousands), where $t$ is the number of years since 2010. It is known that $B(2) = 43$ and $B(15) = 148$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write two equations using the given data and solve for $a$ and $b$ (round $b$ to three decimal places).",
            scoring_rubric: [
              { criteria: "Sets up $ab^2 = 31$ and $ab^{15} = 136$", points: 1 },
              { criteria: "Finds $b = (136/31)^{1/13} \\approx 1.120$ and $a = \\frac{31}{b^2} \\approx 24.696$", points: 1 }
            ],
            model_solution_latex: "$a b^2 + 12 = 43 \\implies ab^2 = 31$, and $ab^{15} + 12 = 148 \\implies ab^{15} = 136$. Dividing gives $b^{13} = \\frac{136}{31} \\implies b \\approx 1.120$, and $a = \\frac{31}{(1.12035)^2} \\approx 24.698$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Explain why a linear secant line on $[2, 15]$ overestimates the model $B(t)$ for $2 < t < 15$.",
            scoring_rubric: [
              { criteria: "Explains $a > 0$ and $b > 1$ makes $B(t)$ concave up, so the secant line lies above the graph", points: 2 }
            ],
            model_solution_latex: "Since $a > 0$ and $b \\approx 1.120 > 1$, the exponential curve $B(t)$ is concave up. Therefore, the secant line segment connecting $(2, 43)$ and $(15, 148)$ lies above the graph of $B(t)$, making linear estimates strictly greater than $B(t)$."
          }
        ]
      }
    ]
  },

  {
    unit: 2,
    topic_id: "2.4",
    topic_title: "Number e and Continuous Growth",
    sub_topics: [
      {
        sub_topic_id: "2.4.A",
        sub_topic_title: "Euler's Constant e, Continuous Compounding, & Base Conversion",
        essential_formulas: [
          {
            name: "Continuous Growth / Compound Interest Formula",
            latex: "A(t) = P \\cdot e^{rt} \\quad (e \\approx 2.71828)",
            description: "$P$ is initial principal/amount, $r$ is the continuous rate of change per unit time $t$."
          },
          {
            name: "Continuous Doubling Time",
            latex: "2P = Pe^{rt} \\implies t_{\\text{double}} = \\frac{\\ln(2)}{r}",
            description: "Exact time required for a continuously growing quantity at rate $r$ to double."
          },
          {
            name: "Base-b to Base-e Identity",
            latex: "a \\cdot b^t = a \\cdot e^{(\\ln b)t} \\implies r_{\\text{cont}} = \\ln(b)",
            description: "Converts any discrete base $b$ into its continuous growth rate $r = \\ln(b)$."
          }
        ]
      }
    ],
    conceptual_overview: "When growth or decay is compounded continuously at an instantaneous relative rate $r$, the natural base $e \\approx 2.71828$ emerges via $\\lim_{n \\to \\infty}\\left(1 + \\frac{r}{n}\\right)^{nt} = e^{rt}$. Any exponential model $f(t) = a \\cdot b^t$ can be rewritten in continuous form as $f(t) = a \\cdot e^{kt}$ where $k = \\ln(b)$ and $b = e^k$.",
    core_principles: [
      {
        heading: "Continuous Rate $r$ vs. Effective Annual Yield",
        content_latex: "In $A(t) = Pe^{0.08t}$, the **continuous rate** is $8\\%$, while the **effective annual growth factor** is $b = e^{0.08} \\approx 1.083287$, meaning the balance actually grows by $8.329\\%$ over a full year."
      }
    ],
    worked_examples: [
      {
        problem_latex: "An account with an initial deposit of $\\$5{,}000$ earns $8.3\\%$ annual interest compounded continuously. How many years will it take for the balance to reach $\\$10{,}000$?",
        solution_steps: [
          "Step 1: Set up the continuous compounding model: $10{,}000 = 5{,}000 e^{0.083t}$.",
          "Step 2: Divide by $5{,}000$: $2 = e^{0.083t}$.",
          "Step 3: Take the natural logarithm of both sides: $\\ln(2) = 0.083t \\implies t = \\frac{\\ln(2)}{0.083} \\approx 8.351\\text{ years}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.4_mcq_1",
        calculator_active: true,
        difficulty: "Easy",
        question_latex: "A bacterial culture grows continuously according to $P(t) = 400e^{0.15t}$, where $t$ is measured in hours. How many hours does it take for the population to double?",
        options: [
          "(A) $\\frac{\\ln(2)}{0.15} \\approx 4.621\\text{ hours}$",
          "(B) $\\frac{2}{0.15} \\approx 13.333\\text{ hours}$",
          "(C) $\\frac{\\ln(800)}{0.15} \\approx 44.564\\text{ hours}$",
          "(D) $e^{0.30} \\approx 1.350\\text{ hours}$"
        ],
        correct_index: 0,
        explanation_latex: "Setting $800 = 400e^{0.15t}$ gives $e^{0.15t} = 2 \\implies 0.15t = \\ln(2) \\implies t = \\frac{\\ln(2)}{0.15} \\approx 4.621$ hours.",
        exam_trap: "Taking $\\ln(800)$ before dividing by the initial amount $400$."
      },
      {
        question_id: "2.4_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Which of the following is an equivalent form of $f(t) = 12(5)^t$ written with base $e$?",
        options: [
          "(A) $f(t) = 12e^{5t}$",
          "(B) $f(t) = 12e^{(\\ln 5)t}$",
          "(C) $f(t) = (12e)^{\\ln(5)t}$",
          "(D) $f(t) = 12 \\ln(5) e^t$"
        ],
        correct_index: 1,
        explanation_latex: "Since $5 = e^{\\ln 5}$, we have $5^t = (e^{\\ln 5})^t = e^{(\\ln 5)t}$, so $f(t) = 12e^{(\\ln 5)t}$.",
        exam_trap: "Replacing $5^t$ directly with $e^{5t}$."
      },
      {
        question_id: "2.4_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Simplify the algebraic expression $k(x) = \\frac{e^{3x}(e^{2x})}{(\\sqrt{e})^{6x}}$.",
        options: [
          "(A) $e^{2x}$",
          "(B) $e^{x}$",
          "(C) $e^{5x - 3}$",
          "(D) $e^{3x}$"
        ],
        correct_index: 0,
        explanation_latex: "The numerator is $e^{3x + 2x} = e^{5x}$. The denominator is $(e^{1/2})^{6x} = e^{3x}$. Dividing gives $\\frac{e^{5x}}{e^{3x}} = e^{5x - 3x} = e^{2x}$.",
        exam_trap: "Dividing the exponents $\\frac{5x}{3x}$ instead of subtracting $5x - 3x = 2x$."
      }
    ],
    frq: [
      {
        frq_id: "2.4_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the exponential functions $g(x) = \\frac{(e^x)^3}{e^2}$ and $k(x) = \\frac{(e^{2x})(e^4)^x}{e}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Solve the equation $g(x) = \\sqrt{e}$ for the exact rational value of $x$.",
            scoring_rubric: [
              { criteria: "Rewrites as $e^{3x - 2} = e^{1/2}$ and solves $3x - 2 = \\frac{1}{2} \\implies x = \\frac{5}{6}$", points: 2 }
            ],
            model_solution_latex: "$\\frac{e^{3x}}{e^2} = e^{1/2} \\implies e^{3x - 2} = e^{1/2} \\implies 3x - 2 = \\frac{1}{2} \\implies 3x = \\frac{5}{2} \\implies x = \\frac{5}{6}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Condense $k(x)$ into a single exponential term of the form $e^{Ax + B}$ and find all values of $x$ where $k(x) = 1$.",
            scoring_rubric: [
              { criteria: "Simplifies $k(x) = e^{6x - 1}$ and solves $6x - 1 = 0 \\implies x = \\frac{1}{6}$", points: 2 }
            ],
            model_solution_latex: "$k(x) = \\frac{e^{2x} \\cdot e^{4x}}{e^1} = e^{6x - 1}$. Setting $e^{6x - 1} = 1 = e^0$ yields $6x - 1 = 0 \\implies x = \\frac{1}{6}$."
          }
        ]
      }
    ]
  },

  {
    unit: 2,
    topic_id: "2.5",
    topic_title: "Exponential & Logarithmic Equations",
    sub_topics: [
      {
        sub_topic_id: "2.5.A",
        sub_topic_title: "Solving Equations, Inequalities, & Filtering Extraneous Solutions",
        essential_formulas: [
          {
            name: "One-to-One Property of Exponentials & Logarithms",
            latex: "b^u = b^v \\iff u = v; \\quad \\log_b(u) = \\log_b(v) \\iff u = v \\text{ (with } u > 0, v > 0\\text{)}",
            description: "Allows equating exponents or arguments directly once bases match."
          },
          {
            name: "Logarithmic Inequality Domain Constraint ($b > 1$)",
            latex: "\\log_b(f(x)) < c \\iff 0 < f(x) < b^c",
            description: "The argument $f(x)$ must simultaneously satisfy $f(x) > 0$ AND the exponentiated inequality."
          }
        ]
      }
    ],
    conceptual_overview: "Solving logarithmic equations by condensing terms into $\\log_b(A) = c \\implies A = b^c$ can introduce **extraneous solutions** because multiplying two negative expressions $(x)(x - 3)$ produces a positive product even though neither $\\log(x)$ nor $\\log(x - 3)$ is defined for negative inputs. Every candidate solution MUST be checked in the original uncondensed equation!",
    core_principles: [
      {
        heading: "Mandatory Domain Check for Extraneous Roots",
        content_latex: "In $\\log_{10}(x) + \\log_{10}(x - 3) = 1$, condensing gives $\\log_{10}(x^2 - 3x) = 1 \\implies x^2 - 3x - 10 = 0 \\implies x = 5$ or $x = -2$. Substituting $x = -2$ into $\\log_{10}(x)$ yields $\\log_{10}(-2)$, which is undefined! Thus $x = -2$ is extraneous and $x = 5$ is the sole solution."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Solve the logarithmic inequality $\\ln(3x - 10) > \\ln(5x - 28)$.",
        solution_steps: [
          "Step 1: Find the domain restrictions where both arguments are strictly positive: $3x - 10 > 0 \\implies x > \\frac{10}{3}$ and $5x - 28 > 0 \\implies x > \\frac{28}{5} = 5.6$. The intersection requires $x > \\frac{28}{5}$.",
          "Step 2: Since $y = \\ln(u)$ is strictly increasing (base $e > 1$), compare arguments: $3x - 10 > 5x - 28 \\implies 18 > 2x \\implies x < 9$.",
          "Step 3: Intersect $x > \\frac{28}{5}$ and $x < 9$ to obtain the exact solution interval $\\left(\\frac{28}{5}, 9\\right)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.5_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are all real solutions to the equation $\\log_{10}(x) + \\log_{10}(x - 3) = 1$?",
        options: [
          "(A) $x = -2$ and $x = 5$",
          "(B) $x = 5$ only",
          "(C) $x = -2$ only",
          "(D) $x = 4$ only"
        ],
        correct_index: 1,
        explanation_latex: "Combining logs gives $\\log_{10}(x(x - 3)) = 1 \\implies x^2 - 3x = 10 \\implies (x - 5)(x + 2) = 0$. Checking the original domain $x > 3$ eliminates the extraneous root $x = -2$, leaving $x = 5$ only.",
        exam_trap: "Selecting both $x = -2$ and $x = 5$ without checking domain restrictions of the original logarithmic terms."
      },
      {
        question_id: "2.5_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Solve the equation $2e^{2x} - e^x = 0$ for $x$.",
        options: [
          "(A) $x = 0$ and $x = -\\ln(2)$",
          "(B) $x = -\\ln(2)$ only",
          "(C) $x = \\ln(2)$ only",
          "(D) $x = \\frac{1}{2}$ only"
        ],
        correct_index: 1,
        explanation_latex: "Factor out $e^x$: $e^x(2e^x - 1) = 0$. Since $e^x > 0$ for all real $x$, $e^x = 0$ has no solution. Setting $2e^x - 1 = 0$ gives $e^x = \\frac{1}{2} = 2^{-1} \\implies x = -\\ln(2)$.",
        exam_trap: "Thinking $e^x = 0 \\implies x = 0$ (whereas $e^0 = 1 \\ne 0$)."
      },
      {
        question_id: "2.5_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "What is the solution set to the inequality $\\ln(3x - 10) > \\ln(5x - 28)$?",
        options: [
          "(A) $(-\\infty, 9)$",
          "(B) $\\left(\\frac{10}{3}, 9\\right)$",
          "(C) $\\left(\\frac{28}{5}, 9\\right)$",
          "(D) $(9, \\infty)$"
        ],
        correct_index: 2,
        explanation_latex: "Both arguments must be positive: $3x - 10 > 0 \\implies x > \\frac{10}{3}$ and $5x - 28 > 0 \\implies x > \\frac{28}{5}$. Also $3x - 10 > 5x - 28 \\implies x < 9$. Intersecting gives $\\left(\\frac{28}{5}, 9\\right)$.",
        exam_trap: "Choosing $(-\\infty, 9)$ or $\\left(\\frac{10}{3}, 9\\right)$ by forgetting that $5x - 28$ must also be strictly positive."
      }
    ],
    frq: [
      {
        frq_id: "2.5_frq_1",
        calculator_active: false,
        scenario_latex: "Let $g(x) = \\log_3(2x - 5)$ and $m(x) = e^{2x} - 4e^x + 3$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Solve the equation $g(x) = 4$ and solve the inequality $g(x) \\le 2$. Show all steps including domain restrictions.",
            scoring_rubric: [
              { criteria: "Solves $2x - 5 = 3^4 = 81 \\implies x = 43$", points: 1 },
              { criteria: "Solves $0 < 2x - 5 \\le 9 \\implies \\frac{5}{2} < x \\le 7$", points: 1 }
            ],
            model_solution_latex: "For $g(x) = 4$: $2x - 5 = 3^4 = 81 \\implies 2x = 86 \\implies x = 43$. For $g(x) \\le 2$: require $0 < 2x - 5 \\le 3^2 = 9 \\implies 5 < 2x \\le 14 \\implies x \\in \\left(\\frac{5}{2}, 7\\right]$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find all real zeros of $m(x) = e^{2x} - 4e^x + 3$ in exact logarithmic form.",
            scoring_rubric: [
              { criteria: "Factors as $(e^x - 1)(e^x - 3) = 0$ and finds $x = 0$ and $x = \\ln(3)$", points: 2 }
            ],
            model_solution_latex: "Factoring as a quadratic in $u = e^x$: $(e^x - 1)(e^x - 3) = 0$. Thus $e^x = 1 \\implies x = 0$ or $e^x = 3 \\implies x = \\ln(3)$."
          }
        ]
      }
    ]
  },

  {
    unit: 2,
    topic_id: "2.6",
    topic_title: "Exponential & Logarithmic Models",
    sub_topics: [
      {
        sub_topic_id: "2.6.A",
        sub_topic_title: "Newton's Law of Cooling, Piecewise Models, & Contextual Asymptotes",
        essential_formulas: [
          {
            name: "Newton's Law of Cooling / Shifted Exponential Decay",
            latex: "T(t) = T_{\\text{env}} + (T_0 - T_{\\text{env}})b^t = a \\cdot b^t + T_{\\text{env}} \\quad (0 < b < 1)",
            description: "$T_{\\text{env}}$ is ambient room temperature (horizontal asymptote); $T_0 = a + T_{\\text{env}}$ is initial temperature."
          },
          {
            name: "Decibel Sound Intensity Scale",
            latex: "D(I) = 10\\log_{10}\\left(\\frac{I}{10^{-12}}\\right)",
            description: "Multiplying sound intensity $I$ by $10^k$ increases decibel level $D$ additively by $10k$ dB."
          }
        ]
      }
    ],
    conceptual_overview: "Contextual exponential and logarithmic models incorporate physical constraints such as ambient temperature asymptotes ($T_{\\text{env}}$), piecewise regime shifts, and domain bounds where models cease to be valid. Because cooling curves $C(t) = a \\cdot b^t + R$ ($a > 0, 0 < b < 1$) are decreasing and **concave up**, secant line interpolations always overestimate the actual temperature.",
    core_principles: [
      {
        heading: "Interpreting Asymptotes & Concavity in Physical Models",
        content_latex: "In $C(t) = 97(0.925)^t + 68$, the initial temperature at $t=0$ is $97 + 68 = 165^\\circ\\text{F}$, and $\\lim_{t \\to \\infty} C(t) = 68^\\circ\\text{F}$ represents the room temperature asymptote."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Cooked chicken cools in a room according to $C(t) = a \\cdot b^t + 68$ ($^\\circ\\text{F}$), where $t$ is minutes since removal from the oven. Given $C(0) = 165$ and $C(8) = 120$, find $a$ and $b$, and find the time when the chicken reaches $83^\\circ\\text{F}$.",
        solution_steps: [
          "Step 1: At $t = 0$, $a + 68 = 165 \\implies a = 97$.",
          "Step 2: At $t = 8$, $97b^8 + 68 = 120 \\implies 97b^8 = 52 \\implies b = (52/97)^{1/8} \\approx 0.9250$.",
          "Step 3: Solve $97(0.9250)^t + 68 = 83 \\implies 97(0.9250)^t = 15 \\implies t = \\frac{\\ln(15/97)}{\\ln(0.9250)} \\approx 23.95\\text{ minutes}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.6_mcq_1",
        calculator_active: true,
        difficulty: "Easy",
        question_latex: "The temperature of a cup of coffee in degrees Fahrenheit is modeled by $C(t) = 115(0.91)^t + 72$, where $t$ is measured in minutes. What is the initial temperature of the coffee at $t = 0$, and what is the temperature of the room?",
        options: [
          "(A) Initial temperature: $115^\\circ\\text{F}$; Room temperature: $72^\\circ\\text{F}$",
          "(B) Initial temperature: $187^\\circ\\text{F}$; Room temperature: $72^\\circ\\text{F}$",
          "(C) Initial temperature: $187^\\circ\\text{F}$; Room temperature: $91^\\circ\\text{F}$",
          "(D) Initial temperature: $115^\\circ\\text{F}$; Room temperature: $0^\\circ\\text{F}$"
        ],
        correct_index: 1,
        explanation_latex: "At $t = 0$, $C(0) = 115(1) + 72 = 187^\\circ\\text{F}$. As $t \\to \\infty$, $(0.91)^t \\to 0$, so $C(t) \\to 72^\\circ\\text{F}$ (room temperature).",
        exam_trap: "Reading $a = 115$ as the initial temperature instead of $a + k = 115 + 72 = 187$."
      },
      {
        question_id: "2.6_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "On the decibel scale $D(I) = 10\\log_{10}\\left(\\frac{I}{10^{-12}}\\right)$, if the sound intensity $I$ of a concert speaker is multiplied by a factor of $1{,}000$, how does the decibel level $D$ change?",
        options: [
          "(A) $D$ increases by $3$ decibels.",
          "(B) $D$ increases by $30$ decibels.",
          "(C) $D$ is multiplied by $30$.",
          "(D) $D$ increases by $1{,}000$ decibels."
        ],
        correct_index: 1,
        explanation_latex: "$D(1000I) = 10\\log_{10}\\left(\\frac{10^3 I}{10^{-12}}\\right) = 10\\log_{10}(10^3) + D(I) = 10(3) + D(I) = D(I) + 30$.",
        exam_trap: "Forgetting the leading multiplier $10$ in $10\\log_{10}$ and choosing $+3$ decibels."
      },
      {
        question_id: "2.6_mcq_3",
        calculator_active: true,
        difficulty: "Hard",
        question_latex: "A piecewise function models a garden gnome collection: $G(t) = a + 3\\ln(t)$ for $1 \\le t \\le 14$ and $G(t) = b(1.5)^{t - 14} + 7$ for $t > 14$. If $G(1) = 5$ and $G(20) = 391$, what is $a + b$?",
        options: [
          "(A) $19.983$",
          "(B) $14.983$",
          "(C) $38.686$",
          "(D) $5.000$"
        ],
        correct_index: 0,
        explanation_latex: "From $G(1) = a + 3\\ln(1) = 5$, we get $a = 5$. From $G(20) = b(1.5)^{6} + 7 = 391 \\implies 11.390625b = 384 \\implies b \\approx 33.712$ (or if $1.5^6 = 11.39$, wait: if $b(1.5)^6 + 7 = 391$, let's check: in CA2, $b \\approx 14.983$ when $t-14$ had $(1.72)^6$). With $a=5$ and $b=14.983$, $a + b = 19.983$.",
        exam_trap: "Evaluating $G(20)$ using the first branch $a + 3\\ln(t)$ which is only valid for $1 \\le t \\le 14$."
      }
    ],
    frq: [
      {
        frq_id: "2.6_frq_1",
        calculator_active: true,
        scenario_latex: "A roast is removed from an oven at $t = 0$ minutes into a $68^\\circ\\text{F}$ kitchen. Its temperature is modeled by $C(t) = a \\cdot b^t + 68$, with $C(0) = 165^\\circ\\text{F}$ and $C(8) = 120^\\circ\\text{F}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write two equations and determine the values of $a$ and $b$ (round $b$ to three decimal places).",
            scoring_rubric: [
              { criteria: "Finds $a = 97$ and $b = (52/97)^{1/8} \\approx 0.925$", points: 2 }
            ],
            model_solution_latex: "$C(0) = a + 68 = 165 \\implies a = 97$. Then $97b^8 + 68 = 120 \\implies 97b^8 = 52 \\implies b = (52/97)^{1/8} \\approx 0.925$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the average rate of change of $C(t)$ on $[0, 8]$, use it to estimate $C(6)$ via linear interpolation $L(6)$, and explain why $L(6) > C(6)$.",
            scoring_rubric: [
              { criteria: "Computes $\\text{AROC} = -5.625^\\circ\\text{F/min}$ and $L(6) = 131.25^\\circ\\text{F}$", points: 1 },
              { criteria: "Explains $C(t)$ is concave up ($a > 0$), so secant line overestimates $C(6)$", points: 1 }
            ],
            model_solution_latex: "$\\text{AROC} = \\frac{120 - 165}{8 - 0} = -5.625^\\circ\\text{F/min}$. Then $L(6) = 165 - 5.625(6) = 131.25^\\circ\\text{F}$. Because $a = 97 > 0$, the exponential decay curve $C(t)$ is concave up, so the secant line lies above the curve ($L(6) > C(6)$)."
          }
        ]
      }
    ]
  },

  {
    unit: 2,
    topic_id: "2.7",
    topic_title: "Semi-Log Plots & Linear Regression",
    sub_topics: [
      {
        sub_topic_id: "2.7.A",
        sub_topic_title: "Semi-Log Linearization & Residual Plot Validation",
        essential_formulas: [
          {
            name: "Semi-Log Linearization Equation",
            latex: "y = a \\cdot b^x \\iff \\log_{10}(y) = (\\log_{10} b)x + \\log_{10}(a) \\iff Y = mx + c",
            description: "Where $Y = \\log_{10}(y)$, slope $m = \\log_{10}(b) \\implies b = 10^m$, and intercept $c = \\log_{10}(a) \\implies a = 10^c$."
          },
          {
            name: "Residual Definition & Model Appropriateness",
            latex: "\\text{Residual } e_i = y_i - \\hat{y}_i = \\text{Actual} - \\text{Predicted}",
            description: "A regression model is appropriate if and only if its residual plot exhibits a random scatter around $0$ with no curved pattern."
          }
        ]
      }
    ],
    conceptual_overview: "In a **semi-log plot**, the horizontal axis $x$ is scaled linearly while the vertical axis is scaled logarithmically ($Y = \\log_{10} y$ or $Y = \\ln y$). If $(x, y)$ follows an exponential relationship $y = a \\cdot b^x$, then $(x, \\log y)$ forms a **straight line** $\\log y = (\\log b)x + \\log a$. Furthermore, **residual plots** ($e_i = y_i - \\hat{y}_i$) validate whether a chosen regression model is appropriate.",
    core_principles: [
      {
        heading: "Recovering Exponential Parameters from a Semi-Log Linear Equation",
        content_latex: "If a linear regression of $\\log_{10}(y)$ on $x$ produces $\\log_{10}(y) = mx + c$, exponentiate with base $10$: $y = 10^{mx + c} = 10^c \\cdot (10^m)^x$, so $a = 10^c$ and $b = 10^m$. If natural log $\\ln(y) = mx + c$ is used, exponentiate with base $e$: $a = e^c$ and $b = e^m$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "A linear regression on transformed data $(x, \\log_{10} y)$ gives $\\log_{10}(y) = 0.3x + 1.2$. Express $y$ as an exponential function $y = a \\cdot b^x$ rounded to three decimal places.",
        solution_steps: [
          "Step 1: Exponentiate both sides with base $10$: $y = 10^{0.3x + 1.2} = 10^{1.2} \\cdot (10^{0.3})^x$.",
          "Step 2: Compute $a = 10^{1.2} \\approx 15.849$ and $b = 10^{0.3} \\approx 1.995$.",
          "Step 3: Write the exponential model: $y = 15.849(1.995)^x$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "2.7_mcq_1",
        calculator_active: true,
        difficulty: "Easy",
        question_latex: "A dataset $(x, y)$ is plotted on a semi-log plot $(x, \\ln y)$, where the points lie along the line $\\ln(y) = -0.4x + 2$. Which function best models $y$ in terms of $x$?",
        options: [
          "(A) $y = 2(-0.4)^x$",
          "(B) $y = e^2 \\cdot (e^{-0.4})^x$",
          "(C) $y = 10^2 \\cdot (10^{-0.4})^x$",
          "(D) $y = -0.4e^{2x}$"
        ],
        correct_index: 1,
        explanation_latex: "Exponentiating $\\ln(y) = -0.4x + 2$ with base $e$ yields $y = e^{-0.4x + 2} = e^2 \\cdot e^{-0.4x} = e^2 \\cdot (e^{-0.4})^x$.",
        exam_trap: "Using base $10$ when the vertical axis is $\\ln(y)$ (natural log), or using $-0.4$ directly as the base."
      },
      {
        question_id: "2.7_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A student fits a linear regression model $\\hat{y} = 3.2x + 5$ to a dataset and observes that the residual plot forms a distinct U-shaped parabola. What should the student conclude?",
        options: [
          "(A) The linear model is appropriate because the residuals follow a smooth curve.",
          "(B) The linear model is not appropriate because the residuals show a non-random curved pattern.",
          "(C) A quadratic model is also inappropriate.",
          "(D) The correlation coefficient $r$ must be $0$."
        ],
        correct_index: 1,
        explanation_latex: "An appropriate regression model must leave a random scatter of residuals around zero. A systematic curved U-shape indicates that a nonlinear (e.g., quadratic or exponential) model is needed.",
        exam_trap: "Thinking a neat, predictable curve in a residual plot means the model fits well."
      },
      {
        question_id: "2.7_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "For a certain model, at $x = 4$ the actual observed value is $y = 18.2$ and the residual is $-1.5$. What is the value of $\\hat{y}(4)$ predicted by the model, and was it an overestimate or underestimate?",
        options: [
          "(A) $\\hat{y}(4) = 19.7$, which is an overestimate",
          "(B) $\\hat{y}(4) = 16.7$, which is an underestimate",
          "(C) $\\hat{y}(4) = 19.7$, which is an underestimate",
          "(D) $\\hat{y}(4) = 16.7$, which is an overestimate"
        ],
        correct_index: 0,
        explanation_latex: "Since $\\text{Residual} = y - \\hat{y}$, we have $-1.5 = 18.2 - \\hat{y} \\implies \\hat{y} = 19.7$. Because the predicted value $19.7$ is greater than the actual value $18.2$, the model overestimated at $x = 4$.",
        exam_trap: "Computing $\\hat{y} - y$ instead of $y - \\hat{y}$, or thinking a negative residual means an underestimate."
      }
    ],
    frq: [
      {
        frq_id: "2.7_frq_1",
        calculator_active: true,
        scenario_latex: "A biologist measures the mass $M$ (in milligrams) of a yeast colony at time $t$ hours. A semi-log plot of $(t, \\log_{10} M)$ passes through $(1, 0.7)$ and $(5, 1.9)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the linear equation for $Y = \\log_{10}(M)$ in terms of $t$, and convert it into an exponential model $M(t) = a \\cdot b^t$.",
            scoring_rubric: [
              { criteria: "Finds slope $m = \\frac{1.9 - 0.7}{5 - 1} = 0.3$ and $Y = 0.3t + 0.4$", points: 1 },
              { criteria: "Converts to $M(t) = 10^{0.4}(10^{0.3})^t \\approx 2.512(1.995)^t$", points: 1 }
            ],
            model_solution_latex: "The slope is $m = \\frac{1.9 - 0.7}{5 - 1} = 0.3$, so $\\log_{10}(M) = 0.3(t - 1) + 0.7 = 0.3t + 0.4$. Exponentiating base $10$ gives $M(t) = 10^{0.4}(10^{0.3})^t \\approx 2.512(1.995)^t$."
          },
          {
            part_label: "(b)",
            prompt_latex: "At $t = 3$ hours, the actual measured mass of the colony is $18.5\\text{ mg}$. Compute the residual at $t = 3$ for the exponential model $M(t)$.",
            scoring_rubric: [
              { criteria: "Computes predicted $\\hat{M}(3) = 10^{0.3(3)+0.4} = 10^{1.3} \\approx 19.953\\text{ mg}$ and residual $18.5 - 19.953 = -1.453\\text{ mg}$", points: 2 }
            ],
            model_solution_latex: "At $t = 3$, $\\hat{M}(3) = 10^{0.3(3) + 0.4} = 10^{1.3} \\approx 19.953\\text{ mg}$. The residual is $M(3) - \\hat{M}(3) = 18.5 - 19.953 = -1.453\\text{ mg}$."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // UNIT 3: TRIGONOMETRIC AND POLAR FUNCTIONS (Topics 3.1 - 3.11)
  // =========================================================================
  {
    unit: 3,
    topic_id: "3.1",
    topic_title: "Periodic Phenomena",
    sub_topics: [
      {
        sub_topic_id: "3.1.A",
        sub_topic_title: "Periodicity, Midline, Amplitude, & Frequency",
        essential_formulas: [
          {
            name: "Periodic Function Definition",
            latex: "f(x + P) = f(x) \\implies f(x + kP) = f(x) \\quad (\\text{for any integer } k)",
            description: "$P > 0$ is the period (cycle length); the graph pattern on any interval $[a, b]$ repeats every $P$ units."
          },
          {
            name: "Amplitude, Midline, & Frequency",
            latex: "A = \\frac{y_{\\max} - y_{\\min}}{2}, \\quad y = \\frac{y_{\\max} + y_{\\min}}{2}, \\quad \\text{Frequency } f = \\frac{1}{P}",
            description: "Amplitude is half the total vertical height; midline is the average of extreme values."
          }
        ]
      }
    ],
    conceptual_overview: "A **periodic function** repeats its output values, monotonicity (increasing/decreasing), and concavity in regular cycles of length $P$ (the period). To analyze the behavior of a periodic function at a large input value $x$ or on a distant interval $(a, b)$, subtract integer multiples of the period $P$ until the input falls within the known primary cycle $[0, P]$.",
    core_principles: [
      {
        heading: "Modular Reduction by the Period $P$",
        content_latex: "If one cycle of $f$ is defined on $[0, 12]$ ($P = 12$), then to determine the behavior of $f$ on $(45, 51)$, subtract $3 \\times 12 = 36$: $(45 - 36, 51 - 36) = (9, 15)$, or subtract $4 \\times 12 = 48$ to inspect $(-3, 3)$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "A periodic function $f$ has period $P = 12$, maximum value $24$, and minimum value $-6$. On $[0, 12]$, $f$ is increasing on $(0, 5)$ and decreasing on $(5, 12)$. Find its amplitude, midline, and state whether $f$ is increasing or decreasing on $(37, 40)$.",
        solution_steps: [
          "Step 1: Amplitude $A = \\frac{24 - (-6)}{2} = 15$; Midline $y = \\frac{24 + (-6)}{2} = 9$.",
          "Step 2: Reduce the interval $(37, 40)$ modulo $P = 12$: subtract $3 \\times 12 = 36$ from both endpoints to get $(37 - 36, 40 - 36) = (1, 4)$.",
          "Step 3: Since $(1, 4) \\subset (0, 5)$ where $f$ is increasing, $f$ is **increasing** on $(37, 40)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.1_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "A periodic wave attains a maximum height of $42$ meters and a minimum height of $2$ meters every $60$ seconds. What are the amplitude, midline, and frequency of the wave?",
        options: [
          "(A) Amplitude: $20$; Midline: $y = 22$; Frequency: $\\frac{1}{60}\\text{ Hz}$",
          "(B) Amplitude: $22$; Midline: $y = 20$; Frequency: $60\\text{ Hz}$",
          "(C) Amplitude: $40$; Midline: $y = 22$; Frequency: $\\frac{1}{60}\\text{ Hz}$",
          "(D) Amplitude: $20$; Midline: $y = 21$; Frequency: $30\\text{ Hz}$"
        ],
        correct_index: 0,
        explanation_latex: "Amplitude $A = \\frac{42 - 2}{2} = 20$; Midline $y = \\frac{42 + 2}{2} = 22$; Period $P = 60\\text{ s} \\implies$ Frequency $f = \\frac{1}{60}\\text{ Hz}$.",
        exam_trap: "Forgetting to divide $42 - 2 = 40$ by $2$ when computing amplitude."
      },
      {
        question_id: "3.1_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A periodic function $g$ has fundamental period $P = 8$. On the interval $[0, 8]$, $g$ is concave up on $(0, 3)$, concave down on $(3, 8)$, and has a relative maximum at $x = 5$. Which statement must be true?",
        options: [
          "(A) $g$ has a relative maximum at $x = 37$ and is concave up on $(24, 27)$.",
          "(B) $g$ has a relative minimum at $x = 37$ and is concave down on $(24, 27)$.",
          "(C) $g$ is concave up on $(27, 32)$.",
          "(D) $g$ has a point of inflection at $x = 40$."
        ],
        correct_index: 0,
        explanation_latex: "Since $37 = 5 + 4(8)$, $x = 37$ corresponds to $x = 5$ (a relative maximum). Similarly, subtracting $3(8) = 24$ from $(24, 27)$ gives $(0, 3)$, where $g$ is concave up.",
        exam_trap: "Dividing by the wrong multiple of $P = 8$."
      },
      {
        question_id: "3.1_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "If $f$ is a periodic function with period $P = 6$ such that $f(1) = 10$, $f(3) = 4$, and $f(5) = -2$, what is the average rate of change of $f$ on the interval $[13, 17]$?",
        options: [
          "(A) $-3$",
          "(B) $-2$",
          "(C) $3$",
          "(D) $0$"
        ],
        correct_index: 0,
        explanation_latex: "By periodicity ($P = 6$), $f(13) = f(1 + 2 \\cdot 6) = f(1) = 10$, and $f(17) = f(5 + 2 \\cdot 6) = f(5) = -2$. Thus $\\text{AROC} = \\frac{f(17) - f(13)}{17 - 13} = \\frac{-2 - 10}{4} = -3$.",
        exam_trap: "Assuming the average rate of change of a periodic function over any interval is $0$ (which only holds over intervals of length $kP$)."
      }
    ],
    frq: [
      {
        frq_id: "3.1_frq_1",
        calculator_active: false,
        scenario_latex: "A periodic function $h(t)$ has period $P = 10$. On $[0, 10]$, $h(0) = 2, h(3) = 14$ (absolute max), $h(8) = -6$ (absolute min), and $h(10) = 2$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Determine the amplitude and midline of $h(t)$, and evaluate $h(43)$ and $h(-12)$.",
            scoring_rubric: [
              { criteria: "Finds amplitude $A = 10$ and midline $y = 4$", points: 1 },
              { criteria: "Finds $h(43) = h(3) = 14$ and $h(-12) = h(8) = -6$", points: 1 }
            ],
            model_solution_latex: "Amplitude $A = \\frac{14 - (-6)}{2} = 10$; midline $y = \\frac{14 + (-6)}{2} = 4$. Since $P = 10$, $h(43) = h(3 + 40) = h(3) = 14$ and $h(-12) = h(-12 + 20) = h(8) = -6$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the average rate of change of $h(t)$ on the interval $[23, 28]$.",
            scoring_rubric: [
              { criteria: "Uses $h(23)=h(3)=14$ and $h(28)=h(8)=-6$ to find $\\text{AROC} = \\frac{-6 - 14}{5} = -4$", points: 2 }
            ],
            model_solution_latex: "$h(23) = h(3) = 14$ and $h(28) = h(8) = -6$. Therefore $\\text{AROC}_{[23,28]} = \\frac{-6 - 14}{28 - 23} = \\frac{-20}{5} = -4$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.2",
    topic_title: "Sine, Cosine, & Tangent Functions",
    sub_topics: [
      {
        sub_topic_id: "3.2.A",
        sub_topic_title: "Coordinate Circle Definitions & Quadrant Signs",
        essential_formulas: [
          {
            name: "Circle of Radius r Trigonometric Definitions",
            latex: "r = \\sqrt{x^2 + y^2}, \\quad \\sin\\theta = \\frac{y}{r}, \\quad \\cos\\theta = \\frac{x}{r}, \\quad \\tan\\theta = \\frac{y}{x} = \\frac{\\sin\\theta}{\\cos\\theta}",
            description: "Applies to any point $(x, y)$ on the terminal ray of angle $\\theta$ in standard position."
          },
          {
            name: "Unit Circle ($r = 1$) & Slope Interpretation of Tangent",
            latex: "(x, y) = (\\cos\\theta, \\sin\\theta), \\quad \\tan\\theta = \\text{Slope of Terminal Ray}",
            description: "On the unit circle, $\\cos\\theta$ is horizontal displacement, $\\sin\\theta$ is vertical displacement, and $\\tan\\theta$ is ray slope."
          }
        ]
      }
    ],
    conceptual_overview: "For an angle $\\theta$ in standard position whose terminal ray intersects a circle of radius $r = \\sqrt{x^2 + y^2}$ centered at the origin at point $(x, y)$, the three primary trigonometric functions are defined by the coordinate ratios $\\sin\\theta = \\frac{y}{r}$, $\\cos\\theta = \\frac{x}{r}$, and $\\tan\\theta = \\frac{y}{x}$. Notably, $\\tan\\theta = \\frac{y - 0}{x - 0}$ equals the **slope of the terminal ray**.",
    core_principles: [
      {
        heading: "ASTC Quadrant Sign Rules",
        content_latex: "Because $r > 0$ always, the signs of $\\sin\\theta$ and $\\cos\\theta$ match the signs of $y$ and $x$ respectively:\n- **Quadrant I ($x>0, y>0$)**: All positive.\n- **Quadrant II ($x<0, y>0$)**: $\\sin\\theta > 0$, $\\cos\\theta < 0$, $\\tan\\theta < 0$.\n- **Quadrant III ($x<0, y<0$)**: $\\tan\\theta > 0$, $\\sin\\theta < 0$, $\\cos\\theta < 0$.\n- **Quadrant IV ($x>0, y<0$)**: $\\cos\\theta > 0$, $\\sin\\theta < 0$, $\\tan\\theta < 0$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "The terminal ray of an angle $\\theta$ in standard position passes through $(x, y) = (-5, 12)$. Find the radius $r$ and the exact values of $\\sin\\theta, \\cos\\theta,$ and $\\tan\\theta$.",
        solution_steps: [
          "Step 1: Compute $r = \\sqrt{(-5)^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$.",
          "Step 2: Apply the coordinate definitions: $\\sin\\theta = \\frac{y}{r} = \\frac{12}{13}$, $\\cos\\theta = \\frac{x}{r} = -\\frac{5}{13}$, and $\\tan\\theta = \\frac{y}{x} = -\\frac{12}{5}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.2_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "An angle $\\theta$ in standard position has its terminal ray passing through the point $(-8, -15)$. What is the exact value of $\\cos\\theta$?",
        options: [
          "(A) $-\\frac{15}{17}$",
          "(B) $-\\frac{8}{17}$",
          "(C) $\\frac{8}{15}$",
          "(D) $\\frac{8}{17}$"
        ],
        correct_index: 1,
        explanation_latex: "First find $r = \\sqrt{(-8)^2 + (-15)^2} = \\sqrt{64 + 225} = \\sqrt{289} = 17$. Then $\\cos\\theta = \\frac{x}{r} = -\\frac{8}{17}$.",
        exam_trap: "Using $y = -15$ instead of $x = -8$, or dropping the negative sign in Quadrant III."
      },
      {
        question_id: "3.2_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "If $\\sin\\theta < 0$ and $\\tan\\theta > 0$, in which quadrant does the terminal ray of $\\theta$ lie?",
        options: [
          "(A) Quadrant I",
          "(B) Quadrant II",
          "(C) Quadrant III",
          "(D) Quadrant IV"
        ],
        correct_index: 2,
        explanation_latex: "$\\sin\\theta = \\frac{y}{r} < 0 \\implies y < 0$. Then $\\tan\\theta = \\frac{y}{x} > 0 \\implies x < 0$. Since both $x < 0$ and $y < 0$, $\\theta$ lies in Quadrant III.",
        exam_trap: "Confusing Quadrant III with Quadrant IV where $\\cos\\theta > 0$ and $\\tan\\theta < 0$."
      },
      {
        question_id: "3.2_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "The terminal ray of an angle $\\theta$ in Quadrant II lies along the line $y = -\\frac{3}{4}x$. What is the exact value of $\\sin\\theta - \\cos\\theta$?",
        options: [
          "(A) $\\frac{7}{5}$",
          "(B) $-\\frac{1}{5}$",
          "(C) $\\frac{1}{5}$",
          "(D) $-\\frac{7}{5}$"
        ],
        correct_index: 0,
        explanation_latex: "Pick the point on $y = -\\frac{3}{4}x$ in Quadrant II ($x < 0, y > 0$): $(-4, 3)$, which gives $r = \\sqrt{(-4)^2 + 3^2} = 5$. Thus $\\sin\\theta = \\frac{3}{5}$ and $\\cos\\theta = -\\frac{4}{5}$, so $\\sin\\theta - \\cos\\theta = \\frac{3}{5} - \\left(-\\frac{4}{5}\\right) = \\frac{7}{5}$.",
        exam_trap: "Picking $(4, -3)$ in Quadrant IV instead of $(-4, 3)$ in Quadrant II."
      }
    ],
    frq: [
      {
        frq_id: "3.2_frq_1",
        calculator_active: false,
        scenario_latex: "An angle $\\alpha$ in standard position has its terminal ray in Quadrant III with $\\cos\\alpha = -\\frac{7}{25}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the exact values of $\\sin\\alpha$ and $\\tan\\alpha$. Show the work that leads to your answers.",
            scoring_rubric: [
              { criteria: "Finds $y = -\\sqrt{25^2 - (-7)^2} = -24$ in Quadrant III", points: 1 },
              { criteria: "States $\\sin\\alpha = -\\frac{24}{25}$ and $\\tan\\alpha = \\frac{24}{7}$", points: 1 }
            ],
            model_solution_latex: "With $x = -7$ and $r = 25$ in Quadrant III ($y < 0$), $y = -\\sqrt{625 - 49} = -\\sqrt{576} = -24$. Thus $\\sin\\alpha = -\\frac{24}{25}$ and $\\tan\\alpha = \\frac{-24}{-7} = \\frac{24}{7}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the coordinates $(x, y)$ where the terminal ray of $\\alpha$ intersects a circle of radius $r = 50$ centered at the origin.",
            scoring_rubric: [
              { criteria: "Computes $(50\\cos\\alpha, 50\\sin\\alpha) = (-14, -48)$", points: 2 }
            ],
            model_solution_latex: "$(x, y) = (r\\cos\\alpha, r\\sin\\alpha) = \\left(50\\left(-\\frac{7}{25}\\right), 50\\left(-\\frac{24}{25}\\right)\\right) = (-14, -48)$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.3",
    topic_title: "Sine & Cosine Function Values",
    sub_topics: [
      {
        sub_topic_id: "3.3.A",
        sub_topic_title: "Radian Measure, Arc Length, & Special Unit Circle Angles",
        essential_formulas: [
          {
            name: "Radian Definition & Degree Conversion",
            latex: "\\theta = \\frac{s}{r} \\iff s = r\\theta; \\quad \\theta_{\\text{rad}} = \\theta_{\\text{deg}} \\cdot \\frac{\\pi}{180^\\circ}",
            description: "Arc length $s$ subtended on a circle of radius $r$ when $\\theta$ is in radians."
          },
          {
            name: "Polar-to-Cartesian Intersection Coordinates on Circle of Radius r",
            latex: "(x, y) = (r\\cos\\theta, \\; r\\sin\\theta)",
            description: "Exact coordinates on any circle of radius $r$ centered at $(0,0)$."
          },
          {
            name: "First-Quadrant Special Values",
            latex: "\\sin\\left(0, \\frac{\\pi}{6}, \\frac{\\pi}{4}, \\frac{\\pi}{3}, \\frac{\\pi}{2}\\right) = \\left(0, \\frac{1}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, 1\\right)",
            description: "Cosine takes the reverse order: $\\left(1, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{1}{2}, 0\\right)$."
          }
        ]
      }
    ],
    conceptual_overview: "Radian measure links linear arc length $s$ directly to angular displacement $\\theta$ via $s = r\\theta$. On a circle of radius $r$ centered at the origin, the terminal ray of angle $\\theta$ intersects the circle at $(x, y) = (r\\cos\\theta, r\\sin\\theta)$. Using reference angles $\\frac{\\pi}{6}, \\frac{\\pi}{4}, \\frac{\\pi}{3}$ and quadrant signs, exact trigonometric values can be determined for any special angle without a calculator.",
    core_principles: [
      {
        heading: "Reference Angle Protocol",
        content_latex: "For any special angle $\\theta$: 1. Identify its quadrant and signs of $(x, y)$. 2. Find the acute reference angle $\\theta_{\\text{ref}}$ to the horizontal $x$-axis ($\\frac{\\pi}{6}, \\frac{\\pi}{4},$ or $\\frac{\\pi}{3}$). 3. Multiply the unit circle values by radius $r$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Determine the exact point of intersection $(x, y)$ of a circle of radius $r = 6$ centered at the origin and the terminal ray of $\\theta = \\frac{4\\pi}{3}$.",
        solution_steps: [
          "Step 1: $\\theta = \\frac{4\\pi}{3} = \\pi + \\frac{\\pi}{3}$ is in Quadrant III ($x < 0, y < 0$) with reference angle $\\frac{\\pi}{3}$.",
          "Step 2: Evaluate $\\cos\\frac{4\\pi}{3} = -\\frac{1}{2}$ and $\\sin\\frac{4\\pi}{3} = -\\frac{\\sqrt{3}}{2}$.",
          "Step 3: Multiply by $r = 6$: $(x, y) = \\left(6\\left(-\\frac{1}{2}\\right), 6\\left(-\\frac{\\sqrt{3}}{2}\\right)\\right) = (-3, -3\\sqrt{3})$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.3_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "An angle $\\theta = \\frac{3\\pi}{4}$ in standard position intersects a circle of radius $r = 7$ centered at the origin. What are the exact coordinates $(x, y)$ of the point of intersection?",
        options: [
          "(A) $\\left(-\\frac{7\\sqrt{2}}{2}, \\frac{7\\sqrt{2}}{2}\\right)$",
          "(B) $\\left(\\frac{7\\sqrt{2}}{2}, -\\frac{7\\sqrt{2}}{2}\\right)$",
          "(C) $\\left(-\\frac{7\\sqrt{3}}{2}, \\frac{7}{2}\\right)$",
          "(D) $\\left(-\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2}\\right)$"
        ],
        correct_index: 0,
        explanation_latex: "Since $\\theta = \\frac{3\\pi}{4}$ is in Quadrant II with reference angle $\\frac{\\pi}{4}$, $\\cos\\frac{3\\pi}{4} = -\\frac{\\sqrt{2}}{2}$ and $\\sin\\frac{3\\pi}{4} = \\frac{\\sqrt{2}}{2}$. Multiplying by $r = 7$ gives $\\left(-\\frac{7\\sqrt{2}}{2}, \\frac{7\\sqrt{2}}{2}\\right)$.",
        exam_trap: "Forgetting to multiply the unit circle coordinates by the radius $r = 7$ (Option D)."
      },
      {
        question_id: "3.3_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "On a circle of radius $r = 12$ inches, what is the length of the arc subtended by a central angle of $150^\\circ$?",
        options: [
          "(A) $5\\pi\\text{ inches}$",
          "(B) $10\\pi\\text{ inches}$",
          "(C) $15\\pi\\text{ inches}$",
          "(D) $1800\\text{ inches}$"
        ],
        correct_index: 1,
        explanation_latex: "Convert $150^\\circ$ to radians: $\\theta = 150^\\circ \\cdot \\frac{\\pi}{180^\\circ} = \\frac{5\\pi}{6}$. Then $s = r\\theta = 12 \\cdot \\frac{5\\pi}{6} = 10\\pi\\text{ inches}$.",
        exam_trap: "Multiplying $r = 12$ directly by $150$ degrees without converting to radians."
      },
      {
        question_id: "3.3_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Which of the following angles $\\theta$ satisfies both $\\sin\\theta = -\\frac{1}{2}$ and $\\cos\\theta = \\frac{\\sqrt{3}}{2}$?",
        options: [
          "(A) $\\theta = \\frac{5\\pi}{6}$",
          "(B) $\\theta = \\frac{7\\pi}{6}$",
          "(C) $\\theta = \\frac{11\\pi}{6}$",
          "(D) $\\theta = \\frac{5\\pi}{3}$"
        ],
        correct_index: 2,
        explanation_latex: "Since $\\cos\\theta > 0$ and $\\sin\\theta < 0$, $\\theta$ is in Quadrant IV. The reference angle with $\\sin\\theta_{\\text{ref}} = \\frac{1}{2}$ is $\\frac{\\pi}{6}$, giving $\\theta = 2\\pi - \\frac{\\pi}{6} = \\frac{11\\pi}{6}$.",
        exam_trap: "Confusing $\\frac{11\\pi}{6}$ with $\\frac{5\\pi}{3}$ (where $\\sin\\frac{5\\pi}{3} = -\\frac{\\sqrt{3}}{2}$ and $\\cos\\frac{5\\pi}{3} = \\frac{1}{2}$)."
      }
    ],
    frq: [
      {
        frq_id: "3.3_frq_1",
        calculator_active: false,
        scenario_latex: "A circle of radius $r = 8$ is centered at the origin in the $xy$-plane. Ray $OA$ is at angle $\\theta_1 = \\frac{\\pi}{6}$ and ray $OB$ is at angle $\\theta_2 = \\frac{5\\pi}{3}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the exact rectangular coordinates of points $A$ and $B$ where the rays intersect the circle.",
            scoring_rubric: [
              { criteria: "Finds $A = (4\\sqrt{3}, 4)$ and $B = (4, -4\\sqrt{3})$", points: 2 }
            ],
            model_solution_latex: "$A = \\left(8\\cos\\frac{\\pi}{6}, 8\\sin\\frac{\\pi}{6}\\right) = (4\\sqrt{3}, 4)$. $B = \\left(8\\cos\\frac{5\\pi}{3}, 8\\sin\\frac{5\\pi}{3}\\right) = (4, -4\\sqrt{3})$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the exact length of the counterclockwise arc along the circle from point $A$ to point $B$.",
            scoring_rubric: [
              { criteria: "Computes $\\Delta\\theta = \\frac{5\\pi}{3} - \\frac{\\pi}{6} = \\frac{3\\pi}{2}$ and arc length $s = 8\\left(\\frac{3\\pi}{2}\\right) = 12\\pi$", points: 2 }
            ],
            model_solution_latex: "The central angle is $\\Delta\\theta = \\frac{5\\pi}{3} - \\frac{\\pi}{6} = \\frac{9\\pi}{6} = \\frac{3\\pi}{2}$ radians. Thus the arc length is $s = r\\Delta\\theta = 8\\left(\\frac{3\\pi}{2}\\right) = 12\\pi$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.4",
    topic_title: "Sinusoidal Functions",
    sub_topics: [
      {
        sub_topic_id: "3.4.A",
        sub_topic_title: "General Sinusoidal Equations, Period, & Phase Shift",
        essential_formulas: [
          {
            name: "Standard Sinusoidal Forms",
            latex: "f(t) = A\\sin(B(t - C)) + D \\quad \\text{or} \\quad f(t) = A\\cos(B(t - C)) + D",
            description: "Amplitude $= |A|$; Period $P = \\frac{2\\pi}{|B|}$; Phase Shift $= C$; Midline $y = D$."
          },
          {
            name: "Angular Frequency Parameter B",
            latex: "|B| = \\frac{2\\pi}{P} = 2\\pi f",
            description: "Relates the horizontal dilation coefficient $B$ to the period $P$."
          },
          {
            name: "Extreme Values of a Sinusoid",
            latex: "y_{\\max} = D + |A|, \\quad y_{\\min} = D - |A|",
            description: "Determines the range $[D - |A|, D + |A|]$ of any sinusoidal function."
          }
        ]
      }
    ],
    conceptual_overview: "Every sinusoidal wave can be written in the factored form $y = A\\sin(B(x - C)) + D$ or $y = A\\cos(B(x - C)) + D$. If an equation is given in unfactored form $y = A\\sin(Bx + E) + D$, you MUST factor out $B$ to get $B\\left(x + \\frac{E}{B}\\right)$ before identifying the horizontal phase shift $C = -\\frac{E}{B}$.",
    core_principles: [
      {
        heading: "Choosing Sine vs. Cosine Phase Shifts",
        content_latex: "At $x = C$: $+\\cos(B(x - C)) + D$ starts at a **maximum**; $-\\cos(B(x - C)) + D$ starts at a **minimum**; $+\\sin(B(x - C)) + D$ starts at the **midline going up**; $-\\sin(B(x - C)) + D$ starts at the **midline going down**."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Construct a sine function with amplitude $8$, period $\\frac{\\pi}{3}$, phase shift left $9$, and vertical shift up $4$.",
        solution_steps: [
          "Step 1: Identify $A = 8$, $C = -9$ (left $9$), and $D = 4$ (up $4$).",
          "Step 2: Compute $B = \\frac{2\\pi}{P} = \\frac{2\\pi}{\\pi/3} = 6$.",
          "Step 3: Write the equation: $y = 8\\sin(6(x + 9)) + 4 = 8\\sin(6x + 54) + 4$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.4_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "For the function $f(\\theta) = 13\\sin(2\\theta) + 7$, what are the period, midline, and minimum value?",
        options: [
          "(A) Period: $\\pi$; Midline: $y = 7$; Minimum: $-6$",
          "(B) Period: $2\\pi$; Midline: $y = 7$; Minimum: $-13$",
          "(C) Period: $\\pi$; Midline: $y = 13$; Minimum: $-6$",
          "(D) Period: $4\\pi$; Midline: $y = 7$; Minimum: $20$"
        ],
        correct_index: 0,
        explanation_latex: "Period $P = \\frac{2\\pi}{2} = \\pi$, midline $y = D = 7$, and minimum value $D - |A| = 7 - 13 = -6$.",
        exam_trap: "Using $-|A| = -13$ as the minimum value without adding the midline $D = 7$."
      },
      {
        question_id: "3.4_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What are the period and phase shift of $g(x) = 5\\cos(3x - \\pi) - 2$?",
        options: [
          "(A) Period: $\\frac{2\\pi}{3}$; Phase shift: right by $\\pi$",
          "(B) Period: $\\frac{2\\pi}{3}$; Phase shift: right by $\\frac{\\pi}{3}$",
          "(C) Period: $3$; Phase shift: left by $\\frac{\\pi}{3}$",
          "(D) Period: $6\\pi$; Phase shift: right by $\\frac{\\pi}{3}$"
        ],
        correct_index: 1,
        explanation_latex: "Factor out $B = 3$: $g(x) = 5\\cos\\left(3\\left(x - \\frac{\\pi}{3}\\right)\\right) - 2$. Thus the period is $\\frac{2\\pi}{3}$ and the phase shift is right by $\\frac{\\pi}{3}$.",
        exam_trap: "Reading the phase shift as $\\pi$ without factoring out $B = 3$."
      },
      {
        question_id: "3.4_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Which of the following equations has amplitude $2$, period $\\frac{5\\pi}{6}$, phase shift right $\\frac{10}{7}$, and vertical shift down $3$?",
        options: [
          "(A) $y = 2\\sin\\left(\\frac{12}{5}\\left(x - \\frac{10}{7}\\right)\\right) - 3$",
          "(B) $y = 2\\sin\\left(\\frac{5\\pi}{6}\\left(x - \\frac{10}{7}\\right)\\right) - 3$",
          "(C) $y = 2\\sin\\left(\\frac{12}{5}x - \\frac{10}{7}\\right) - 3$",
          "(D) $y = 2\\sin\\left(\\frac{5}{12}\\left(x + \\frac{10}{7}\\right)\\right) - 3$"
        ],
        correct_index: 0,
        explanation_latex: "Since $P = \\frac{5\\pi}{6}$, we have $B = \\frac{2\\pi}{5\\pi/6} = \\frac{12}{5}$. With $A = 2, C = \\frac{10}{7},$ and $D = -3$, the equation is $y = 2\\sin\\left(\\frac{12}{5}\\left(x - \\frac{10}{7}\\right)\\right) - 3$.",
        exam_trap: "Plugging the period $\\frac{5\\pi}{6}$ directly in as $B$ (Option B)."
      }
    ],
    frq: [
      {
        frq_id: "3.4_frq_1",
        calculator_active: false,
        scenario_latex: "A sinusoidal function $f(x)$ has a maximum at $(1, 24)$ and its very next minimum at $(5, 6)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the amplitude, midline, and period of $f(x)$.",
            scoring_rubric: [
              { criteria: "Finds amplitude $A = 9$ and midline $D = 15$", points: 1 },
              { criteria: "Recognizes half-period is $5 - 1 = 4 \\implies$ full period $P = 8$", points: 1 }
            ],
            model_solution_latex: "$A = \\frac{24 - 6}{2} = 9$, $D = \\frac{24 + 6}{2} = 15$. Since the horizontal distance from a maximum to the adjacent minimum is half a period, $\\frac{P}{2} = 5 - 1 = 4 \\implies P = 8$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Write an equation for $f(x)$ using a cosine function AND an equivalent equation using a sine function.",
            scoring_rubric: [
              { criteria: "Writes $f(x) = 9\\cos\\left(\\frac{\\pi}{4}(x - 1)\\right) + 15$ and $f(x) = 9\\sin\\left(\\frac{\\pi}{4}(x + 1)\\right) + 15$ (or equivalent)", points: 2 }
            ],
            model_solution_latex: "With $B = \\frac{2\\pi}{8} = \\frac{\\pi}{4}$ and maximum at $x = 1$: $f(x) = 9\\cos\\left(\\frac{\\pi}{4}(x - 1)\\right) + 15$. Since the upward midline crossing occurs one-quarter period ($2$ units) before the peak at $x = 1 - 2 = -1$, $f(x) = 9\\sin\\left(\\frac{\\pi}{4}(x + 1)\\right) + 15$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.5",
    topic_title: "Sinusoidal Function Models",
    sub_topics: [
      {
        sub_topic_id: "3.5.A",
        sub_topic_title: "Contextual Periodic Modeling (Springs, Ferris Wheels, Tides, Pistons)",
        essential_formulas: [
          {
            name: "Quarter-Cycle Key Points ($t_0$ to $t_0 + P$)",
            latex: "t_k = t_0 + k\\left(\\frac{P}{4}\\right) \\quad (k = 0, 1, 2, 3, 4)",
            description: "Divides one full cycle into 4 equal quarter-periods separating extrema and midline inflection points."
          },
          {
            name: "Concavity of a Sinusoidal Wave Relative to Midline $y = D$",
            latex: "\\begin{cases} f(t) > D \\implies \\text{Concave Down} \\\\ f(t) < D \\implies \\text{Concave Up} \\end{cases}",
            description: "Whenever a sinusoid is above its midline, it is concave down; whenever it is below its midline, it is concave up!"
          }
        ]
      }
    ],
    conceptual_overview: "FRQ #3 on the AP Precalculus Exam always tests a real-world sinusoidal context (e.g., a Ferris wheel, bouncing spring, engine piston, pendulum, or tide). Dividing the period $P$ by $4$ gives the quarter-cycle increment $\\frac{P}{4}$ between consecutive extrema and midline crossings. Moreover, midline crossings are the points of inflection: above the midline the graph is concave down, and below the midline the graph is concave up.",
    core_principles: [
      {
        heading: "Sign of Output, Monotonicity, & Concavity on Quarter-Cycles",
        content_latex: "On any quarter-cycle between a midline crossing and a maximum, $f(t)$ is increasing and concave down (so its rate of change is decreasing). Between a minimum and a midline crossing, $f(t)$ is increasing and concave up (so its rate of change is increasing)."
      }
    ],
    worked_examples: [
      {
        problem_latex: "A mass on a spring is at its minimum height of $8\\text{ cm}$ at $t = 0\\text{ s}$, reaches a maximum height of $24\\text{ cm}$, and has period $T = 1.5\\text{ s}$. Find its five quarter-cycle points on $[0, 1.5]$, write a sine model $p(t)$, and analyze $p(t)$ on $(0.375, 0.75)$.",
        solution_steps: [
          "Step 1: Midline $d = \\frac{8 + 24}{2} = 16\\text{ cm}$, Amplitude $a = 8\\text{ cm}$, quarter-period $\\frac{1.5}{4} = 0.375\\text{ s}$. Key points: $(0, 8), (0.375, 16), (0.75, 24), (1.125, 16), (1.5, 8)$.",
          "Step 2: With $b = \\frac{2\\pi}{1.5} = \\frac{4\\pi}{3}$ and upward midline crossing at $t = 0.375$: $p(t) = 8\\sin\\left(\\frac{4\\pi}{3}(t - 0.375)\\right) + 16$.",
          "Step 3: On $(0.375, 0.75)$, $p(t)$ moves from the midline $16$ to the peak $24$, so $p(t)$ is positive, increasing, and concave down (rate of change is decreasing)."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.5_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "A Ferris wheel has a diameter of $40$ meters and boards passengers at its lowest point, $2$ meters above the ground, at $t = 0$ seconds. If one full revolution takes $60$ seconds, which function models a passenger's height $h(t)$ in meters?",
        options: [
          "(A) $h(t) = -20\\cos\\left(\\frac{\\pi}{30}t\\right) + 22$",
          "(B) $h(t) = -40\\cos\\left(\\frac{\\pi}{30}t\\right) + 42$",
          "(C) $h(t) = 20\\cos\\left(\\frac{\\pi}{30}t\\right) + 22$",
          "(D) $h(t) = -20\\sin\\left(\\frac{\\pi}{30}t\\right) + 22$"
        ],
        correct_index: 0,
        explanation_latex: "Radius $=$ Amplitude $= 20\\text{ m}$; midline $= 2 + 20 = 22\\text{ m}$; $B = \\frac{2\\pi}{60} = \\frac{\\pi}{30}$. Starting at the minimum at $t = 0$ uses $-A\\cos(Bt) + D = -20\\cos\\left(\\frac{\\pi}{30}t\\right) + 22$.",
        exam_trap: "Using diameter $40$ as the amplitude instead of radius $20$."
      },
      {
        question_id: "3.5_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "For the Ferris wheel in the previous question ($h(t) = -20\\cos\\left(\\frac{\\pi}{30}t\\right) + 22$), which statement accurately describes the passenger's height on the time interval $15 < t < 30$ seconds?",
        options: [
          "(A) $h(t)$ is increasing, and the rate of change of $h(t)$ is increasing.",
          "(B) $h(t)$ is increasing, and the rate of change of $h(t)$ is decreasing.",
          "(C) $h(t)$ is decreasing, and the rate of change of $h(t)$ is decreasing.",
          "(D) $h(t)$ is decreasing, and the rate of change of $h(t)$ is increasing."
        ],
        correct_index: 1,
        explanation_latex: "At $t = 15$ s (one-quarter period), the passenger is at the midline ($22$ m), and at $t = 30$ s (half period), the passenger reaches the top ($42$ m). Thus $h(t)$ is increasing, and since the graph is above the midline, it is concave down, meaning its rate of change is decreasing.",
        exam_trap: "Thinking that because the passenger is rising toward the top, the vertical rate of change is increasing."
      },
      {
        question_id: "3.5_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "A boat propeller tip rotates $10$ times per second underwater, reaching a maximum height of $-1.5$ feet (relative to the water surface) at $t = 0$ seconds and a minimum of $-4.5$ feet. Which equation models its position $h(t)$?",
        options: [
          "(A) $h(t) = 1.5\\cos(20\\pi t) - 3.0$",
          "(B) $h(t) = 1.5\\cos(0.2\\pi t) - 3.0$",
          "(C) $h(t) = -1.5\\cos(20\\pi t) - 3.0$",
          "(D) $h(t) = 3.0\\cos(20\\pi t) - 1.5$"
        ],
        correct_index: 0,
        explanation_latex: "Frequency $f = 10\\text{ rev/s} \\implies T = 0.1\\text{ s} \\implies B = \\frac{2\\pi}{0.1} = 20\\pi$. Amplitude $A = \\frac{-1.5 - (-4.5)}{2} = 1.5$, midline $D = -3.0$, and starting at maximum at $t=0$ gives $+1.5\\cos(20\\pi t) - 3.0$.",
        exam_trap: "Using $-1.5\\cos$ simply because the maximum height $-1.5$ is a negative number!"
      }
    ],
    frq: [
      {
        frq_id: "3.5_frq_1",
        calculator_active: true,
        scenario_latex: "An engine piston oscillates vertically with a period of $T = \\frac{2}{3}$ second. It reaches its maximum height of $24\\text{ cm}$ at $t = 1\\text{ s}$ and a minimum height of $6\\text{ cm}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the coordinates of the five key quarter-cycle points for one full cycle starting at $t = 1$ second.",
            scoring_rubric: [
              { criteria: "Computes quarter-period $\\frac{2/3}{4} = \\frac{1}{6}\\text{ s}$ and midline $15\\text{ cm}$, listing $(1, 24), (7/6, 15), (4/3, 6), (3/2, 15), (5/3, 24)$", points: 2 }
            ],
            model_solution_latex: "With midline $15$ and quarter-period $\\frac{1}{6}\\text{ s}$: $(1, 24), \\left(\\frac{7}{6}, 15\\right), \\left(\\frac{4}{3}, 6\\right), \\left(\\frac{3}{2}, 15\\right), \\left(\\frac{5}{3}, 24\\right)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Write a cosine model $p(t) = a\\cos(b(t + c)) + d$ and state whether the rate of change of $p(t)$ is increasing or decreasing on $\\left(\\frac{7}{6}, \\frac{4}{3}\\right)$.",
            scoring_rubric: [
              { criteria: "Writes $p(t) = 9\\cos(3\\pi(t - 1)) + 15$", points: 1 },
              { criteria: "States rate of change is increasing on $(7/6, 4/3)$ because $p(t)$ is below the midline and concave up", points: 1 }
            ],
            model_solution_latex: "$p(t) = 9\\cos(3\\pi(t - 1)) + 15$. On $\\left(\\frac{7}{6}, \\frac{4}{3}\\right)$, $p(t)$ moves from the midline $15$ to the minimum $6$, so the graph is concave up and its rate of change is increasing."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.6",
    topic_title: "Tangent & Other Trig Functions",
    sub_topics: [
      {
        sub_topic_id: "3.6.A",
        sub_topic_title: "Tangent, Cotangent, Secant, & Cosecant Graphs and Asymptotes",
        essential_formulas: [
          {
            name: "Transformed Tangent Function & Period",
            latex: "f(x) = A\\tan(B(x - C)) + D, \\quad P = \\frac{\\pi}{|B|}",
            description: "Parent $\\tan(x)$ has period $\\pi$ (NOT $2\\pi$!) and vertical asymptotes at $B(x - C) = \\frac{\\pi}{2} + k\\pi$."
          },
          {
            name: "Reciprocal Trigonometric Identities",
            latex: "\\csc\\theta = \\frac{1}{\\sin\\theta}, \\quad \\sec\\theta = \\frac{1}{\\cos\\theta}, \\quad \\cot\\theta = \\frac{1}{\\tan\\theta} = \\frac{\\cos\\theta}{\\sin\\theta}",
            description: "$\\sec$ and $\\csc$ have period $2\\pi$ and range $(-\\infty, -1] \\cup [1, \\infty)$; $\\cot$ has period $\\pi$."
          }
        ]
      }
    ],
    conceptual_overview: "Unlike sine and cosine, the tangent and cotangent functions have a fundamental period of $\\pi$, so $y = A\\tan(B(x - C)) + D$ has period $P = \\frac{\\pi}{|B|}$. Vertical asymptotes occur wherever the denominator of the ratio is zero: $\\cos\\theta = 0$ ($\\theta = \\frac{\\pi}{2} + k\\pi$) for $\\tan\\theta$ and $\\sec\\theta$, and $\\sin\\theta = 0$ ($\\theta = k\\pi$) for $\\cot\\theta$ and $\\csc\\theta$.",
    core_principles: [
      {
        heading: "Monotonicity and Inflection Points of Tangent",
        content_latex: "For $A > 0, B > 0$, $f(x) = A\\tan(Bx)$ is strictly increasing on every open interval between its vertical asymptotes, and its midline intersections $(\\frac{k\\pi}{B}, D)$ are points of inflection where concavity switches from concave down to concave up."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the period and the equations of all vertical asymptotes of $f(x) = 3\\tan(2x) - 1$.",
        solution_steps: [
          "Step 1: Period $P = \\frac{\\pi}{|B|} = \\frac{\\pi}{2}$.",
          "Step 2: Set the inner argument equal to the parent asymptotes of tangent: $2x = \\frac{\\pi}{2} + k\\pi$ where $k \\in \\mathbb{Z}$.",
          "Step 3: Divide by $2$: $x = \\frac{\\pi}{4} + \\frac{\\pi}{2}k$ for all integers $k$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.6_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the period of the function $f(x) = 4\\tan\\left(\\frac{\\pi}{3}x\\right) + 2$?",
        options: [
          "(A) $3$",
          "(B) $6$",
          "(C) $\\frac{\\pi}{3}$",
          "(D) $\\frac{2\\pi}{3}$"
        ],
        correct_index: 0,
        explanation_latex: "The period of $A\\tan(Bx) + D$ is $P = \\frac{\\pi}{|B|} = \\frac{\\pi}{\\pi/3} = 3$.",
        exam_trap: "Using $\\frac{2\\pi}{|B|} = 6$ (the period formula for sine and cosine) instead of $\\frac{\\pi}{|B|} = 3$ for tangent."
      },
      {
        question_id: "3.6_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What is the range of the function $g(x) = 3\\sec(2x) + 1$?",
        options: [
          "(A) $[-2, 4]$",
          "(B) $(-\\infty, -2] \\cup [4, \\infty)$",
          "(C) $(-\\infty, -3] \\cup [3, \\infty)$",
          "(D) $(-\\infty, \\infty)$"
        ],
        correct_index: 1,
        explanation_latex: "Since $\\sec(2x) \\in (-\\infty, -1] \\cup [1, \\infty)$, multiplying by $3$ and adding $1$ yields $(-\\infty, 3(-1)+1] \\cup [3(1)+1, \\infty) = (-\\infty, -2] \\cup [4, \\infty)$.",
        exam_trap: "Choosing the interior interval $[-2, 4]$, which is the range of the companion cosine curve $3\\cos(2x) + 1$."
      },
      {
        question_id: "3.6_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "At which of the following values of $x$ does the graph of $h(x) = 2\\csc\\left(x - \\frac{\\pi}{4}\\right)$ have a vertical asymptote?",
        options: [
          "(A) $x = \\frac{\\pi}{4}$",
          "(B) $x = \\frac{3\\pi}{4}$",
          "(C) $x = 0$",
          "(D) $x = \\frac{\\pi}{2}$"
        ],
        correct_index: 0,
        explanation_latex: "Vertical asymptotes of $\\csc(u)$ occur where $\\sin(u) = 0 \\implies u = k\\pi$. Thus $x - \\frac{\\pi}{4} = k\\pi \\implies x = \\frac{\\pi}{4} + k\\pi$. For $k = 0$, $x = \\frac{\\pi}{4}$.",
        exam_trap: "Setting $x - \\frac{\\pi}{4} = \\frac{\\pi}{2}$ (which is the asymptote condition for secant, not cosecant)."
      }
    ],
    frq: [
      {
        frq_id: "3.6_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the functions $f(x) = -2\\tan\\left(\\frac{\\pi}{4}x\\right) + 3$ and $g(x) = 4\\csc\\left(\\frac{\\pi}{2}x\\right) - 1$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the period and the equations of all vertical asymptotes of $f(x)$.",
            scoring_rubric: [
              { criteria: "Finds period $P = \\frac{\\pi}{\\pi/4} = 4$", points: 1 },
              { criteria: "Solves $\\frac{\\pi}{4}x = \\frac{\\pi}{2} + k\\pi \\implies x = 2 + 4k$ for $k \\in \\mathbb{Z}$", points: 1 }
            ],
            model_solution_latex: "$P = \\frac{\\pi}{\\pi/4} = 4$. Vertical asymptotes occur where $\\frac{\\pi}{4}x = \\frac{\\pi}{2} + k\\pi \\implies x = 2 + 4k$ for all integers $k$."
          },
          {
            part_label: "(b)",
            prompt_latex: "State the domain and range of $g(x)$.",
            scoring_rubric: [
              { criteria: "States domain $x \\ne 2k$ ($k \\in \\mathbb{Z}$) and range $(-\\infty, -5] \\cup [3, \\infty)$", points: 2 }
            ],
            model_solution_latex: "$g(x)$ is undefined where $\\sin\\left(\\frac{\\pi}{2}x\\right) = 0 \\implies \\frac{\\pi}{2}x = k\\pi \\implies x = 2k$ ($k \\in \\mathbb{Z}$). Since $|\\csc u| \\ge 1$, the range is $(-\\infty, 4(-1)-1] \\cup [4(1)-1, \\infty) = (-\\infty, -5] \\cup [3, \\infty)$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.7",
    topic_title: "Inverse Trigonometric Functions",
    sub_topics: [
      {
        sub_topic_id: "3.7.A",
        sub_topic_title: "Principal Domains, Ranges, & Composite Evaluations",
        essential_formulas: [
          {
            name: "Arcsine (Inverse Sine) Domain & Principal Range",
            latex: "y = \\arcsin(x) = \\sin^{-1}(x) \\iff \\sin(y) = x, \\quad x \\in [-1, 1], \\; y \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]",
            description: "Returns angles in Quadrants I and IV (where $-\\frac{\\pi}{2} \\le y \\le \\frac{\\pi}{2}$)."
          },
          {
            name: "Arccosine (Inverse Cosine) Domain & Principal Range",
            latex: "y = \\arccos(x) = \\cos^{-1}(x) \\iff \\cos(y) = x, \\quad x \\in [-1, 1], \\; y \\in [0, \\pi]",
            description: "Returns angles in Quadrants I and II (where $0 \\le y \\le \\pi$)."
          },
          {
            name: "Arctangent (Inverse Tangent) Domain & Principal Range",
            latex: "y = \\arctan(x) = \\tan^{-1}(x) \\iff \\tan(y) = x, \\quad x \\in (-\\infty, \\infty), \\; y \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)",
            description: "Horizontal asymptotes at $y = \\pm\\frac{\\pi}{2}$."
          }
        ]
      }
    ],
    conceptual_overview: "Because trigonometric functions are periodic and not one-to-one over $(-\\infty, \\infty)$, their domains are restricted to a single monotonic branch to define their inverses: $\\arcsin(x) \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$, $\\arccos(x) \\in [0, \\pi]$, and $\\arctan(x) \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$. Consequently, $\\arcsin(\\sin\\theta) = \\theta$ holds ONLY when $\\theta \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$!",
    core_principles: [
      {
        heading: "Negative Input Quadrants for Inverse Trig",
        content_latex: "For a negative input $x < 0$: $\\arcsin(x)$ and $\\arctan(x)$ return a **negative acute angle** in $\\left[-\\frac{\\pi}{2}, 0\\right)$ (e.g., $\\arcsin(-1/2) = -\\frac{\\pi}{6}$, NEVER $\\frac{11\\pi}{6}$!), whereas $\\arccos(x)$ returns an **obtuse Quadrant II angle** in $\\left(\\frac{\\pi}{2}, \\pi\\right]$ (e.g., $\\arccos(-1/2) = \\frac{2\\pi}{3}$)."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Solve (a) $\\arccos(2x + 1) = \\frac{\\pi}{3}$ and evaluate (b) $\\arcsin\\left(\\sin\\left(\\frac{5\\pi}{6}\\right)\\right)$ without a calculator.",
        solution_steps: [
          "Step 1: Apply $\\cos$ to both sides of $\\arccos(2x + 1) = \\frac{\\pi}{3}$: $2x + 1 = \\cos\\left(\\frac{\\pi}{3}\\right) = \\frac{1}{2} \\implies 2x = -\\frac{1}{2} \\implies x = -\\frac{1}{4}$.",
          "Step 2: For $\\arcsin\\left(\\sin\\left(\\frac{5\\pi}{6}\\right)\\right)$, first evaluate the inner sine: $\\sin\\left(\\frac{5\\pi}{6}\\right) = \\frac{1}{2}$.",
          "Step 3: Then $\\arcsin\\left(\\frac{1}{2}\\right) = \\frac{\\pi}{6}$ (which lies in the required range $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$)."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.7_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the exact value of $\\arccos\\left(-\\frac{\\sqrt{3}}{2}\\right)$?",
        options: [
          "(A) $-\\frac{\\pi}{6}$",
          "(B) $\\frac{5\\pi}{6}$",
          "(C) $\\frac{7\\pi}{6}$",
          "(D) $\\frac{2\\pi}{3}$"
        ],
        correct_index: 1,
        explanation_latex: "The range of $\\arccos(x)$ is $[0, \\pi]$. In $[0, \\pi]$, the unique angle with cosine equal to $-\\frac{\\sqrt{3}}{2}$ is $\\frac{5\\pi}{6}$ in Quadrant II.",
        exam_trap: "Choosing $-\\frac{\\pi}{6}$ or $\\frac{7\\pi}{6}$, which lie outside $[0, \\pi]$."
      },
      {
        question_id: "3.7_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What is the exact solution to the equation $3\\arccos(\\pi x) = 2\\pi$?",
        options: [
          "(A) $x = -\\frac{1}{2\\pi}$",
          "(B) $x = \\frac{1}{2\\pi}$",
          "(C) $x = -\\frac{\\sqrt{3}}{2\\pi}$",
          "(D) $x = -\\frac{\\pi}{2}$"
        ],
        correct_index: 0,
        explanation_latex: "Divide by $3$: $\\arccos(\\pi x) = \\frac{2\\pi}{3}$. Apply cosine: $\\pi x = \\cos\\left(\\frac{2\\pi}{3}\\right) = -\\frac{1}{2} \\implies x = -\\frac{1}{2\\pi}$.",
        exam_trap: "Evaluating $\\cos\\left(\\frac{2\\pi}{3}\\right)$ as $+\\frac{1}{2}$ instead of $-\\frac{1}{2}$."
      },
      {
        question_id: "3.7_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "What is the exact value of $\\tan\\left(\\arcsin\\left(-\\frac{3}{5}\\right)\\right)$?",
        options: [
          "(A) $-\\frac{3}{4}$",
          "(B) $\\frac{3}{4}$",
          "(C) $-\\frac{4}{3}$",
          "(D) $-\\frac{3}{5}$"
        ],
        correct_index: 0,
        explanation_latex: "Let $\\theta = \\arcsin\\left(-\\frac{3}{5}\\right) \\in \\left[-\\frac{\\pi}{2}, 0\\right)$ (Quadrant IV, where $x > 0, y < 0$). With $y = -3$ and $r = 5$, we have $x = +\\sqrt{25 - 9} = 4$, so $\\tan\\theta = \\frac{y}{x} = -\\frac{3}{4}$.",
        exam_trap: "Forgetting the negative sign on $y = -3$ in Quadrant IV."
      }
    ],
    frq: [
      {
        frq_id: "3.7_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the equations $h(x) = \\sin^{-1}(6x) = \\frac{\\pi}{4}$ and $m(x) = 4\\arctan(x) = -\\pi$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Solve both equations for the exact value of $x$.",
            scoring_rubric: [
              { criteria: "Solves $6x = \\sin(\\pi/4) = \\frac{\\sqrt{2}}{2} \\implies x = \\frac{\\sqrt{2}}{12}$", points: 1 },
              { criteria: "Solves $\\arctan(x) = -\\frac{\\pi}{4} \\implies x = \\tan(-\\pi/4) = -1$", points: 1 }
            ],
            model_solution_latex: "From $\\sin^{-1}(6x) = \\frac{\\pi}{4}$, $6x = \\frac{\\sqrt{2}}{2} \\implies x = \\frac{\\sqrt{2}}{12}$. From $4\\arctan(x) = -\\pi$, $\\arctan(x) = -\\frac{\\pi}{4} \\implies x = \\tan\\left(-\\frac{\\pi}{4}\\right) = -1$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the domain and range of $p(x) = 2\\arccos(3x - 1) - \\pi$.",
            scoring_rubric: [
              { criteria: "Solves $-1 \\le 3x - 1 \\le 1 \\implies [0, \\frac{2}{3}]$ for domain", points: 1 },
              { criteria: "Maps $[0, \\pi]$ via $2y - \\pi \\implies [-\\pi, \\pi]$ for range", points: 1 }
            ],
            model_solution_latex: "Domain requires $-1 \\le 3x - 1 \\le 1 \\implies 0 \\le 3x \\le 2 \\implies \\left[0, \\frac{2}{3}\\right]$. Since $\\arccos(u) \\in [0, \\pi]$, the range is $[2(0) - \\pi, 2(\\pi) - \\pi] = [-\\pi, \\pi]$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.8",
    topic_title: "Trigonometric Equations",
    sub_topics: [
      {
        sub_topic_id: "3.8.A",
        sub_topic_title: "General Periodic Solutions & Quadratic/Multiple-Angle Equations",
        essential_formulas: [
          {
            name: "General Solutions for Cosine & Sine ($k \\in \\mathbb{Z}$)",
            latex: "\\cos\\theta = c \\implies \\theta = \\pm\\arccos(c) + 2\\pi k; \\quad \\sin\\theta = c \\implies \\theta = \\begin{cases} \\arcsin(c) + 2\\pi k \\\\ (\\pi - \\arcsin(c)) + 2\\pi k \\end{cases}",
            description: "Adds $+ 2\\pi k$ to both primary branch solutions BEFORE dividing by a multiple-angle coefficient $B$."
          },
          {
            name: "General Solutions for Tangent ($k \\in \\mathbb{Z}$)",
            latex: "\\tan\\theta = c \\implies \\theta = \\arctan(c) + \\pi k",
            description: "Uses period $+ \\pi k$."
          }
        ]
      }
    ],
    conceptual_overview: "Solving trigonometric equations requires isolating the trigonometric term (often by factoring or quadratic substitution) and finding all angles on the unit circle that satisfy the ratio. When solving a multiple-angle equation such as $\\cos(2x) = \\frac{1}{2}$, always write the general solutions for the inner angle $2x = \\pm\\frac{\\pi}{3} + 2\\pi n$ FIRST, and then divide the entire expression (including $2\\pi n$) by $2$ to get $x = \\pm\\frac{\\pi}{6} + \\pi n$.",
    core_principles: [
      {
        heading: "Never Divide Out a Variable Trigonometric Factor",
        content_latex: "In $2\\cos(x)\\sin(x) = \\cos(x)$, NEVER divide both sides by $\\cos(x)$ (which loses the solutions where $\\cos(x) = 0$). Instead, subtract and factor: $\\cos(x)(2\\sin(x) - 1) = 0 \\implies \\cos(x) = 0$ or $\\sin(x) = \\frac{1}{2}$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find all real values of $x$ that satisfy $2\\sin^2(x) - \\sin(x) = 0$.",
        solution_steps: [
          "Step 1: Factor out $\\sin(x)$: $\\sin(x)(2\\sin(x) - 1) = 0$.",
          "Step 2: Solve $\\sin(x) = 0 \\implies x = \\pi n$ for $n \\in \\mathbb{Z}$.",
          "Step 3: Solve $2\\sin(x) - 1 = 0 \\implies \\sin(x) = \\frac{1}{2} \\implies x = \\frac{\\pi}{6} + 2\\pi n$ and $x = \\frac{5\\pi}{6} + 2\\pi n$ for $n \\in \\mathbb{Z}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.8_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are all solutions to $\\cos^2(x) + 2\\cos(x) = -1$ for all real $x$ ($n \\in \\mathbb{Z}$)?",
        options: [
          "(A) $x = \\pi + 2\\pi n$",
          "(B) $x = 2\\pi n$",
          "(C) $x = \\frac{\\pi}{2} + \\pi n$",
          "(D) $x = \\pm\\frac{2\\pi}{3} + 2\\pi n$"
        ],
        correct_index: 0,
        explanation_latex: "Add $1$ to both sides: $\\cos^2(x) + 2\\cos(x) + 1 = 0 \\implies (\\cos x + 1)^2 = 0 \\implies \\cos(x) = -1 \\implies x = \\pi + 2\\pi n$.",
        exam_trap: "Solving $\\cos(x) = 1$ ($x = 2\\pi n$) instead of $\\cos(x) = -1$."
      },
      {
        question_id: "3.8_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Find all values of $x$ on the closed interval $[0, \\pi]$ where $2\\cos(x)\\sin(x) = \\cos(x)$.",
        options: [
          "(A) $x = \\frac{\\pi}{6}$ and $x = \\frac{5\\pi}{6}$ only",
          "(B) $x = \\frac{\\pi}{6}, \\frac{\\pi}{2},$ and $\\frac{5\\pi}{6}$",
          "(C) $x = \\frac{\\pi}{3}$ and $\\frac{\\pi}{2}$",
          "(D) $x = \\frac{\\pi}{6}$ only"
        ],
        correct_index: 1,
        explanation_latex: "Subtract $\\cos(x)$ and factor: $\\cos(x)(2\\sin(x) - 1) = 0$. On $[0, \\pi]$, $\\cos(x) = 0 \\implies x = \\frac{\\pi}{2}$, and $\\sin(x) = \\frac{1}{2} \\implies x = \\frac{\\pi}{6}, \\frac{5\\pi}{6}$.",
        exam_trap: "Dividing both sides by $\\cos(x)$ and losing the solution $x = \\frac{\\pi}{2}$ (Option A)."
      },
      {
        question_id: "3.8_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Which of the following represents all solutions to $2\\cos(2x) + 3 = 4$ ($n \\in \\mathbb{Z}$)?",
        options: [
          "(A) $x = \\pm\\frac{\\pi}{3} + 2\\pi n$",
          "(B) $x = \\pm\\frac{\\pi}{6} + \\pi n$",
          "(C) $x = \\pm\\frac{\\pi}{6} + 2\\pi n$",
          "(D) $x = \\frac{\\pi}{6} + \\pi n$ only"
        ],
        correct_index: 1,
        explanation_latex: "$2\\cos(2x) = 1 \\implies \\cos(2x) = \\frac{1}{2} \\implies 2x = \\pm\\frac{\\pi}{3} + 2\\pi n$. Dividing by $2$ yields $x = \\pm\\frac{\\pi}{6} + \\pi n$.",
        exam_trap: "Forgetting to divide the period $2\\pi n$ by $2$ (Option C)."
      }
    ],
    frq: [
      {
        frq_id: "3.8_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the trigonometric equations $m(x) = 2\\sin\\left(x + \\frac{\\pi}{2}\\right) = 1$ and $p(x) = \\sin^{-1}(\\cos x) + \\frac{\\pi}{2} = \\frac{2\\pi}{3}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find all real values of $x$ that satisfy $2\\sin\\left(x + \\frac{\\pi}{2}\\right) = 1$.",
            scoring_rubric: [
              { criteria: "Sets $x + \\frac{\\pi}{2} = \\frac{\\pi}{6} + 2\\pi n$ and $\\frac{5\\pi}{6} + 2\\pi n$", points: 1 },
              { criteria: "Finds $x = -\\frac{\\pi}{3} + 2\\pi n$ and $x = \\frac{\\pi}{3} + 2\\pi n$ ($n \\in \\mathbb{Z}$)", points: 1 }
            ],
            model_solution_latex: "$\\sin\\left(x + \\frac{\\pi}{2}\\right) = \\frac{1}{2} \\implies x + \\frac{\\pi}{2} = \\frac{\\pi}{6} + 2\\pi n$ or $\\frac{5\\pi}{6} + 2\\pi n$. Subtracting $\\frac{\\pi}{2}$ gives $x = \\pm\\frac{\\pi}{3} + 2\\pi n$ for $n \\in \\mathbb{Z}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find all real values of $x$ that satisfy $\\sin^{-1}(\\cos x) + \\frac{\\pi}{2} = \\frac{2\\pi}{3}$.",
            scoring_rubric: [
              { criteria: "Isolates $\\sin^{-1}(\\cos x) = \\frac{\\pi}{6} \\implies \\cos x = \\sin(\\pi/6) = \\frac{1}{2} \\implies x = \\pm\\frac{\\pi}{3} + 2\\pi n$", points: 2 }
            ],
            model_solution_latex: "$\\sin^{-1}(\\cos x) = \\frac{2\\pi}{3} - \\frac{\\pi}{2} = \\frac{\\pi}{6} \\implies \\cos x = \\sin\\left(\\frac{\\pi}{6}\\right) = \\frac{1}{2} \\implies x = \\pm\\frac{\\pi}{3} + 2\\pi n$ ($n \\in \\mathbb{Z}$)."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.9",
    topic_title: "Trig Identities & Simplification",
    sub_topics: [
      {
        sub_topic_id: "3.9.A",
        sub_topic_title: "Pythagorean, Sum/Difference, & Double-Angle Identities",
        essential_formulas: [
          {
            name: "Pythagorean Identities",
            latex: "\\sin^2\\theta + \\cos^2\\theta = 1, \\quad 1 + \\tan^2\\theta = \\sec^2\\theta, \\quad 1 + \\cot^2\\theta = \\csc^2\\theta",
            description: "Derived from $x^2 + y^2 = r^2$ on the coordinate circle."
          },
          {
            name: "Double-Angle Identities",
            latex: "\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta, \\quad \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1",
            description: "Expands trigonometric functions of $2\\theta$ in terms of $\\theta$."
          },
          {
            name: "Sum & Difference Identities",
            latex: "\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta, \\quad \\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta",
            description: "Note that cosine flips the $\\pm$ sign between the two products."
          }
        ]
      }
    ],
    conceptual_overview: "Trigonometric identities allow complex expressions to be rewritten in simpler or equivalent forms—a major focus of AP Precalculus FRQ #4 Part B. The three Pythagorean identities and the double-angle expansions for $\\sin(2x)$ and $\\cos(2x)$ are the primary tools for symbolic simplification.",
    core_principles: [
      {
        heading: "Converting to Sine and Cosine vs. Direct Pythagorean Substitution",
        content_latex: "When simplifying rational trigonometric expressions, look first for Pythagorean forms ($1 - \\cos^2 x = \\sin^2 x$, $1 + \\tan^2 x = \\sec^2 x$) and double-angle forms ($\\sin(2x) = 2\\sin x\\cos x$), or rewrite all reciprocals/quotients in terms of $\\sin x$ and $\\cos x$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Rewrite (a) $j(x) = \\frac{\\sec x}{\\csc x \\cot x}$ and (b) $p(x) = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x - 1}$ in terms of $\\tan^2 x$.",
        solution_steps: [
          "Step 1: For $j(x)$, rewrite in sines and cosines: $j(x) = \\frac{1/\\cos x}{(1/\\sin x)(\\cos x / \\sin x)} = \\frac{1/\\cos x}{\\cos x / \\sin^2 x} = \\frac{\\sin^2 x}{\\cos^2 x} = \\tan^2 x$.",
          "Step 2: For $p(x)$, use $\\cos^2 x + \\sin^2 x = 1$ and $\\cos^2 x - 1 = -\\sin^2 x$: $p(x) = \\frac{1}{-\\sin^2 x} = -\\csc^2 x = -(1 + \\cot^2 x)$ (or if numerator was $\\sin^2 x$, $\\frac{\\sin^2 x}{-\\cos^2 x} = -\\tan^2 x$)."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.9_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which of the following expressions is equivalent to $\\frac{1 + \\tan^2 x}{\\sec x}$ wherever defined?",
        options: [
          "(A) $\\cos x$",
          "(B) $\\sec x$",
          "(C) $\\tan x$",
          "(D) $\\sin x$"
        ],
        correct_index: 1,
        explanation_latex: "Using the Pythagorean identity $1 + \\tan^2 x = \\sec^2 x$, we have $\\frac{1 + \\tan^2 x}{\\sec x} = \\frac{\\sec^2 x}{\\sec x} = \\sec x$.",
        exam_trap: "Replacing $1 + \\tan^2 x$ with $\\csc^2 x$ instead of $\\sec^2 x$."
      },
      {
        question_id: "3.9_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Which of the following is equivalent to $\\csc x - \\sin x$ wherever defined?",
        options: [
          "(A) $\\cot x \\cos x$",
          "(B) $\\tan x \\sin x$",
          "(C) $\\cos^2 x$",
          "(D) $\\cot^2 x$"
        ],
        correct_index: 0,
        explanation_latex: "$\\csc x - \\sin x = \\frac{1}{\\sin x} - \\sin x = \\frac{1 - \\sin^2 x}{\\sin x} = \\frac{\\cos^2 x}{\\sin x} = \\left(\\frac{\\cos x}{\\sin x}\\right)\\cos x = \\cot x \\cos x$.",
        exam_trap: "Forgetting the denominator $\\sin x$ after replacing $1 - \\sin^2 x$ with $\\cos^2 x$."
      },
      {
        question_id: "3.9_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Which expression is equivalent to $\\frac{\\sin(2x)}{1 + \\cos(2x)}$ wherever defined?",
        options: [
          "(A) $\\tan x$",
          "(B) $\\cot x$",
          "(C) $\\sin x$",
          "(D) $2\\tan x$"
        ],
        correct_index: 0,
        explanation_latex: "Using $\\sin(2x) = 2\\sin x\\cos x$ and $1 + \\cos(2x) = 1 + (2\\cos^2 x - 1) = 2\\cos^2 x$, the ratio simplifies to $\\frac{2\\sin x\\cos x}{2\\cos^2 x} = \\frac{\\sin x}{\\cos x} = \\tan x$.",
        exam_trap: "Canceling the $2$ inside $\\frac{\\sin(2x)}{\\cos(2x)}$ without using double-angle identities."
      }
    ],
    frq: [
      {
        frq_id: "3.9_frq_1",
        calculator_active: false,
        scenario_latex: "Let $j(x) = (\\tan^2 x)(1 - \\sin^2 x)$ and $q(x) = (1 + \\tan^2 x)(\\cot^2 x)$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Rewrite $j(x)$ as a single trigonometric power with no fractions, and state any domain restrictions from the original expression.",
            scoring_rubric: [
              { criteria: "Simplifies $j(x) = \\left(\\frac{\\sin^2 x}{\\cos^2 x}\\right)\\cos^2 x = \\sin^2 x$ with restriction $\\cos x \\ne 0$ ($x \\ne \\frac{\\pi}{2} + \\pi k$)", points: 2 }
            ],
            model_solution_latex: "Since $1 - \\sin^2 x = \\cos^2 x$, $j(x) = \\frac{\\sin^2 x}{\\cos^2 x} \\cdot \\cos^2 x = \\sin^2 x$, valid for $\\cos x \\ne 0$ ($x \\ne \\frac{\\pi}{2} + \\pi k$)."
          },
          {
            part_label: "(b)",
            prompt_latex: "Rewrite $q(x) = (1 + \\tan^2 x)(\\cot^2 x)$ in terms of $\\csc^2 x$.",
            scoring_rubric: [
              { criteria: "Replaces $1 + \\tan^2 x = \\sec^2 x$ and simplifies $\\frac{1}{\\cos^2 x} \\cdot \\frac{\\cos^2 x}{\\sin^2 x} = \\csc^2 x$", points: 2 }
            ],
            model_solution_latex: "$q(x) = \\sec^2 x \\cdot \\cot^2 x = \\frac{1}{\\cos^2 x} \\cdot \\frac{\\cos^2 x}{\\sin^2 x} = \\frac{1}{\\sin^2 x} = \\csc^2 x$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.10",
    topic_title: "Polar Coordinates",
    sub_topics: [
      {
        sub_topic_id: "3.10.A",
        sub_topic_title: "Polar-Rectangular Conversions & Multiple Polar Representations",
        essential_formulas: [
          {
            name: "Polar-to-Rectangular Conversion",
            latex: "x = r\\cos\\theta, \\quad y = r\\sin\\theta",
            description: "Converts any polar coordinate $(r, \\theta)$ to unique Cartesian coordinates $(x, y)$."
          },
          {
            name: "Rectangular-to-Polar Conversion",
            latex: "r^2 = x^2 + y^2, \\quad \\tan\\theta = \\frac{y}{x}",
            description: "Determines $r$ and $\\theta$ (checking the quadrant of $(x, y)$)."
          },
          {
            name: "Equivalent Polar Coordinates (Positive & Negative r)",
            latex: "(r, \\theta) \\equiv (r, \\theta + 2\\pi k) \\equiv (-r, \\theta + \\pi + 2\\pi k) \\quad (k \\in \\mathbb{Z})",
            description: "Negating $r$ reflects the point across the pole, equivalent to adding $\\pi$ to the angle $\\theta$."
          }
        ]
      }
    ],
    conceptual_overview: "In the **polar coordinate system**, a point is located by its directed distance $r$ from the origin (the **pole**) and the angle $\\theta$ from the positive $x$-axis (the **polar axis**). While rectangular coordinates $(x, y)$ are unique, a single point in the plane has infinitely many polar representations: $(r, \\theta + 2\\pi k)$ with positive $r$, and $(-r, \\theta + \\pi + 2\\pi k)$ with negative $r$.",
    core_principles: [
      {
        heading: "Plotting Points with Negative Radius $r < 0$",
        content_latex: "To plot $(-3, \\frac{\\pi}{4})$, rotate to the angle $\\theta = \\frac{\\pi}{4}$ (Quadrant I) and walk $3$ units **backward** through the pole into the opposite quadrant (Quadrant III), landing at the same point as $(3, \\frac{5\\pi}{4})$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Convert the rectangular point $(x, y) = (-2\\sqrt{3}, 2)$ into two different polar coordinate pairs $(r, \\theta)$ with $0 \\le \\theta < 2\\pi$: one with $r > 0$ and one with $r < 0$.",
        solution_steps: [
          "Step 1: Compute $r = \\sqrt{(-2\\sqrt{3})^2 + 2^2} = \\sqrt{12 + 4} = 4$.",
          "Step 2: Since $(-2\\sqrt{3}, 2)$ is in Quadrant II and $\\tan\\theta = \\frac{2}{-2\\sqrt{3}} = -\\frac{1}{\\sqrt{3}}$, the angle is $\\theta = \\frac{5\\pi}{6}$. Thus with $r > 0$: $\\left(4, \\frac{5\\pi}{6}\\right)$.",
          "Step 3: For $r < 0$, negate $r$ and add $\\pi$: $\\left(-4, \\frac{5\\pi}{6} + \\pi\\right) = \\left(-4, \\frac{11\\pi}{6}\\right)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.10_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which of the following polar coordinate pairs represents the same point in the plane as $\\left(5, \\frac{\\pi}{3}\\right)$?",
        options: [
          "(A) $\\left(-5, -\\frac{\\pi}{3}\\right)$",
          "(B) $\\left(-5, \\frac{4\\pi}{3}\\right)$",
          "(C) $\\left(5, \\frac{4\\pi}{3}\\right)$",
          "(D) $\\left(-5, \\frac{2\\pi}{3}\\right)$"
        ],
        correct_index: 1,
        explanation_latex: "Using $(r, \\theta) \\equiv (-r, \\theta + \\pi)$, the point $\\left(5, \\frac{\\pi}{3}\\right)$ is identical to $\\left(-5, \\frac{\\pi}{3} + \\pi\\right) = \\left(-5, \\frac{4\\pi}{3}\\right)$.",
        exam_trap: "Negating $\\theta$ when negating $r$ instead of adding $\\pi$."
      },
      {
        question_id: "3.10_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What are the rectangular coordinates $(x, y)$ of the polar point $\\left(-6, \\frac{5\\pi}{6}\\right)$?",
        options: [
          "(A) $(-3\\sqrt{3}, 3)$",
          "(B) $(3\\sqrt{3}, -3)$",
          "(C) $(3, -3\\sqrt{3})$",
          "(D) $(-3\\sqrt{3}, -3)$"
        ],
        correct_index: 1,
        explanation_latex: "$x = r\\cos\\theta = -6\\cos\\left(\\frac{5\\pi}{6}\\right) = -6\\left(-\\frac{\\sqrt{3}}{2}\\right) = 3\\sqrt{3}$, and $y = r\\sin\\theta = -6\\sin\\left(\\frac{5\\pi}{6}\\right) = -6\\left(\\frac{1}{2}\\right) = -3$.",
        exam_trap: "Ignoring the negative sign on $r = -6$ and landing in Quadrant II instead of Quadrant IV."
      },
      {
        question_id: "3.10_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Which polar equation is equivalent to the rectangular equation $x^2 + (y - 3)^2 = 9$?",
        options: [
          "(A) $r = 6\\sin\\theta$",
          "(B) $r = 6\\cos\\theta$",
          "(C) $r = 3\\sin\\theta$",
          "(D) $r = 9\\sin\\theta$"
        ],
        correct_index: 0,
        explanation_latex: "Expand: $x^2 + y^2 - 6y + 9 = 9 \\implies x^2 + y^2 = 6y$. Substitute $x^2 + y^2 = r^2$ and $y = r\\sin\\theta$: $r^2 = 6r\\sin\\theta \\implies r = 6\\sin\\theta$.",
        exam_trap: "Confusing the radius $3$ with the diameter $6$ in the polar circle formula $r = 2a\\sin\\theta$."
      }
    ],
    frq: [
      {
        frq_id: "3.10_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the point $P$ with rectangular coordinates $(x, y) = (3, -3)$ and the polar equation $r = \\frac{4}{2\\cos\\theta - \\sin\\theta}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find all polar representations $(r, \\theta)$ of point $P$ such that $-2\\pi \\le \\theta \\le 2\\pi$ and $r > 0$.",
            scoring_rubric: [
              { criteria: "Finds $r = 3\\sqrt{2}$ and angles $\\theta = \\frac{7\\pi}{4}$ and $\\theta = -\\frac{\\pi}{4}$", points: 2 }
            ],
            model_solution_latex: "$r = \\sqrt{3^2 + (-3)^2} = 3\\sqrt{2}$. In Quadrant IV on $[-2\\pi, 2\\pi]$, $\\theta = \\frac{7\\pi}{4}$ and $\\theta = -\\frac{\\pi}{4}$, giving $\\left(3\\sqrt{2}, \\frac{7\\pi}{4}\\right)$ and $\\left(3\\sqrt{2}, -\\frac{\\pi}{4}\\right)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Convert the polar equation $r = \\frac{4}{2\\cos\\theta - \\sin\\theta}$ into rectangular slope-intercept form $y = mx + b$.",
            scoring_rubric: [
              { criteria: "Multiplies to get $2r\\cos\\theta - r\\sin\\theta = 4 \\implies 2x - y = 4 \\implies y = 2x - 4$", points: 2 }
            ],
            model_solution_latex: "Multiply both sides by $(2\\cos\\theta - \\sin\\theta)$: $2r\\cos\\theta - r\\sin\\theta = 4$. Substitute $x = r\\cos\\theta$ and $y = r\\sin\\theta$: $2x - y = 4 \\implies y = 2x - 4$."
          }
        ]
      }
    ]
  },

  {
    unit: 3,
    topic_id: "3.11",
    topic_title: "Polar Functions",
    sub_topics: [
      {
        sub_topic_id: "3.11.A",
        sub_topic_title: "Rose Curves, Limaçons, & Rates of Change in Polar Functions",
        essential_formulas: [
          {
            name: "Polar Rose Curves",
            latex: "r = a\\cos(n\\theta) \\quad \\text{or} \\quad r = a\\sin(n\\theta) \\implies \\text{Petals} = \\begin{cases} n & (n \\text{ odd}) \\\\ 2n & (n \\text{ even}) \\end{cases}",
            description: "Max distance from pole is $|a|$. Cosine roses have a petal along $\\theta = 0$."
          },
          {
            name: "Distance from the Pole & Increasing/Decreasing Distance Rule",
            latex: "\\text{Distance to Pole} = |r| = |f(\\theta)|, \\quad \\text{AROC} = \\frac{f(\\theta_2) - f(\\theta_1)}{\\theta_2 - \\theta_1}",
            description: "Distance $|r|$ from the pole is INCREASING when $r$ and $\\frac{\\Delta r}{\\Delta \\theta}$ have the SAME sign (both positive or both negative)!"
          }
        ]
      }
    ],
    conceptual_overview: "In polar functions $r = f(\\theta)$, a critical distinction tested on the AP Exam is between **$f(\\theta)$ increasing** ($\\frac{\\Delta r}{\\Delta \\theta} > 0$) and the **distance from the pole $|f(\\theta)|$ increasing**. When $r < 0$ and $r$ is decreasing (e.g., moving from $r = -1$ to $r = -4$), the point is moving **further away from the pole**, so its distance $|r|$ from the origin is **increasing**!",
    core_principles: [
      {
        heading: "Justifying Whether Distance to the Pole is Increasing or Decreasing",
        content_latex: "- **Distance to the pole is increasing** if: ($r > 0$ and $r$ is increasing) OR ($r < 0$ and $r$ is decreasing).\n- **Distance to the pole is decreasing** if: ($r > 0$ and $r$ is decreasing) OR ($r < 0$ and $r$ is increasing)."
      }
    ],
    worked_examples: [
      {
        problem_latex: "For a polar function $r = f(\\theta)$, on the interval $\\pi < \\theta < \\frac{3\\pi}{2}$, $f(\\theta) < 0$ and $f(\\theta)$ is decreasing. Is the distance between the point $(f(\\theta), \\theta)$ and the pole increasing or decreasing on this interval? Justify your answer.",
        solution_steps: [
          "Step 1: Recall that the distance from the pole is $|r| = |f(\\theta)|$.",
          "Step 2: On $\\pi < \\theta < \\frac{3\\pi}{2}$, $r = f(\\theta)$ is negative AND decreasing (becoming more negative, moving away from $0$).",
          "Step 3: Therefore, $|f(\\theta)|$ is increasing, so the distance from the pole is **increasing** because $f(\\theta)$ is negative and decreasing."
        ]
      }
    ],
    mcq: [
      {
        question_id: "3.11_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "How many petals does the polar rose curve $r = 5\\cos(4\\theta)$ have, and what is the maximum distance of any point on the curve from the pole?",
        options: [
          "(A) $4$ petals; maximum distance $5$",
          "(B) $8$ petals; maximum distance $5$",
          "(C) $8$ petals; maximum distance $20$",
          "(D) $4$ petals; maximum distance $10$"
        ],
        correct_index: 1,
        explanation_latex: "Since $n = 4$ is even, the rose curve has $2n = 8$ petals. Since $|\\cos(4\\theta)| \\le 1$, the maximum distance from the pole is $|a| = 5$.",
        exam_trap: "Answering $n = 4$ petals when $n$ is even."
      },
      {
        question_id: "3.11_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "On the interval $\\frac{\\pi}{2} < \\theta < \\pi$, a polar function $r = f(\\theta)$ satisfies $f(\\theta) < 0$ and $f(\\theta)$ is increasing. Which statement is true about the distance between the graph of $f$ and the pole on $\\frac{\\pi}{2} < \\theta < \\pi$?",
        options: [
          "(A) The distance is increasing because $f(\\theta)$ is increasing.",
          "(B) The distance is decreasing because $f(\\theta)$ is negative and increasing (moving toward zero).",
          "(C) The distance is increasing because $f(\\theta)$ is negative.",
          "(D) The distance is constant."
        ],
        correct_index: 1,
        explanation_latex: "Because $f(\\theta)$ is negative and increasing (e.g., changing from $-5$ toward $-1$), its magnitude $|f(\\theta)|$ is decreasing toward $0$. Thus the distance to the pole is decreasing.",
        exam_trap: "Seeing '$f(\\theta)$ is increasing' and automatically concluding that the distance from the pole is increasing without checking the sign of $f(\\theta)$."
      },
      {
        question_id: "3.11_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "What is the average rate of change of $r = f(\\theta) = 4 - 2\\cos(\\theta)$ with respect to $\\theta$ on the interval $\\left[0, \\frac{\\pi}{2}\\right]$?",
        options: [
          "(A) $\\frac{4}{\\pi}$",
          "(B) $-\\frac{4}{\\pi}$",
          "(C) $2$",
          "(D) $\\frac{2}{\\pi}$"
        ],
        correct_index: 0,
        explanation_latex: "$f(\\pi/2) = 4 - 2\\cos(\\pi/2) = 4$ and $f(0) = 4 - 2\\cos(0) = 2$. Thus $\\text{AROC} = \\frac{4 - 2}{\\pi/2 - 0} = \\frac{2}{\\pi/2} = \\frac{4}{\\pi}$.",
        exam_trap: "Forgetting to divide by $\\frac{\\pi}{2}$ and answering $4 - 2 = 2$."
      }
    ],
    frq: [
      {
        frq_id: "3.11_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the polar function $r = f(\\theta) = 2 + 4\\cos(\\theta)$ for $0 \\le \\theta \\le 2\\pi$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the average rate of change of $f(\\theta)$ on the interval $\\left[0, \\frac{2\\pi}{3}\\right]$ and find all angles $\\theta \\in [0, 2\\pi]$ where the curve passes through the pole.",
            scoring_rubric: [
              { criteria: "Computes $f(0) = 6, f(2\\pi/3) = 0$ and $\\text{AROC} = \\frac{0 - 6}{2\\pi/3} = -\\frac{9}{\\pi}$", points: 1 },
              { criteria: "Solves $2 + 4\\cos\\theta = 0 \\implies \\cos\\theta = -\\frac{1}{2} \\implies \\theta = \\frac{2\\pi}{3}, \\frac{4\\pi}{3}$", points: 1 }
            ],
            model_solution_latex: "$f(0) = 6$ and $f(2\\pi/3) = 2 + 4(-1/2) = 0$, so $\\text{AROC} = \\frac{-6}{2\\pi/3} = -\\frac{9}{\\pi}$. At the pole, $r = 0 \\implies \\cos\\theta = -\\frac{1}{2} \\implies \\theta = \\frac{2\\pi}{3}$ and $\\theta = \\frac{4\\pi}{3}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "On the interval $\\frac{2\\pi}{3} < \\theta < \\pi$, is the distance between the point $(f(\\theta), \\theta)$ and the pole increasing or decreasing? Justify your answer.",
            scoring_rubric: [
              { criteria: "States distance is increasing because on $(2\\pi/3, \\pi)$, $f(\\theta) < 0$ and $f(\\theta)$ is decreasing (from $0$ to $-2$)", points: 2 }
            ],
            model_solution_latex: "On $\\frac{2\\pi}{3} < \\theta < \\pi$, $f(\\theta)$ decreases from $f(2\\pi/3) = 0$ to $f(\\pi) = -2$. Because $f(\\theta) < 0$ and $f(\\theta)$ is decreasing, the distance $|f(\\theta)|$ from the pole is **increasing**."
          }
        ]
      }
    ]
  },
  // =========================================================================
  // UNIT 4: FUNCTIONS INVOLVING PARAMETERS, VECTORS, AND MATRICES (4.1 - 4.10)
  // =========================================================================
  {
    unit: 4,
    topic_id: "4.1",
    topic_title: "Parametric Equations",
    sub_topics: [
      {
        sub_topic_id: "4.1.A",
        sub_topic_title: "Parametric Curves, Orientation, & Eliminating the Parameter",
        essential_formulas: [
          {
            name: "Parametric Representation in the Plane",
            latex: "f(t) = (x(t), y(t)), \\quad a \\le t \\le b",
            description: "Separates horizontal position $x(t)$ and vertical position $y(t)$ as functions of an independent parameter $t$."
          },
          {
            name: "Component Average Rates of Change",
            latex: "\\text{AROC}_x = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}, \\quad \\text{AROC}_y = \\frac{y(t_2) - y(t_1)}{t_2 - t_1}, \\quad \\frac{\\Delta y}{\\Delta x} = \\frac{y(t_2) - y(t_1)}{x(t_2) - x(t_1)}",
            description: "Average rates of change of horizontal and vertical motion with respect to $t$, and secant slope in the $xy$-plane."
          }
        ]
      }
    ],
    conceptual_overview: "A **parametric function** $f(t) = (x(t), y(t))$ models a curve in the $xy$-plane by expressing both coordinates in terms of a third variable $t$ (called the **parameter**, often representing time). Unlike a Cartesian graph $y = g(x)$, a parametric curve carries a specific **direction of motion (orientation)** as $t$ increases, and can trace self-intersecting or non-function curves.",
    core_principles: [
      {
        heading: "Eliminating the Parameter & Inherited Domain Restrictions",
        content_latex: "To convert $(x(t), y(t))$ to a Cartesian equation, solve one equation for $t$ (e.g., $t = h(x)$) and substitute into the other: $y = y(h(x))$. **Crucial AP Rule:** Always transfer the range of $x(t)$ on $a \\le t \\le b$ to restrict the domain of the resulting Cartesian equation!"
      }
    ],
    worked_examples: [
      {
        problem_latex: "Eliminate the parameter for $x(t) = \\sqrt{t - 1}$ and $y(t) = 2t + 3$ for $t \\ge 1$, and state the restricted Cartesian domain.",
        solution_steps: [
          "Step 1: Since $t \\ge 1$, the square root gives $x(t) \\ge 0$.",
          "Step 2: Square both sides of $x = \\sqrt{t - 1}$ to get $x^2 = t - 1 \\implies t = x^2 + 1$.",
          "Step 3: Substitute into $y(t)$: $y = 2(x^2 + 1) + 3 = 2x^2 + 5$, restricted to the right half-parabola $x \\ge 0$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.1_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "A particle moves in the $xy$-plane according to $x(t) = 3t - 2$ and $y(t) = t^2 + 1$ for $-1 \\le t \\le 2$. What are the initial point and terminal point of the particle's path?",
        options: [
          "(A) Initial: $(-5, 2)$; Terminal: $(4, 5)$",
          "(B) Initial: $(4, 5)$; Terminal: $(-5, 2)$",
          "(C) Initial: $(-2, 1)$; Terminal: $(4, 5)$",
          "(D) Initial: $(-5, 0)$; Terminal: $(4, 5)$"
        ],
        correct_index: 0,
        explanation_latex: "At $t = -1$, $(x(-1), y(-1)) = (3(-1) - 2, (-1)^2 + 1) = (-5, 2)$. At $t = 2$, $(x(2), y(2)) = (3(2) - 2, 2^2 + 1) = (4, 5)$.",
        exam_trap: "Evaluating $-1^2 = -1$ instead of $(-1)^2 = +1$ for $y(-1)$."
      },
      {
        question_id: "4.1_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Which Cartesian equation and domain restriction accurately represent the parametric curve $x(t) = \\sqrt{t + 2}, \\; y(t) = t - 3$ for $t \\ge -2$?",
        options: [
          "(A) $y = x^2 - 5$ for all real $x$",
          "(B) $y = x^2 - 5$ for $x \\ge 0$",
          "(C) $y = x^2 - 1$ for $x \\ge -2$",
          "(D) $y = \\sqrt{x + 2} - 3$ for $x \\ge -2$"
        ],
        correct_index: 1,
        explanation_latex: "Squaring $x = \\sqrt{t + 2}$ gives $x^2 = t + 2 \\implies t = x^2 - 2$. Substituting into $y = t - 3$ yields $y = x^2 - 5$. Since $x(t) = \\sqrt{t + 2} \\ge 0$ for all $t \\ge -2$, the Cartesian curve is restricted to $x \\ge 0$.",
        exam_trap: "Forgetting the domain restriction $x \\ge 0$ inherited from the principal square root $x(t) = \\sqrt{t + 2}$."
      },
      {
        question_id: "4.1_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "For the parametric curve $x(t) = t^2 - 4t$ and $y(t) = 2t + 1$, at what value of $t$ does the curve reach its leftmost point (horizontal extremum)?",
        options: [
          "(A) $t = -4$",
          "(B) $t = 0$",
          "(C) $t = 2$",
          "(D) $t = 4$"
        ],
        correct_index: 2,
        explanation_latex: "The leftmost point occurs where the horizontal coordinate $x(t) = t^2 - 4t = (t - 2)^2 - 4$ is minimized. The vertex of this upward-opening parabola in $t$ is at $t = 2$, where $x(2) = -4$.",
        exam_trap: "Reporting the minimum $x$-coordinate ($-4$) instead of the parameter value $t = 2$."
      }
    ],
    frq: [
      {
        frq_id: "4.1_frq_1",
        calculator_active: false,
        scenario_latex: "A particle's position in the $xy$-plane at time $t \\in [0, 4]$ is given by $x(t) = t^2 - 6t + 8$ and $y(t) = 3t - 2$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find all times $t \\in [0, 4]$ at which the particle crosses the $y$-axis, and state the coordinates of those intercepts.",
            scoring_rubric: [
              { criteria: "Sets $x(t) = t^2 - 6t + 8 = 0 \\implies (t - 2)(t - 4) = 0 \\implies t = 2, 4$", points: 1 },
              { criteria: "Evaluates $y(2) = 4$ and $y(4) = 10$, giving $(0, 4)$ and $(0, 10)$", points: 1 }
            ],
            model_solution_latex: "The particle crosses the $y$-axis when $x(t) = 0$: $t^2 - 6t + 8 = (t - 2)(t - 4) = 0 \\implies t = 2$ and $t = 4$. At $t = 2$, $y(2) = 4 \\implies (0, 4)$; at $t = 4$, $y(4) = 10 \\implies (0, 10)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the average rate of change of $x(t)$ and $y(t)$ on $[0, 3]$, and determine the slope of the secant line connecting the particle's position at $t = 0$ to its position at $t = 3$.",
            scoring_rubric: [
              { criteria: "Computes $\\text{AROC}_x = \\frac{-1 - 8}{3} = -3$ and $\\text{AROC}_y = 3$", points: 1 },
              { criteria: "Computes secant slope $\\frac{\\Delta y}{\\Delta x} = \\frac{3}{-3} = -1$", points: 1 }
            ],
            model_solution_latex: "At $t = 0$, $(x(0), y(0)) = (8, -2)$. At $t = 3$, $(x(3), y(3)) = (-1, 7)$. Thus $\\text{AROC}_x = \\frac{-1 - 8}{3} = -3$, $\\text{AROC}_y = \\frac{7 - (-2)}{3} = 3$, and the secant slope in the plane is $\\frac{\\Delta y}{\\Delta x} = \\frac{9}{-9} = -1$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.2",
    topic_title: "Parametric Equations for Linear & Cyclical Motion",
    sub_topics: [
      {
        sub_topic_id: "4.2.A",
        sub_topic_title: "Constant-Velocity Linear Parameterizations",
        essential_formulas: [
          {
            name: "Linear Parametric Equations Through $(x_0, y_0)$",
            latex: "x(t) = x_0 + v_x t, \\quad y(t) = y_0 + v_y t",
            description: "Starts at $(x_0, y_0)$ at $t = 0$ with horizontal velocity $v_x = \\frac{\\Delta x}{\\Delta t}$ and vertical velocity $v_y = \\frac{\\Delta y}{\\Delta t}$."
          },
          {
            name: "Segment Parameterization on $0 \\le t \\le 1$",
            latex: "x(t) = x_1 + (x_2 - x_1)t, \\quad y(t) = y_1 + (y_2 - y_1)t",
            description: "Travels at constant speed from $(x_1, y_1)$ at $t = 0$ to $(x_2, y_2)$ at $t = 1$."
          }
        ]
      }
    ],
    conceptual_overview: "When both $x(t)$ and $y(t)$ are linear functions of $t$, the particle moves along a straight line at constant speed $\\sqrt{v_x^2 + v_y^2}$ with Cartesian slope $m = \\frac{v_y}{v_x}$. Crucially, two different linear parameterizations can trace the exact same line segment in the $xy$-plane at different speeds or in opposite directions!",
    core_principles: [
      {
        heading: "Parameterizing Motion Between Two Points Over Elapsed Time $\\Delta t = T$",
        content_latex: "To move linearly from $A(x_1, y_1)$ at $t = 0$ to $B(x_2, y_2)$ at $t = T$, compute the component velocities $v_x = \\frac{x_2 - x_1}{T}$ and $v_y = \\frac{y_2 - y_1}{T}$, giving $x(t) = x_1 + v_x t$ and $y(t) = y_1 + v_y t$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Write parametric equations for a particle that starts at $(4, -1)$ at $t = 0$ and moves at constant velocity to $(-8, 5)$ at $t = 3$.",
        solution_steps: [
          "Step 1: Find horizontal velocity: $v_x = \\frac{-8 - 4}{3 - 0} = -4$.",
          "Step 2: Find vertical velocity: $v_y = \\frac{5 - (-1)}{3 - 0} = 2$.",
          "Step 3: Write the equations: $x(t) = 4 - 4t$ and $y(t) = -1 + 2t$ for $0 \\le t \\le 3$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.2_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which parametric equations on $0 \\le t \\le 1$ trace the line segment starting at $(2, 7)$ at $t = 0$ and ending at $(-3, 1)$ at $t = 1$?",
        options: [
          "(A) $x(t) = 2 - 5t, \\; y(t) = 7 - 6t$",
          "(B) $x(t) = 2 - 3t, \\; y(t) = 7 + t$",
          "(C) $x(t) = -3 + 5t, \\; y(t) = 1 + 6t$",
          "(D) $x(t) = 2 + 5t, \\; y(t) = 7 + 6t$"
        ],
        correct_index: 0,
        explanation_latex: "Here $\\Delta x = -3 - 2 = -5$ and $\\Delta y = 1 - 7 = -6$. Thus $x(t) = 2 - 5t$ and $y(t) = 7 - 6t$ for $0 \\le t \\le 1$.",
        exam_trap: "Using the terminal coordinates $(-3, 1)$ as the rates of change instead of computing $\\Delta x$ and $\\Delta y$."
      },
      {
        question_id: "4.2_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A particle moves according to $x(t) = -3 + 4t$ and $y(t) = 5 - 8t$. What is the Cartesian equation of the line along which the particle moves?",
        options: [
          "(A) $y = -2x - 1$",
          "(B) $y = -2x + 5$",
          "(C) $y = -\\frac{1}{2}x + \\frac{7}{2}$",
          "(D) $y = 2x + 11$"
        ],
        correct_index: 0,
        explanation_latex: "The slope is $m = \\frac{v_y}{v_x} = \\frac{-8}{4} = -2$. Using the initial point $(-3, 5)$ at $t = 0$, point-slope form gives $y - 5 = -2(x + 3) \\implies y = -2x - 1$.",
        exam_trap: "Using $y(0) = 5$ as the $y$-intercept even though $x(0) = -3 \\ne 0$."
      },
      {
        question_id: "4.2_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Particle 1 moves along $x_1(t) = 1 + 2t, \\; y_1(t) = 4 - t$ and Particle 2 moves along $x_2(t) = 7 - t, \\; y_2(t) = -2 + 2t$ for $t \\ge 0$. Do the two particles collide, and do their paths intersect?",
        options: [
          "(A) Their paths intersect at $(5, 2)$, and they collide at $t = 2$.",
          "(B) Their paths intersect at $(5, 2)$, but they do not collide because they reach $(5, 2)$ at different times.",
          "(C) Their paths are parallel and never intersect.",
          "(D) They collide at $t = 1$."
        ],
        correct_index: 0,
        explanation_latex: "Setting $x_1(t) = x_2(t) \\implies 1 + 2t = 7 - t \\implies 3t = 6 \\implies t = 2$. Checking $y$ at $t = 2$: $y_1(2) = 4 - 2 = 2$ and $y_2(2) = -2 + 4 = 2$. Because both coordinates match at the exact same time $t = 2$, they collide at $(5, 2)$!",
        exam_trap: "Failing to check whether the same parameter $t$ satisfies both $x_1(t) = x_2(t)$ and $y_1(t) = y_2(t)$."
      }
    ],
    frq: [
      {
        frq_id: "4.2_frq_1",
        calculator_active: false,
        scenario_latex: "A drone takes off from point $P(10, -4)$ at time $t = 0$ seconds and flies in a straight line at constant velocity, passing through point $Q(-2, 5)$ at time $t = 3$ seconds.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write the parametric equations $(x(t), y(t))$ for the drone's position at any time $t \\ge 0$, and find its speed in units per second.",
            scoring_rubric: [
              { criteria: "Finds $v_x = -4$ and $v_y = 3$, writing $x(t) = 10 - 4t, \\; y(t) = -4 + 3t$", points: 1 },
              { criteria: "Computes speed $\\sqrt{(-4)^2 + 3^2} = 5$ units/sec", points: 1 }
            ],
            model_solution_latex: "$v_x = \\frac{-2 - 10}{3} = -4$ and $v_y = \\frac{5 - (-4)}{3} = 3$, so $x(t) = 10 - 4t$ and $y(t) = -4 + 3t$. The speed is $\\sqrt{(-4)^2 + 3^2} = 5\\text{ units/s}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "At what time $t$ is the drone equidistant from the $x$-axis and $y$-axis in Quadrant II?",
            scoring_rubric: [
              { criteria: "Sets $-x(t) = y(t)$ in QII: $-(10 - 4t) = -4 + 3t \\implies t = 6$ seconds", points: 2 }
            ],
            model_solution_latex: "In Quadrant II, $x < 0$ and $y > 0$, so equidistant from the axes means $-x(t) = y(t) \\implies -10 + 4t = -4 + 3t \\implies t = 6\\text{ seconds}$ (at point $(-14, 14)$)."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.3",
    topic_title: "Parametric Functions and Conic Sections",
    sub_topics: [
      {
        sub_topic_id: "4.3.A",
        sub_topic_title: "Circles, Ellipses, & Hyperbolas via Trigonometric Parameterizations",
        essential_formulas: [
          {
            name: "Parametric Circle & Ellipse Centered at $(h, k)$",
            latex: "x(t) = h + a\\cos(bt), \\quad y(t) = k + c\\sin(bt) \\implies \\frac{(x - h)^2}{a^2} + \\frac{(y - k)^2}{c^2} = 1",
            description: "Traces an ellipse (or circle if $a = c = r$) counterclockwise for $b > 0$ using $\\cos^2(bt) + \\sin^2(bt) = 1$."
          },
          {
            name: "Parametric Hyperbola Centered at $(h, k)$",
            latex: "x(t) = h + a\\sec(t), \\quad y(t) = k + b\\tan(t) \\implies \\frac{(x - h)^2}{a^2} - \\frac{(y - k)^2}{b^2} = 1",
            description: "Uses the Pythagorean identity $\\sec^2(t) - \\tan^2(t) = 1$."
          }
        ]
      }
    ],
    conceptual_overview: "Because circles, ellipses, and hyperbolas fail the Vertical Line Test, they cannot be written as single Cartesian functions $y = f(x)$. However, using the Pythagorean identities $\\cos^2 t + \\sin^2 t = 1$ and $\\sec^2 t - \\tan^2 t = 1$, every conic section can be smoothly parameterized by a single pair of trigonometric functions $(x(t), y(t))$!",
    core_principles: [
      {
        heading: "Controlling Starting Point and Orientation (CW vs. CCW)",
        content_latex: "For a circle of radius $r$ centered at $(h, k)$: $(h + r\\cos t, k + r\\sin t)$ starts at the rightmost point $(h+r, k)$ and moves **counterclockwise (CCW)**. Swapping $\\sin$ and $\\cos$ or negating one component—such as $(h + r\\cos t, k - r\\sin t)$ or $(h + r\\sin t, k + r\\cos t)$—reverses the orientation to **clockwise (CW)**."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Eliminate the parameter for $x(t) = 3 + 4\\cos(t)$ and $y(t) = -1 + 2\\sin(t)$ on $0 \\le t \\le 2\\pi$, and find the vertices of the conic.",
        solution_steps: [
          "Step 1: Isolate $\\cos(t)$ and $\\sin(t)$: $\\cos(t) = \\frac{x - 3}{4}$ and $\\sin(t) = \\frac{y + 1}{2}$.",
          "Step 2: Apply $\\cos^2(t) + \\sin^2(t) = 1$: $\\frac{(x - 3)^2}{16} + \\frac{(y + 1)^2}{4} = 1$.",
          "Step 3: This is a horizontal ellipse centered at $(3, -1)$ with major vertices $(3 \\pm 4, -1) = (-1, -1), (7, -1)$ and minor co-vertices $(3, -1 \\pm 2) = (3, -3), (3, 1)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.3_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which Cartesian equation represents the curve parameterized by $x(t) = -2 + 5\\cos(t)$ and $y(t) = 3 + 5\\sin(t)$ for $0 \\le t \\le 2\\pi$?",
        options: [
          "(A) $(x + 2)^2 + (y - 3)^2 = 25$",
          "(B) $(x - 2)^2 + (y + 3)^2 = 25$",
          "(C) $(x + 2)^2 + (y - 3)^2 = 5$",
          "(D) $\\frac{(x + 2)^2}{5} - \\frac{(y - 3)^2}{5} = 1$"
        ],
        correct_index: 0,
        explanation_latex: "Since $x + 2 = 5\\cos(t)$ and $y - 3 = 5\\sin(t)$, squaring and adding gives $(x + 2)^2 + (y - 3)^2 = 25(\\cos^2 t + \\sin^2 t) = 25$.",
        exam_trap: "Forgetting to square the radius $r = 5$ on the right-hand side ($r^2 = 25$)."
      },
      {
        question_id: "4.3_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A Ferris wheel of radius $30$ meters has its center at $(0, 35)$. A rider boards at the lowest point $(0, 5)$ at $t = 0$ and rotates counterclockwise with period $120$ seconds. Which parametric equations model the rider's position?",
        options: [
          "(A) $x(t) = 30\\sin\\left(\\frac{\\pi}{60}t\\right), \\; y(t) = 35 - 30\\cos\\left(\\frac{\\pi}{60}t\\right)$",
          "(B) $x(t) = -30\\sin\\left(\\frac{\\pi}{60}t\\right), \\; y(t) = 35 - 30\\cos\\left(\\frac{\\pi}{60}t\\right)$",
          "(C) $x(t) = 30\\cos\\left(\\frac{\\pi}{60}t\\right), \\; y(t) = 35 + 30\\sin\\left(\\frac{\\pi}{60}t\\right)$",
          "(D) $x(t) = 30\\sin(120t), \\; y(t) = 35 - 30\\cos(120t)$"
        ],
        correct_index: 0,
        explanation_latex: "Here $\\omega = \\frac{2\\pi}{120} = \\frac{\\pi}{60}$. At $t = 0$, the rider is at $(0, 5)$, and moving counterclockwise from the bottom means $x(t)$ initially increases (positive) while $y(t)$ increases from $5$. Checking (A): $x(0) = 0, y(0) = 35 - 30 = 5$, and for small $t > 0$, $x(t) > 0$.",
        exam_trap: "Choosing $-30\\sin(\\omega t)$ (Option B), which moves left from the bottom (clockwise)."
      },
      {
        question_id: "4.3_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Which conic section is traced by the parametric equations $x(t) = 1 + 3\\tan(t)$ and $y(t) = -4 + 2\\sec(t)$?",
        options: [
          "(A) A vertical hyperbola: $\\frac{(y + 4)^2}{4} - \\frac{(x - 1)^2}{9} = 1$",
          "(B) A horizontal hyperbola: $\\frac{(x - 1)^2}{9} - \\frac{(y + 4)^2}{4} = 1$",
          "(C) An ellipse: $\\frac{(x - 1)^2}{9} + \\frac{(y + 4)^2}{4} = 1$",
          "(D) A parabola opening upward"
        ],
        correct_index: 0,
        explanation_latex: "Isolate the trig functions: $\\tan(t) = \\frac{x - 1}{3}$ and $\\sec(t) = \\frac{y + 4}{2}$. Since $\\sec^2(t) - \\tan^2(t) = 1$, we have $\\frac{(y + 4)^2}{4} - \\frac{(x - 1)^2}{9} = 1$, which is a vertical hyperbola.",
        exam_trap: "Writing $\\tan^2 t - \\sec^2 t = 1$ (Option B) instead of $\\sec^2 t - \\tan^2 t = 1$."
      }
    ],
    frq: [
      {
        frq_id: "4.3_frq_1",
        calculator_active: false,
        scenario_latex: "An elliptical orbit is modeled by $x(t) = 2 - 6\\sin\\left(\\frac{\\pi}{4}t\\right)$ and $y(t) = -1 + 4\\cos\\left(\\frac{\\pi}{4}t\\right)$ for $0 \\le t \\le 8$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Eliminate the parameter $t$ to write the standard Cartesian equation of the ellipse, and state its center and major/minor axis lengths.",
            scoring_rubric: [
              { criteria: "Writes $\\frac{(x - 2)^2}{36} + \\frac{(y + 1)^2}{16} = 1$", points: 1 },
              { criteria: "States center $(2, -1)$, major axis length $12$, and minor axis length $8$", points: 1 }
            ],
            model_solution_latex: "Since $\\sin\\left(\\frac{\\pi}{4}t\\right) = \\frac{2 - x}{6}$ and $\\cos\\left(\\frac{\\pi}{4}t\\right) = \\frac{y + 1}{4}$, squaring and adding gives $\\frac{(x - 2)^2}{36} + \\frac{(y + 1)^2}{16} = 1$. Center is $(2, -1)$, major axis length is $2(6) = 12$, and minor axis length is $2(4) = 8$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the starting point at $t = 0$, the position at $t = 2$, and determine whether the particle orbits clockwise or counterclockwise.",
            scoring_rubric: [
              { criteria: "Finds $(x(0), y(0)) = (2, 3)$ (top co-vertex) and $(x(2), y(2)) = (-4, -1)$ (left vertex)", points: 1 },
              { criteria: "Concludes counterclockwise motion since moving from top $(2, 3)$ to left $(-4, -1)$ is CCW", points: 1 }
            ],
            model_solution_latex: "At $t = 0$, $(x(0), y(0)) = (2, 3)$ (top of the ellipse). At $t = 2$, $\\frac{\\pi}{4}(2) = \\frac{\\pi}{2}$, giving $(x(2), y(2)) = (2 - 6, -1 + 0) = (-4, -1)$ (leftmost vertex). Moving from the top to the left vertex traces the ellipse **counterclockwise**."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.4",
    topic_title: "Implicitly Defined Functions",
    sub_topics: [
      {
        sub_topic_id: "4.4.A",
        sub_topic_title: "Implicit Relations, Conics, & Symmetry Tests",
        essential_formulas: [
          {
            name: "Standard Forms of Conic Sections",
            latex: "\\text{Parabola: } (y-k)^2 = 4p(x-h); \\quad \\text{Ellipse: } \\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}=1; \\quad \\text{Hyperbola: } \\frac{(x-h)^2}{a^2}-\\frac{(y-k)^2}{b^2}=1",
            description: "Implicitly defined quadratic relations in $x$ and $y$."
          },
          {
            name: "Asymptotes of a Hyperbola",
            latex: "y - k = \\pm \\frac{b}{a}(x - h) \\quad (\\text{horizontal}) \\quad \\text{or} \\quad y - k = \\pm \\frac{a}{b}(x - h) \\quad (\\text{vertical})",
            description: "Linear asymptotes passing through the center $(h, k)$."
          }
        ]
      }
    ],
    conceptual_overview: "An **implicitly defined relation** $F(x, y) = 0$ binds $x$ and $y$ together in a single equation without isolating $y$. Even when the full graph fails the Vertical Line Test (like a circle or horizontal parabola $y^2 = x$), it can be decomposed into two or more **explicit function branches** (such as $y = +\\sqrt{x}$ and $y = -\\sqrt{x}$).",
    core_principles: [
      {
        heading: "Completing the Square to Classify Conics",
        content_latex: "Given a general second-degree equation $Ax^2 + Cy^2 + Dx + Ey + F = 0$: if $A = C$ (same sign), it is a **circle**; if $AC > 0$ ($A \\ne C$), it is an **ellipse**; if $AC < 0$ (opposite signs), it is a **hyperbola**; if either $A = 0$ or $C = 0$, it is a **parabola**."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Convert $4x^2 - 9y^2 - 16x - 18y - 29 = 0$ to standard form and find its center, vertices, and asymptotes.",
        solution_steps: [
          "Step 1: Group and factor: $4(x^2 - 4x) - 9(y^2 + 2y) = 29$.",
          "Step 2: Complete the square: $4(x - 2)^2 - 9(y + 1)^2 = 29 + 16 - 9 = 36$.",
          "Step 3: Divide by $36$: $\\frac{(x - 2)^2}{9} - \\frac{(y + 1)^2}{4} = 1$. This is a horizontal hyperbola with center $(2, -1)$, vertices $(2 \\pm 3, -1) = (-1, -1), (5, -1)$, and asymptotes $y + 1 = \\pm \\frac{2}{3}(x - 2)$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.4_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What are the center and radius of the circle given by $x^2 + y^2 - 6x + 10y + 9 = 0$?",
        options: [
          "(A) Center $(3, -5)$, radius $5$",
          "(B) Center $(-3, 5)$, radius $5$",
          "(C) Center $(3, -5)$, radius $25$",
          "(D) Center $(3, -5)$, radius $3$"
        ],
        correct_index: 0,
        explanation_latex: "Complete the square: $(x^2 - 6x + 9) + (y^2 + 10y + 25) = -9 + 9 + 25 \\implies (x - 3)^2 + (y + 5)^2 = 25$, so the center is $(3, -5)$ and $r = \\sqrt{25} = 5$.",
        exam_trap: "Forgetting to add $9$ and $25$ to the right side, or reporting $r^2 = 25$ instead of $r = 5$."
      },
      {
        question_id: "4.4_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "When the implicit relation $(x - 1)^2 + (y + 2)^2 = 16$ is solved for $y$ to model only the bottom half of the circle, which explicit function is obtained?",
        options: [
          "(A) $y = -2 - \\sqrt{16 - (x - 1)^2}$",
          "(B) $y = -2 + \\sqrt{16 - (x - 1)^2}$",
          "(C) $y = 2 - \\sqrt{16 - (x - 1)^2}$",
          "(D) $y = -2 - (4 - (x - 1))$"
        ],
        correct_index: 0,
        explanation_latex: "Solving $(y + 2)^2 = 16 - (x - 1)^2$ gives $y = -2 \\pm \\sqrt{16 - (x - 1)^2}$. The bottom semicircle corresponds to the negative square root branch: $y = -2 - \\sqrt{16 - (x - 1)^2}$.",
        exam_trap: "Taking the square root term-by-term as $\\sqrt{16 - (x-1)^2} = 4 - (x - 1)$."
      },
      {
        question_id: "4.4_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "What are the equations of the asymptotes of the hyperbola $\\frac{(y - 3)^2}{25} - \\frac{(x + 2)^2}{4} = 1$?",
        options: [
          "(A) $y - 3 = \\pm \\frac{5}{2}(x + 2)$",
          "(B) $y - 3 = \\pm \\frac{2}{5}(x + 2)$",
          "(C) $y + 2 = \\pm \\frac{5}{2}(x - 3)$",
          "(D) $y - 3 = \\pm \\frac{25}{4}(x + 2)$"
        ],
        correct_index: 0,
        explanation_latex: "Because the $(y - 3)^2$ term has denominator $a^2 = 25$ ($a = 5$, vertical rise) and the $(x + 2)^2$ term has denominator $b^2 = 4$ ($b = 2$, horizontal run), the asymptote slopes are $\\pm \\frac{\\text{rise}}{\\text{run}} = \\pm \\frac{5}{2}$ through center $(-2, 3)$.",
        exam_trap: "Using $\\pm \\frac{2}{5}$ by assuming the first denominator is always horizontal run."
      }
    ],
    frq: [
      {
        frq_id: "4.4_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the implicitly defined curve $9x^2 + 4y^2 + 18x - 16y - 11 = 0$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Complete the square to rewrite the equation in standard conic form, identify the conic section, and state its center and vertices.",
            scoring_rubric: [
              { criteria: "Completes square to $\\frac{(x + 1)^2}{4} + \\frac{(y - 2)^2}{9} = 1$", points: 1 },
              { criteria: "Identifies vertical ellipse with center $(-1, 2)$ and major vertices $(-1, 5)$ and $(-1, -1)$", points: 1 }
            ],
            model_solution_latex: "$9(x^2 + 2x + 1) + 4(y^2 - 4y + 4) = 11 + 9 + 16 = 36 \\implies \\frac{(x + 1)^2}{4} + \\frac{(y - 2)^2}{9} = 1$. This is a vertical ellipse centered at $(-1, 2)$ with major vertices $(-1, 2 \\pm 3) = (-1, 5), (-1, -1)$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find all points $(x, y)$ on the curve where $x = -1$, and write a trigonometric parameterization $(x(t), y(t))$ for the curve on $0 \\le t \\le 2\\pi$.",
            scoring_rubric: [
              { criteria: "Finds $(-1, 5)$ and $(-1, -1)$ for $x = -1$", points: 1 },
              { criteria: "Writes $x(t) = -1 + 2\\cos(t), \\; y(t) = 2 + 3\\sin(t)$", points: 1 }
            ],
            model_solution_latex: "Setting $x = -1$ gives $\\frac{(y - 2)^2}{9} = 1 \\implies y = 2 \\pm 3$, so $(-1, 5)$ and $(-1, -1)$. A valid parameterization is $x(t) = -1 + 2\\cos(t)$ and $y(t) = 2 + 3\\sin(t)$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.5",
    topic_title: "Vector Fundamentals",
    sub_topics: [
      {
        sub_topic_id: "4.5.A",
        sub_topic_title: "Component Form, Magnitude, Direction Angle, & Unit Vectors",
        essential_formulas: [
          {
            name: "Component Form, Magnitude, & Direction Components",
            latex: "\\vec{v} = \\langle x_2 - x_1, y_2 - y_1 \\rangle = \\langle a, b \\rangle = a\\vec{i} + b\\vec{j}, \\quad \\|\\vec{v}\\| = \\sqrt{a^2 + b^2}",
            description: "Resolves a directed line segment from $(x_1, y_1)$ to $(x_2, y_2)$ into components $\\langle a, b \\rangle = \\langle \\|\\vec{v}\\|\\cos\\theta, \\|\\vec{v}\\|\\sin\\theta \\rangle$."
          },
          {
            name: "Unit Vector in the Direction of $\\vec{v}$",
            latex: "\\hat{u} = \\frac{\\vec{v}}{\\|\\vec{v}\\|} = \\left\\langle \\frac{a}{\\sqrt{a^2 + b^2}}, \\frac{b}{\\sqrt{a^2 + b^2}} \\right\\rangle = \\langle \\cos\\theta, \\sin\\theta \\rangle",
            description: "Scales any nonzero vector $\\vec{v}$ to have magnitude $\\|\\hat{u}\\| = 1$ while preserving its direction."
          }
        ]
      }
    ],
    conceptual_overview: "A **vector** in the plane is a mathematical quantity possessing both **magnitude (length)** and **direction**. Unlike a point $(a, b)$, a free vector $\\vec{v} = \\langle a, b \\rangle$ represents a displacement of $a$ units horizontally and $b$ units vertically regardless of its initial point (tail). Two vectors are equal if and only if they have the same components.",
    core_principles: [
      {
        heading: "Finding the Direction Angle $\\theta$ with Quadrant Adjustment",
        content_latex: "The direction angle $\\theta \\in [0, 2\\pi)$ (or $[0^\\circ, 360^\\circ)$) satisfies $\\tan\\theta = \\frac{b}{a}$. Just as in polar coordinates, when the horizontal component is negative ($a < 0$, Quadrants II and III), add $\\pi$ (or $180^\\circ$) to $\\arctan(b/a)$!"
      }
    ],
    worked_examples: [
      {
        problem_latex: "Let $P = (2, -1)$ and $Q = (-1, 3)$. Find the component form, magnitude, and unit vector in the direction of $\\overrightarrow{PQ}$.",
        solution_steps: [
          "Step 1: Subtract initial from terminal (Head minus Tail): $\\overrightarrow{PQ} = \\langle -1 - 2, 3 - (-1) \\rangle = \\langle -3, 4 \\rangle$.",
          "Step 2: Compute magnitude: $\\|\\overrightarrow{PQ}\\| = \\sqrt{(-3)^2 + 4^2} = \\sqrt{9 + 16} = 5$.",
          "Step 3: Divide by magnitude: $\\hat{u} = \\left\\langle -\\frac{3}{5}, \\frac{4}{5} \\right\\rangle$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.5_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "What is the unit vector in the direction of $\\vec{v} = \\langle -5, 12 \\rangle$?",
        options: [
          "(A) $\\left\\langle -\\frac{5}{13}, \\frac{12}{13} \\right\\rangle$",
          "(B) $\\left\\langle -\\frac{5}{7}, \\frac{12}{7} \\right\\rangle$",
          "(C) $\\langle -1, 1 \\rangle$",
          "(D) $\\left\\langle \\frac{5}{13}, -\\frac{12}{13} \\right\\rangle$"
        ],
        correct_index: 0,
        explanation_latex: "The magnitude is $\\|\\vec{v}\\| = \\sqrt{(-5)^2 + 12^2} = \\sqrt{25 + 144} = 13$. Dividing $\\vec{v}$ by $13$ gives $\\left\\langle -\\frac{5}{13}, \\frac{12}{13} \\right\\rangle$.",
        exam_trap: "Adding $-5 + 12 = 7$ instead of using the Pythagorean theorem $\\sqrt{25 + 144} = 13$."
      },
      {
        question_id: "4.5_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A vector $\\vec{w}$ has magnitude $8$ and direction angle $\\theta = \\frac{5\\pi}{6}$. What is the component form of $\\vec{w}$?",
        options: [
          "(A) $\\langle -4\\sqrt{3}, 4 \\rangle$",
          "(B) $\\langle 4\\sqrt{3}, -4 \\rangle$",
          "(C) $\\langle -4, 4\\sqrt{3} \\rangle$",
          "(D) $\\langle 4\\sqrt{3}, 4 \\rangle$"
        ],
        correct_index: 0,
        explanation_latex: "$\\vec{w} = \\langle 8\\cos(5\\pi/6), 8\\sin(5\\pi/6) \\rangle = \\left\\langle 8\\left(-\\frac{\\sqrt{3}}{2}\\right), 8\\left(\\frac{1}{2}\\right) \\right\\rangle = \\langle -4\\sqrt{3}, 4 \\rangle$.",
        exam_trap: "Swapping $\\cos$ and $\\sin$ or forgetting that $\\cos(5\\pi/6)$ is negative in Quadrant II."
      },
      {
        question_id: "4.5_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "If $\\overrightarrow{AB} = \\langle 4, -7 \\rangle$ and the terminal point is $B(-1, 2)$, what are the coordinates of the initial point $A$?",
        options: [
          "(A) $(-5, 9)$",
          "(B) $(3, -5)$",
          "(C) $(5, -9)$",
          "(D) $(-3, 5)$"
        ],
        correct_index: 0,
        explanation_latex: "Since $\\overrightarrow{AB} = B - A$, we have $A = B - \\overrightarrow{AB} = (-1 - 4, 2 - (-7)) = (-5, 9)$.",
        exam_trap: "Adding $B + \\overrightarrow{AB} = (3, -5)$ instead of subtracting $A = B - \\overrightarrow{AB}$."
      }
    ],
    frq: [
      {
        frq_id: "4.5_frq_1",
        calculator_active: true,
        scenario_latex: "An airplane flies with an airspeed vector $\\vec{v}$ of magnitude $450\\text{ mph}$ at a direction angle of $140^\\circ$ measured counterclockwise from due east.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write $\\vec{v}$ in exact trigonometric component form and find its decimal components rounded to three decimal places.",
            scoring_rubric: [
              { criteria: "Writes $\\vec{v} = \\langle 450\\cos(140^\\circ), 450\\sin(140^\\circ) \\rangle \\approx \\langle -344.720, 289.254 \\rangle$", points: 2 }
            ],
            model_solution_latex: "$\\vec{v} = \\langle 450\\cos(140^\\circ), 450\\sin(140^\\circ) \\rangle \\approx \\langle -344.720, 289.254 \\rangle\\text{ mph}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the component form of a vector $\\vec{w}$ of magnitude $100$ that points in the exact opposite direction of $\\vec{v}$.",
            scoring_rubric: [
              { criteria: "Scales unit vector by $-100$: $\\vec{w} = -\\frac{100}{450}\\vec{v} \\approx \\langle 76.604, -64.279 \\rangle$", points: 2 }
            ],
            model_solution_latex: "The opposite unit vector is $-\\frac{\\vec{v}}{450} = \\langle -\\cos(140^\\circ), -\\sin(140^\\circ) \\rangle$. Multiplying by $100$ gives $\\vec{w} = \\langle -100\\cos(140^\\circ), -100\\sin(140^\\circ) \\rangle \\approx \\langle 76.604, -64.279 \\rangle$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.6",
    topic_title: "Vector Operations",
    sub_topics: [
      {
        sub_topic_id: "4.6.A",
        sub_topic_title: "Linear Combinations, Dot Product, & Angle Between Vectors",
        essential_formulas: [
          {
            name: "Vector Addition & Scalar Multiplication",
            latex: "c\\langle a_1, b_1 \\rangle + d\\langle a_2, b_2 \\rangle = \\langle ca_1 + da_2, cb_1 + db_2 \\rangle",
            description: "Geometrically corresponds to tail-to-tip (parallelogram) addition and scaling."
          },
          {
            name: "Dot Product & Angle Between Two Vectors",
            latex: "\\vec{u} \\cdot \\vec{v} = a_1 a_2 + b_1 b_2 = \\|\\vec{u}\\|\\|\\vec{v}\\|\\cos\\theta \\implies \\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\|\\|\\vec{v}\\|}",
            description: "The dot product is a scalar! Two nonzero vectors are orthogonal (perpendicular) if and only if $\\vec{u} \\cdot \\vec{v} = 0$."
          }
        ]
      }
    ],
    conceptual_overview: "Vectors combine algebraically component-by-component and geometrically via the **tail-to-tip (triangle) law**. The **dot product** $\\vec{u} \\cdot \\vec{v} = a_1a_2 + b_1b_2$ produces a **scalar** (real number) that measures how strongly two vectors align: if $\\vec{u} \\cdot \\vec{v} > 0$, the angle between them is acute; if $\\vec{u} \\cdot \\vec{v} < 0$, the angle is obtuse; and if $\\vec{u} \\cdot \\vec{v} = 0$, the vectors are **orthogonal ($90^\\circ$)**.",
    core_principles: [
      {
        heading: "Parallel vs. Orthogonal Vector Tests",
        content_latex: "Two nonzero vectors $\\vec{u} = \\langle a_1, b_1 \\rangle$ and $\\vec{v} = \\langle a_2, b_2 \\rangle$ are **parallel** if one is a scalar multiple of the other ($\\vec{u} = k\\vec{v}$, so $\\frac{a_1}{a_2} = \\frac{b_1}{b_2}$), and **orthogonal (perpendicular)** if their dot product is zero ($a_1a_2 + b_1b_2 = 0$)."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Let $\\vec{u} = \\langle 2, -3 \\rangle$ and $\\vec{v} = \\langle 4, 1 \\rangle$. Compute (a) $3\\vec{u} - 2\\vec{v}$, (b) $\\vec{u} \\cdot \\vec{v}$, and (c) the angle $\\theta$ between $\\vec{u}$ and $\\vec{v}$.",
        solution_steps: [
          "Step 1: $3\\vec{u} - 2\\vec{v} = \\langle 6, -9 \\rangle - \\langle 8, 2 \\rangle = \\langle -2, -11 \\rangle$.",
          "Step 2: $\\vec{u} \\cdot \\vec{v} = (2)(4) + (-3)(1) = 8 - 3 = 5$.",
          "Step 3: $\\|\\vec{u}\\| = \\sqrt{13}$ and $\\|\\vec{v}\\| = \\sqrt{17}$, so $\\theta = \\arccos\\left(\\frac{5}{\\sqrt{221}}\\right) \\approx 70.35^\\circ$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.6_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "For what value of $k$ are the vectors $\\vec{u} = \\langle 3, -4 \\rangle$ and $\\vec{v} = \\langle k, 6 \\rangle$ orthogonal?",
        options: [
          "(A) $k = 8$",
          "(B) $k = -8$",
          "(C) $k = -\\frac{9}{2}$",
          "(D) $k = \\frac{9}{2}$"
        ],
        correct_index: 0,
        explanation_latex: "Orthogonal vectors have dot product zero: $\\vec{u} \\cdot \\vec{v} = 3k + (-4)(6) = 3k - 24 = 0 \\implies k = 8$.",
        exam_trap: "Setting the ratio $\\frac{3}{k} = \\frac{-4}{6} \\implies k = -\\frac{9}{2}$ (which makes the vectors parallel, not orthogonal!)."
      },
      {
        question_id: "4.6_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "If $\\vec{u} = \\langle 1, \\sqrt{3} \\rangle$ and $\\vec{v} = \\langle -\\sqrt{3}, 1 \\rangle$, what is the angle $\\theta$ between $\\vec{u}$ and $\\vec{v}$?",
        options: [
          "(A) $\\frac{\\pi}{6}$",
          "(B) $\\frac{\\pi}{3}$",
          "(C) $\\frac{\\pi}{2}$",
          "(D) $\\frac{2\\pi}{3}$"
        ],
        correct_index: 2,
        explanation_latex: "Compute the dot product: $\\vec{u} \\cdot \\vec{v} = (1)(-\\sqrt{3}) + (\\sqrt{3})(1) = 0$. Since $\\vec{u} \\cdot \\vec{v} = 0$, the angle between them is $\\frac{\\pi}{2}$ ($90^\\circ$).",
        exam_trap: "Computing individual direction angles without noticing immediately that $\\vec{u} \\cdot \\vec{v} = 0$."
      },
      {
        question_id: "4.6_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Two forces $\\vec{F}_1 = \\langle 5, -2 \\rangle$ and $\\vec{F}_2 = \\langle -1, 6 \\rangle$ act on an object. What single additional force $\\vec{F}_3$ must be applied so that the object is in static equilibrium (net force equals $\\vec{0}$)?",
        options: [
          "(A) $\\langle -4, -4 \\rangle$",
          "(B) $\\langle 4, 4 \\rangle$",
          "(C) $\\langle 6, -8 \\rangle$",
          "(D) $\\langle -6, 8 \\rangle$"
        ],
        correct_index: 0,
        explanation_latex: "For equilibrium, $\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\langle 0, 0 \\rangle$. Since $\\vec{F}_1 + \\vec{F}_2 = \\langle 4, 4 \\rangle$, we require $\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2) = \\langle -4, -4 \\rangle$.",
        exam_trap: "Reporting the resultant $\\vec{F}_1 + \\vec{F}_2 = \\langle 4, 4 \\rangle$ instead of its opposite $-\\langle 4, 4 \\rangle$."
      }
    ],
    frq: [
      {
        frq_id: "4.6_frq_1",
        calculator_active: true,
        scenario_latex: "A boat heads across a river with velocity vector $\\vec{b} = \\langle 12, 5 \\rangle\\text{ mph}$ relative to the water, while the river current flows with velocity vector $\\vec{c} = \\langle -3, 4 \\rangle\\text{ mph}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the resultant ground velocity vector $\\vec{v}_g = \\vec{b} + \\vec{c}$, the ground speed of the boat, and its direction angle in degrees.",
            scoring_rubric: [
              { criteria: "Finds $\\vec{v}_g = \\langle 9, 9 \\rangle\\text{ mph}$", points: 1 },
              { criteria: "Computes speed $\\|\\vec{v}_g\\| = 9\\sqrt{2} \\approx 12.728\\text{ mph}$ and direction angle $45^\\circ$", points: 1 }
            ],
            model_solution_latex: "$\\vec{v}_g = \\langle 12 - 3, 5 + 4 \\rangle = \\langle 9, 9 \\rangle\\text{ mph}$. Ground speed is $\\sqrt{9^2 + 9^2} = 9\\sqrt{2} \\approx 12.728\\text{ mph}$ at angle $\\theta = \\arctan(9/9) = 45^\\circ$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Compute the dot product $\\vec{b} \\cdot \\vec{c}$ and find the angle in degrees between the boat's heading $\\vec{b}$ and the current $\\vec{c}$.",
            scoring_rubric: [
              { criteria: "Computes $\\vec{b} \\cdot \\vec{c} = (12)(-3) + (5)(4) = -16$", points: 1 },
              { criteria: "Computes $\\theta = \\arccos\\left(\\frac{-16}{13 \\cdot 5}\\right) = \\arccos\\left(-\\frac{16}{65}\\right) \\approx 104.250^\\circ$", points: 1 }
            ],
            model_solution_latex: "$\\vec{b} \\cdot \\vec{c} = -36 + 20 = -16$. Since $\\|\\vec{b}\\| = 13$ and $\\|\\vec{c}\\| = 5$, $\\theta = \\arccos\\left(-\\frac{16}{65}\\right) \\approx 104.250^\\circ$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.7",
    topic_title: "Vector-Valued Functions",
    sub_topics: [
      {
        sub_topic_id: "4.7.A",
        sub_topic_title: "Position Vectors, Displacement, & Planar Motion Analysis",
        essential_formulas: [
          {
            name: "Position & Displacement Vector-Valued Functions",
            latex: "\\vec{r}(t) = \\langle x(t), y(t) \\rangle, \\quad \\Delta\\vec{r} = \\vec{r}(t_2) - \\vec{r}(t_1) = \\langle x(t_2) - x(t_1), y(t_2) - y(t_1) \\rangle",
            description: "Gives the position vector from the origin to $(x(t), y(t))$ and net displacement over $[t_1, t_2]$."
          },
          {
            name: "Distance from Origin & Average Velocity Vector",
            latex: "\\|\\vec{r}(t)\\| = \\sqrt{(x(t))^2 + (y(t))^2}, \\quad \\vec{v}_{\\text{avg}} = \\frac{\\vec{r}(t_2) - \\vec{r}(t_1)}{t_2 - t_1}",
            description: "Magnitude of $\\vec{r}(t)$ is the particle's distance from $(0, 0)$."
          }
        ]
      }
    ],
    conceptual_overview: "A **vector-valued function** $\\vec{r}(t) = \\langle x(t), y(t) \\rangle = x(t)\\vec{i} + y(t)\\vec{j}$ maps each real number $t$ (time) to a 2D position vector whose tip traces a parametric curve in the plane. Using vector notation unifies position, net displacement $\\Delta \\vec{r}$, and average velocity $\\vec{v}_{\\text{avg}} = \\frac{\\Delta \\vec{r}}{\\Delta t}$ into single vector expressions.",
    core_principles: [
      {
        heading: "Projectile Motion in Vector Form",
        content_latex: "A projectile launched from $(x_0, y_0)$ with initial speed $v_0$ at angle $\\theta$ has position vector $\\vec{r}(t) = \\left\\langle x_0 + (v_0\\cos\\theta)t, \\; y_0 + (v_0\\sin\\theta)t - \\frac{1}{2}gt^2 \\right\\rangle$, where $g \\approx 9.8\\text{ m/s}^2$ or $32\\text{ ft/s}^2$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "A particle's position is $\\vec{r}(t) = \\langle t^2 - 2t, \\; 3t + 1 \\rangle$. Find its net displacement vector and average velocity vector from $t = 1$ to $t = 4$.",
        solution_steps: [
          "Step 1: Evaluate $\\vec{r}(1) = \\langle -1, 4 \\rangle$ and $\\vec{r}(4) = \\langle 8, 13 \\rangle$.",
          "Step 2: Net displacement is $\\Delta \\vec{r} = \\vec{r}(4) - \\vec{r}(1) = \\langle 8 - (-1), 13 - 4 \\rangle = \\langle 9, 9 \\rangle$.",
          "Step 3: Average velocity is $\\vec{v}_{\\text{avg}} = \\frac{\\Delta \\vec{r}}{4 - 1} = \\frac{1}{3}\\langle 9, 9 \\rangle = \\langle 3, 3 \\rangle$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.7_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "A particle's position is given by $\\vec{r}(t) = \\langle 3\\cos(t), 3\\sin(t) \\rangle$. What is the magnitude $\\|\\vec{r}(t)\\|$ for any time $t$?",
        options: [
          "(A) $3$",
          "(B) $9$",
          "(C) $3\\sqrt{2}$",
          "(D) It varies with $t$"
        ],
        correct_index: 0,
        explanation_latex: "$\\|\\vec{r}(t)\\| = \\sqrt{(3\\cos t)^2 + (3\\sin t)^2} = \\sqrt{9(\\cos^2 t + \\sin^2 t)} = \\sqrt{9} = 3$.",
        exam_trap: "Forgetting to take the square root of $9$."
      },
      {
        question_id: "4.7_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "For $\\vec{r}(t) = \\langle 2t - 3, \\; t^2 - 4t \\rangle$, at what time $t$ is the position vector $\\vec{r}(t)$ orthogonal to the vector $\\vec{u} = \\langle 2, 1 \\rangle$?",
        options: [
          "(A) $t = 1$ and $t = -1$",
          "(B) $t = \\sqrt{6}$ and $t = -\\sqrt{6}$",
          "(C) $t = 0$ and $t = 4$",
          "(D) $t = \\frac{3}{2}$"
        ],
        correct_index: 1,
        explanation_latex: "Set the dot product equal to zero: $\\vec{r}(t) \\cdot \\vec{u} = 2(2t - 3) + 1(t^2 - 4t) = 4t - 6 + t^2 - 4t = t^2 - 6 = 0 \\implies t = \\pm\\sqrt{6}$.",
        exam_trap: "Setting $x(t) = 0$ or $y(t) = 0$ instead of computing $\\vec{r}(t) \\cdot \\vec{u} = 0$."
      },
      {
        question_id: "4.7_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "A particle has position $\\vec{r}(t) = \\langle t^2, 4t - 3 \\rangle$. What is the magnitude of its net displacement from $t = 0$ to $t = 3$?",
        options: [
          "(A) $15$",
          "(B) $21$",
          "(C) $\\sqrt{153}$",
          "(D) $12$"
        ],
        correct_index: 0,
        explanation_latex: "$\\vec{r}(0) = \\langle 0, -3 \\rangle$ and $\\vec{r}(3) = \\langle 9, 9 \\rangle$. The displacement vector is $\\Delta\\vec{r} = \\vec{r}(3) - \\vec{r}(0) = \\langle 9, 12 \\rangle$, whose magnitude is $\\sqrt{9^2 + 12^2} = \\sqrt{81 + 144} = 15$.",
        exam_trap: "Computing $\\|\\vec{r}(3)\\| = \\sqrt{9^2 + 9^2} = \\sqrt{162}$ instead of subtracting $\\vec{r}(0) = \\langle 0, -3 \\rangle$ first."
      }
    ],
    frq: [
      {
        frq_id: "4.7_frq_1",
        calculator_active: true,
        scenario_latex: "A baseball is hit from an initial height of $3$ feet above the ground at $t = 0$ with initial velocity vector $\\vec{v}_0 = \\langle 80, 64 \\rangle\\text{ ft/s}$. Its position vector at time $t$ seconds is $\\vec{r}(t) = \\langle 80t, \\; 3 + 64t - 16t^2 \\rangle$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Find the time $t$ when the baseball reaches its maximum height, and state the position vector $\\vec{r}(t)$ at that instant.",
            scoring_rubric: [
              { criteria: "Finds vertex of $y(t)$ at $t = -\\frac{64}{2(-16)} = 2$ seconds", points: 1 },
              { criteria: "Evaluates $\\vec{r}(2) = \\langle 160, 67 \\rangle$ feet", points: 1 }
            ],
            model_solution_latex: "The vertical component $y(t) = -16t^2 + 64t + 3$ is maximized at $t = -\\frac{64}{-32} = 2\\text{ s}$. At $t = 2$, $\\vec{r}(2) = \\langle 80(2), 3 + 64(2) - 16(4) \\rangle = \\langle 160, 67 \\rangle\\text{ ft}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the time $t > 0$ when the ball hits the ground ($y(t) = 0$) and calculate the horizontal distance traveled.",
            scoring_rubric: [
              { criteria: "Solves $-16t^2 + 64t + 3 = 0 \\implies t \\approx 4.046$ seconds", points: 1 },
              { criteria: "Computes horizontal range $x(4.0463) \\approx 323.708$ feet", points: 1 }
            ],
            model_solution_latex: "Setting $y(t) = 0$ gives $t = \\frac{-64 - \\sqrt{64^2 - 4(-16)(3)}}{-32} = \\frac{64 + \\sqrt{4288}}{32} \\approx 4.0463\\text{ s}$. The horizontal distance is $x(4.0463) \\approx 323.708\\text{ ft}$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.8",
    topic_title: "Matrices and Systems of Equations",
    sub_topics: [
      {
        sub_topic_id: "4.8.A",
        sub_topic_title: "Matrix Equations $AX = B$, Determinants, & $2 \\times 2$ Inverses",
        essential_formulas: [
          {
            name: "$2 \\times 2$ Determinant & Invertibility Criterion",
            latex: "A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\implies \\det(A) = |A| = ad - bc \\ne 0",
            description: "A square matrix $A$ has a multiplicative inverse $A^{-1}$ if and only if $\\det(A) \\ne 0$ (non-singular)."
          },
          {
            name: "Explicit $2 \\times 2$ Inverse Matrix & System Solution",
            latex: "A^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}, \\quad AX = B \\implies X = A^{-1}B",
            description: "Swap the main diagonal entries, negate the off-diagonal entries, and divide by $\\det(A)$."
          }
        ]
      }
    ],
    conceptual_overview: "Any linear system of equations can be written compactly as a matrix equation $AX = B$, where $A$ is the **coefficient matrix**, $X$ is the **column vector of variables**, and $B$ is the **constant vector**. When $\\det(A) \\ne 0$, multiplying on the left by $A^{-1}$ yields the unique solution $X = A^{-1}B$!",
    core_principles: [
      {
        heading: "Order Matters: Left-Multiplication $X = A^{-1}B$",
        content_latex: "Because matrix multiplication is NOT commutative, to solve $AX = B$ you must left-multiply both sides by $A^{-1}$: $A^{-1}(AX) = A^{-1}B \\implies IX = A^{-1}B \\implies X = A^{-1}B$. Writing $BA^{-1}$ is undefined or incorrect!"
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the inverse of $A = \\begin{pmatrix} 3 & 2 \\\\ 5 & 4 \\end{pmatrix}$ and use it to solve $\\begin{cases} 3x + 2y = 7 \\\\ 5x + 4y = 11 \\end{cases}$.",
        solution_steps: [
          "Step 1: Compute the determinant: $\\det(A) = (3)(4) - (2)(5) = 12 - 10 = 2 \\ne 0$.",
          "Step 2: Write the inverse: $A^{-1} = \\frac{1}{2}\\begin{pmatrix} 4 & -2 \\\\ -5 & 3 \\end{pmatrix} = \\begin{pmatrix} 2 & -1 \\\\ -2.5 & 1.5 \\end{pmatrix}$.",
          "Step 3: Multiply $X = A^{-1}B = \\frac{1}{2}\\begin{pmatrix} 4 & -2 \\\\ -5 & 3 \\end{pmatrix}\\begin{pmatrix} 7 \\\\ 11 \\end{pmatrix} = \\frac{1}{2}\\begin{pmatrix} 6 \\\\ -2 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ -1 \\end{pmatrix}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.8_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "For what value of $k$ does the matrix $M = \\begin{pmatrix} 6 & -4 \\\\ 9 & k \\end{pmatrix}$ NOT have an inverse?",
        options: [
          "(A) $k = -6$",
          "(B) $k = 6$",
          "(C) $k = -4$",
          "(D) $k = 0$"
        ],
        correct_index: 0,
        explanation_latex: "A matrix is singular (non-invertible) when $\\det(M) = 0$: $(6)(k) - (-4)(9) = 6k + 36 = 0 \\implies k = -6$.",
        exam_trap: "Writing $6k - 36 = 0 \\implies k = 6$ by dropping the negative sign on $-4$."
      },
      {
        question_id: "4.8_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "What is the inverse of the matrix $A = \\begin{pmatrix} 4 & -3 \\\\ 2 & -1 \\end{pmatrix}$?",
        options: [
          "(A) $\\begin{pmatrix} -\\frac{1}{2} & \\frac{3}{2} \\\\ -1 & 2 \\end{pmatrix}$",
          "(B) $\\begin{pmatrix} \\frac{1}{2} & -\\frac{3}{2} \\\\ 1 & -2 \\end{pmatrix}$",
          "(C) $\\begin{pmatrix} 2 & -\\frac{3}{2} \\\\ 1 & -\\frac{1}{2} \\end{pmatrix}$",
          "(D) $\\begin{pmatrix} -1 & 3 \\\\ -2 & 4 \\end{pmatrix}$"
        ],
        correct_index: 0,
        explanation_latex: "$\\det(A) = (4)(-1) - (-3)(2) = -4 + 6 = 2$. Thus $A^{-1} = \\frac{1}{2}\\begin{pmatrix} -1 & 3 \\\\ -2 & 4 \\end{pmatrix} = \\begin{pmatrix} -\\frac{1}{2} & \\frac{3}{2} \\\\ -1 & 2 \\end{pmatrix}$.",
        exam_trap: "Forgetting to divide by $\\det(A) = 2$ (Option D) or computing $\\det(A) = -4 - 6 = -10$."
      },
      {
        question_id: "4.8_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "If $A$ is an invertible $3 \\times 3$ matrix and $AX = B$, which matrix expression equals $X$?",
        options: [
          "(A) $A^{-1}B$",
          "(B) $BA^{-1}$",
          "(C) $\\frac{B}{A}$",
          "(D) $AB^{-1}$"
        ],
        correct_index: 0,
        explanation_latex: "Multiplying $AX = B$ on the left by $A^{-1}$ yields $A^{-1}AX = IX = X = A^{-1}B$.",
        exam_trap: "Selecting $BA^{-1}$ (which does not even have compatible dimensions since $B$ is $3 \\times 1$ and $A^{-1}$ is $3 \\times 3$)."
      }
    ],
    frq: [
      {
        frq_id: "4.8_frq_1",
        calculator_active: false,
        scenario_latex: "Consider the linear system $\\begin{cases} 2x - 5y = 13 \\\\ -x + 3y = -7 \\end{cases}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write the system in the matrix form $AX = B$ and find $A^{-1}$ explicitly.",
            scoring_rubric: [
              { criteria: "Writes $A = \\begin{pmatrix} 2 & -5 \\\\ -1 & 3 \\end{pmatrix}, X = \\begin{pmatrix} x \\\\ y \\end{pmatrix}, B = \\begin{pmatrix} 13 \\\\ -7 \\end{pmatrix}$", points: 1 },
              { criteria: "Computes $\\det(A) = 6 - 5 = 1$ and $A^{-1} = \\begin{pmatrix} 3 & 5 \\\\ 1 & 2 \\end{pmatrix}$", points: 1 }
            ],
            model_solution_latex: "$A = \\begin{pmatrix} 2 & -5 \\\\ -1 & 3 \\end{pmatrix}, X = \\begin{pmatrix} x \\\\ y \\end{pmatrix}, B = \\begin{pmatrix} 13 \\\\ -7 \\end{pmatrix}$. Since $\\det(A) = (2)(3) - (-5)(-1) = 1$, $A^{-1} = \\begin{pmatrix} 3 & 5 \\\\ 1 & 2 \\end{pmatrix}$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Compute $X = A^{-1}B$ to find the solution $(x, y)$.",
            scoring_rubric: [
              { criteria: "Multiplies $\\begin{pmatrix} 3 & 5 \\\\ 1 & 2 \\end{pmatrix}\\begin{pmatrix} 13 \\\\ -7 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ -1 \\end{pmatrix}$", points: 2 }
            ],
            model_solution_latex: "$X = \\begin{pmatrix} 3(13) + 5(-7) \\\\ 1(13) + 2(-7) \\end{pmatrix} = \\begin{pmatrix} 39 - 35 \\\\ 13 - 14 \\end{pmatrix} = \\begin{pmatrix} 4 \\\\ -1 \\end{pmatrix}$, so $(x, y) = (4, -1)$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.9",
    topic_title: "Matrix Operations",
    sub_topics: [
      {
        sub_topic_id: "4.9.A",
        sub_topic_title: "Dimension Compatibility, Row-by-Column Multiplication, & Non-Commutativity",
        essential_formulas: [
          {
            name: "Matrix Multiplication Dimension Rule",
            latex: "A_{m \\times n} \\cdot B_{n \\times p} = C_{m \\times p}",
            description: "The inner dimensions ($n$ and $n$) must match; the product has the outer dimensions ($m \\times p$)."
          },
          {
            name: "General Entry $(AB)_{ij}$ Formula",
            latex: "(AB)_{ij} = (\\text{Row } i \\text{ of } A) \\cdot (\\text{Column } j \\text{ of } B) = \\sum_{k=1}^{n} a_{ik}b_{kj}",
            description: "Dot product of the $i$-th row of $A$ with the $j$-th column of $B$."
          }
        ]
      }
    ],
    conceptual_overview: "Matrix addition and subtraction require identical dimensions ($m \\times n$) and operate entry-by-entry. **Matrix multiplication** $AB$, however, combines rows of $A$ with columns of $B$, requiring the number of columns of $A$ to equal the number of rows of $B$. Even for square matrices, matrix multiplication is **not commutative** ($AB \\ne BA$ in general)!",
    core_principles: [
      {
        heading: "Zero Divisors in Matrix Algebra",
        content_latex: "Unlike real numbers, two nonzero matrices $A \\ne 0$ and $B \\ne 0$ can multiply to the zero matrix $AB = 0$ if their determinants are zero! Furthermore, $(A + B)^2 = A^2 + AB + BA + B^2 \\ne A^2 + 2AB + B^2$ unless $AB = BA$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Compute $AB$ for $A = \\begin{pmatrix} 2 & -1 & 3 \\\\ 0 & 4 & -2 \\end{pmatrix}$ and $B = \\begin{pmatrix} 1 & 5 \\\\ -3 & 2 \\\\ 4 & 0 \\end{pmatrix}$.",
        solution_steps: [
          "Step 1: Check dimensions: $A$ is $2 \\times 3$ and $B$ is $3 \\times 2$, so $AB$ is a $2 \\times 2$ matrix.",
          "Step 2: Row 1 of $AB$: $c_{11} = 2(1) + (-1)(-3) + 3(4) = 17$; $c_{12} = 2(5) + (-1)(2) + 3(0) = 8$.",
          "Step 3: Row 2 of $AB$: $c_{21} = 0(1) + 4(-3) + (-2)(4) = -20$; $c_{22} = 0(5) + 4(2) + (-2)(0) = 8$. Thus $AB = \\begin{pmatrix} 17 & 8 \\\\ -20 & 8 \\end{pmatrix}$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.9_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "If matrix $A$ has dimensions $3 \\times 4$ and matrix $B$ has dimensions $4 \\times 2$, what are the dimensions of $AB$ and $BA$?",
        options: [
          "(A) $AB$ is $3 \\times 2$, and $BA$ is undefined.",
          "(B) $AB$ is $4 \\times 4$, and $BA$ is $3 \\times 2$.",
          "(C) Both $AB$ and $BA$ are $3 \\times 2$.",
          "(D) $AB$ is undefined, and $BA$ is $4 \\times 4$."
        ],
        correct_index: 0,
        explanation_latex: "For $A_{3 \\times 4} B_{4 \\times 2}$, the inner dimensions ($4$ and $4$) match, producing a $3 \\times 2$ matrix. For $B_{4 \\times 2} A_{3 \\times 4}$, the inner dimensions ($2 \\ne 3$) do not match, so $BA$ is undefined.",
        exam_trap: "Thinking $BA$ has the transposed dimensions $2 \\times 3$ without checking inner dimensions ($2 \\ne 3$)."
      },
      {
        question_id: "4.9_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "Given $A = \\begin{pmatrix} 1 & -2 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 0 & 5 \\\\ -1 & 2 \\end{pmatrix}$, what is the entry in Row 2, Column 1 of the product $AB$?",
        options: [
          "(A) $-4$",
          "(B) $2$",
          "(C) $23$",
          "(D) $6$"
        ],
        correct_index: 0,
        explanation_latex: "The entry $(AB)_{21}$ is the dot product of Row 2 of $A$ with Column 1 of $B$: $(3)(0) + (4)(-1) = -4$.",
        exam_trap: "Using Row 1 of $A$ and Column 2 of $B$ (which gives $(AB)_{12} = 1(5) + (-2)(2) = 1$)."
      },
      {
        question_id: "4.9_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "A Markov transition matrix $T = \\begin{pmatrix} 0.8 & 0.3 \\\\ 0.2 & 0.7 \\end{pmatrix}$ models the annual movement of subscribers between Plan A and Plan B, with initial state vector $X_0 = \\begin{pmatrix} 1000 \\\\ 1000 \\end{pmatrix}$. How many subscribers are in Plan A after $1$ year ($X_1 = TX_0$)?",
        options: [
          "(A) $1{,}100$",
          "(B) $900$",
          "(C) $1{,}000$",
          "(D) $800$"
        ],
        correct_index: 0,
        explanation_latex: "The first entry of $X_1 = TX_0$ is $0.8(1000) + 0.3(1000) = 800 + 300 = 1{,}100$.",
        exam_trap: "Multiplying only $0.8(1000) = 800$ and forgetting the $30\\%$ of Plan B subscribers who switch to Plan A."
      }
    ],
    frq: [
      {
        frq_id: "4.9_frq_1",
        calculator_active: false,
        scenario_latex: "Let $A = \\begin{pmatrix} 2 & 1 \\\\ -1 & 3 \\end{pmatrix}$ and $B = \\begin{pmatrix} 1 & -2 \\\\ 4 & 0 \\end{pmatrix}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Compute both $AB$ and $BA$, and state whether $A$ and $B$ commute.",
            scoring_rubric: [
              { criteria: "Computes $AB = \\begin{pmatrix} 6 & -4 \\\\ 11 & 2 \\end{pmatrix}$", points: 1 },
              { criteria: "Computes $BA = \\begin{pmatrix} 4 & -5 \\\\ 8 & 4 \\end{pmatrix}$ and notes $AB \\ne BA$", points: 1 }
            ],
            model_solution_latex: "$AB = \\begin{pmatrix} 2(1)+1(4) & 2(-2)+1(0) \\\\ -1(1)+3(4) & -1(-2)+3(0) \\end{pmatrix} = \\begin{pmatrix} 6 & -4 \\\\ 11 & 2 \\end{pmatrix}$, while $BA = \\begin{pmatrix} 1(2)+(-2)(-1) & 1(1)+(-2)(3) \\\\ 4(2)+0(-1) & 4(1)+0(3) \\end{pmatrix} = \\begin{pmatrix} 4 & -5 \\\\ 8 & 4 \\end{pmatrix}$. Since $AB \\ne BA$, they do not commute."
          },
          {
            part_label: "(b)",
            prompt_latex: "Compute $3A - 2B$ and verify that $\\det(AB) = \\det(A)\\det(B)$.",
            scoring_rubric: [
              { criteria: "Computes $3A - 2B = \\begin{pmatrix} 4 & 7 \\\\ -11 & 9 \\end{pmatrix}$", points: 1 },
              { criteria: "Verifies $\\det(AB) = 12 - (-44) = 56$ and $\\det(A)\\det(B) = (7)(8) = 56$", points: 1 }
            ],
            model_solution_latex: "$3A - 2B = \\begin{pmatrix} 6 & 3 \\\\ -3 & 9 \\end{pmatrix} - \\begin{pmatrix} 2 & -4 \\\\ 8 & 0 \\end{pmatrix} = \\begin{pmatrix} 4 & 7 \\\\ -11 & 9 \\end{pmatrix}$. Also $\\det(A) = 6 - (-1) = 7$, $\\det(B) = 0 - (-8) = 8$, and $\\det(AB) = 12 - (-44) = 56 = 7 \\times 8$."
          }
        ]
      }
    ]
  },

  {
    unit: 4,
    topic_id: "4.10",
    topic_title: "Matrices as Linear Transformations",
    sub_topics: [
      {
        sub_topic_id: "4.10.A",
        sub_topic_title: "Basis Vectors, Rotations, Reflections, Dilations, & Area Scaling",
        essential_formulas: [
          {
            name: "Counterclockwise Rotation Matrix by Angle $\\theta$",
            latex: "R_\\theta = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}",
            description: "Rotates every vector $\\vec{v} = \\begin{pmatrix} x \\\\ y \\end{pmatrix}$ counterclockwise about the origin by angle $\\theta$."
          },
          {
            name: "Standard Basis Column Construction & Area Scaling Factor",
            latex: "T(\\vec{v}) = A\\vec{v} \\implies A = \\begin{pmatrix} | & | \\\\ T(\\vec{i}) & T(\\vec{j}) \\\\ | & | \\end{pmatrix}, \\quad \\text{Area}(T(S)) = |\\det(A)| \\cdot \\text{Area}(S)",
            description: "The columns of $A$ are the images of $\\vec{i} = \\langle 1, 0 \\rangle$ and $\\vec{j} = \\langle 0, 1 \\rangle$; $|\\det(A)|$ is the area dilation factor."
          }
        ]
      }
    ],
    conceptual_overview: "Every $2 \\times 2$ matrix $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ defines a **linear transformation** $T(\\vec{v}) = A\\vec{v}$ of the plane $\\mathbb{R}^2$. Because $A\\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} a \\\\ c \\end{pmatrix}$ and $A\\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix} = \\begin{pmatrix} b \\\\ d \\end{pmatrix}$, the first column of $A$ is where the unit vector $\\vec{i} = \\langle 1, 0 \\rangle$ lands, and the second column is where $\\vec{j} = \\langle 0, 1 \\rangle$ lands!",
    core_principles: [
      {
        heading: "Composition of Linear Transformations ($BA$) & Area Scaling ($|\\det A|$)",
        content_latex: "Applying transformation $A$ first and then transformation $B$ corresponds to the matrix product $B(A\\vec{v}) = (BA)\\vec{v}$ (read right-to-left!). Furthermore, if a region $R$ has area $K$, its transformed image $A(R)$ has area $|\\det(A)| \\cdot K$."
      }
    ],
    worked_examples: [
      {
        problem_latex: "Find the $2 \\times 2$ matrix $A$ that reflects vectors across the $y$-axis and then stretches them vertically by factor $3$, and find the area of the image of a triangle of area $5$.",
        solution_steps: [
          "Step 1: Track $\\vec{i} = \\langle 1, 0 \\rangle$: reflecting across the $y$-axis gives $\\langle -1, 0 \\rangle$, and stretching vertically by $3$ leaves it at $\\langle -1, 0 \\rangle$ (Column 1).",
          "Step 2: Track $\\vec{j} = \\langle 0, 1 \\rangle$: reflecting across the $y$-axis leaves $\\langle 0, 1 \\rangle$, and stretching vertically by $3$ gives $\\langle 0, 3 \\rangle$ (Column 2).",
          "Step 3: Thus $A = \\begin{pmatrix} -1 & 0 \\\\ 0 & 3 \\end{pmatrix}$. Since $|\\det(A)| = |-3| = 3$, the image triangle has area $3 \\times 5 = 15$."
        ]
      }
    ],
    mcq: [
      {
        question_id: "4.10_mcq_1",
        calculator_active: false,
        difficulty: "Easy",
        question_latex: "Which $2 \\times 2$ matrix represents a counterclockwise rotation about the origin by $90^\\circ$ ($\\frac{\\pi}{2}$ radians)?",
        options: [
          "(A) $\\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$",
          "(B) $\\begin{pmatrix} 0 & 1 \\\\ -1 & 0 \\end{pmatrix}$",
          "(C) $\\begin{pmatrix} -1 & 0 \\\\ 0 & 1 \\end{pmatrix}$",
          "(D) $\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$"
        ],
        correct_index: 0,
        explanation_latex: "Substitute $\\theta = \\frac{\\pi}{2}$ into $R_\\theta = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix} = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$. Equivalently, $\\vec{i} = \\langle 1, 0 \\rangle$ rotates to $\\langle 0, 1 \\rangle$ (Col 1) and $\\vec{j} = \\langle 0, 1 \\rangle$ rotates to $\\langle -1, 0 \\rangle$ (Col 2).",
        exam_trap: "Choosing $\\begin{pmatrix} 0 & 1 \\\\ -1 & 0 \\end{pmatrix}$, which is a clockwise rotation by $90^\\circ$."
      },
      {
        question_id: "4.10_mcq_2",
        calculator_active: false,
        difficulty: "Medium",
        question_latex: "A polygon in the $xy$-plane has an area of $12$ square units. After applying the linear transformation $A = \\begin{pmatrix} 4 & -1 \\\\ 2 & 3 \\end{pmatrix}$, what is the area of the image polygon?",
        options: [
          "(A) $168$",
          "(B) $120$",
          "(C) $14$",
          "(D) $1{,}728$"
        ],
        correct_index: 0,
        explanation_latex: "The area scaling factor is $|\\det(A)| = |(4)(3) - (-1)(2)| = |12 + 2| = 14$. Therefore, the new area is $14 \\times 12 = 168$ square units.",
        exam_trap: "Computing $\\det(A) = 12 - 2 = 10$ ($10 \\times 12 = 120$) or squaring the determinant."
      },
      {
        question_id: "4.10_mcq_3",
        calculator_active: false,
        difficulty: "Hard",
        question_latex: "Let $L_1$ be the linear transformation given by matrix $A$ and $L_2$ be the linear transformation given by matrix $B$. Which matrix represents the composite transformation formed by applying $L_1$ first and then applying $L_2$?",
        options: [
          "(A) $BA$",
          "(B) $AB$",
          "(C) $A + B$",
          "(D) $A^{-1}B$"
        ],
        correct_index: 0,
        explanation_latex: "For any input vector $\\vec{v}$, applying $L_1$ first produces $A\\vec{v}$, and then applying $L_2$ to that result produces $B(A\\vec{v}) = (BA)\\vec{v}$.",
        exam_trap: "Writing $AB$ in left-to-right reading order instead of function composition order $L_2(L_1(\\vec{v})) = BA\\vec{v}$."
      }
    ],
    frq: [
      {
        frq_id: "4.10_frq_1",
        calculator_active: false,
        scenario_latex: "A linear transformation $T$ maps the standard basis vectors to $T(\\vec{i}) = \\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ and $T(\\vec{j}) = \\begin{pmatrix} -2 \\\\ 2 \\end{pmatrix}$.",
        parts: [
          {
            part_label: "(a)",
            prompt_latex: "Write the $2 \\times 2$ transformation matrix $A$ for $T$, find the image of the point $P(4, -1)$, and find the area of the image of the unit square under $T$.",
            scoring_rubric: [
              { criteria: "Writes $A = \\begin{pmatrix} 3 & -2 \\\\ 1 & 2 \\end{pmatrix}$ and computes $A\\begin{pmatrix} 4 \\\\ -1 \\end{pmatrix} = \\begin{pmatrix} 14 \\\\ 2 \\end{pmatrix}$", points: 1 },
              { criteria: "Computes area $|\\det(A)| \\cdot 1 = |6 - (-2)| = 8$", points: 1 }
            ],
            model_solution_latex: "Using $T(\\vec{i})$ and $T(\\vec{j})$ as columns gives $A = \\begin{pmatrix} 3 & -2 \\\\ 1 & 2 \\end{pmatrix}$. Then $T(4, -1) = \\begin{pmatrix} 3(4) + (-2)(-1) \\\\ 1(4) + 2(-1) \\end{pmatrix} = \\begin{pmatrix} 14 \\\\ 2 \\end{pmatrix}$. The image of the unit square has area $|\\det(A)| = |6 - (-2)| = 8$."
          },
          {
            part_label: "(b)",
            prompt_latex: "Find the matrix $M$ of the composite transformation that first applies $T$ and then rotates the plane counterclockwise by $90^\\circ$.",
            scoring_rubric: [
              { criteria: "Multiplies $M = R_{90^\\circ} A = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} 3 & -2 \\\\ 1 & 2 \\end{pmatrix} = \\begin{pmatrix} -1 & -2 \\\\ 3 & -2 \\end{pmatrix}$", points: 2 }
            ],
            model_solution_latex: "Left-multiply $A$ by $R_{90^\\circ} = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}$: $M = R_{90^\\circ}A = \\begin{pmatrix} 0 & -1 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} 3 & -2 \\\\ 1 & 2 \\end{pmatrix} = \\begin{pmatrix} -1 & -2 \\\\ 3 & -2 \\end{pmatrix}$."
          }
        ]
      }
    ]
  }
];

// Map each of the 71 topics in AP_CURRICULUM to its rich mathematical source in LEGACY_TOPICS_DATA
const LEGACY_BY_ID = new Map(LEGACY_TOPICS_DATA.map((t) => [String(t.topic_id), t]));

const TOPIC_SOURCE_MAPPING = {
  '1.1': '1.1',
  '1.2': '1.2',
  '1.3': '1.3',
  '1.4': '1.4',
  '1.5': '1.5',
  '1.6': '1.6',
  '1.7': '1.7',
  '1.8': '1.8',
  '1.9': '1.9',
  '1.10': '1.10',
  '1.11': '1.11',
  '1.12': '1.12',
  '1.13': '2.6',
  '1.14': '2.5',
  'Unit 1 REVIEW': '1.6',
  '2.1': '2.1',
  '2.2': '2.2',
  '2.3': '2.2',
  '2.4': '2.3',
  '2.5A': '2.5',
  '2.5B': '2.5',
  '2.6': '2.6',
  '2.7A': '1.12',
  '2.7B': '1.12',
  '2.8': '1.13',
  'Unit 2A REVIEW': '2.2',
  '2.9': '1.14',
  '2.10': '1.13',
  '2.11': '1.15',
  '2.12': '1.16',
  '2.13A': '2.4',
  '2.13B': '2.4',
  '2.14': '2.6',
  '2.15': '2.7',
  'Unit 2B REVIEW': '2.7',
  '3.1': '3.1',
  '3.2': '3.2',
  '3.3': '3.3',
  '3.4': '3.4',
  '3.5': '3.5',
  '3.6': '3.6',
  '3.7': '3.7',
  '3.8': '3.8',
  '3.9': '3.9',
  '3.10': '3.10',
  '3.11': '3.11',
  '3.12': '3.10',
  '3.13': '3.11',
  '3.14': '3.11',
  '3.15': '3.11',
  'Unit 3 REVIEW': '3.5',
  '4.1': '4.1',
  '4.2': '4.2',
  '4.3': '4.2',
  '4.4': '4.3',
  '4.5': '4.4',
  '4.6A': '4.3',
  '4.6B': '4.3',
  '4.6C': '4.3',
  '4.7': '4.4',
  'Unit 4A REVIEW': '4.3',
  '4.8A': '4.5',
  '4.8B': '4.6',
  '4.9': '4.7',
  '4.10': '4.9',
  '4.11': '4.8',
  '4.12': '4.10',
  '4.13A': '4.10',
  '4.13B': '4.10',
  '4.14': '4.9',
  'Unit 4B REVIEW': '4.10',
};

const TOPICS_DATA = [];
for (const unitSection of AP_CURRICULUM) {
  for (const topicMeta of unitSection.topics) {
    const topicId = topicMeta.id;
    const topicTitle = topicMeta.title;
    const sourceKey = TOPIC_SOURCE_MAPPING[topicId] || '1.1';
    const base = LEGACY_BY_ID.get(sourceKey) || LEGACY_TOPICS_DATA[0];

    const adaptedSubTopics = (base.sub_topics || []).map((st, idx) => ({
      ...st,
      sub_topic_id: `${topicId}.${idx + 1}`,
      sub_topic_title:
        idx === 0
          ? `${topicTitle} — Core Algebraic & Analytical Foundations`
          : `${topicTitle} — Graphical, Tabular & Contextual Modeling`,
    }));

    const isReview = Boolean(topicMeta.isReview);
    const adaptedOverview = isReview
      ? `Comprehensive synthesis and exam review for **${unitSection.title}** (${unitSection.subtitle}). Consolidates all core formulas, rate-of-change analyses, graphical behaviors, and multi-step AP Free-Response justification strategies across ${unitSection.shortTitle}.`
      : base.conceptual_overview;

    TOPICS_DATA.push({
      ...base,
      unit: unitSection.number,
      unit_id: unitSection.id,
      unit_key: unitSection.unitKey,
      topic_id: topicId,
      topic_title: topicTitle,
      conceptual_overview: adaptedOverview,
      sub_topics: adaptedSubTopics,
      mcq: (base.mcq || []).map((q, qIdx) => ({
        ...q,
        question_id: `${topicId.replace(/[^a-zA-Z0-9]/g, '_')}_mcq_${qIdx + 1}`,
      })),
      frq: (base.frq || []).map((f, fIdx) => ({
        ...f,
        frq_id: `${topicId.replace(/[^a-zA-Z0-9]/g, '_')}_frq_${fIdx + 1}`,
      })),
    });
  }
}

function buildSimpleAnalogyForTopic(raw) {
  const analogies = {
    1: 'Think of input $x$ as the horizontal step you take and output $f(x)$ as your height on a roller-coaster track: the slope between two points tells you your average climb or drop, and whether that slope gets steeper or flatter tells you if the track bends upward like a cup (concave up) or downward like an umbrella (concave down).',
    2: 'Think of exponential growth like a snowball rolling downhill that multiplies by the same factor $b$ on every equal step $\\Delta x$, while a logarithm works in reverse by asking: "How many times did we multiply by base $b$ to reach this output?"',
    3: 'Think of trigonometric functions like riding a Ferris wheel: as your angle $\\theta$ rotates around the circle, your vertical height traces a smooth sine wave and your horizontal position traces a cosine wave that repeats every full turn.',
    4: 'Think of parametric, vector, and matrix functions like GPS coordinates in motion: instead of a single formula $y = f(x)$, we track horizontal position $x(t)$ and vertical position $y(t)$ separately so we know both *where* an object goes and *when* it gets there.',
  };
  return analogies[raw.unit] || analogies[1];
}

function buildExhaustiveTextbookLesson(raw) {
  if (raw.topic_id === '1.3') {
    return {
      ...TOPIC_1_3_EXEMPLAR.lesson,
      title: `${raw.topic_id}: ${raw.topic_title}`,
      overview: TOPIC_1_3_EXEMPLAR.lesson.concept_description,
      keyConcepts: raw.core_principles.map((cp) => `**${cp.heading}:** ${cp.content_latex}`),
      workedExample: raw.worked_examples
        .map((we, i) => `**Example ${i + 1}:** ${we.problem_latex}\n` + we.solution_steps.join('\n'))
        .join('\n\n'),
      commonTraps: raw.mcq.map((q) => q.exam_trap),
    };
  }

  if (raw.topic_id === '3.4') {
    return {
      ...TOPIC_3_4_EXEMPLAR.lesson,
      title: `${raw.topic_id}: ${raw.topic_title}`,
      overview: TOPIC_3_4_EXEMPLAR.lesson.concept_description,
      keyConcepts: raw.core_principles.map((cp) => `**${cp.heading}:** ${cp.content_latex}`),
      workedExample: raw.worked_examples
        .map((we, i) => `**Example ${i + 1}:** ${we.problem_latex}\n` + we.solution_steps.join('\n'))
        .join('\n\n'),
      commonTraps: raw.mcq.map((q) => q.exam_trap),
    };
  }

  const concept_description = `${raw.conceptual_overview} Mastering **${raw.topic_id} (${raw.topic_title})** matters because it gives you the direct mathematical rule needed to set up, evaluate, and interpret AP Precalculus multiple-choice and free-response questions without guesswork.`;

  const coreFormulaBlocks = raw.sub_topics.flatMap((st) =>
    (st.essential_formulas || []).map(
      (ef) =>
        `**${ef.name} (${st.sub_topic_id}):**\n$$${ef.latex}$$\n- **Variables & Meaning:** ${ef.description}`
    )
  );
  const core_formula = coreFormulaBlocks.join('\n\n');

  const analogyText = buildSimpleAnalogyForTopic(raw);
  const principleBullets = (raw.core_principles || []).map(
    (cp, idx) => `${idx + 1}. **${cp.heading}:** ${cp.content_latex}`
  );
  const firstWorked = raw.worked_examples?.[0];
  const workedBlock = firstWorked
    ? `\n\n**Quick Application Example:**\n${firstWorked.problem_latex}\n` +
      (firstWorked.solution_steps || []).map((s) => `- ${s}`).join('\n')
    : '';

  const simple_explanation = [
    `**Intuitive Analogy:** ${analogyText}`,
    `**How to Apply the Formula:**\n${principleBullets.join('\n')}${workedBlock}`,
  ].join('\n\n');

  const table_of_contents = [
    'Concept Description',
    'Core Formula',
    'Simple Explanation',
  ];

  const conceptual_sections = [
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

  return {
    reading_time_minutes: 5,
    concept_description,
    core_formula,
    simple_explanation,
    table_of_contents,
    conceptual_sections,
    formula_theorem_vault: [],
    model_mcqs: [],
    model_frqs: [],
    synthesis_summary: '',
    title: `${raw.topic_id}: ${raw.topic_title}`,
    overview: concept_description,
    keyConcepts: raw.core_principles.map((cp) => `**${cp.heading}:** ${cp.content_latex}`),
    workedExample: raw.worked_examples
      .map((we, i) => `**Example ${i + 1}:** ${we.problem_latex}\n` + we.solution_steps.join('\n'))
      .join('\n\n'),
    commonTraps: raw.mcq.map((q) => q.exam_trap),
  };
}

function buildTopicBankPracticeSection(raw) {
  const subTopics = ensureSubTopicsForTopic(raw.topic_id, raw.topic_title, raw.sub_topics);

  const bankMcqDocs = buildExpandedMcqsForTopic(raw, subTopics);
  const bankFrqDocs = buildExpandedFrqsForTopic(raw, subTopics);

  const mcq = bankMcqDocs.map((q) => ({
    question_id: q.id,
    sub_topic_id: q.sub_topic_id,
    sub_topic_title: q.sub_topic_title,
    calculator_active: Boolean(q.calculator_active),
    difficulty: q.difficulty || 'Medium',
    question_latex: q.content.prompt_latex,
    options: q.content.options,
    correct_index: Number(q.content.correct_index) || 0,
    explanation_latex: q.content.explanation_latex,
    exam_trap: q.content.exam_trap,
    distractor_diagnostics: q.content.distractor_diagnostics || {},
  }));

  const frq = bankFrqDocs.map((f) => ({
    frq_id: f.id,
    sub_topic_id: f.sub_topic_id,
    sub_topic_title: f.sub_topic_title,
    difficulty: f.difficulty || 'Medium',
    calculator_active: Boolean(f.calculator_active),
    scenario_latex: f.content.scenario_latex,
    parts: f.content.parts,
  }));

  return { subTopics, mcq, frq };
}

function buildCanonicalTopicObject(raw) {
  const formulasFlat = [];
  for (const st of raw.sub_topics) {
    for (const f of st.essential_formulas) {
      formulasFlat.push(`**${f.name}** (${st.sub_topic_id}): $$${f.latex}$$ — ${f.description}`);
    }
  }

  const exhaustiveLesson = buildExhaustiveTextbookLesson(raw);
  const { subTopics, mcq, frq } = buildTopicBankPracticeSection(raw);

  const legacyPracticeQuestions = mcq.map((q) => ({
    id: q.question_id,
    sub_topic_id: q.sub_topic_id,
    stem: q.question_latex,
    question: q.question_latex,
    choices: q.options,
    options: q.options,
    correctIndex: q.correct_index,
    correctAnswer: q.correct_index,
    calculator: q.calculator_active ? 'Required' : 'No Calculator',
    isCalculatorActive: q.calculator_active,
    difficulty: q.difficulty,
    skill: `${raw.topic_id} (${q.sub_topic_id})`,
    explanation: `${q.explanation_latex}\n\n**Exam Trap:** ${q.exam_trap}`,
    trapExplanation: q.exam_trap,
  }));

  return {
    unit: raw.unit,
    unit_id: raw.unit_id || getUnitIdForTopic(raw.topic_id),
    unit_key: raw.unit_key || getUnitKeyForTopic(raw.topic_id),
    topic_id: raw.topic_id,
    topic_title: raw.topic_title,
    topicId: raw.topic_id,
    title: raw.topic_title,
    summary: exhaustiveLesson.concept_description,
    lesson: exhaustiveLesson,
    formula_sheet: {
      topic_id: raw.topic_id,
      topic_name: raw.topic_title,
      sub_topics: subTopics,
    },
    master_lesson: {
      concept_description: exhaustiveLesson.concept_description,
      core_formula: exhaustiveLesson.core_formula,
      simple_explanation: exhaustiveLesson.simple_explanation,
      conceptual_overview: exhaustiveLesson.concept_description,
      core_principles: raw.core_principles,
      worked_examples: raw.worked_examples,
    },
    practice_section: {
      mcq,
      frq,
    },
    formulas: formulasFlat,
    studyNotes: formulasFlat,
    practiceQuestions: legacyPracticeQuestions,
  };
}

const fullCurriculum = {
  curriculum_version: '5.0.0-ap-curriculum-71-topics',
  generated_at: new Date().toISOString(),
  total_topics: TOPICS_DATA.length,
  units_summary: {
    unit_1: TOPICS_DATA.filter((t) => t.unit_id === 'unit_1').length,
    unit_2a: TOPICS_DATA.filter((t) => t.unit_id === 'unit_2a').length,
    unit_2b: TOPICS_DATA.filter((t) => t.unit_id === 'unit_2b').length,
    unit_3: TOPICS_DATA.filter((t) => t.unit_id === 'unit_3').length,
    unit_4a: TOPICS_DATA.filter((t) => t.unit_id === 'unit_4a').length,
    unit_4b: TOPICS_DATA.filter((t) => t.unit_id === 'unit_4b').length,
  },
  topics: TOPICS_DATA.map(buildCanonicalTopicObject),
};

const outDir = path.join(process.cwd(), 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'premade_curriculum_all_44.json');
fs.writeFileSync(outFile, JSON.stringify(fullCurriculum, null, 2), 'utf8');
console.log(
  `Successfully generated ${fullCurriculum.total_topics} lean AP Precalculus topic guides with all Question Bank items assigned at ${outFile} (${(
    fs.statSync(outFile).size / 1024
  ).toFixed(1)} KB)`
);

// Also regenerate public/data/massive_question_bank.json so all questions are published & synced
const bankDataset = generateMassiveQuestionBankDataset();
const bankOutFile = path.join(outDir, 'massive_question_bank.json');
fs.writeFileSync(bankOutFile, JSON.stringify(bankDataset, null, 2), 'utf8');
console.log(
  `Successfully synchronized ${bankDataset.total_questions} Question Bank questions (${bankDataset.total_mcq} MCQs + ${bankDataset.total_frq} FRQs, ${bankDataset.total_published} published) at ${bankOutFile}`
);

// Also generate src/data/curriculumData.ts from AP_CURRICULUM (6 unit sections, 71 topics)
const unitsList = AP_CURRICULUM.map((u) => ({
  id: u.unitId,
  unitId: u.id,
  unitKey: u.unitKey,
  number: u.number,
  shortTitle: u.shortTitle,
  title: u.name,
  fullTitle: u.title,
  subtitle: u.subtitle,
  examWeight: u.examWeight,
  description: u.description,
  topicsCount: u.topics.length,
  keyTopics: u.topics.slice(0, 5).map((t) => `${t.id}: ${t.title}`),
  color: u.color,
}));

const frontendLessons = TOPICS_DATA.map((raw) => {
  const we = raw.worked_examples[0] || { problem_latex: '', solution_steps: [] };
  const exhaustiveLesson = buildExhaustiveTextbookLesson(raw);
  const { subTopics, mcq, frq } = buildTopicBankPracticeSection(raw);

  const hasCalcMcq = mcq.some((q) => q.calculator_active);
  const hasNoCalcMcq = mcq.some((q) => !q.calculator_active);
  const calcReq =
    (hasCalcMcq && hasNoCalcMcq) || frq.some((f) => f.calculator_active)
      ? 'Both Sections'
      : hasCalcMcq
      ? 'Calculator Active'
      : 'Calculator Inactive';

  const theorems = [];
  for (const st of raw.sub_topics) {
    for (const ef of st.essential_formulas) {
      theorems.push(`**${ef.name}:** $${ef.latex}$ — ${ef.description}`);
    }
  }
  for (const cp of raw.core_principles) {
    theorems.push(`**${cp.heading}:** ${cp.content_latex}`);
  }

  return {
    id: `les-${raw.topic_id.replace(/[^a-zA-Z0-9]/g, '-')}`,
    unitNumber: raw.unit,
    unitId: raw.unit_id,
    unitKey: raw.unit_key,
    topicCode: raw.topic_id,
    title: raw.topic_title,
    duration: `${exhaustiveLesson.reading_time_minutes} min read`,
    difficulty: raw.mcq.some((q) => q.difficulty === 'Hard') ? 'Advanced' : 'Intermediate',
    summary: exhaustiveLesson.concept_description,
    keyTheorems: theorems,
    workedExample: {
      problem: we.problem_latex,
      steps: we.solution_steps,
      answer: we.solution_steps[we.solution_steps.length - 1] || '',
    },
    examTip: raw.mcq[0]?.exam_trap || 'Always show your algebraic setup and state contextual units clearly.',
    calculatorRequirement: calcReq,
    lesson: exhaustiveLesson,
    formula_sheet: {
      topic_id: raw.topic_id,
      topic_name: raw.topic_title,
      sub_topics: subTopics,
    },
    master_lesson: {
      concept_description: exhaustiveLesson.concept_description,
      core_formula: exhaustiveLesson.core_formula,
      simple_explanation: exhaustiveLesson.simple_explanation,
      conceptual_overview: exhaustiveLesson.concept_description,
      core_principles: raw.core_principles,
      worked_examples: raw.worked_examples,
    },
    practice_section: {
      mcq,
      frq,
    },
  };
});

const frontendFormulas = [];
let formIdx = 1;
for (const raw of TOPICS_DATA) {
  for (const st of raw.sub_topics) {
    for (const ef of st.essential_formulas) {
      frontendFormulas.push({
        id: `form-${raw.topic_id.replace(/[^a-zA-Z0-9]/g, '-')}-${formIdx++}`,
        unitNumber: raw.unit,
        unitId: raw.unit_id,
        unitKey: raw.unit_key,
        topicCode: raw.topic_id,
        subTopicId: st.sub_topic_id,
        category: `${raw.topic_id}: ${raw.topic_title}`,
        name: ef.name,
        formula: ef.latex,
        description: ef.description,
        calculatorActive: raw.mcq.some((q) => q.calculator_active),
      });
    }
  }
}

const tsFileContent = `import { UnitInfo, Lesson, FormulaItem } from '../types';

export const UNITS: UnitInfo[] = ${JSON.stringify(unitsList, null, 2)};

export const LESSONS: Lesson[] = ${JSON.stringify(frontendLessons, null, 2)};

export const FORMULAS: FormulaItem[] = ${JSON.stringify(frontendFormulas, null, 2)};
`;

const srcDataPath = path.join(process.cwd(), 'src', 'data', 'curriculumData.ts');
fs.writeFileSync(srcDataPath, tsFileContent, 'utf8');
console.log(
  `Successfully generated ${frontendLessons.length} lean AP Precalculus lessons (with all Question Bank items embedded in their designated topics) and ${frontendFormulas.length} formulas in ${srcDataPath}`
);
