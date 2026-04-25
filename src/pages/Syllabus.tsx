import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, Layers, ChevronRight, Library, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { SYLLABUS, type Course, type Subject, type Chapter, type Level } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type View =
  | { kind: "course" }
  | { kind: "level"; courseId: Course["id"] }
  | { kind: "subject"; courseId: Course["id"]; levelId: string }
  | { kind: "chapters"; courseId: Course["id"]; levelId: string; subjectCode: string }
  | { kind: "chapter"; courseId: Course["id"]; levelId: string; subjectCode: string; chapterId: string }
  | { kind: "summary"; courseId: Course["id"]; levelId: string; subjectCode: string };

const Syllabus = () => {
  const [view, setView] = useState<View>({ kind: "course" });

  const course = useMemo(
    () => ("courseId" in view ? SYLLABUS.find((c) => c.id === (view as any).courseId) : undefined),
    [view],
  );
  const level = useMemo<Level | undefined>(() => {
    if (!course || !("levelId" in view)) return undefined;
    return course.levels.find((l) => l.id === (view as any).levelId);
  }, [course, view]);
  const subject = useMemo<Subject | undefined>(() => {
    if (!level || !("subjectCode" in view)) return undefined;
    return level.subjects.find((s) => s.code === (view as any).subjectCode);
  }, [level, view]);
  const chapter = useMemo<Chapter | undefined>(() => {
    if (!subject || view.kind !== "chapter") return undefined;
    return subject.chapters.find((c) => c.id === view.chapterId);
  }, [subject, view]);

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-6xl mx-auto w-full">
          <Header view={view} setView={setView} course={course} level={level} subject={subject} chapter={chapter} />

          <AnimatePresence mode="wait">
            {view.kind === "course" && <CourseGrid key="course" onPick={(id) => setView({ kind: "level", courseId: id })} />}

            {view.kind === "level" && course && (
              <LevelGrid
                key="level"
                course={course}
                onPick={(lid) => setView({ kind: "subject", courseId: course.id, levelId: lid })}
              />
            )}

            {view.kind === "subject" && course && level && (
              <SubjectGrid
                key="subject"
                course={course}
                level={level}
                onPick={(code) => setView({ kind: "chapters", courseId: course.id, levelId: level.id, subjectCode: code })}
                onSummary={() => setView({ kind: "summary", courseId: course.id, levelId: level.id, subjectCode: "__ALL__" })}
              />
            )}

            {view.kind === "chapters" && course && level && subject && (
              <ChapterList
                key="chapters"
                course={course}
                level={level}
                subject={subject}
                onPick={(chId) =>
                  setView({ kind: "chapter", courseId: course.id, levelId: level.id, subjectCode: subject.code, chapterId: chId })
                }
                onSummary={() =>
                  setView({ kind: "summary", courseId: course.id, levelId: level.id, subjectCode: subject.code })
                }
              />
            )}

            {view.kind === "chapter" && course && level && subject && chapter && (
              <ChapterView key="chapter" course={course} level={level} subject={subject} chapter={chapter} />
            )}

            {view.kind === "summary" && course && level && (
              <AllChapterSummary
                key="summary"
                course={course}
                level={level}
                subject={view.subjectCode === "__ALL__" ? undefined : level.subjects.find((s) => s.code === view.subjectCode)}
              />
            )}
          </AnimatePresence>

          <p className="text-[11px] text-muted-foreground mt-6">
            Reference syllabus compiled from ICAI, ICSI and ICMAI publications. Always verify with the latest official notification before your attempt.
          </p>
        </main>
      </div>
    </PageTransition>
  );
};

/* ---------------- Header / breadcrumb ---------------- */

const Header = ({
  view, setView, course, level, subject, chapter,
}: {
  view: View;
  setView: (v: View) => void;
  course?: Course; level?: Level; subject?: Subject; chapter?: Chapter;
}) => {
  const back = () => {
    if (view.kind === "level") setView({ kind: "course" });
    else if (view.kind === "subject") setView({ kind: "level", courseId: view.courseId });
    else if (view.kind === "chapters") setView({ kind: "subject", courseId: view.courseId, levelId: view.levelId });
    else if (view.kind === "chapter")
      setView({ kind: "chapters", courseId: view.courseId, levelId: view.levelId, subjectCode: view.subjectCode });
    else if (view.kind === "summary") {
      if (view.subjectCode === "__ALL__")
        setView({ kind: "subject", courseId: view.courseId, levelId: view.levelId });
      else setView({ kind: "chapters", courseId: view.courseId, levelId: view.levelId, subjectCode: view.subjectCode });
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <Library className="h-5 w-5 text-primary" />
        <h1 className="font-display text-3xl font-bold tracking-tight">Syllabus Sheets</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Drill into every chapter of every subject. AI-generated summaries available for each.
      </p>

      {view.kind !== "course" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:border-primary/50"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
          <Crumb onClick={() => setView({ kind: "course" })}>Courses</Crumb>
          {course && (
            <Crumb onClick={() => setView({ kind: "level", courseId: course.id })}>{course.id}</Crumb>
          )}
          {level && (
            <Crumb onClick={() => setView({ kind: "subject", courseId: course!.id, levelId: level.id })}>{level.name}</Crumb>
          )}
          {subject && (
            <Crumb
              onClick={() =>
                setView({ kind: "chapters", courseId: course!.id, levelId: level!.id, subjectCode: subject.code })
              }
            >
              {subject.name}
            </Crumb>
          )}
          {chapter && <Crumb>{chapter.title}</Crumb>}
          {view.kind === "summary" && <Crumb>Summary by AI</Crumb>}
        </div>
      )}
    </div>
  );
};

const Crumb = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:cursor-default"
  >
    <span className="mr-2 opacity-50">/</span>
    {children}
  </button>
);

/* ---------------- Course grid ---------------- */

const CourseGrid = ({ onPick }: { onPick: (id: Course["id"]) => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="grid sm:grid-cols-3 gap-3"
  >
    {SYLLABUS.map((c) => (
      <button
        key={c.id}
        onClick={() => onPick(c.id)}
        className="btn-3d text-left rounded-2xl p-5 border border-border bg-card/40 hover:border-primary/50 transition-all"
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <p className="font-display font-semibold">{c.name}</p>
        </div>
        <p className="text-[11px] mt-2 text-muted-foreground">{c.authority}</p>
        <p className="text-[11px] mt-0.5 text-muted-foreground">{c.tagline}</p>
        <p className="mt-3 text-xs text-primary inline-flex items-center gap-1">
          Open <ChevronRight className="h-3 w-3" />
        </p>
      </button>
    ))}
  </motion.section>
);

/* ---------------- Level grid ---------------- */

const LevelGrid = ({ course, onPick }: { course: Course; onPick: (lid: string) => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="grid sm:grid-cols-3 gap-3"
  >
    {course.levels.map((l) => {
      const total = l.subjects.reduce((s, x) => s + x.marks, 0);
      return (
        <button
          key={l.id}
          onClick={() => onPick(l.id)}
          className="btn-3d text-left rounded-2xl p-5 border border-border bg-card/40 hover:border-primary/50"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <p className="font-display font-semibold">{l.name}</p>
          </div>
          <p className="text-[11px] mt-2 text-muted-foreground">{l.description}</p>
          <p className="mt-3 text-xs text-gradient font-display">
            {l.subjects.length} papers · {total} marks
          </p>
        </button>
      );
    })}
  </motion.section>
);

/* ---------------- Subject grid ---------------- */

const SubjectGrid = ({
  course, level, onPick, onSummary,
}: {
  course: Course; level: Level; onPick: (code: string) => void; onSummary: () => void;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    <div className="grid md:grid-cols-2 gap-3">
      {level.subjects.map((s) => (
        <button
          key={s.code}
          onClick={() => onPick(s.code)}
          className="btn-3d text-left glass rounded-2xl p-4 shadow-3d hover:border-primary/50 border border-transparent"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.code}</p>
                <p className="font-display font-semibold leading-tight">{s.name}</p>
              </div>
            </div>
            <span className="text-[11px] rounded-full bg-secondary px-2 py-0.5 text-muted-foreground tabular-nums shrink-0">
              {s.marks} marks
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">{s.chapters.length} chapters · tap to view</p>
        </button>
      ))}
    </div>

    <button
      onClick={onSummary}
      className="btn-3d mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-4 py-2 text-sm glow-primary"
    >
      <Sparkles className="h-4 w-4" />
      Summary of all subjects by AI
    </button>
    <p className="text-[11px] text-muted-foreground mt-2">Generates a quick faculty-style overview of every paper in {level.name}.</p>
  </motion.section>
);

/* ---------------- Chapter list ---------------- */

const ChapterList = ({
  course, level, subject, onPick, onSummary,
}: {
  course: Course; level: Level; subject: Subject;
  onPick: (id: string) => void; onSummary: () => void;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="glass-strong rounded-2xl p-6 shadow-3d"
  >
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{subject.code}</p>
        <h2 className="font-display text-xl font-semibold">{subject.name}</h2>
        <p className="text-xs text-muted-foreground mt-1">{subject.chapters.length} chapters · {subject.marks} marks</p>
      </div>
      <button
        onClick={onSummary}
        className="btn-3d inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-3.5 py-1.5 text-xs glow-primary"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Summary of all chapters by AI
      </button>
    </div>
    <ol className="grid md:grid-cols-2 gap-2">
      {subject.chapters.map((ch, i) => (
        <li key={ch.id}>
          <button
            onClick={() => onPick(ch.id)}
            className="btn-3d w-full text-left flex items-center justify-between gap-2 rounded-xl border border-border bg-card/40 px-3 py-2.5 hover:border-primary/50"
          >
            <span className="text-sm">
              <span className="text-muted-foreground tabular-nums mr-2">{String(i + 1).padStart(2, "0")}</span>
              {ch.title}
            </span>
            <ChevronRight className="h-4 w-4 text-primary/70" />
          </button>
        </li>
      ))}
    </ol>
  </motion.section>
);

/* ---------------- Single chapter ---------------- */

const ChapterView = ({
  course, level, subject, chapter,
}: { course: Course; level: Level; subject: Subject; chapter: Chapter }) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSummary("");
    try {
      const { data, error } = await supabase.functions.invoke("chapter-summary", {
        body: {
          course: course.name,
          level: level.name,
          subject: subject.name,
          chapter: chapter.title,
          topics: chapter.topics,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data?.summary ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="glass-strong rounded-2xl p-6 shadow-3d"
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{subject.code} · {subject.name}</p>
      <h2 className="font-display text-2xl font-semibold mt-1">{chapter.title}</h2>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Topics covered</p>
        <ul className="grid sm:grid-cols-2 gap-1.5">
          {chapter.topics.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-foreground/90">
              <ChevronRight className="h-4 w-4 text-primary/70 mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-border/40 pt-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-display font-semibold inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Summary by AI
          </h3>
          <button
            onClick={generate}
            disabled={loading}
            className="btn-3d inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-3.5 py-1.5 text-xs glow-primary disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {summary ? "Regenerate" : "Generate summary"}
          </button>
        </div>
        {summary ? (
          <article className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{summary}</article>
        ) : (
          <p className="text-xs text-muted-foreground">Tap “Generate summary” to get a faculty-style overview of this chapter.</p>
        )}
      </div>
    </motion.section>
  );
};

/* ---------------- All-chapters / all-subjects summary ---------------- */

const AllChapterSummary = ({
  course, level, subject,
}: { course: Course; level: Level; subject?: Subject }) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSummary("");
    try {
      const body = subject
        ? {
            course: course.name,
            level: level.name,
            subject: subject.name,
            chapter: "All chapters overview",
            topics: subject.chapters.map((c) => c.title),
          }
        : {
            course: course.name,
            level: level.name,
            subject: `${level.name} — All papers`,
            chapter: "Whole-level overview",
            topics: level.subjects.map((s) => `${s.code}: ${s.name}`),
          };
      const { data, error } = await supabase.functions.invoke("chapter-summary", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data?.summary ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="glass-strong rounded-2xl p-6 shadow-3d"
    >
      <h2 className="font-display text-xl font-semibold inline-flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        {subject ? `${subject.name} — Summary by AI` : `${level.name} — Summary by AI`}
      </h2>
      <p className="text-xs text-muted-foreground mt-1">
        AI-generated overview spanning {subject ? `${subject.chapters.length} chapters` : `${level.subjects.length} papers`}.
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="btn-3d mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-4 py-2 text-sm glow-primary disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {summary ? "Regenerate" : "Generate"}
      </button>

      {summary ? (
        <article className="mt-5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{summary}</article>
      ) : (
        <p className="text-xs text-muted-foreground mt-4">Tap “Generate” to draft a clean, exam-ready summary.</p>
      )}
    </motion.section>
  );
};

export default Syllabus;