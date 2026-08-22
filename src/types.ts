export type GradeLevel = 'lop6_9' | 'lop10' | 'lop11' | 'lop12' | 'daihoc' | 'daichung';

export type LectureDuration = '15min' | '45min' | '90min' | 'project';

export type TeachingMethod = '5e_model' | 'stem_hands_on' | 'standard_theory' | 'interactive_discovery';

export type PhysicsBranch = 
  | 'mechanics' 
  | 'thermodynamics' 
  | 'electromagnetism' 
  | 'optics' 
  | 'waves_oscillations' 
  | 'quantum_nuclear' 
  | 'astrophysics';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PhysicsProblem {
  id: string;
  title: string;
  problemStatement: string;
  givenData: { symbol: string; value: string; unit: string; description: string }[];
  requiredToFind: string[];
  formulaList: string[];
  steps: {
    stepNumber: number;
    title: string;
    calculation: string;
    explanation: string;
  }[];
  finalAnswer: string;
}

export interface SlideContent {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  formulaLatex?: string;
  keyConcept: string;
  realWorldApplication?: string;
  presenterNotes: string;
  diagramDescription?: string;
  visualType?: 'diagram' | 'formula' | 'experiment' | 'summary';
}

export interface LessonActivity {
  id: string;
  phaseName: string; // e.g. "Khởi động (Engage)", "Khám phá (Explore)", "Hình thành kiến thức (Explain)", "Luyện tập (Elaborate)", "Đánh giá (Evaluate)"
  durationMinutes: number;
  teacherAction: string;
  studentAction: string;
  keyContent: string;
  pedagogicalTip: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  formula?: string;
  children?: MindMapNode[];
}

export interface SimulationConfig {
  type: 'projectile' | 'pendulum' | 'circuits' | 'optics_snell' | 'free_fall' | 'wave_interference';
  title: string;
  description: string;
  initialParams: {
    [key: string]: number;
  };
  paramLabels: {
    [key: string]: { label: string; min: number; max: number; step: number; unit: string };
  };
}

export interface PhysicsLesson {
  id: string;
  topic: string;
  subTopic?: string;
  gradeLevel: GradeLevel;
  duration: LectureDuration;
  method: TeachingMethod;
  branch: PhysicsBranch;
  createdAt: string;
  
  overview: {
    title: string;
    abstract: string;
    knowledgeObjectives: string[];
    skillObjectives: string[];
    attitudeObjectives: string[];
    prerequisites: string[];
    keyFormulas: { name: string; latex: string; explanation: string }[];
  };

  activities: LessonActivity[];
  slides: SlideContent[];
  simulation: SimulationConfig;
  quizzes: QuizQuestion[];
  problems: PhysicsProblem[];
  mindMap: MindMapNode;
  experimentalGuide: {
    title: string;
    toolsNeeded: string[];
    safetyPrecautions: string[];
    steps: string[];
    expectedPhenomenon: string;
    errorAnalysis: string;
  };
  summaryTakeaways: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
