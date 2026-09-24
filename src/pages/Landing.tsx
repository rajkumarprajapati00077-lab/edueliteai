import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  FileText,
  Languages,
  LifeBuoy,
  ListChecks,
  MessageCircle,
  Music as MusicIcon,
  Network,
  Settings as SettingsIcon,
  Sparkles,
  UserCircle2,
} from "lucide-react";
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

const authorities = [
  {
    name: "ICAI",
    fullName: "The Institute of Chartered Accountants of India",
    track: "Chartered Accountancy",
    logo: icaiLogo,
    href: "https://www.icai.org/",
  },
  {
    name: "ICSI",
    fullName: "The Institute of Company Secretaries of India",
    track: "Company Secretary",
    logo: icsiLogo,
    href: "https://www.icsi.edu/",
  },
  {
    name: "ICMAI",
    fullName: "The Institute of Cost Accountants of India",
    track: "Cost & Management Accountancy",
    logo: icmaiLogo,
    href: "https://icmai.in/",
  },
];

const features = [
  {
    icon: Brain,
    number: "01",
    title: "A plan that bends around real life",
    desc: "Set your attempt, available hours and pending chapters. Your daily plan adjusts when classes, work or a difficult topic changes the pace.",
    note: "Targets, backlog and weekly rhythm",
  },
  {
    icon: Languages,
    number: "02",
    title: "A tutor that explains before it answers",
    desc: "Ask in Hindi or English. Get a patient explanation first, followed by the precise language and structure you can carry into the examination hall.",
    note: "Bilingual, step-by-step teaching",
  },
  {
    icon: FileText,
    number: "03",
    title: "Notes made to be revised, not admired",
    desc: "Move from full chapter to key points, concepts, charts and a clean PDF without losing the logic that joins one section to the next.",
    note: "Chapter notes and polished PDFs",
  },
];

const services = [
  { icon: Sparkles, to: "/ai-tools", title: "AI Tools Hub", desc: "Tutor, notes, quizzes and planning in one place." },
  { icon: BookOpen, to: "/syllabus", title: "Detailed Syllabus", desc: "Explore course, subject and chapter step by step." },
  { icon: ListChecks, to: "/quiz", title: "Chapter Quizzes", desc: "Practice MCQs and review explanations by chapter." },
  { icon: FileText, to: "/notes", title: "Notes & PDFs", desc: "Keep your library or create focused revision notes." },
  { icon: MessageCircle, to: "/chat", title: "Bilingual AI Tutor", desc: "Ask naturally; learn in clear Hindi or English." },
  { icon: CalendarDays, to: "/calendar", title: "Study Calendar", desc: "Turn an attempt date into a workable daily routine." },
  { icon: Network, to: "/inter-linkage", title: "Inter-Linkage", desc: "Connect concepts across Law, Tax, Accounts and Audit." },
  { icon: LifeBuoy, to: "/survival-planner", title: "Survival Planner", desc: "Build a focused final 36-hour revision sequence." },
  { icon: MusicIcon, to: "/music", title: "Focus Music", desc: "Calm instrumental playlists for long study blocks." },
  { icon: UserCircle2, to: "/profile", title: "Your Profile", desc: "Keep course, level and attempt details together." },
  { icon: SettingsIcon, to: "/settings", title: "Settings & Privacy", desc: "Control your study preferences and private data." },
];

const Landing = () => {
  const { user } = useAuth();
  const destination = user ? "/dashboard" : "/auth";

  return (
    <PageTransition>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <FloatingProfileButton />
        <Navbar />

        <main>
          <section className="relative min-h-[92svh] pt-28 sm:pt-32 pb-12 flex items-center">
            <div className="absolute inset-0 bg-gradient-hero" />
            <div className="absolute inset-0 grid-bg opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
              <div className="grid lg:grid-cols-[1.02fr_.98fr] gap-10 lg:gap-14 items-center">
                <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
                  <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    <span className="h-px w-8 bg-primary" /> Built for the long attempt
                  </p>
                  <h1 className="mt-5 font-display text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[0.98] text-balance">
                    Serious study,<br />with a <em className="font-semibold text-primary">human rhythm.</em>
                  </h1>
                  <p className="mt-6 max-w-xl text-base sm:text-lg leading-8 text-muted-foreground">
                    EduElite helps CA, CS and CMA students understand difficult concepts, plan honest daily work and revise without the noise.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button asChild size="lg" className="btn-3d bg-gradient-primary font-semibold shadow-3d">
                      <Link to={destination}>{user ? "Continue studying" : "Build my study plan"}<ArrowRight /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-card/60 font-semibold">
                      <Link to={user ? "/chat" : "/auth"}>Ask the AI tutor</Link>
                    </Button>
                  </div>
                  <div className="mt-9 grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-5">
                    {["Course-aware", "Hindi + English", "Private workspace"].map((item) => (
                      <span key={item} className="flex items-start gap-1.5 text-[11px] sm:text-xs leading-4 text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {item}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 0.12 }} className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-foreground/10 shadow-elevated">
                    <img src={studentImage} alt="A professional-course student preparing at her study desk" width={1536} height={1024} fetchPriority="high" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                      <p className="max-w-xs font-display text-xl sm:text-2xl leading-snug text-foreground">“One clear chapter at a time.”</p>
                      <p className="mt-1 text-xs text-foreground/70">A workspace designed around how students actually study.</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-3 sm:-right-5 rounded-md border border-primary/25 bg-card px-4 py-3 shadow-elevated">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Tonight</p>
                    <p className="mt-1 text-sm font-medium">2 chapters · 1 revision</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/40 py-10" aria-labelledby="institutes-heading">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your professional pathway</p>
                  <h2 id="institutes-heading" className="mt-2 font-display text-2xl sm:text-3xl font-semibold">Built around India’s three professional courses</h2>
                </div>
                <p className="max-w-lg text-xs leading-5 text-muted-foreground">Institute names and logos identify the courses and link to official sources. EduElite is an independent study platform and is not endorsed by these institutes.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
                {authorities.map((authority) => (
                  <a key={authority.name} href={authority.href} target="_blank" rel="noreferrer" className="group flex min-h-32 items-center gap-4 bg-background p-5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" aria-label={`Visit the official ${authority.name} website`}>
                    <div className="grid h-20 w-24 shrink-0 place-items-center rounded-md bg-foreground p-2">
                      <img src={authority.logo} alt={`${authority.name} logo`} loading="lazy" className="max-h-16 max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{authority.name}</p>
                      <h3 className="mt-1 font-display text-lg leading-tight">{authority.track}</h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{authority.fullName}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground">Official website <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="grid lg:grid-cols-[.7fr_1.3fr] gap-10 lg:gap-20">
                <div className="lg:sticky lg:top-32 lg:self-start">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">How EduElite helps</p>
                  <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold leading-tight">Tools that respect the way you learn.</h2>
                  <p className="mt-5 text-muted-foreground leading-7">No inflated promises. Just thoughtful support for planning, understanding and revising.</p>
                </div>
                <div className="divide-y divide-border border-y border-border">
                  {features.map((feature, index) => (
                    <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.08 }} className="grid sm:grid-cols-[5rem_1fr] gap-5 py-8 sm:py-10">
                      <div className="flex items-center sm:block gap-3">
                        <span className="font-display text-3xl text-primary/70">{feature.number}</span>
                        <feature.icon className="mt-0 sm:mt-5 h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl sm:text-3xl font-semibold">{feature.title}</h3>
                        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{feature.desc}</p>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{feature.note}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/35 py-20 sm:py-24" id="services" aria-label="EduElite study tools">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Inside your workspace</p>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold">Everything has a place.</h2>
                <p className="mt-4 leading-7 text-muted-foreground">Choose the tool you need now. The rest stays quietly out of the way.</p>
              </div>
              <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-border">
                {services.map((service) => (
                  <Link key={service.to} to={user ? service.to : "/auth"} className="group min-h-40 border-b border-r border-border p-6 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                    <div className="flex items-start justify-between">
                      <service.icon className="h-5 w-5 text-primary" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h3 className="mt-7 font-display text-xl font-semibold">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
              <div className="mx-auto h-px max-w-xl editorial-rule" />
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your next study session</p>
              <h2 className="mt-4 font-display text-4xl sm:text-6xl font-semibold leading-tight">Start where you are.<br /><em className="text-primary">We’ll help with the next step.</em></h2>
              <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">Set your course and attempt once. EduElite will shape the workspace around what matters to you.</p>
              <Button asChild size="lg" className="btn-3d mt-8 bg-gradient-primary font-semibold shadow-3d">
                <Link to={destination}>{user ? "Open my workspace" : "Create my workspace"}<ArrowRight /></Link>
              </Button>
            </div>
          </section>

          <section className="border-t border-border py-12">
            <div className="mx-auto max-w-4xl px-5 sm:px-8"><PrivacyNotice /></div>
            <footer className="mx-auto mt-10 flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 text-xs text-muted-foreground">
              <span>© 2026 EduElite</span><span>Made with care for India’s professional students.</span>
            </footer>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

export default Landing;