import { useState } from "react";

export default function QuizView({ quiz }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const q = quiz[current];
  const totalQ = quiz.length;
  const isAnswered = current in answers;
  const isLast = current === totalQ - 1;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelected(idx);
    setAnswers((prev) => ({ ...prev, [current]: idx }));
  };

  const handleNext = () => {
    if (current < totalQ - 1) {
      setCurrent((c) => c + 1);
      setSelected(answers[current + 1] ?? null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers({});
    setShowResult(false);
  };

  const score = Object.entries(answers).filter(
    ([qi, ai]) => quiz[Number(qi)].correctIndex === ai
  ).length;

  const getOptionClass = (idx) => {
    if (!isAnswered) return "quiz-option";
    if (idx === q.correctIndex) return "quiz-option quiz-correct";
    if (idx === selected && idx !== q.correctIndex) return "quiz-option quiz-wrong";
    return "quiz-option quiz-reveal";
  };

  if (showResult) {
    const pct = Math.round((score / totalQ) * 100);
    const emoji =
      pct >= 80 ? "🏆" : pct >= 60 ? "📚" : pct >= 40 ? "💪" : "🔄";
    const message =
      pct >= 80
        ? "Excellent! You've mastered this material."
        : pct >= 60
        ? "Good job! Review the missed questions."
        : pct >= 40
        ? "Keep studying — you're getting there!"
        : "More review needed. Try again after re-reading the notes.";

    return (
      <div className="card p-8 text-center space-y-6 animate-slide-up">
        <div className="text-6xl">{emoji}</div>
        <div>
          <div className="text-5xl font-bold text-slate-100">
            {score}
            <span className="text-2xl text-slate-400 font-normal">/{totalQ}</span>
          </div>
          <div className="text-xl text-indigo-400 font-semibold mt-1">{pct}%</div>
        </div>

        {/* Score bar */}
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              pct >= 80
                ? "bg-emerald-500"
                : pct >= 60
                ? "bg-indigo-500"
                : pct >= 40
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-slate-400 text-sm">{message}</p>

        {/* Per-question review */}
        <div className="text-left space-y-3">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Review
          </h4>
          {quiz.map((question, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === question.correctIndex;
            return (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm border ${
                  isCorrect
                    ? "border-emerald-800 bg-emerald-950/30"
                    : "border-red-800 bg-red-950/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span>{isCorrect ? "✅" : "❌"}</span>
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium">{question.question}</p>
                    {!isCorrect && (
                      <p className="text-slate-400 text-xs mt-1">
                        ✓ {question.options[question.correctIndex]}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-1 italic">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={handleRestart} className="btn-primary w-full py-3">
          🔄 Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Question {current + 1} of {totalQ}</span>
          <span>
            {Object.keys(answers).length} answered
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / totalQ) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-start gap-3">
          <span className="text-indigo-400 font-bold text-lg flex-shrink-0">
            Q{current + 1}.
          </span>
          <p className="text-slate-100 text-base font-medium leading-relaxed">
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={getOptionClass(idx)}
            >
              <span className="flex items-start gap-3">
                <span className="font-bold text-slate-500 flex-shrink-0">
                  {["A", "B", "C", "D"][idx]}.
                </span>
                <span>{opt.replace(/^[A-D]\)\s*/, "")}</span>
                {isAnswered && idx === q.correctIndex && (
                  <span className="ml-auto flex-shrink-0">✅</span>
                )}
                {isAnswered && idx === selected && idx !== q.correctIndex && (
                  <span className="ml-auto flex-shrink-0">❌</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 animate-fade-in">
            <p className="text-xs font-semibold text-slate-400 mb-1">💡 Explanation</p>
            <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (current > 0) {
              setCurrent((c) => c - 1);
              setSelected(answers[current - 1] ?? null);
            }
          }}
          disabled={current === 0}
          className="btn-secondary flex-1 py-2.5 disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="btn-primary flex-1 py-2.5 disabled:opacity-40"
        >
          {isLast ? "See Results 🎯" : "Next →"}
        </button>
      </div>
    </div>
  );
}
