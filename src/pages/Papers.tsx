import { useState } from "react";
import { FileText, Download, ExternalLink, BookOpen, Clock, Award } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COURSES,
  SUBJECTS,
  PAPERS,
  ATTEMPTS,
  PAPER_TYPE_LABELS,
  PAPER_TYPE_DESCRIPTIONS,
  getPapers,
  type Course,
  type PaperType,
} from "@/data/papers";

const TABS: { id: PaperType; label: string; icon: string }[] = [
  { id: "rtp", label: "RTP", icon: "📝" },
  { id: "mtp1", label: "MTP I", icon: "⏱️" },
  { id: "mtp2", label: "MTP II", icon: "⏱️" },
  { id: "pyq", label: "PYQ", icon: "📜" },
];

const Papers = () => {
  const [course, setCourse] = useState<Course>("CA Final");
  const [tab, setTab] = useState<PaperType>("mtp1");
  const [subject, setSubject] = useState<string>("all");
  const [attempt, setAttempt] = useState<string>("all");

  const papers = getPapers(
    course,
    tab,
    subject === "all" ? undefined : subject,
    attempt === "all" ? undefined : attempt
  );
  const subjects = SUBJECTS[course];

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-20 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText />
              </span>
              <div>
                <h1 className="font-display text-3xl">RTP · MTP · PYQ Papers</h1>
                <p className="text-sm text-muted-foreground">
                  Official ICAI practice material — revision papers, mock tests & past exams.
                </p>
              </div>
            </div>

            {/* Course selector */}
            <div className="mt-6 flex flex-wrap gap-2">
              {COURSES.map((c) => (
                <Button
                  key={c}
                  variant={course === c ? "default" : "outline"}
                  onClick={() => {
                    setCourse(c);
                    setSubject("all");
                  }}
                  className="rounded-xl"
                >
                  {c}
                </Button>
              ))}
            </div>

            {/* Type tabs */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    tab === t.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="text-2xl">{t.icon}</div>
                  <div className="mt-1 font-semibold">{t.label}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {PAPER_TYPE_LABELS[t.id]}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {PAPER_TYPE_DESCRIPTIONS[tab]}
            </p>

            {/* Subject & Attempt filters */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-56 rounded-xl">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.paperNo} value={s.name}>
                        {s.paperNo} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={attempt}
                  onValueChange={(v) => {
                    setAttempt(v);
                    setSubject("all");
                  }}
                >
                  <SelectTrigger className="w-44 rounded-xl">
                    <SelectValue placeholder="All attempts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All attempts (8 yrs)</SelectItem>
                    {ATTEMPTS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Papers list */}
            <div className="mt-6 space-y-3">
              {papers.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-3 font-semibold">No papers yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Papers for this combination are being added. Check the BOS portal meanwhile.
                  </p>
                  <Button asChild variant="outline" className="mt-4 rounded-xl">
                    <a
                      href="https://boslive.icai.org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open BOS Portal
                    </a>
                  </Button>
                </div>
              ) : (
                papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl">
                      {TABS.find((t) => t.id === paper.type)?.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{paper.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" />
                          {paper.attempt}
                        </span>
                        {paper.marks && (
                          <span>{paper.marks} marks</span>
                        )}
                        {paper.duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {paper.duration}
                          </span>
                        )}
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                          {PAPER_TYPE_LABELS[paper.type]}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" className="rounded-xl">
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Paper
                        </a>
                      </Button>
                      {paper.answerKeyUrl && (
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
                        >
                          <a
                            href={paper.answerKeyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Answer Key
                          </a>
                        </Button>
                      )}
                      <Button asChild className="rounded-xl">
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info note */}
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium">📚 About these papers & answer keys</p>
              <p className="mt-1 text-muted-foreground">
                RTP, MTP & PYQ are published by ICAI's Board of Studies for student practice. 
                Source: <a href="https://boslive.icai.org" target="_blank" rel="noopener noreferrer" className="underline">BOS Knowledge Portal</a>.
                Attempt each paper under timed conditions, then check against the official answer keys.
                MTP answer keys are uploaded within 48 hours of the paper. RTP answers are included in the RTP document itself.
              </p>
            </div>

            {/* Practice CTA */}
            <div className="mt-4 rounded-xl border bg-card p-5">
              <h3 className="font-semibold">Want interactive practice?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try AI-generated MCQs and case studies from the same syllabus — with instant evaluation.
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <a href="/quiz">MCQ Practice</a>
                </Button>
                <Button asChild className="rounded-xl">
                  <a href="/copy-checker">Check My Copy</a>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Papers;
