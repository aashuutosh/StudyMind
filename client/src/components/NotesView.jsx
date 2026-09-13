import { useState } from "react";
import { stripLatex } from "../utils/stripLatex.js";
import {
  Search,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  ChevronDown,
  Clock,
  Layers,
  KeyRound
} from "lucide-react";

export default function NotesView({ data }) {
  const [open, setOpen] = useState(() => new Set((data.notes || []).map((_, i) => i)));
  const [search, setSearch] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cheatSheetMode, setCheatSheetMode] = useState(false);

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${data.title}. ${data.summary}. Key points: ${
        (data.notes || []).map((n) => `${n.heading}. ${(n.bullets || []).join(". ")}`).join(". ")
      }`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Copy Section
  const copySection = (section, index) => {
    const text = `${section.heading}\n${(section.bullets || []).map((b) => `• ${b}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Filter sections by search query
  const query = search.toLowerCase().trim();
  const filteredNotes = (data.notes || []).filter((section) => {
    if (!query) return true;
    const inHeading = (section.heading || "").toLowerCase().includes(query);
    const inBullets = (section.bullets || []).some((b) => b.toLowerCase().includes(query));
    return inHeading || inBullets;
  });

  // Calculate estimated reading time
  const totalWords = [
    data.summary || "",
    ...(data.notes || []).flatMap((n) => [n.heading, ...(n.bullets || [])])
  ].join(" ").split(/\s+/).length;
  const readMinutes = Math.max(1, Math.round(totalWords / 180));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ── Top Utility Bar ── */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search concepts or notes…"
            className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-500/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Audio Read-Aloud Button */}
          <button
            onClick={toggleSpeech}
            className={`btn-glass text-xs py-2 px-3.5 transition-all ${
              isSpeaking
                ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                : "hover:text-indigo-300"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-indigo-400 animate-pulse" /> Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-indigo-400" /> Listen to Audio
              </>
            )}
          </button>

          {/* Quick Cram / Cheat Sheet mode */}
          <button
            onClick={() => setCheatSheetMode(!cheatSheetMode)}
            className={`btn-glass text-xs py-2 px-3.5 ${
              cheatSheetMode
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "hover:text-purple-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            {cheatSheetMode ? "Standard View" : "Exam Cram View"}
          </button>
        </div>
      </div>

      {/* ── Overview Banner ── */}
      <div className="glass-card p-6 relative overflow-hidden group border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase">
                Executive Synthesis
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~{readMinutes} min read
              </span>
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-normal">
              {stripLatex(data.summary)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Notes Grid / Sections ── */}
      {cheatSheetMode ? (
        /* Cram Mode: Compact multi-column bullets */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((section, i) => (
            <div key={i} className="glass-card p-4 space-y-2 border-l-2 border-l-indigo-500">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <span>{section.emoji || "📌"}</span>
                  {stripLatex(section.heading)}
                </h4>
                <button
                  onClick={() => copySection(section, i)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <ul className="space-y-1.5 pl-2 text-xs text-slate-300">
                {(section.bullets || []).map((b, j) => (
                  <li key={j} className="list-disc list-inside leading-snug">
                    {stripLatex(b)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        /* Standard View: Rich expandable cards with copy and highlight */
        <div className="space-y-3.5">
          {filteredNotes.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-400">
              No matching notes found for "{search}".
            </div>
          ) : (
            filteredNotes.map((section, i) => {
              const isOpen = open.has(i);
              return (
                <div
                  key={i}
                  className="glass-card overflow-hidden transition-all duration-200 hover:border-white/20"
                >
                  <div
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl group-hover:scale-110 transition-transform">
                        {section.emoji || "📌"}
                      </span>
                      <h3 className="font-semibold text-slate-100 text-sm md:text-base group-hover:text-indigo-300 transition-colors">
                        {stripLatex(section.heading)}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {(section.bullets || []).length} insights
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copySection(section, i);
                        }}
                        title="Copy section"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-indigo-400" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 animate-fade-in">
                      <div className="space-y-3 pt-2">
                        {(section.bullets || []).map((bullet, j) => (
                          <div key={j} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                            <span className="leading-relaxed">{stripLatex(bullet)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Key Terms Glossary Grid ── */}
      {data.keyTerms?.length > 0 && (
        <div className="glass-card p-6 space-y-4 border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-transparent">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Core Vocabulary & Key Terms ({data.keyTerms.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {data.keyTerms.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <div className="font-semibold text-purple-300 text-sm group-hover:text-purple-200 transition-colors flex items-center gap-1.5">
                  <span className="text-xs">✦</span> {stripLatex(t.term)}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {stripLatex(t.definition)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
