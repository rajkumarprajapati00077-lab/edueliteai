import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

const content = {
  about: {
    title: "About EduElite",
    intro: "A focused study workspace for CA, CS and CMA students in India.",
    sections: [
      ["What you can do", "Explore syllabus chapters, plan an attempt, practise quizzes, prepare notes and ask the AI tutor to explain difficult concepts. Your study progress is tied to your account."],
      ["Independent by design", "EduElite is an independent learning aid. ICAI, ICSI and ICMAI remain the authoritative sources for their respective syllabi, notifications, examination rules and results."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Your study workspace should be useful without putting your personal information on display.",
    sections: [
      ["What you provide", "When you create an account, we process your email address and authentication information. Your profile, course choice, target dates, study goals, notes, quiz activity and conversations are used to provide the workspace you request."],
      ["AI-assisted study", "When you request a tutor answer, notes, a quiz or another AI feature, the content you submit is sent to the services needed to generate the response. Avoid entering sensitive personal, financial or client information into prompts or uploaded study material."],
      ["Access and storage", "Account data is stored in the platform's cloud services. Signed-in access controls are intended to restrict private records to their owner. We retain study records while your account and its associated data remain in use; contact the operator for an account-data request."],
      ["External services", "Links to institute websites and YouTube lead to third-party sites with their own privacy practices. AI providers may process submitted prompts to deliver requested responses. Do not treat an AI output as an official institute communication."],
      ["Your choices", "You can update profile details and study preferences in the app. For access, correction or deletion requests, use the contact channel provided by the platform operator. This policy should be reviewed when new services or contact details are added."],
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "EduElite is a study aid, not an official examination service.",
    sections: [
      ["Using the workspace", "Use the tools for lawful personal study. Keep your sign-in information secure and do not upload material that you do not have permission to use. Do not attempt to access another student's records or disrupt the service."],
      ["Study content", "AI-generated notes, explanations, quizzes, schedules and summaries can be incomplete or incorrect. Check important points against the latest official ICAI, ICSI or ICMAI material before relying on them for an examination."],
      ["Availability", "Features that depend on outside services or official websites can change or be temporarily unavailable. Exam dates and notices should always be confirmed with the relevant institute."],
      ["Ownership and use", "You remain responsible for the material you submit. EduElite presents independently prepared study tools and does not claim endorsement by an institute or ownership of third-party course material."],
    ],
  },
  contact: {
    title: "Contact",
    intro: "Need help with your account or want to report an incorrect study resource?",
    sections: [
      ["Support requests", "Include the affected page, your course and a short description of what happened. Do not send passwords, recovery links, financial details or confidential client material."],
      ["Official exam matters", "For registration, examination notices, results and syllabus changes, contact your institute directly through its official website. EduElite cannot change an institute's records or examination decisions."],
    ],
  },
} as const;

export default function InfoPage() {
  const { page } = useParams();
  const info = content[page as keyof typeof content];
  if (!info) return <main className="min-h-screen p-8"><Link to="/">Back to EduElite</Link></main>;
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border px-5 py-4"><div className="mx-auto max-w-3xl"><Logo /></div></header>
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
      <Link to="/" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Home</Link>
      <h1 className="font-display text-4xl sm:text-5xl">{info.title}</h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground">{info.intro}</p>
      <div className="mt-10 divide-y divide-border border-y border-border">
        {info.sections.map(([heading, text]) => <section key={heading} className="py-7"><h2 className="font-display text-2xl">{heading}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p></section>)}
      </div>
      {page === "contact" && <div className="mt-8 flex flex-wrap gap-4 text-sm text-primary">
        <a className="inline-flex min-h-11 items-center gap-2" href="https://www.icai.org/" target="_blank" rel="noreferrer">ICAI <ExternalLink className="h-4 w-4" /></a>
        <a className="inline-flex min-h-11 items-center gap-2" href="https://www.icsi.edu/" target="_blank" rel="noreferrer">ICSI <ExternalLink className="h-4 w-4" /></a>
        <a className="inline-flex min-h-11 items-center gap-2" href="https://icmai.in/" target="_blank" rel="noreferrer">ICMAI <ExternalLink className="h-4 w-4" /></a>
      </div>}
      <p className="mt-12 text-xs text-muted-foreground">Independent platform · Not endorsed by ICAI, ICSI or ICMAI</p>
    </main>
  </div>;
}