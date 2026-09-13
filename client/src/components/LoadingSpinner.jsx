export default function LoadingSpinner() {
  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {["60%","100%","80%"].map((w, i) => (
        <div key={i} className="glass p-5 space-y-3">
          <div className="shimmer h-5 rounded-lg" style={{ width: w }} />
          <div className="space-y-2 pl-2">
            <div className="shimmer h-3.5 rounded w-full" />
            <div className="shimmer h-3.5 rounded w-5/6" />
            <div className="shimmer h-3.5 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
