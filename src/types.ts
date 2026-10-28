export type UnitId = 'unit-1' | 'unit-2a' | 'unit-2b' | 'unit-3' | 'unit-4a' | 'unit-4b' | 'unit-2' | 'unit-4';
export type PageId = 'home' | 'lessons' | 'practice' | 'progress' | 'formulas' | 'checkout' | 'admin';


export interface UnitInfo {
  id: UnitId | string;
  unitId?: string;
  unitKey?: string;
  number: number;
  shortTitle?: string;
  title: string;
  fullTitle?: string;
  subtitle: string;
  examWeight: string;
  description: string;
  topicsCount: number;
  keyTopics: string[];
  color: string;
}

export interface EssentialFormula {
  name: string;
  latex: string;
  description: string;
  parameter_constraints?: string;
  algebraic_proof_latex?: string;
  derivation_walkthrough_latex?: string;
  conditions_when_it_works?: string;
  when_it_fails?: string;
}

export interface SubTopicFormulaSheet {
  sub_topic_id: string;
  sub_topic_title: string;
  essential_formulas: EssentialFormula[];
}

export interface CorePrinciple {
  heading: string;
  content_latex: string;
}

export interface WorkedExampleItem {
  problem_latex: string;
  solution_steps: string[];
}

export interface PracticeMcqItem {
  question_id: string;
  sub_topic_id?: string;
  sub_topic_title?: string;
  calculator_active: boolean;
  difficulty: string;
  question_latex: string;
  options: string[];
  correct_index: number;
  explanation_latex: string;
  exam_trap: string;
  distractor_diagnostics?: Record<string, string>;
}

export interface FrqRubricItem {
  criteria: string;
  points: number;
}

export interface PracticeFrqPart {
  part_label: string;
  prompt_latex: string;
  scoring_rubric: FrqRubricItem[];
  model_solution_latex: string;
  common_errors?: string;
}

export interface PracticeFrqItem {
  frq_id: string;
  sub_topic_id?: string;
  sub_topic_title?: string;
  difficulty?: string;
  calculator_active: boolean;
  scenario_latex: string;
  parts: PracticeFrqPart[];
}

export interface SubTopicConceptualFoundation {
  sub_topic_id: string;
  sub_topic_title: string;
  core_mechanism: string[];
  context_of_application: string;
}

export interface TopicConceptualFoundation {
  topic_id: string;
  topic_title: string;
  core_mechanism: string[];
  context_of_application: string;
  sub_topics: SubTopicConceptualFoundation[];
}

export interface ConceptualSection {
  section_id: string;
  title: string;
  body_markdown: string;
}

export interface FormulaTheoremVaultItem {
  theorem_id: string;
  sub_topic_id: string;
  sub_topic_title: string;
  title: string;
  latex: string;
  formal_definition: string;
  parameter_constraints?: string;
  algebraic_proof_latex?: string;
  derivation_walkthrough_latex?: string;
  conditions_when_it_works: string;
  when_it_fails: string;
}

export interface ModelMcqItem {
  model_id: string;
  calculator_active: boolean;
  difficulty: 'Foundational' | 'AP Standard' | 'Challenge' | string;
  prompt_latex: string;
  options: string[];
  correct_index: number;
  worked_solution_latex: string;
  distractor_breakdown: Record<string, string>;
  ap_exam_trap: string;
}

export interface ModelFrqRubricPoint {
  point: number;
  description: string;
}

export interface ModelFrqPart {
  part_label: string;
  prompt_latex: string;
  point_value: number;
  rubric: ModelFrqRubricPoint[];
  model_solution_latex: string;
  common_errors: string;
}

export interface ModelFrqItem {
  model_id: string;
  calculator_active: boolean;
  frq_type: string;
  scenario_latex: string;
  parts: ModelFrqPart[];
}

export interface ExhaustiveLesson {
  reading_time_minutes: number;
  table_of_contents: string[];
  concept_description?: string;
  core_formula?: string;
  simple_explanation?: string;
  conceptual_foundation?: TopicConceptualFoundation;
  conceptual_sections: ConceptualSection[];
  formula_theorem_vault: FormulaTheoremVaultItem[];
  model_mcqs: ModelMcqItem[];
  model_frqs: ModelFrqItem[];
  synthesis_summary: string;
  quick_takeaway_rules?: string[];
  title?: string;
  overview?: string;
  keyConcepts?: string[];
  workedExample?: string;
  commonTraps?: string[];
}

export interface Lesson {
  id: string;
  unitNumber: number;
  unitId?: string;
  unitKey?: string;
  topicCode: string;
  title: string;
  duration: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  summary: string;
  keyTheorems: string[];
  workedExample: {
    problem: string;
    steps: string[];
    answer: string;
  };
  examTip: string;
  calculatorRequirement: 'Calculator Inactive' | 'Calculator Active' | 'Both Sections';
  lesson?: ExhaustiveLesson;
  formula_sheet?: {
    topic_id: string;
    topic_name: string;
    sub_topics: SubTopicFormulaSheet[];
  };
  master_lesson?: {
    concept_description?: string;
    core_formula?: string;
    simple_explanation?: string;
    conceptual_overview: string;
    core_principles: CorePrinciple[];
    worked_examples: WorkedExampleItem[];
  };
  practice_section?: {
    mcq: PracticeMcqItem[];
    frq: PracticeFrqItem[];
  };
}

export interface FormulaItem {
  id: string;
  unitNumber: number;
  unitId?: string;
  unitKey?: string;
  topicCode?: string;
  subTopicId?: string;
  category: string;
  name: string;
  formula: string;
  description: string;
  parameterConstraints?: string;
  algebraicProofLatex?: string;
  derivationWalkthroughLatex?: string;
  conditions?: string;
  whenItFails?: string;
  calculatorActive: boolean;
}


