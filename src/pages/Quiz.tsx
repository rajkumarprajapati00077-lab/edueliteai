import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, CheckCircle2, XCircle, Sparkles, ScrollText } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PageTransition } from "@/components/PageTransition";
import { SYLLABUS } from "@/data/syllabus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "mcq" | "case-study" | "mcq30";
type Question = { q: string; options: string[]; answer: number; explanation: string };
type Case = { scenario: string; questions: Question[] };

const Quiz = () => {
  const [courseId, setCourseId] = useState<"CA" | "CS" | "CMA">("CA");
  const course = useMemo(() => SYLLABUS.find((c) => c.id === courseId)!, [courseId]);
  const [levelId, setLevelId] = useState(course.levels[0].id);
  const level = useMemo(() => course.levels.find((l) => l.id === levelId) ?? course.levels[0], [course, levelId]);
  const [subjectCode, setSubjectCode] = useState(level.subjects[0].code);
  const subject = useMemo(() => level.subjects.find((s) => s.code === subjectCode) ?? level.subjects[0], [level, subjectCode]);
  const [mode, setMode] = useState<Mode>("mcq");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const onCourse = (id: "CA" | "CS" | "CMA") => {
    setCourseId(id);
    const c = SYLLABUS.find((x) => x.id === id)!;
    setLevelId(c.levels[0].id);
    setSubjectCode(c.levels[0].subjects[0].code);
    reset();
  };
  const onLevel = (lid: string) => {
    setLevelId(lid);
    const l = course.levels.find((x) => x.id === lid)!;
    setSubjectCode(l.subjects[0].code);
    reset();
  };
  const reset = () => { setQuestions([]); setCases([]); setPicked({}); setSubmitted(false); };

  const generate = async () => {
    setLoading(true);
    reset();
    try {
      const { data, error } = await supabase.functions.invoke("quiz-generator", {
        body: { course: course.name, level: level.name, subject: subject.name, mode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (mode === "case-study") setCases(data?.cases ?? []);
      else setQuestions(data?.questions ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const allQuestions = mode === "case-study"
    ? cases.flatMap((c, i) => c.questions.map((q, j) => ({ ...q, key: `${i}-${j}` })))
    : questions.map((q, i) => ({ ...q, key: `q-${i}` }));

  const score = submitted
    ? allQuestions.reduce((acc, q) => acc + (picked[q.key] === q.answer ? 1 : 0), 0)
    : 0;

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-1">
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight">Quiz Engine</h1>
          </div>
          <p className="text-sm text-muted-foreground">AI-generated MCQs, case studies and 30-mark practice sets across CA, CS, CMA.</p>

          <section className="mt-5 glass-strong rounded-2xl p-5 shadow-3d">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Course">
                <select value={courseId} onChange={(e) => onCourse(e.target.value as any)} className="w-full bg-transparent outline-none text-sm">
                  {SYLLABUS.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
                </select>
              </Field>
              <Field label="Level">
                <select value={levelId} onChange={(e) => onLevel(e.target.value)} className="w-full bg-transparent outline-none text-sm">
                  {course.levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </Field>
              <Field label="Subject">
                <select value={subjectCode} onChange={(e) => { setSubjectCode(e.target.value); reset(); }} className="w-full bg-transparent outline-none text-sm">
                  {level.subjects.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Mode">
                <select value={mode} onChange={(e) => { setMode(e.target.value as Mode); reset(); }} className="w-full bg-transparent outline-none text-sm">
                  <option value="mcq">10 MCQs</option>
                  <option value="mcq30">30-mark MCQ set</option>
                  <option value="case-study">Case studies (5×5)</option>
                </select>
              </Field>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="btn-3d mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-4 py-2 text-sm glow-primary disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate quiz
            </button>
          </section>

          <AnimatePresence>
            {(allQuestions.length > 0 || cases.length > 0) && (
              <motion.section
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-5"
              >
                {mode === "case-study" ? cases.map((c, i) => (
                  <div key={i} className="glass-strong rounded-2xl p-5 shadow-3d">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Case {i + 1}</p>
                    <p className="text-sm mt-1 leading-relaxed flex gap-2">
                      <ScrollText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{c.scenario}</span>
                    </p>
                    <div className="mt-4 space-y-3">
                      {c.questions.map((q, j) => (
                        <QCard key={`${i}-${j}`} q={q} qKey={`${i}-${j}`} picked={picked} setPicked={setPicked} submitted={submitted} />
                      ))}
                    </div>
                  </div>
                )) : questions.map((q, i) => (
                  <QCard key={`q-${i}`} q={q} qKey={`q-${i}`} picked={picked} setPicked={setPicked} submitted={submitted} index={i + 1} />
                ))}

                {!submitted ? (
                  <button
                    onClick={() => setSubmitted(true)}
                    className="btn-3d w-full rounded-xl bg-gradient-primary text-primary-foreground py-3 font-semibold glow-primary"
                  >
                    Submit & reveal answers
                  </button>
                ) : (
                  <div className="glass-strong rounded-2xl p-5 shadow-3d text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Your score</p>
                    <p className="font-display text-3xl text-gradient mt-1">{score} / {allQuestions.length}</p>
                    <button onClick={generate} className="btn-3d mt-3 rounded-full border border-border px-4 py-1.5 text-xs">
                      New quiz
                    </button>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
    <div className="glass rounded-xl px-3 py-2.5">{children}</div>
  </label>
);

const QCard = ({
  q, qKey, picked, setPicked, submitted, index,
}: {
  q: Question; qKey: string;
  picked: Record<string, number>; setPicked: (r: Record<string, number>) => void;
  submitted: boolean; index?: number;
}) => {
  const sel = picked[qKey];
  return (
    <div className="glass rounded-2xl p-4 shadow-3d">
      <p className="text-sm font-medium">
        {index !== undefined && <span className="text-muted-foreground tabular-nums mr-2">Q{index}.</span>}
        {q.q}
      </p>
      <div className="mt-3 grid gap-2">
        {q.options.map((opt, i) => {
          const chosen = sel === i;
          const correct = submitted && i === q.answer;
          const wrong = submitted && chosen && i !== q.answer;
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => setPicked({ ...picked, [qKey]: i })}
              className={`text-left text-sm rounded-xl px-3 py-2 border transition-colors flex items-center gap-2 ${
                correct ? "border-green-500/60 bg-green-500/10"
                : wrong ? "border-red-500/60 bg-red-500/10"
                : chosen ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-[10px] uppercase text-muted-foreground tabular-nums w-4">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{opt}</span>
              {correct && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {wrong && <XCircle className="h-4 w-4 text-red-500" />}
            </button>
          );
        })}
      </div>
      {submitted && (
        <p className="text-[11px] text-muted-foreground mt-2 italic">Why: {q.explanation}</p>
      )}
    </div>
  );
};

export default Quiz;