export type PickPayload = {
  question: number;
  picked: number | null;
  timeLeft: number;
};

export type AnswerRecord = {
  question: number;
  picked: number | null;
  correct: number;
  is_correct: boolean;
  points: number;
  time_left: number;
  choice_text: string | null;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_name: string;
  score: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  duration_sec: number | null;
  answers: AnswerRecord[];
  created_at: string;
};

export type LeaderboardEntry = {
  student_name: string;
  score: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  created_at: string;
};

export type QuestionStat = {
  quiz_id: string;
  question_num: number;
  total_attempts: number;
  correct_count: number;
  pct_correct: number;
};
