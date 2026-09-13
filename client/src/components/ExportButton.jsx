import { useState } from "react";
import { jsPDF } from "jspdf";
import { stripLatex } from "../utils/stripLatex.js";
import { Download, FileCode, Check, Copy } from "lucide-react";

function clean(text) {
  return stripLatex(text || "");
}

export default function ExportButton({ data }) {
  const [copied, setCopied] = useState(false);

  const exportPDF = () => {
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210;
      const margin = 18;
      const lineW = W - margin * 2;
      let y = 20;

      const checkPage = (needed = 10) => {
        if (y + needed > 275) {
          doc.addPage();
          y = 20;
        }
      };

      const writeLine = (text, size, r, g, b, bold = false) => {
        doc.setFontSize(size);
        doc.setTextColor(r, g, b);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(String(text), lineW);
        lines.forEach((line) => {
          checkPage();
          doc.text(line, margin, y);
          y += size * 0.45;
        });
        y += 1.5;
      };

      // Header Banner
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(margin, y - 4, lineW, 18, 3, 3, "F");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("StudyMind AI — Academic Revision Report", margin + 4, y + 8);
      y += 22;

      writeLine(`Subject: ${clean(data.subject)}`, 10, 100, 116, 139);
      writeLine(`Topic: ${clean(data.title)}`, 10, 100, 116, 139);
      y += 3;

      // Executive Summary
      writeLine("Executive Overview", 12, 79, 70, 229, true);
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + lineW, y);
      y += 4;
      writeLine(clean(data.summary), 10, 51, 65, 85);
      y += 5;

      // Notes
      (data.notes || []).forEach((section) => {
        checkPage(20);
        writeLine(`${clean(section.heading)}`, 11.5, 79, 70, 229, true);
        (section.bullets || []).forEach((b) => {
          writeLine(`  • ${clean(b)}`, 9.5, 51, 65, 85);
        });
        y += 2.5;
      });

      // Key Terms
      if (data.keyTerms?.length) {
        checkPage(15);
        y += 2;
        writeLine("Key Terminology & Glossary", 12, 147, 51, 234, true);
        data.keyTerms.forEach(({ term, definition }) => {
          checkPage(8);
          writeLine(`${clean(term)}: ${clean(definition)}`, 9.5, 71, 85, 105);
        });
        y += 3;
      }

      // Quiz
      if (data.quiz?.length) {
        doc.addPage();
        y = 20;

        doc.setFillColor(79, 70, 229);
        doc.roundedRect(margin, y - 4, lineW, 18, 3, 3, "F");
        doc.setFontSize(15);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Practice Assessment Questions", margin + 4, y + 8);
        y += 22;

        data.quiz.forEach((q, i) => {
          checkPage(30);
          writeLine(`Q${i + 1}. ${clean(q.question)}`, 10.5, 15, 23, 42, true);
          (q.options || []).forEach((opt, oi) => {
            const isCorrect = oi === q.correctIndex;
            writeLine(
              `   ${["A", "B", "C", "D"][oi]}. ${clean(opt.replace(/^[A-D]\)\s*/, ""))}${
                isCorrect ? "  [CORRECT]" : ""
              }`,
              9.5,
              isCorrect ? 16 : 100,
              isCorrect ? 185 : 116,
              isCorrect ? 129 : 139
            );
          });
          writeLine(`   Rationale: ${clean(q.explanation)}`, 9, 100, 116, 139);
          y += 3;
        });
      }

      const total = doc.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Generated via StudyMind Workspace • Prompt Wars 2026 • Page ${p} of ${total}`,
          margin,
          290
        );
      }

      const safeName = (data.title || "studymind_notes")
        .replace(/[^a-z0-9]/gi, "_")
        .slice(0, 40);
      doc.save(`StudyMind_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("PDF export error: " + err.message);
    }
  };

  const exportMarkdown = () => {
    try {
      let md = `# ${clean(data.title)}\n\n`;
      md += `**Subject:** ${clean(data.subject)}\n\n`;
      md += `## Overview\n${clean(data.summary)}\n\n`;

      md += `## Revision Notes\n\n`;
      (data.notes || []).forEach((s) => {
        md += `### ${clean(s.heading)}\n`;
        (s.bullets || []).forEach((b) => (md += `- ${clean(b)}\n`));
        md += "\n";
      });

      if (data.keyTerms?.length) {
        md += `## Key Vocabulary\n\n`;
        data.keyTerms.forEach(({ term, definition }) => {
          md += `**${clean(term)}** — ${clean(definition)}\n\n`;
        });
      }

      if (data.quiz?.length) {
        md += `## Self-Assessment Quiz\n\n`;
        (data.quiz || []).forEach((q, i) => {
          md += `**Q${i + 1}. ${clean(q.question)}**\n\n`;
          (q.options || []).forEach((opt, oi) => {
            const label = ["A", "B", "C", "D"][oi];
            const isCorrect = oi === q.correctIndex;
            md += `${isCorrect ? "✅" : "-"} ${label}. ${clean(
              opt.replace(/^[A-D]\)\s*/, "")
            )}\n`;
          });
          md += `\n> 💡 ${clean(q.explanation)}\n\n---\n\n`;
        });
      }

      md += `*Generated by StudyMind Workspace • ${new Date().toLocaleDateString()}*\n`;

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `StudyMind_${(data.title || "notes")
        .replace(/[^a-z0-9]/gi, "_")
        .slice(0, 40)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Markdown export error:", err);
      alert("Markdown export error: " + err.message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportPDF}
        className="btn-glass text-xs py-2 px-3.5 hover:text-white"
        title="Download high-resolution PDF document"
      >
        <Download className="w-3.5 h-3.5 text-indigo-400" />
        <span>Export PDF</span>
      </button>

      <button
        onClick={exportMarkdown}
        className="btn-glass text-xs py-2 px-3.5 hover:text-white"
        title="Download formatted Markdown file"
      >
        <FileCode className="w-3.5 h-3.5 text-purple-400" />
        <span>Export MD</span>
      </button>
    </div>
  );
}
