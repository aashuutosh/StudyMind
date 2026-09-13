import { useState } from "react";

export default function NotesView({ data }) {
  const [expandedSections, setExpandedSections] = useState(
    () => new Set(data.notes.map((_, i) => i))
  );

  const toggleSection = (i) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Overview card */}
      <div className="card p-6 border-l-4 border-l-indigo-500">
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5">📋</div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              Overview
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Notes sections */}
      {data.notes.map((section, i) => (
        <div key={i} className="card overflow-hidden transition-all duration-200">
          <button
            onClick={() => toggleSection(i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{section.emoji}</span>
              <h3 className="font-semibold text-slate-100">{section.heading}</h3>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {section.bullets.length} points
              </span>
            </div>
            <span
              className={`text-slate-500 transition-transform duration-200 ${
                expandedSections.has(i) ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {expandedSections.has(i) && (
            <div className="px-5 pb-4 animate-fade-in">
              <ul className="space-y-2.5 border-t border-slate-800 pt-3">
                {section.bullets.map((bullet, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-indigo-400 mt-0.5 flex-shrink-0">◆</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Key Terms */}
      {data.keyTerms && data.keyTerms.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🔑</span> Key Terms
          </h3>
          <div className="space-y-3">
            {data.keyTerms.map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-purple-300 font-semibold text-sm min-w-fit">
                  {item.term}
                </span>
                <span className="text-slate-400 text-sm">—</span>
                <span className="text-slate-400 text-sm leading-relaxed">
                  {item.definition}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
