import { motion } from "framer-motion";
import { Brain, Languages, ScrollText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroScene } from "@/components/HeroScene";
import { PageTransition } from "@/components/PageTransition";

const features = [
  {
    icon: Brain,
    title: "AI Backlog Manager",
    desc: "Stop drowning in pending modules. Our agent reverse-engineers your ICAI / ICSI syllabus, tracks every unread chapter, and rebuilds a daily plan around your real revision velocity.",
    bullets: ["Auto-prioritises weak topics", "Adapts to missed sessions", "CA Inter & Final ready"],
    accent: "from-primary to-primary-glow",
  },
  {
    icon: Languages,
    title: "Bilingual Concept Translator",
    desc: "Think in Hindi, write like a Rank-holder. Explain Sec 80C, IND-AS 115 or CARO clauses in your own words — we return institute-grade English ready for the answer sheet.",
    bullets: ["Hindi → exam English", "ICAI tone preserved", "Section & case-law citations"],
    accent: "from-accent to-accent-glow",
  },
  {
    icon: ScrollText,
    title: "AI Answer Auditor",
    desc: "Paste your mock-test answer. The auditor scores it the way an ICAI examiner would — marking format, headings, working notes, and missing provisions out of 5, 8 or 16 marks.",
    bullets: ["Step-marking insights", "Presentation feedback", "RTP / MTP calibrated"],
    accent: "from-primary to-accent",
  },
];

const Landing = () => {
  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden">
        <Navbar />

        {/* HERO */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-0 -z-0">
            <HeroScene />
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                The AI Operating System <br />
                for <span className="text-gradient">Professional Students</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                One workspace to plan ICAI modules, translate concepts from Hindi to exam-grade English,
                and audit your answers like a Board examiner would.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground glow-primary hover:scale-[1.03] active:scale-95 transition-transform"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 rounded-xl glass-strong px-6 py-3 font-semibold hover:bg-secondary transition-colors"
                >
                  Try the Translator
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> ICAI aligned</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 14-day trial</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> No card needed</span>
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
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Three engines. <span className="text-gradient">One unfair advantage.</span>
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
                  className="group relative rounded-2xl glass-strong p-6 overflow-hidden hover:-translate-y-1 transition-transform"
                >
                  <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${f.accent} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
                  <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} mb-5 glow-primary`}>
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
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
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="relative rounded-3xl glass-strong p-10 md:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-hero opacity-60" />
              <div className="relative">
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Your <span className="text-gradient">May 2026</span> attempt starts tonight.
                </h3>
                <p className="mt-4 text-muted-foreground">
                  Join 12,400+ CA, CS and CMA students already studying with Aurum AI.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-7 py-3 font-semibold text-primary-foreground glow-primary hover:scale-[1.03] transition-transform"
                >
                  Open my workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <footer className="mt-16 text-center text-xs text-muted-foreground pb-10">
            © 2026 Aurum AI · Made for India's professional students.
          </footer>
        </section>
      </div>
    </PageTransition>
  );
};

export default Landing;