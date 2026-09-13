import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeDocument } from "./gemini.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Multer: store in memory (max 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StudyMind server is running 🎓" });
});

// Main analyze endpoint
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const subject = req.body.subject || "";
    const questionCount = parseInt(req.body.questionCount) || 5;

    console.log(
      `📄 Analyzing: ${req.file.originalname} | Subject: ${subject || "auto-detect"} | Questions: ${questionCount}`
    );

    const result = await analyzeDocument(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      subject,
      questionCount
    );

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Analysis error:", err);
    res.status(500).json({
      error: err.message || "Failed to analyze document. Please try again.",
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 StudyMind server running at http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/analyze\n`);
});
