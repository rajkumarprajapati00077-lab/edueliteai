import { motion } from "framer-motion";
import { Brain, Languages, ScrollText, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroVisual } from "@/components/HeroVisual";
import { PageTransition } from "@/components/PageTransition";
import { FloatingProfileButton } from "@/components/FloatingProfileButton";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Brain,
    title: "Daily Targets & Backlog AI",
    desc: "Set tonight's targets in seconds. EduElite tracks every unread chapter across ICAI / ICSI / ICMAI modules and rebuilds your plan around your real revision velocity.",
    bullets: ["Daily target tracker + streaks", "Weekly study calendar", "CA / CS / CMA aware"],
    accent: "from-primary to-primary-glow",
  },
  {
    icon: Languages,
    title: "AI Tutor & Bilingual Translator",
    desc: "Think in Hindi, write like a rank-holder. Ask Sec 80C, IND-AS 115 or CARO clauses in your own words — your AI tutor explains and returns institute-grade English ready for the answer sheet.",
    bullets: ["Hindi → exam-grade English", "Step-by-step teacher tone", "Section & case-law citations"],
    accent: "from-accent to-accent-glow",
  },
  {
    icon: FileText,
    title: "Notes Library + AI PDF Generator",
    desc: "Browse chapter-wise notes uploaded by toppers, or generate a fresh study-note PDF for any chapter on demand — ICAI module language, ready to download.",
    bullets: ["Chapter PDFs by course / subject", "AI-generated chapter notes", "One-tap PDF download"],
    accent: "from-primary to-accent",
  },
];

const Landing = () => {
  const { user } = useAuth();
  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden">
        <FloatingProfileButton />
        <Navbar />

        {/* HERO */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-0 hidden md:block">
            <HeroVisual />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-6">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                Built for CA · CS · CMA — May & Nov 2026 attempts
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
                Study like a <span className="italic text-gradient">rank&#8209;holder.</span><br />
                Powered by <span className="text-gradient">EduElite</span>.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Plan daily ICAI targets, ask an AI tutor in Hindi or English, and download
                chapter-wise notes as PDFs — one premium workspace built for India's CA, CS &amp; CMA students.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={user ? "/dashboard" : "/auth"}
                  className="btn-3d inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground glow-primary"
                >
                  {user ? "Open my workspace" : "Get started"} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/chat"
                  className="btn-3d inline-flex items-center gap-2 rounded-xl glass-strong px-6 py-3 font-semibold"
                >
                  Ask the AI Tutor
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> ICAI aligned</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Live ICSI &amp; ICMAI updates</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Private to your account</span>
              </div>
            </motion.div>
            <div className="hidden md:block h-[420px]" />
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Three engines. <span className="italic text-gradient">One unfair advantage.</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Designed with rank-holders, audited by practising CAs. Every workflow is calibrated to ICAI module language and exam scoring patterns.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative rounded-2xl glass-strong p-6 overflow-hidden btn-3d"
                >
                  <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${f.accent} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
                  <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} mb-5 glow-primary`}>
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                  <ul className="space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 max-w-3xl mx-auto">
              <PrivacyNotice />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="relative rounded-3xl glass-strong p-10 md:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-hero opacity-60" />
              <div className="relative">
                <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                  Your <span className="italic text-gradient">May 2026</span> attempt starts tonight.
                </h3>
                <p className="mt-4 text-muted-foreground">
                  Join 12,400+ CA, CS and CMA students already studying with EduElite.
                </p>
                <Link
                  to={user ? "/dashboard" : "/auth"}
                  className="btn-3d mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3 font-semibold text-primary-foreground glow-primary"
                >
                  Open my workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <footer className="mt-16 text-center text-xs text-muted-foreground pb-10">
            © 2026 EduElite · Made for India's professional students.
          </footer>
        </section>
      </div>
    </PageTransition>
  );
};

export default Landing;