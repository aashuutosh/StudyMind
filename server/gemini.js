import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

Rules:
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

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    contents,
    config: {
      responseMimeType: "application/json",
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  });

  const text = response.text;

  try {
    const parsed = JSON.parse(text);

    // Validate required fields
    if (!parsed.notes || !parsed.quiz) {
      throw new Error("Invalid response structure from AI");
    }

    return parsed;
  } catch (parseErr) {
    console.error("JSON parse error:", parseErr);
    console.error("Raw response:", text?.slice(0, 500));
    throw new Error(
      "AI returned an unexpected format. Please try again with a cleaner document."
    );
  }
}
