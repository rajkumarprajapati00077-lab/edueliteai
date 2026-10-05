import { Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import {
  MessageCircle, FileText, Brain, Network, LifeBuoy, Sparkles, FileCheck2,
} from "lucide-react";

const tools = [
  { to: "/chat",            icon: MessageCircle, title: "AI Tutor",             desc: "Ask doubts in Hindi, get exam-grade English answers with sections & case laws.",         accent: "from-accent to-accent-glow" },
  { to: "/notes",           icon: FileText,      title: "AI Notes Generator",   desc: "Generate polished chapter PDFs in ICAI / ICSI / ICMAI style on demand.",                accent: "from-primary to-accent" },
  { to: "/quiz",            icon: Brain,         title: "AI Quiz Generator",    desc: "Auto-built MCQ quizzes for every chapter with linked official sources.",               accent: "from-emerald-500 to-teal-500" },
  { to: "/inter-linkage",   icon: Network,       title: "Inter-Linkage Mapper", desc: "See how Tax, Law, FR, Audit and Costing concepts connect across papers.",              accent: "from-cyan-500 to-blue-500" },
  { to: "/survival-planner",icon: LifeBuoy,      title: "Survival Planner",     desc: "Last-30-days revision plan auto-built from your pending backlog.",                     accent: "from-amber-500 to-orange-500" },
  { to: "/copy-checker",   icon: FileCheck2,    title: "Paper Copy Checker",   desc: "Upload a handwritten answer copy for detailed marks and feedback.",                    accent: "from-primary to-accent" },
];

const AIToolsHub = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-72 p-6 lg:p-10">
          <div className="max-w-5xl mx-auto pt-12 lg:pt-0 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" /> AI Tools Hub
              </div>
              <h1 className="text-3xl font-display font-bold mt-2">Everything AI in one place</h1>
              <p className="text-muted-foreground text-sm">Pick a tool to get started. All tools are tuned for CA, CS & CMA students.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="group rounded-xl glass p-5 hover:bg-secondary/40 transition-all hover:-translate-y-1"
                >
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.accent} grid place-items-center text-primary-foreground shadow-3d mb-3`}>
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold">{t.title}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default AIToolsHub;