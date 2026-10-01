import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, CalendarDays, FileText, MessageCircle, Music2, Network, Sparkles, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { FloatingProfileButton } from "@/components/FloatingProfileButton";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import studentImage from "@/assets/home-study.jpg";
import icaiLogo from "@/assets/authorities/icai.png";
import icsiLogo from "@/assets/authorities/icsi.png";
import icmaiLogo from "@/assets/authorities/icmai.jpg";

const institutes = [
  { name: "ICAI", course: "CA", logo: icaiLogo, href: "https://www.icai.org/" },
  { name: "ICSI", course: "CS", logo: icsiLogo, href: "https://www.icsi.edu/" },
  { name: "ICMAI", course: "CMA", logo: icmaiLogo, href: "https://icmai.in/" },
];

const tools = [
  { icon: BookOpen, to: "/syllabus", title: "Syllabus", detail: "Chapter by chapter", number: "01" },
  { icon: MessageCircle, to: "/chat", title: "AI Tutor", detail: "Ask anything", number: "02" },
  { icon: FileText, to: "/notes", title: "Notes", detail: "Make it stick", number: "03" },
  { icon: Brain, to: "/quiz", title: "Quizzes", detail: "Test yourself", number: "04" },
  { icon: CalendarDays, to: "/calendar", title: "Planner", detail: "Your next step", number: "05" },
  { icon: Network, to: "/inter-linkage", title: "Concept links", detail: "Connect ideas", number: "06" },
  { icon: Timer, to: "/survival-planner", title: "Exam sprint", detail: "Stay on track", number: "07" },
  { icon: Music2, to: "/music", title: "Focus music", detail: "Find your flow", number: "08" },
];

const Landing = () => {
  const { user } = useAuth();
  const path = (to: string) => user ? to : "/auth";

  return (
    <PageTransition>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <Navbar />
        <FloatingProfileButton />
        <main>
          <section className="relative border-b border-border/70 px-4 pb-14 pt-28 sm:px-7 sm:pt-32 lg:pb-20" aria-labelledby="home-title">
            <div className="mx-auto max-w-6xl">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 border-b border-primary/50 pb-2 text-xs font-semibold uppercase text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> CA · CS · CMA workspace
                  </div>
                  <h1 id="home-title" className="font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">EduElite<span className="text-primary">.</span></h1>
                  <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">One place to learn, practise and prepare.</p>
                </div>
                <Button asChild size="lg" className="w-fit gap-3 font-semibold shadow-3d transition-transform hover:-translate-y-1">
                  <Link to={path("/dashboard")}>{user ? "Open workspace" : "Start studying"}<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.55 }} className="mb-8 flex flex-wrap items-center gap-3 border-y border-border/70 py-4 sm:gap-6" aria-label="Professional course institutes">
                <span className="w-full text-[10px] font-semibold uppercase text-muted-foreground sm:w-auto sm:mr-auto">Explore your course</span>
                {institutes.map((institute) => (
                  <a key={institute.name} href={institute.href} target="_blank" rel="noreferrer" className="group flex min-w-0 flex-1 items-center gap-2 border-r border-border/70 pr-2 last:border-r-0 sm:flex-none sm:gap-3 sm:pr-6" aria-label={`${institute.course} course reference — ${institute.name} official website`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-card/80 p-1 shadow-3d transition-transform group-hover:-translate-y-1 sm:h-12 sm:w-12"><img src={institute.logo} alt="" loading="lazy" className="max-h-full max-w-full object-contain" /></span>
                    <span className="min-w-0"><strong className="block text-sm leading-tight sm:text-base">{institute.course}</strong><span className="text-[10px] text-muted-foreground">{institute.name}</span></span>
                  </a>
                ))}
              </motion.div>

              <div className="grid gap-4 lg:grid-cols-[1.05fr_1.7fr] lg:gap-5">
                <Link to={path("/ai-tools")} className="group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-md bg-card shadow-elevated sm:min-h-72 lg:min-h-full" aria-label="Explore AI study tools">
                  <img src={studentImage} alt="Student studying with books and laptop" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <span className="relative m-5 w-fit rounded-sm border border-foreground/20 bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase text-foreground backdrop-blur-lg">Your study desk</span>
                  <div className="relative flex items-end justify-between gap-3 p-5 sm:p-7">
                    <div><h2 className="font-display text-3xl text-foreground sm:text-4xl">A better way to focus.</h2><p className="mt-1 text-xs text-foreground/80">Explore all AI tools</p></div>
                    <ArrowRight className="h-6 w-6 shrink-0 text-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>

                <div id="services" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3" aria-label="Study tools">
                  {tools.map((tool, index) => (
                    <motion.div key={tool.to} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.045 }}>
                      <Link to={path(tool.to)} className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-md border border-border/70 bg-card/55 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-card hover:shadow-elevated sm:h-44" aria-label={tool.title}>
                        <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-110"><tool.icon className="h-5 w-5" strokeWidth={1.8} /></span><span className="text-[10px] text-muted-foreground">{tool.number}</span></div>
                        <div><h3 className="text-sm font-semibold sm:text-base">{tool.title}</h3><p className="mt-0.5 text-[11px] text-muted-foreground">{tool.detail}</p></div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> Built for independent CA, CS & CMA preparation.</div>
            </div>
          </section>
          <section className="px-4 py-12 sm:px-7" aria-label="Privacy"><div className="mx-auto max-w-5xl"><PrivacyNotice /></div></section>
          <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-border/70 px-4 py-5 text-xs text-muted-foreground sm:px-7"><span>© 2026 EduElite</span><span>Independent platform · Not endorsed by ICAI, ICSI or ICMAI</span></footer>
        </main>
      </div>
    </PageTransition>
  );
};

export default Landing;
