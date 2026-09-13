export default function LoadingSpinner() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="card p-6 space-y-3">
        <div className="shimmer h-7 w-2/3 rounded-lg" />
        <div className="shimmer h-4 w-full rounded-lg" />
        <div className="shimmer h-4 w-4/5 rounded-lg" />
        <div className="shimmer h-4 w-3/5 rounded-lg" />
      </div>

      {/* Notes skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="shimmer h-5 w-1/3 rounded-lg" />
          <div className="space-y-2 pl-4">
            <div className="shimmer h-3.5 w-full rounded" />
            <div className="shimmer h-3.5 w-5/6 rounded" />
            <div className="shimmer h-3.5 w-4/5 rounded" />
          </div>
        </div>
      ))}

      {/* Status message */}
      <div className="flex items-center justify-center gap-3 text-slate-400 text-sm py-2">
        <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span>Gemini is reading your document and generating study content...</span>
      </div>
    </div>
  );
}
