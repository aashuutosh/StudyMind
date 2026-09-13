import { useState, useCallback } from "react";
import { UploadCloud, FileText, Sparkles, X, Layers, Check, ArrowRight } from "lucide-react";

const ACCEPTED = {
  "application/pdf": { label: "PDF", color: "text-red-400 border-red-500/30 bg-red-500/10" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { label: "DOCX", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { label: "PPTX", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  "image/jpeg": { label: "JPG", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  "image/png": { label: "PNG", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  "image/webp": { label: "WEBP", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  "text/plain": { label: "TXT", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
};

const SUGGESTIONS = [
  "Operating Systems",
  "Data Structures & Algorithms",
  "Machine Learning",
  "Linear Algebra & Calculus",
  "Thermodynamics"
];

export default function FileUpload({ onAnalyze, onLoadSample, isLoading }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState("");

  const setF = (f) => {
    setError("");
    if (!f) return;
    if (!ACCEPTED[f.type]) {
      setError("Unsupported format. Please upload a PDF, DOCX, PPTX, image, or TXT file.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError("Maximum file limit is 25 MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    setF(e.dataTransfer.files[0]);
  }, []);

  const formatSize = (b) =>
    b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";

  return (
    <div className="space-y-5 animate-slide-up">
      {/* ── Drop Zone ── */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => document.getElementById("sm-file").click()}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 group ${
          dragging
            ? "border-indigo-400 bg-indigo-500/15 scale-[1.01] shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            : file
            ? "border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
            : "border-white/10 hover:border-indigo-500/40 bg-white/[0.02] hover:bg-white/[0.04]"
        }`}
      >
        <input
          id="sm-file"
          type="file"
          className="hidden"
          accept={Object.keys(ACCEPTED).join(",")}
          onChange={(e) => setF(e.target.files[0])}
        />

        {file ? (
          <div className="space-y-3 animate-fade-in py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white font-bold text-lg truncate max-w-sm mx-auto">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatSize(file.size)} • {ACCEPTED[file.type]?.label || "Document"}
              </p>
            </div>
            <button
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors pt-1"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X className="w-3.5 h-3.5" /> Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg tracking-tight">
                Drag &amp; drop lecture document
              </p>
              <p className="text-slate-400 text-sm mt-1">
                or <span className="text-indigo-400 underline underline-offset-4">browse from your computer</span>
              </p>
            </div>

            {/* Format Badges */}
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {["PDF", "DOCX", "PPTX", "Images", "TXT"].map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-semibold tracking-wide bg-white/5 text-slate-400 px-3 py-1 rounded-full border border-white/10"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ── Customization Controls ── */}
      <div className="glass-card p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-200">
              Subject or Course Specialization
            </label>
            <span className="text-xs text-slate-500">Personalize output</span>
          </div>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Operating Systems, Advanced Calculus, Biochemistry…"
            className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
          />

          {/* Quick Subject Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  subject === s
                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-medium"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15"
                }`}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count Pill Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-200">
              Target Quiz Length
            </label>
            <span className="text-xs text-slate-500">Multiple choice format</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[5, 7, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setQuestionCount(n)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  questionCount === n
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200 bg-white/[0.02]"
                }`}
              >
                {n} Questions
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action Buttons: Primary Analyze + Try Sample ── */}
      <div className="space-y-3 pt-1">
        <button
          onClick={() => onAnalyze(file, subject.trim(), questionCount)}
          disabled={!file || isLoading}
          className="btn-gradient w-full py-4 text-base flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
          <span>Synthesize Notes &amp; Generate Quiz</span>
          <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 1-Click Instant Demo Button for Judges */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative px-3 text-[11px] text-slate-500 uppercase tracking-widest bg-[#07070d]">
            or test instantly
          </span>
        </div>

        <button
          type="button"
          onClick={onLoadSample}
          className="btn-glass w-full justify-center py-3 text-xs text-indigo-300 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Try Live Sample: Operating Systems (Zero upload needed)
        </button>
      </div>
    </div>
  );
}
