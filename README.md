# XYZ AI · Human-Like School Assistant

XYZ AI is a standalone Applied AI solution built for school ecosystems. It interacts with **Students**, **Parents**, **Teachers**, and **School Leadership / Principals** through **Chat**, **Voice (Speech-to-Text & Text-to-Speech)**, and an **Interactive 3D Male Avatar with Lip-Sync**.

---

## Key Features

### 1. 3D Male Avatar with Dynamic Lip-Sync
- **Interactive 3D Face**: Rendered with Three.js (WebGL) featuring masculine facial geometry, textured hair, collar, and purple tie.
- **Phonetic Lip-Sync**: Multi-frequency viseme mouth modulation synchronizes jaw and lip movement to speech audio in real time.
- **Natural Micro-Animations**: Realistic periodic eye blinking (every 2.5–4.5s), idle breathing motion, and attentive head-tilting in listening mode.

### 2. Multi-Language Voice System (STT & TTS)
- **Universal Dual-Engine Speech**:
  - **Speech-to-Text (STT)**: Microphone speech recognition via the Web Speech API with BCP-47 locale matching.
  - **Text-to-Speech (TTS)**: Hybrid synthesis using native browser voices and a server-side audio streaming endpoint (`/api/tts`) to guarantee 100% fluent speech across all platforms.
- **11 Supported Indian Languages**: English, Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Kannada, Malayalam, and Urdu.

### 3. Role-Based Personas & Security
- **Role Scoping & Isolation**: Strict JWT authentication with HTTP-only cookies and edge proxy validation (`src/proxy.ts`).
- **Mock API Enforcement**: Application-layer authorization matrix prevents cross-role data leaks or unauthorized actions.
- **Anti-Role Spoofing & Prompt Injection Defense**: Heuristic and prompt-level defenses block role-override and prompt-leak attempts.

### 4. Authority Escalation Flow
- Interactive escalation cards and natural-language triggers allow Students and Parents to request callbacks from classroom teachers or school management.
- Backend records and confirms escalation tickets via `/api/escalation/request`.

---

## User Roles & Capabilities

| Role | Persona | Permissions & Capabilities | Example Query |
|---|---|---|---|
| **Student** | Academic Mentor | View own attendance and profile data | *"What is my attendance?"* |
| **Parent** | Family Counselor | View linked child's attendance, request teacher callbacks | *"How much attendance does my child have?"* |
| **Teacher** | Classroom Assistant | View class rosters, mark daily student attendance | *"Mark Rahul absent today."* |
| **Principal** | Executive Assistant | School-wide attendance analytics, grade-level metrics | *"What is the overall attendance?"* |

---

## Demo Credentials

You can use the **Quick Demo Login** buttons on `/login` or enter the credentials below:

| Role | Name | Email | Password | Linked Student / Class |
|---|---|---|---|---|
| **Student** | Rahul Sharma | `rahul@school.xyz` | `student123` | `stu-1` (Grade 10-A) |
| **Parent** | Priya Sharma | `priya@parent.xyz` | `parent123` | Linked to Rahul Sharma (`stu-1`) |
| **Teacher** | Anita Desai | `anita@school.xyz` | `teacher123` | Class Teacher (Grade 10-A) |
| **Principal** | Dr. Vikram Mehta | `vikram@school.xyz` | `principal123` | All Grades & Students |

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Edge Proxy Middleware)
- **3D Graphics**: Three.js
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens (White primary + `#8b5cf6` secondary accent, zero gradients)
- **Icons**: `react-icons` (Feather Icons)
- **Authentication**: `jose` (JWT signing and edge verification)
- **LLM Orchestration**: Groq SDK (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`) with deterministic multi-language rule fallback

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm (or yarn / pnpm)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/BhumikaYeole/xyz-ai.git
cd xyz-ai
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
JWT_SECRET=xyz-ai-secret-key-production
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
*(Note: If `GROQ_API_KEY` is omitted, the built-in deterministic multi-language rule orchestrator handles all queries).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```
