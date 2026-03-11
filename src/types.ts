export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Record {
  id: number;
  level: Level;
  score: number;
  correct_count: number;
  time_seconds: number;
  created_at: string;
}

export interface GameState {
  status: 'idle' | 'playing' | 'finished';
  level: Level;
  questions: Question[];
  currentQuestionIndex: number;
  answers: string[];
  startTime: number | null;
  endTime: number | null;
}

export interface Question {
  hour: number;
  minute: number;
}
