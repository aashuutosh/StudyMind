import { useState, useEffect } from "react";
import { stripLatex } from "../utils/stripLatex.js";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Timer, Flame, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuizView({ quiz = [] }) {
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const q = quiz[cur];
  const total = quiz.length;
  const answered = cur in answers;
  const isLast = cur === total - 1;

  // Stopwatch timer
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [done]);

  const score = Object.entries(answers).filter(
    ([qi, ai]) => quiz[+qi].correctIndex === ai
  ).length;

  const pick = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswers((p) => ({ ...p, [cur]: idx }));

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      // Small celebratory burst on correct answer
      confetti({ particleCount: 25, spread: 40, origin: { y: 0.8 } });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (!isLast) {
      setCur((c) => c + 1);
      setSelected(answers[cur + 1] ?? null);
    } else {
      setDone(true);
      // Large celebratory fireworks on quiz finish if score >= 60%
      if (score / total >= 0.6) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  const prev = () => {
    if (cur > 0) {
      setCur((c) => c - 1);
      setSelected(answers[cur - 1] ?? null);
    }
  };

  const restart = () => {
    setCur(0);
    setSelected(null);
    setAnswers({});
    setDone(false);
    setStreak(0);
    setSeconds(0);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const optClass = (idx) => {
    if (!answered) {
      return "w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-indigo-500/10 hover:border-indigo-500/40 text-slate-200 transition-all font-medium text-sm md:text-base flex items-center justify-between";
    }
    if (idx === q.correctIndex) {
      return "w-full text-left p-4 rounded-xl border border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-medium text-sm md:text-base flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]";
    }
    if (idx === selected) {
      return "w-full text-left p-4 rounded-xl border border-red-500/60 bg-red-500/15 text-red-300 font-medium text-sm md:text-base flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.15)]";
    }
    return "w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.01] text-slate-500 font-normal text-sm md:text-base opacity-40 flex items-center justify-between";
  };

  /* ── Results Screen ── */
  if (done) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;

    return (
      <div className="glass-card p-8 text-center space-y-8 animate-slide-up max-w-2xl mx-auto border-indigo-500/30">
        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <div className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            {score} <span className="text-2xl text-slate-500 font-normal">/ {total}</span>
          </div>
          <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {pct}% Performance Score
          </p>
          <p className="text-sm text-slate-400 max-w-md mx-auto pt-1">
            {passed
              ? "Outstanding performance! You have grasped the key principles of this lecture."
              : "Good practice run! Review the explanations below to master these concepts."}
          </p>
        </div>

        {/* Stats Pill Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-slate-500 block">Time Spent</span>
            <span className="text-base font-bold text-slate-200">{formatTime(seconds)}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-slate-500 block">Accuracy</span>
            <span className="text-base font-bold text-indigo-400">{pct}%</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-slate-500 block">Best Streak</span>
            <span className="text-base font-bold text-amber-400">🔥 {bestStreak}</span>
          </div>
        </div>

        {/* Question Review List */}
        <div className="text-left space-y-3 pt-2 max-h-96 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Detailed Review
          </h4>
          {quiz.map((question, i) => {
            const isCorrect = answers[i] === question.correctIndex;
            return (
              <div
                key={i}
                className={`p-4 rounded-xl border text-sm transition-all ${
                  isCorrect
                    ? "border-emerald-500/20 bg-emerald-950/10"
                    : "border-red-500/20 bg-red-950/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="text-slate-200 font-medium">
                      Q{i + 1}. {stripLatex(question.question)}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-emerald-400 font-medium pt-1">
                        Correct: {stripLatex((question.options || [])[question.correctIndex])}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 leading-relaxed pt-1 italic">
                      💡 {stripLatex(question.explanation)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={restart}
          className="btn-gradient w-full flex items-center justify-center gap-2 py-4"
        >
          <RotateCcw className="w-4 h-4" /> Retake Practice Quiz
        </button>
      </div>
    );
  }

  /* ── Active Quiz Flow ── */
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-slide-up">
      {/* Quiz Top Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">
            Question {cur + 1} of {total}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Timer className="w-3.5 h-3.5 text-indigo-400" /> {formatTime(seconds)}
          </span>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1 font-bold text-amber-400 animate-bounce">
            <Flame className="w-4 h-4 fill-amber-400" /> {streak} Streak!
          </div>
        )}
      </div>

      {/* Progress Track */}
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${((cur + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex-shrink-0 mt-0.5">
            Q{cur + 1}
          </span>
          <h3 className="text-lg md:text-xl font-semibold text-white leading-relaxed">
            {stripLatex(q.question)}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {(q.options || []).map((opt, idx) => (
            <button
              key={idx}
              onClick={() => pick(idx)}
              className={optClass(idx)}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                  {["A", "B", "C", "D"][idx]}
                </span>
                <span>{stripLatex(opt.replace(/^[A-D]\)\s*/, ""))}</span>
              </div>
              {answered && idx === q.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />
              )}
              {answered && idx === selected && idx !== q.correctIndex && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 ml-2" />
              )}
            </button>
          ))}
        </div>

        {/* Answer Explanation Box */}
        {answered && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 animate-fade-in space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" /> Conceptual Explanation
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {stripLatex(q.explanation)}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          disabled={cur === 0}
          className="btn-glass flex-1 justify-center py-3 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={next}
          disabled={!answered}
          className="btn-gradient flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-40"
        >
          {isLast ? "Complete & See Score" : "Next Question"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
