import { useState, useEffect } from "react";
import { stripLatex } from "../utils/stripLatex.js";
import { RotateCw, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Sparkles, Shuffle } from "lucide-react";
import confetti from "canvas-confetti";

export default function FlashcardView({ data }) {
  // Combine keyTerms and note sections into flashcard decks
  const cards = [
    ...(data.keyTerms || []).map((t) => ({
      front: t.term,
      back: t.definition,
      tag: "Key Term",
      emoji: "🔑"
    })),
    ...(data.notes || []).map((n) => ({
      front: n.heading,
      back: (n.bullets || []).slice(0, 3).join("\n\n• "),
      tag: "Core Concept",
      emoji: n.emoji || "⚡"
    }))
  ];

  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
    setMastered(new Set());
  }, [data]);

  const current = deck[index] || { front: "No cards available", back: "", tag: "Notice", emoji: "ℹ️" };
  const isMastered = mastered.has(index);

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % deck.length);
    }, 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => {
      setIndex((i) => (i - 1 + deck.length) % deck.length);
    }, 150);
  };

  const toggleMastery = (markAsMastered) => {
    const next = new Set(mastered);
    if (markAsMastered) {
      next.add(index);
      if (next.size === deck.length) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      next.delete(index);
    }
    setMastered(next);
    handleNext();
  };

  const handleShuffle = () => {
    setFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setMastered(new Set());
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-slide-up">
      {/* Deck stats bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            Card {index + 1} of {deck.length}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-medium">
            {mastered.size} Mastered
          </span>
        </div>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle
        </button>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${((index + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer perspective-1000 h-80 w-full select-none group"
      >
        <div
          className={`relative w-full h-full duration-500 preserve-3d transition-transform ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden glass-card p-8 flex flex-col justify-between border border-white/10 group-hover:border-indigo-500/40 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> {current.tag}
              </span>
              <span className="text-2xl">{current.emoji}</span>
            </div>

            <div className="text-center my-auto px-4">
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                {stripLatex(current.front)}
              </h3>
              <p className="text-xs text-indigo-400/80 mt-4 flex items-center justify-center gap-1">
                <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: "6s" }} />
                Click card to flip definition
              </p>
            </div>

            <div className="text-center text-[11px] text-slate-500">
              [Spacebar] to flip • [← / →] Navigate
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-8 flex flex-col justify-between border border-purple-500/30 bg-purple-950/20 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] transition-all overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Explanation & Meaning
              </span>
              <span className="text-xl">💡</span>
            </div>

            <div className="my-auto py-2 text-slate-200 text-sm md:text-base leading-relaxed">
              <p className="whitespace-pre-line font-medium text-slate-100">
                {stripLatex(current.back)}
              </p>
            </div>

            <div className="text-center text-[11px] text-purple-400/70">
              Click again to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Mastery Controls */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => toggleMastery(false)}
          className="btn-glass justify-center hover:border-red-500/40 hover:bg-red-500/10 text-slate-300 hover:text-red-400 py-3"
        >
          <XCircle className="w-4 h-4 text-red-400" />
          Need Practice
        </button>
        <button
          onClick={() => toggleMastery(true)}
          className="btn-glass justify-center hover:border-emerald-500/40 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 py-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Mastered
        </button>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="btn-glass text-xs py-2 px-3 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous Card
        </button>
        <button
          onClick={handleNext}
          className="btn-glass text-xs py-2 px-3 hover:text-white"
        >
          Next Card <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
