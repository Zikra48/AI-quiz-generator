# Quiz Studio — AI Quiz Generator 🎓

Quiz Studio is an AI-powered academic quiz platform designed for students and educators. Generate personalized, multiple-choice quizzes on any academic subject, test your knowledge interactively, track progress, and review comprehensive educational explanations.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Google Gemini API**, designed for direct deployment to **Vercel** and **GitHub**.

---

## ✨ Features

- **🎯 AI-Powered Academic Quiz Generation**: Input any academic topic (Biology, Computer Science, Economics, History, Physics, etc.) with custom difficulty levels (Beginner, Intermediate, Advanced) and 3–10 questions.
- **🔒 Secure Server-Side Architecture**: `GEMINI_API_KEY` is kept exclusively on the server side via serverless `/api/generate-quiz` and `/api/grade-quiz` endpoints. The correct answers remain encrypted until submission, preventing browser inspection cheating.
- **⚡ Interactive Test Taking**:
  - Clear option cards (A, B, C, D) with full text and keyboard shortcut support (`A`, `B`, `C`, `D`, numbers `1-4`, and arrow navigation).
  - Real-time progress bar and interactive question navigator matrix.
  - Strict submission validation: all questions must be answered before final grading, with 1-click jump to unanswered questions.
  - Ability to review and change answers anytime before submission.
- **📊 Detailed Results & In-Depth Feedback**:
  - Instant score calculation and percentage grade.
  - Question-by-question breakdown with green/red status indicators.
  - In-depth academic explanations detailing why the correct answer is true and clarifying distractors.
  - Filter review by *All Questions*, *Incorrect Only*, or *Correct Only*.
  - Study Sheet Export (printable / Markdown study guide) and Quiz Retake mode.
- **🎨 Educational SaaS Design**:
  - Warm cream background (`#F7F5F0`), deep navy typography (`#182B3A`), and warm orange accents (`#D94C27`).
  - High contrast (WCAG AA compliant) in all lighting conditions.
  - Fully responsive across desktop, tablet, and mobile screens.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion
- **Backend / Serverless**: Node.js Express (Local dev) & Vercel Serverless Functions (`/api/*.ts`)
- **AI Engine**: Google Gemini API (`@google/genai` SDK with `gemini-3.8-flash` model)

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ installed
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation

```bash
git clone <your-repo-url>
cd quiz-studio
npm install
```

### 3. Set Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

This repository is preconfigured for zero-config deployment on Vercel's free Hobby plan.

### Method 1: Deploy with Vercel Web Dashboard (Recommended)

1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New" > "Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `Your Google Gemini API Key`
5. Click **Deploy**. Vercel will build the Vite SPA and deploy the `/api/generate-quiz` and `/api/grade-quiz` serverless functions automatically!

### Method 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
# When prompted, configure GEMINI_API_KEY as an environment secret:
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## 📂 Project Structure

```
├── api/
│   ├── generate-quiz.ts    # Serverless endpoint: Generates questions with Gemini
│   ├── grade-quiz.ts       # Serverless endpoint: Calculates score & reveals answers
│   ├── token-util.ts       # AES-256 session token encoder/decoder
│   └── types.ts            # Shared API & quiz types
├── src/
│   ├── components/         # Modular UI components (QuizForm, ActiveQuiz, ResultsView, etc.)
│   ├── types/              # Frontend types & state definitions
│   ├── App.tsx             # Root application orchestrator
│   ├── index.css           # Global Tailwind styling & theme
│   └── main.tsx            # React root mount
├── server.ts               # Local full-stack Express runner with Vite middleware
├── vercel.json             # Vercel deployment & routing configuration
├── package.json
└── vite.config.ts
```

---

## 🛡️ Security & Integrity

- **Server-Side API Key Shielding**: The Gemini API key is accessed only in serverless backend functions and is never exposed to the client bundle.
- **Tamper-Resistant Answer Keys**: Quiz answers and explanations are encrypted in an AES-256 session token during quiz generation. The browser cannot inspect the correct answers until the student submits their responses to `/api/grade-quiz`.
- **Abuse & Rate-Limit Protection**: Built-in sliding-window rate limiting and validation guards protect the API from spam or malformed queries.

---

## 📜 License
Apache-2.0
