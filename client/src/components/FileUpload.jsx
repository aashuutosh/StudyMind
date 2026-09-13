import { useState, useCallback } from "react";

const ACCEPTED_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "text/plain": ".txt",
};

const FORMAT_ICONS = {
  "application/pdf": "📄",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "📊",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/webp": "🖼️",
  "text/plain": "📃",
};

export default function FileUpload({ onAnalyze, isLoading }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState("");

  const validateAndSet = (f) => {
    setError("");
    if (!f) return;
    if (!ACCEPTED_TYPES[f.type]) {
      setError("Unsupported format. Please upload PDF, DOCX, PPTX, image, or TXT.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File too large. Maximum size is 20MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    validateAndSet(dropped);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const handleSubmit = () => {
    if (!file) return;
    onAnalyze(file, subject.trim(), questionCount);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 animate-slide-up">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer group
          ${dragging
            ? "border-indigo-400 bg-indigo-950/40 scale-[1.01]"
            : file
            ? "border-indigo-600 bg-indigo-950/20"
            : "border-slate-700 hover:border-slate-500 bg-slate-900/50"
          }`}
        onClick={() => document.getElementById("file-input").click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={Object.keys(ACCEPTED_TYPES).join(",")}
          onChange={(e) => validateAndSet(e.target.files[0])}
        />

        {file ? (
          <div className="space-y-2 animate-fade-in">
            <div className="text-4xl">{FORMAT_ICONS[file.type] || "📎"}</div>
            <p className="text-slate-200 font-semibold text-lg truncate px-4">
              {file.name}
            </p>
            <p className="text-slate-500 text-sm">{formatSize(file.size)}</p>
            <button
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setError("");
              }}
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl group-hover:scale-110 transition-transform duration-200">
              📂
            </div>
            <div>
              <p className="text-slate-200 font-semibold text-lg">
                Drop your lecture file here
              </p>
              <p className="text-slate-500 text-sm mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {["PDF", "DOCX", "PPTX", "Image", "TXT"].map((fmt) => (
                <span
                  key={fmt}
                  className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Subject personalisation */}
      <div className="card p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Subject / Course{" "}
            <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Data Structures, Thermodynamics, Machine Learning..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Number of quiz questions
          </label>
          <div className="flex gap-2">
            {[5, 7, 10].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border
                  ${questionCount === n
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                  }`}
              >
                {n} Qs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Analyzing with Gemini AI...
          </>
        ) : (
          <>✨ Generate Notes & Quiz</>
        )}
      </button>
    </div>
  );
}
