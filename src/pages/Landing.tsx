import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  FileText,
  Languages,
  ListChecks,
  MessageCircle,
  Music,
  Network,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { FloatingProfileButton } from "@/components/FloatingProfileButton";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import studentImage from "@/assets/home-study.jpg";
import icaiLogo from "@/assets/authorities/icai.png";
import icsiLogo from "@/assets/authorities/icsi.png";
import icmaiLogo from "@/assets/authorities/icmai.jpg";

const authorities = [
  { name: "ICAI", course: "CA", logo: icaiLogo, href: "https://www.icai.org/" },
  { name: "ICSI", course: "CS", logo: icsiLogo, href: "https://www.icsi.edu/" },
  { name: "ICMAI", course: "CMA", logo: icmaiLogo, href: "https://icmai.in/" },
];

const tools = [
  { icon: Brain, to: "/ai-tools", title: "AI Tools", caption: "Learn smarter" },
  { icon: BookOpen, to: "/syllabus", title: "Syllabus", caption: "Chapter by chapter" },
  { icon: ListChecks, to: "/quiz", title: "Quizzes", caption: "Practice & score" },
  { icon: FileText, to: "/notes", title: "Notes", caption: "Create & revise" },
  { icon: MessageCircle, to: "/chat", title: "AI Tutor", caption: "Ask naturally" },
  { icon: CalendarDays, to: "/calendar", title: "Planner", caption: "Stay on track" },
  { icon: Network, to: "/inter-linkage", title: "Concept Links", caption: "See connections" },
  { icon: Music, to: "/music", title: "Focus Music", caption: "Settle into flow" },
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { delay, duration: 0.55 } }),
};

const Landing = () => {
  const { user } = useAuth();
  const destination = user ? "/dashboard" : "/auth";

  return (
    <PageTransition>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <FloatingProfileButton />
        <Navbar />

        <main>
          <section className="relative flex min-h-[94svh] items-center overflow-hidden pb-10 pt-24 sm:pt-28">
            <div className="absolute inset-0 bg-gradient-hero" />
            <div className="absolute inset-0 grid-bg opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_76%)]" />
            <div className="absolute left-[7%] top-[22%] h-32 w-32 rounded-full border border-primary/20 animate-drift sm:h-48 sm:w-48" />
            <div className="absolute bottom-[12%] right-[6%] h-24 w-24 rounded-full border border-accent/25 animate-drift-delayed sm:h-36 sm:w-36" />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-7">
              <motion.div variants={reveal} initial="hidden" animate="visible" custom={0.05} className="mx-auto mb-7 max-w-3xl text-center">
                <LogoMark size={76} className="mx-auto drop-shadow-[0_12px_26px_hsl(var(--primary)/0.24)] sm:h-24 sm:w-24" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">CA · CS · CMA</p>
                <h1 className="mx-auto mt-3 max-w-3xl font-display text-[clamp(2.35rem,6vw,4.8rem)] font-bold leading-[1.08]">
                  Your study world, <span className="text-gradient">finally in sync.</span>
                </h1>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Plan, understand, practise and revise—without switching between ten different apps.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="btn-3d bg-gradient-primary font-semibold shadow-3d">
                    <Link to={destination}>{user ? "Open my workspace" : "Start studying"}<ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="glass-strong font-semibold">
                    <Link to={user ? "/chat" : "/auth"}><Sparkles className="h-4 w-4" />Ask the tutor</Link>
                  </Button>
                </div>
              </motion.div>

              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
                <motion.div variants={reveal} initial="hidden" animate="visible" custom={0.18} className="bento-tile col-span-2 min-h-56 rounded-2xl md:row-span-2 md:min-h-[21rem]">
                  <img src={studentImage} alt="Student preparing with EduElite" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <span className="inline-flex rounded-full border border-foreground/15 bg-background/70 px-3 py-1 text-[11px] font-semibold backdrop-blur-lg">Today’s plan</span>
                    <h2 className="mt-3 max-w-md font-display text-2xl font-bold sm:text-3xl">One clear step at a time.</h2>
                  </div>
                </motion.div>

                <motion.div variants={reveal} initial="hidden" animate="visible" custom={0.28} className="bento-tile min-h-36 rounded-2xl p-5 md:min-h-0">
                  <Languages className="h-6 w-6 text-primary" />
                  <div className="absolute bottom-5 left-5">
                    <p className="font-display text-lg font-bold">Hindi + English</p>
                    <p className="mt-1 text-xs text-muted-foreground">Explain it my way</p>
                  </div>
                </motion.div>

                <motion.div variants={reveal} initial="hidden" animate="visible" custom={0.34} className="bento-tile min-h-36 rounded-2xl p-5 md:min-h-0">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((bar) => <span key={bar} className="w-2 rounded-full bg-primary" style={{ height: `${16 + bar * 7}px`, opacity: 0.45 + bar * 0.16 }} />)}
                  </div>
                  <div className="absolute bottom-5 left-5">
                    <p className="font-display text-lg font-bold">Attempt ready</p>
                    <p className="mt-1 text-xs text-muted-foreground">Plans that adjust</p>
                  </div>
                </motion.div>

                <motion.div variants={reveal} initial="hidden" animate="visible" custom={0.4} className="bento-tile col-span-2 flex min-h-28 items-center justify-between rounded-2xl p-5 md:min-h-0">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Everything connected</p>
                    <p className="mt-1 font-display text-xl font-bold">Notes → Quiz → Revision</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/40 py-8" aria-label="Professional course institutes">
            <div className="mx-auto max-w-5xl px-4 sm:px-7">
              <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Built for India’s professional pathways</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {authorities.map((authority) => (
                  <a key={authority.name} href={authority.href} target="_blank" rel="noreferrer" className="group flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-2 py-4 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated sm:flex-row sm:gap-4 sm:px-5">
                    <img src={authority.logo} alt={`${authority.name} logo`} loading="lazy" width={80} height={80} className="h-10 w-14 object-contain sm:h-14 sm:w-16" />
                    <div className="min-w-0 sm:text-left">
                      <strong className="block font-display text-base sm:text-lg">{authority.course}</strong>
                      <span className="text-[10px] text-muted-foreground sm:text-xs">{authority.name}</span>
                    </div>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-center text-[10px] leading-4 text-muted-foreground">Course references only. EduElite is an independent platform and is not endorsed by these institutes.</p>
            </div>
          </section>

          <section className="py-16 sm:py-24" id="services">
            <div className="mx-auto max-w-6xl px-4 sm:px-7">
              <div className="mx-auto max-w-xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your workspace</p>
                <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Pick what you need. Begin.</h2>
              </div>
              <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">
                {tools.map((tool, index) => (
                  <motion.div key={tool.to} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 4) * 0.06 }}>
                    <Link to={user ? tool.to : "/auth"} className="bento-tile group flex min-h-36 flex-col justify-between rounded-xl p-4 transition-transform hover:-translate-y-1 sm:min-h-44 sm:p-5">
                      <tool.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                      <div>
                        <h3 className="font-display text-base font-bold sm:text-lg">{tool.title}</h3>
                        <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{tool.caption}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-border py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-7"><PrivacyNotice /></div>
            <footer className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-7">
              <span>© 2026 EduElite</span><span>Made for CA, CS & CMA students.</span>
            </footer>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

export default Landing;