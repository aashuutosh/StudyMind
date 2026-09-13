import { useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import NotesView from "./components/NotesView.jsx";
import QuizView from "./components/QuizView.jsx";
import ExportButton from "./components/ExportButton.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

export default function App() {
  const [state, setState] = useState("upload"); // upload | loading | result
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

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis failed. Please try again.");
      }

      setResult(json.data);
      setActiveTab("notes");
      setState("result");
    } catch (err) {
      setError(err.message);
      setState("upload");
    }
  };

  const handleReset = () => {
    setState("upload");
    setResult(null);
    setError("");
    setFilename("");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-600/30">
              🎓
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-none">
                StudyMind
              </h1>
              <p className="text-slate-500 text-xs">AI Student Workspace</p>
            </div>
          </div>

          {state === "result" && (
            <div className="flex items-center gap-3">
              <ExportButton data={result} />
              <button onClick={handleReset} className="btn-secondary">
                + New File
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Upload state */}
        {state === "upload" && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold text-slate-100">
                Turn lectures into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {" "}smart study notes
                </span>
              </h2>
              <p className="text-slate-400 text-lg">
                Upload any lecture material — get revision notes and a practice quiz instantly.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { icon: "📄", label: "PDF, DOCX, PPTX" },
                { icon: "✨", label: "Gemini AI powered" },
                { icon: "🎯", label: "Practice quiz" },
                { icon: "📥", label: "Export to PDF" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-sm text-slate-400"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="max-w-xl mx-auto flex items-center gap-2 bg-red-950/50 border border-red-800 rounded-xl px-5 py-3 text-red-400 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <FileUpload onAnalyze={handleAnalyze} isLoading={false} />
          </div>
        )}

        {/* Loading state */}
        {state === "loading" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Analyzing{" "}
                <span className="text-indigo-400 font-medium">{filename}</span>
              </p>
            </div>
            <LoadingSpinner />
          </div>
        )}

        {/* Result state */}
        {state === "result" && result && (
          <div className="space-y-6 animate-fade-in">
            {/* Document header */}
            <div className="card p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">
                    {result.subject}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-100 truncate">
                  {result.title}
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {result.notes.length} sections · {result.quiz.length} quiz questions
                  {result.keyTerms?.length ? ` · ${result.keyTerms.length} key terms` : ""}
                </p>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {[
                { id: "notes", label: "📝 Revision Notes" },
                { id: "quiz", label: `🎯 Practice Quiz (${result.quiz.length}Q)` },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === id ? "tab-active" : "tab-inactive"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === "notes" && <NotesView data={result} />}
              {activeTab === "quiz" && <QuizView quiz={result.quiz} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-600 text-xs border-t border-slate-800/40 mt-16">
        StudyMind · Powered by Gemini 2.5 Flash · Built for Prompt Wars 2026
      </footer>
    </div>
  );
}
