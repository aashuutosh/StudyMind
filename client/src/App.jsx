import { useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import NotesView from "./components/NotesView.jsx";
import QuizView from "./components/QuizView.jsx";
import FlashcardView from "./components/FlashcardView.jsx";
import ExportButton from "./components/ExportButton.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { SAMPLE_DATA } from "./sampleData.js";
import {
  GraduationCap,
  Sparkles,
  Layers,
  BookOpen,
  BrainCircuit,
  FileCheck2,
  Plus,
  Zap,
  Activity,
  Award
} from "lucide-react";

export default function App() {
  const [state, setState] = useState("upload"); // 'upload' | 'loading' | 'result'
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("notes");
  const [filename, setFilename] = useState("");

  const handleAnalyze = async (file, subject, questionCount) => {
    setState("loading");
    setError("");
    setFilename(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", subject);
      formData.append("questionCount", String(questionCount));

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis failed.");
      }

      setResult(json.data);
      setActiveTab("notes");
      setState("result");
    } catch (err) {
      setError(err.message);
      setState("upload");
    }
  };

  const handleLoadSample = () => {
    setFilename("Sample: OS Concurrency & Virtual Memory.pdf");
    setResult(SAMPLE_DATA);
    setActiveTab("notes");
    setState("result");
  };

  const handleReset = () => {
    setState("upload");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-[#07070d] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* ── Background Glow Orbs & Grid ── */}
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#07070d]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.5)]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">StudyMind</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  v2.0
                </span>
              </div>
              <span className="text-slate-400 text-xs block leading-none">
                AI Student Productivity Workspace
              </span>
            </div>
          </div>

          {/* Engine Status & Result Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.7 Flash Engine</span>
            </div>

            {state === "result" && (
              <div className="flex items-center gap-2">
                <ExportButton data={result} />
                <button
                  onClick={handleReset}
                  className="btn-glass text-xs py-2 px-3 hover:text-white"
                  title="Upload another document"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New File</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 z-10">
        {/* ── STATE 1: UPLOAD & HERO ── */}
        {state === "upload" && (
          <div className="space-y-12 animate-slide-up">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Prompt Wars 2026 • Google for Developers × VIT Bhopal
              </div>

              <h1 className="text-4xl sm:text-6xl font-black leading-[1.1] tracking-tight text-white">
                Turn heavy lectures into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  effortless mastery.
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                One polished flow: Upload lecture slides or PDFs — receive structured revision notes, interactive 3D flashcards, and an exam-ready practice quiz in seconds.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { icon: BookOpen, title: "Structured Notes", desc: "Key topics & synthesis", color: "text-indigo-400" },
                { icon: Layers, title: "3D Flashcards", desc: "Interactive flip & review", color: "text-purple-400" },
                { icon: Award, title: "Practice Quiz", desc: "5-10 MCQs with reasoning", color: "text-pink-400" },
                { icon: FileCheck2, title: "Export Anywhere", desc: "High-res PDF & Markdown", color: "text-emerald-400" },
              ].map(({ icon: Icon, title, desc, color }, idx) => (
                <div key={idx} className="glass-card-hover p-4 text-center space-y-1.5">
                  <div className={`w-9 h-9 mx-auto rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">{title}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{desc}</div>
                </div>
              ))}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="max-w-xl mx-auto flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-400 text-sm animate-fade-in shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <span className="text-lg mt-0.5">⚠️</span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* File Upload Box */}
            <div className="max-w-xl mx-auto">
              <FileUpload
                onAnalyze={handleAnalyze}
                onLoadSample={handleLoadSample}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {/* ── STATE 2: LIVE SYNTHESIS LOADING SKELETON ── */}
        {state === "loading" && (
          <div className="space-y-8 animate-fade-in pt-8 max-w-2xl mx-auto text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(99,102,241,0.6)] animate-bounce">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Synthesizing Lecture Material…
              </h3>
              <p className="text-sm text-slate-400">
                Processing <span className="text-indigo-300 font-medium">{filename}</span> with Gemini 3.7 Multimodal Model
              </p>
            </div>

            <LoadingSpinner />
          </div>
        )}

        {/* ── STATE 3: RESULTS STUDY HUB ── */}
        {state === "result" && result && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Document Metadata Card */}
            <div className="glass-card p-6 border-indigo-500/30 relative overflow-hidden bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 uppercase tracking-wide">
                      {result.subject}
                    </span>
                    <span className="text-xs text-slate-500">
                      • Generated from lecture material
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                    {result.title}
                  </h2>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-400 gap-1 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  <span className="font-semibold text-slate-200">
                    {(result.notes || []).length} Sections
                  </span>
                  <span>{(result.quiz || []).length} Assessment Questions</span>
                  <span>{(result.keyTerms || []).length} Core Terms</span>
                </div>
              </div>
            </div>

            {/* Modern Tab Bar */}
            <div className="glass-card p-1.5 flex gap-1 rounded-2xl max-w-xl mx-auto border-white/10">
              {[
                { id: "notes", label: "Revision Notes", icon: BookOpen, count: (result.notes || []).length },
                { id: "flashcards", label: "3D Flashcards", icon: Layers, count: (result.keyTerms || []).length + (result.notes || []).length },
                { id: "quiz", label: "Practice Quiz", icon: Award, count: (result.quiz || []).length },
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === id
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === id ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Tab View */}
            <div className="pt-2">
              {activeTab === "notes" && <NotesView data={result} />}
              {activeTab === "flashcards" && <FlashcardView data={result} />}
              {activeTab === "quiz" && <QuizView quiz={result.quiz} />}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-xs mt-20 relative z-10">
        <p className="font-medium text-slate-400">
          StudyMind AI • Built for Prompt Wars 2026
        </p>
        <p className="text-slate-600 text-[11px] mt-1">
          Google for Developers × Hack2Skill × Android Club, VIT Bhopal
        </p>
      </footer>
    </div>
  );
}
