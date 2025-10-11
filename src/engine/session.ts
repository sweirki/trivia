import { Question, shuffleArray } from "./question";
import { calculateScore } from "./scoring";

export type GameState = {
  currentIndex: number;
  score: number;
  streak: number;
  completed: boolean;
  questions: Question[];
};

export class TriviaSession {
  private state: GameState;

  constructor(questions: Question[]) {
    this.state = {
      currentIndex: 0,
      score: 0,
      streak: 0,
      completed: false,
      questions: shuffleArray(questions),
    };
  }

  get current() {
    return this.state.questions[this.state.currentIndex];
  }

  get progress() {
    return this.state.currentIndex + 1;
  }

  get total() {
    return this.state.questions.length;
  }

  answer(index: number, timeLeft: number) {
  const q = this.current;

  // ✅ Safety check — if no more questions, stop
  if (!q) {
    this.state.completed = true;
    return { isCorrect: false, gained: 0 };
  }

  const isCorrect = index === q.correctIndex;
  const gained = calculateScore(isCorrect, timeLeft, this.state.streak);

  if (isCorrect) this.state.streak++;
  else this.state.streak = 0;

  this.state.score += gained;
  this.state.currentIndex++;

  if (this.state.currentIndex >= this.state.questions.length)
    this.state.completed = true;

  return { isCorrect, gained };
}


  get summary() {
    return {
      total: this.state.questions.length,
      score: this.state.score,
      streak: this.state.streak,
    };
  }

  get isComplete() {
    return this.state.completed;
  }
}
