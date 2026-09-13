import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

// Lazy-initialize so .env is loaded first
let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in server/.env");
    }
    _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _client;
}

const SYSTEM_PROMPT = `You are StudyMind, an expert academic assistant. Your job is to analyze lecture materials and produce high-quality study content.

Always respond with ONLY valid JSON matching this exact schema:
{
  "subject": "string — detected or provided subject name",
  "title": "string — document title or inferred topic",
  "summary": "string — 3-5 sentence overview of the entire material",
  "notes": [
    {
      "heading": "string — section heading",
      "emoji": "string — single relevant emoji",
      "bullets": ["string — concise bullet point", ...]
    }
  ],
  "keyTerms": [
    { "term": "string", "definition": "string — one sentence definition" }
  ],
  "quiz": [
    {
      "id": number,
      "question": "string — clear, specific question",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": number (0-3),
      "explanation": "string — why this answer is correct"
    }
  ]
}

CRITICAL FORMATTING RULES — MUST FOLLOW:
- NEVER use LaTeX notation. No $...$, \\(...\\), \\frac{}{}, \\sin, \\pi, etc.
- Write ALL math in plain readable text using Unicode: π, ∑, ∫, √, ≤, ≥, ∞, α, β, θ, etc.
- Write fractions as "2/π" not "\\frac{2}{\\pi}"
- Write powers as "x^2" or "x squared" not "x^{2}"
- Write subscripts as "a_0" not "a_{0}"
- notes should have 4-7 sections covering all major topics
- each section should have 3-6 bullet points (concise, exam-ready)
- keyTerms should have 5-10 important terms from the material
- quiz questions must be based ONLY on content in the document
- quiz options must be plausible (no obviously wrong answers)
- if subject is provided, tailor the depth and terminology accordingly`;

/**
 * Convert file buffer to Gemini-compatible inline data part
 */
function bufferToInlinePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

/**
 * For DOCX/PPTX: extract text using mammoth (DOCX) or basic extraction
 */
async function extractTextFromBuffer(buffer, mimeType, filename) {
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.default.extractRawText({ buffer });
      return result.value;
    } catch (e) {
      console.warn("mammoth extraction failed, sending as inline data");
      return null;
    }
  }
  return null;
}

/**
 * Main function: analyze a document with Gemini 2.5 Flash
 */
export async function analyzeDocument(
  buffer,
  mimeType,
  filename,
  subject = "",
  questionCount = 5
) {
  const subjectHint = subject
    ? `The subject/course is: "${subject}". Tailor the notes and quiz depth accordingly.`
    : "Auto-detect the subject from the content.";

  const userPrompt = `${subjectHint}

Generate exactly ${questionCount} quiz questions.

Analyze the following document and return the structured JSON:`;

  let contents;

  // Try text extraction for non-native formats
  const extractedText = await extractTextFromBuffer(buffer, mimeType, filename);

  if (extractedText) {
    // Use extracted text for DOCX
    contents = [
      {
        role: "user",
        parts: [
          { text: userPrompt },
          { text: `Document content:\n\n${extractedText}` },
        ],
      },
    ];
  } else {
    // Use inline data for PDF, images, plain text
    const supportedNative = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
    ];

    if (supportedNative.includes(mimeType)) {
      contents = [
        {
          role: "user",
          parts: [{ text: userPrompt }, bufferToInlinePart(buffer, mimeType)],
        },
      ];
    } else {
      // Fallback: try as text
      contents = [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            { text: buffer.toString("utf-8").slice(0, 50000) },
          ],
        },
      ];
    }
  }

  // Models to try in order — fallback on 503/429
  const MODELS = ["gemini-3.7-flash", "gemini-3.5-flash-lite"];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let response;
  let lastErr;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🤖 Trying ${model} (attempt ${attempt})…`);
        response = await getClient().models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.4,
            maxOutputTokens: 8192,
          },
        });
        console.log(`✅ Got response from ${model}`);
        break; // success — stop retrying
      } catch (err) {
        lastErr = err;
        const status = err?.status || err?.code || 0;
        const is503 = String(err?.message || "").includes("503")
          || String(err?.message || "").includes("UNAVAILABLE")
          || String(err?.message || "").includes("high demand")
          || status === 503;
        const is429 = String(err?.message || "").includes("429")
          || String(err?.message || "").includes("RESOURCE_EXHAUSTED")
          || status === 429;

        if ((is503 || is429) && attempt < 3) {
          const wait = attempt * 3000; // 3s, 6s
          console.warn(`⚠️ ${model} busy (${attempt}/3), retrying in ${wait/1000}s…`);
          await sleep(wait);
          continue;
        }
        console.warn(`❌ ${model} failed: ${err.message}`);
        break; // try next model
      }
    }
    if (response) break;
  }

  if (!response) {
    throw new Error(
      lastErr?.message?.includes("high demand") || lastErr?.message?.includes("503")
        ? "Gemini is busy right now. Please wait 10 seconds and try again."
        : lastErr?.message || "Failed to get a response from AI."
    );
  }


  let text = response.text || "";

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Find the first { and last } to extract JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  console.log("📝 Raw response preview:", text.slice(0, 500));

  try {
    const parsed = JSON.parse(text);

    // ── Normalize top-level fields ──
    const subject = parsed.subject || parsed.course || parsed.Subject || "General";
    const title = parsed.title || parsed.topic || parsed.Title || "Lecture Notes";
    const summary = parsed.summary || parsed.overview || parsed.Summary || "";

    // ── Normalize notes sections ──
    // Handle variations: notes / sections / topics / content
    const rawNotes = parsed.notes || parsed.sections || parsed.topics || parsed.content || [];
    const notes = rawNotes.map((section) => ({
      heading: section.heading || section.title || section.name || section.topic || "Section",
      emoji: section.emoji || section.icon || "📌",
      bullets: Array.isArray(section.bullets)
        ? section.bullets
        : Array.isArray(section.points)
        ? section.points
        : Array.isArray(section.items)
        ? section.items
        : Array.isArray(section.content)
        ? section.content
        : typeof section.content === "string"
        ? [section.content]
        : [],
    }));

    // ── Normalize quiz questions ──
    const rawQuiz = parsed.quiz || parsed.questions || parsed.mcqs || [];
    const quiz = rawQuiz.map((q, i) => ({
      id: q.id || i + 1,
      question: q.question || q.q || q.text || "",
      options: Array.isArray(q.options)
        ? q.options
        : Array.isArray(q.choices)
        ? q.choices
        : [],
      correctIndex:
        typeof q.correctIndex === "number"
          ? q.correctIndex
          : typeof q.correct === "number"
          ? q.correct
          : typeof q.answer === "number"
          ? q.answer
          : 0,
      explanation: q.explanation || q.reason || q.rationale || "",
    }));

    // ── Normalize keyTerms ──
    const rawTerms = parsed.keyTerms || parsed.key_terms || parsed.terms || parsed.glossary || [];
    const keyTerms = rawTerms.map((t) => ({
      term: t.term || t.word || t.name || "",
      definition: t.definition || t.meaning || t.desc || "",
    }));

    console.log(`✅ Parsed: ${notes.length} note sections, ${quiz.length} quiz questions`);

    return { subject, title, summary, notes, quiz, keyTerms };

  } catch (parseErr) {
    console.error("❌ JSON parse error:", parseErr.message);
    console.error("Raw response (first 800 chars):\n", text.slice(0, 800));
    throw new Error(
      "AI returned an unexpected format. Please try again — if this persists, the document may be too complex."
    );
  }
}
