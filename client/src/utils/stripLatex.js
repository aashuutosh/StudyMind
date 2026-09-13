/**
 * Strip LaTeX notation from a string and replace with readable plain text.
 * This handles cases where the AI ignores the no-LaTeX instruction.
 */
export function stripLatex(text) {
  if (!text || typeof text !== "string") return text;

  return text
    // Remove outer $...$ and $$...$$ delimiters (keep content)
    .replace(/\$\$([^$]+)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    // Remove \(...\) and \[...\]
    .replace(/\\\(([^)]+)\\\)/g, "$1")
    .replace(/\\\[([^\]]+)\\\]/g, "$1")
    // Convert common LaTeX commands to Unicode/text
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\sqrt/g, "√")
    .replace(/\\pi/g, "π")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\mu/g, "μ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\omega/g, "ω")
    .replace(/\\infty/g, "∞")
    .replace(/\\sum/g, "∑")
    .replace(/\\int/g, "∫")
    .replace(/\\partial/g, "∂")
    .replace(/\\nabla/g, "∇")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\pm/g, "±")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\log/g, "log")
    .replace(/\\ln/g, "ln")
    .replace(/\\exp/g, "exp")
    .replace(/\\lim/g, "lim")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\Rightarrow/g, "⇒")
    .replace(/\\forall/g, "∀")
    .replace(/\\exists/g, "∃")
    .replace(/\\in/g, "∈")
    .replace(/\\subset/g, "⊂")
    .replace(/\\cup/g, "∪")
    .replace(/\\cap/g, "∩")
    // Remove remaining backslash commands
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    // Clean up leftover braces
    .replace(/[{}]/g, "")
    .trim();
}
