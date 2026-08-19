# XYZ AI · Human-Like School Assistant

> This project was built for the **Bharat Academix AI and ML Competition**.

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

## System Architecture & Technical Design

### 1. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Multi-Modal Client Layer (Browser)"]
        UI["Web Portal UI (Next.js 16 / React 19)"]
        VoiceSTT["Speech-to-Text (Web Speech API)"]
        Avatar3D["3D Male Avatar (Three.js WebGL)"]
        VoiceTTS["Dual-Engine TTS (SpeechSynthesis + Audio Stream)"]
        LangSelect["Multi-Language Selector (11 Languages)"]
    end

    subgraph EdgeSecurity ["2. Edge Security & Proxy Layer"]
        Proxy["Edge Proxy Middleware (src/proxy.ts)"]
        JWT["Jose JWT Token Verification"]
        CookieStore["HTTP-Only Cookie Session"]
    end

    subgraph APIorchestration ["3. API & AI Orchestration Layer"]
        ChatRoute["/api/chat Route Handler"]
        Guardrails["Prompt Injection & Security Guardrails"]
        GroqLLM["Groq LLM Engine (GPT-OSS-120B / LLaMA-3.3)"]
        ToolCaller["Role-Scoped Tool Calling Engine"]
        FallbackEngine["Deterministic Multilingual Rule Engine"]
        TTSRoute["/api/tts Audio Streaming Service"]
    end

    subgraph MockERP ["4. School ERP & Authorization Layer"]
        AuthService["/api/auth (Login / Logout / Session)"]
        AttendanceAPI["/api/attendance (Student / Mark / Overall)"]
        EscalationAPI["/api/escalation (Ticket Management)"]
        PermissionMatrix["Role-Based Access Control (RBAC)"]
        SeedDB[("School ERP Seed Store (In-Memory / Seed)")]
    end

    %% Client to Edge
    UI -->|HTTP Requests / Chat Payload| Proxy
    VoiceSTT -->|Live Transcript| UI
    LangSelect -->|Language Context| UI
    VoiceTTS -->|Phonetic Events| Avatar3D

    %% Edge Proxy to Backend
    Proxy -->|Validate JWT Token| JWT
    JWT -->|Extract AuthPayload| CookieStore
    Proxy -->|Authenticated Request| ChatRoute
    Proxy -->|Authenticated Request| AttendanceAPI
    Proxy -->|Authenticated Request| EscalationAPI

    %% Orchestration Flows
    ChatRoute --> Guardrails
    Guardrails -->|Passed Validation| GroqLLM
    Guardrails -->|Fallback / Offline| FallbackEngine
    GroqLLM -->|Function Call| ToolCaller
    ToolCaller -->|Permission Check| PermissionMatrix
    PermissionMatrix -->|Authorized Fetch/Write| SeedDB
    SeedDB -->|Record Data| ToolCaller
    ToolCaller -->|Tool Result| GroqLLM
    GroqLLM -->|Synthesized Multi-Lingual Answer| ChatRoute
    FallbackEngine -->|Deterministic Response| ChatRoute

    %% Audio Route
    VoiceTTS -->|Fallback Remote Audio| TTSRoute
    ChatRoute -->|JSON Reply| UI
```

---

### 2. Subsystem Architecture

#### A. Multi-Modal Interface Layer
1. **Interactive 3D Male Avatar (`src/components/ThreeAvatar.tsx`)**:
   - Built on **Three.js** with real-time WebGL rendering.
   - Masculine facial topology with sculpted jawline, quiff hairstyle, suit collar, and purple tie.
   - **Phonetic Lip-Sync**: Multi-frequency wave modulation computes syllable energy (`wave1`, `wave2`, `wave3`) to articulate jaw drop and viseme expansion during speech output.
   - **Micro-Animations**: Periodic eyelid blinking (every 2.5–4.5s), subtle breathing bobbing, and attentive head-tilt in voice listening mode.

2. **Universal Multi-Language Voice Pipeline (`src/lib/use-voice.ts`)**:
   - **Speech-to-Text (STT)**: Uses browser `SpeechRecognition` configured with the selected BCP-47 language tag (`hi-IN`, `ta-IN`, `te-IN`, `mr-IN`, `bn-IN`, `gu-IN`, `pa-IN`, `kn-IN`, `ml-IN`, `ur-IN`, `en-IN`).
   - **Dual-Engine Text-to-Speech (TTS)**:
     - *Primary*: Evaluates local `window.speechSynthesis` voices matching the target language and male voice preferences.
     - *Universal Stream Fallback*: If the client operating system lacks regional Indian voices (common on Windows/macOS), streams native pronunciation audio from the `/api/tts` audio endpoint.

---

#### B. Security & Edge Proxy Layer (`src/proxy.ts`)
1. **Route Protection**: Intercepts all portal routes (`/student-portal`, `/parent-portal`, `/staff-portal`, `/management-portal`) and protected API routes at the edge.
2. **Cryptographic Validation**: Verifies JWT signatures via `jose` using `HS256` encryption and secret tokens stored in `httpOnly` secure cookies.
3. **Role Enforcement**: Checks user role in the payload against destination portal path (`PORTAL_ROLES`). Redirects unauthorized attempts to the user's authorized portal or `/login`.

```mermaid
flowchart LR
    Request["Incoming Request to Portal / API"] --> CheckCookie{"Cookie 'xyz-ai-token' exists?"}
    CheckCookie -- No --> RedirectLogin["Redirect to /login?from=..."]
    CheckCookie -- Yes --> VerifyJWT["Verify Signature with 'jose'"]
    VerifyJWT -- Invalid/Expired --> RedirectLogin
    VerifyJWT -- Valid --> CheckRole{"User Role matches Portal?"}
    CheckRole -- No --> RedirectAuthorized["Redirect to Authorized Portal"]
    CheckRole -- Yes --> NextPass["Allow Request -> Next.js Page / API"]
```

---

#### C. AI Orchestration & Tool Calling Layer (`src/lib/ai-orchestrator.ts`)
1. **Security Guardrails (`detectPromptInjection`)**: Analyzes incoming messages against regex and semantic patterns for prompt extraction, role overrides (`"act as principal"`, `"ignore instructions"`), and API key harvesting.
2. **Groq Tool-Calling Engine**: Maps role-specific tools:
   - `student`: `getAttendance` (self only), `requestEscalation`.
   - `parent`: `getAttendance` (linked child only), `requestEscalation`.
   - `teacher`: `getAttendance` (class roster), `markAttendance`.
   - `principal`: `getOverallAttendance`, `getAttendance` (all students).
   - Feeds tool definitions to Groq (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`).
3. **Multi-Language Generation**: Enforces target language script and vocabulary across all **11 Indian languages**.
4. **Deterministic Rule Fallback**: If the LLM provider is offline or rate-limited, a localized rule engine processes intents and returns grammatically natural human-like responses in the user's chosen language.

---

#### D. School ERP Data & Mock API Layer
- **Seed Data Store (`src/lib/data/seed.ts`)**:
  - `users`: User profiles with roles, credentials, linked student IDs, and class assignments.
  - `students`: Student master records, grades, and roll numbers.
  - `attendanceRecords`: Attendance history with timestamps, dates, statuses (`present`, `absent`, `late`), and marker IDs.
  - `escalationRequests`: Logged escalation tickets for teacher/management callbacks.
- **RESTful Endpoints**:
  - `GET /api/attendance/[studentId]` — Fetch individual attendance records with role authorization.
  - `POST /api/attendance/mark` — Record/update student attendance (teacher-only).
  - `GET /api/attendance/overall` — Institutional analytics and grade breakdown (principal-only).
  - `POST /api/escalation/request` — Create support ticket with authorities.
  - `GET /api/tts` — Multi-language audio streaming bridge.

---

### 3. Interaction Sequences

#### Sequence 1: Multi-Language Voice Attendance Query (Student / Parent)

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Parent
    participant Mic as Web Speech API (STT)
    participant UI as Chat & Avatar UI
    participant ChatAPI as /api/chat
    participant Orchestrator as AI Orchestrator
    participant ERP as School ERP API
    participant Groq as Groq LLM (GPT-OSS-120B)
    participant TTS as Speech Engine (TTS / /api/tts)
    participant Avatar as 3D Male Avatar

    User->>Mic: Speaks query (e.g. "What is my attendance?")
    Mic->>UI: Transcribes text in selected language (e.g., Hindi/Tamil/English)
    UI->>ChatAPI: POST { message, sessionId, language }
    ChatAPI->>Orchestrator: orchestrateChat()
    Orchestrator->>Orchestrator: Check Prompt Injection Guardrails
    Orchestrator->>Groq: Prompt with Role Persona + Tool Definitions
    Groq-->>Orchestrator: Function Call -> getAttendance(studentId)
    Orchestrator->>ERP: Fetch attendance records
    ERP-->>Orchestrator: Summary { present: 42, absent: 3, percentage: 93.3% }
    Orchestrator->>Groq: Return tool result + enforce selected language
    Groq-->>Orchestrator: Natural conversational response in target language
    Orchestrator-->>ChatAPI: Formatted response payload
    ChatAPI-->>UI: Display assistant response in chat
    UI->>TTS: Synthesize speech in target language
    TTS->>Avatar: onStart -> Trigger Lip-Sync Viseme Modulation
    Avatar->>Avatar: Animate 3D mouth, jaw, and blinking
    TTS->>User: Audio playback (Natural voice)
    TTS->>Avatar: onEnd -> Return mouth to idle smile
```

---

#### Sequence 2: Teacher Marking Attendance via Chat / Voice

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Teacher (Anita Desai)
    participant UI as Staff Portal
    participant Orchestrator as AI Orchestrator
    participant ERP as Attendance API (/api/attendance/mark)
    participant DB as Attendance Seed Store

    Teacher->>UI: "Mark Rahul absent today"
    UI->>Orchestrator: POST message + Role: 'teacher'
    Orchestrator->>Orchestrator: Resolve student 'Rahul Sharma' (stu-1) in class roster
    Orchestrator->>ERP: Execute markAttendance(studentId: 'stu-1', date: 'YYYY-MM-DD', status: 'absent')
    ERP->>ERP: Verify marker is class teacher
    ERP->>DB: Upsert attendance record
    DB-->>ERP: Record updated successfully
    ERP-->>Orchestrator: Confirmation { ok: true, data: record }
    Orchestrator-->>UI: "Attendance for Rahul Sharma on 2026-08-19 is now marked absent."
    UI->>Teacher: Visual confirmation + Spoken confirmation via 3D Avatar
```

---

#### Sequence 3: Authority Escalation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent / Student
    participant UI as Portal Chat UI
    participant ChatAPI as /api/chat
    participant EscAPI as /api/escalation/request
    participant Store as Escalation Tickets

    Parent->>UI: "I want to talk to the principal regarding attendance"
    UI->>ChatAPI: Process message
    ChatAPI-->>UI: Response + Trigger Escalation Card (Target: Management)
    UI->>Parent: Displays Interactive Escalation Card [Talk to Teacher / Contact Management]
    Parent->>UI: Clicks "Confirm Escalation"
    UI->>EscAPI: POST { targetType: 'management', reason: '...' }
    EscAPI->>EscAPI: Verify authenticated user & linked student permissions
    EscAPI->>Store: Create escalation ticket (Status: confirmed)
    Store-->>EscAPI: Ticket #esc-178706 confirmed
    EscAPI-->>UI: { success: true }
    UI->>Parent: "Your request to connect with school management has been confirmed."
```

---

### 4. Role Authorization Matrix

| Action / Endpoint | Student (`rahul@school.xyz`) | Parent (`priya@parent.xyz`) | Teacher (`anita@school.xyz`) | Principal (`vikram@school.xyz`) |
|---|---|---|---|---|
| **View Own Attendance** | ✅ Self only (`stu-1`) | ❌ N/A | ❌ N/A | ❌ N/A |
| **View Child's Attendance** | ❌ Access Denied | ✅ Linked Child (`stu-1`) | ❌ N/A | ❌ N/A |
| **View Class Attendance** | ❌ Access Denied | ❌ Access Denied | ✅ Assigned Class (`Grade 10-A`) | ❌ N/A |
| **Mark Daily Attendance** | ❌ Access Denied | ❌ Access Denied | ✅ Assigned Class Students | ❌ Access Denied |
| **School-Wide Analytics** | ❌ Access Denied | ❌ Access Denied | ❌ Access Denied | ✅ All Grades & Metrics |
| **Request Callback / Escalation** | ✅ Self Profile | ✅ Linked Child | ❌ N/A | ❌ N/A |
| **Cross-Student Access Attempt** | 🚫 Blocked (403/Denied) | 🚫 Blocked (403/Denied) | 🚫 Blocked (403/Denied) | 🚫 Blocked (403/Denied) |

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
- **3D Graphics**: Three.js (WebGL)
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
