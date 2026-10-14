EduEliteAI
13 WEAPONS. 1 APP. — The AI Study Workspace for CA, CS & CMA Students
🌐 Live app: https://edueliteai.vercel.app
EduEliteAI is a free AI-powered study workspace built for Indian CA, CS and CMA aspirants. One place to learn, practise and prepare — with an AI tutor, ICAI-style copy checker, paper predictor, planners, quizzes, notes, and a full RTP / MTP / PYQ papers library.
✨ Features
#
Feature
What it does
1
AI Tutor
Ask anything — explains in Hindi, answers in professional English
2
Copy Checker
Upload your written answers (PDF/image) — checked like ICAI checks copies
3
Paper Predictor AI
High-probability questions predicted from past-paper trends
4
Survival Planner
Day-by-day plan tuned to your attempt date
5
RTP · MTP · PYQ Library
2019–2026 papers with course / subject / attempt filters + answer keys
6
Free Lectures
Official free lectures + curated Telegram channels
7
AI Tools Hub
Quiz generator, chapter summaries, exam info, inter-linkage engine
8
Study Calendar
Targets, countdowns and daily goals
9
Notes Library
Upload PDFs, keep searchable notes
10
Syllabus Sheets
Track syllabus completion chapter-wise
11
Timed Quizzes
Auto-scored quizzes with performance tracking
12
Study Music
Focus music (Pro)
13
Profile & Settings
Personalise your workspace
Core study tools are free with an account. Pro features are separate.
🚀 Tech Stack
Frontend: React + Vite + Tailwind CSS (deployed on Vercel)
Backend: Supabase (Postgres, Auth with Google OAuth, Edge Functions)
AI: Google Gemini (primary) with fallback chain across 7 edge functions
Mobile: Capacitor config included
🛠️ Run locally
git clone https://github.com/rajkumarprajapati00077-lab/edueliteai.git
cd edueliteai
npm install
npm run dev
Environment variables: copy .env.example to .env and fill in your Supabase keys.
(Edge functions live in supabase/functions — deploy with the Supabase CLI.)
📄 Pages
/ — Landing page
/papers — RTP · MTP I · MTP II · PYQ library
/lectures — Free lectures
/info/* — About, contact, legal pages
📬 Contact
axoflyr@proton.me

Built for independent CA, CS & CMA preparation. Independent references, not endorsements.