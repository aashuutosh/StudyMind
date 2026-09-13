# 🎓 StudyMind — AI-Powered Student Workspace

> **Prompt Wars 2026** · Google for Developers × Hack2Skill × Android Club, VIT Bhopal

Turn any lecture material into **revision notes + a practice quiz** in seconds — powered by Gemini 2.5 Flash.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 Multi-format upload | PDF, DOCX, PPTX, Images (JPG/PNG), TXT |
| 📝 Revision notes | Structured sections with emoji tags and bullet points |
| 🎯 Practice quiz | 5–10 MCQs with instant feedback and explanations |
| 🔑 Key terms | Auto-generated glossary |
| 📥 PDF export | Download full notes + quiz as a formatted PDF |
| 📋 Markdown export | Copy-paste friendly `.md` file |
| 🏷️ Subject tagging | Personalise by course/subject for tailored content |
| 📊 Quiz scoring | Progress bar, results screen, per-question review |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Dependencies
```bash
cd D:\Hackathon\studymind

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure API Key
The `.env` file in `server/` already has your key set.
To change it, edit `server/.env`:
```
GEMINI_API_KEY=your_key_here
PORT=3001
```

### 3. Run (Two terminals)

**Terminal 1 — Server:**
```bash
cd D:\Hackathon\studymind\server
npm run dev
```

**Terminal 2 — Client:**
```bash
cd D:\Hackathon\studymind\client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🏗️ Architecture

```
Frontend (React + Vite + Tailwind)  →  http://localhost:5173
     ↓ POST /api/analyze (multipart/form-data)
Backend (Node.js + Express)         →  http://localhost:3001
     ↓ inline data / extracted text
Gemini 2.5 Flash (multimodal AI)
     ↓ structured JSON
Frontend renders Notes + Quiz tabs
     ↓ jsPDF / Blob download
PDF / Markdown export
```

---

## 📁 Project Structure

```
studymind/
├── server/
│   ├── index.js        # Express app + /api/analyze
│   ├── gemini.js       # Gemini 2.5 Flash integration
│   ├── .env            # API key (git-ignored)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx              # Main app (3 states)
│   │   ├── components/
│   │   │   ├── FileUpload.jsx   # Drag-and-drop uploader
│   │   │   ├── NotesView.jsx    # Collapsible notes
│   │   │   ├── QuizView.jsx     # Interactive MCQ quiz
│   │   │   ├── ExportButton.jsx # PDF + Markdown export
│   │   │   └── LoadingSpinner.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

---

## 🔧 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Multer
- **AI**: Google Gemini 2.5 Flash (`@google/genai`)
- **Parsing**: Mammoth (DOCX), PDF native via Gemini
- **Export**: jsPDF

---

*Built with ❤️ for Prompt Wars 2026*
