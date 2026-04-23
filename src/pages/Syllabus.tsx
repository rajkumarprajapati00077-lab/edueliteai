import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, Layers, ChevronRight, Library } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PageTransition } from "@/components/PageTransition";

type Subject = { code: string; name: string; marks: number; topics: string[] };
type Level = { id: string; name: string; description: string; subjects: Subject[] };
type Course = { id: "CA" | "CS" | "CMA"; name: string; authority: string; tagline: string; levels: Level[] };

const SYLLABUS: Course[] = [
  {
    id: "CA",
    name: "Chartered Accountancy (CA)",
    authority: "ICAI · Institute of Chartered Accountants of India",
    tagline: "Foundation → Intermediate → Final",
    levels: [
      {
        id: "CA-Foundation",
        name: "CA Foundation",
        description: "Entry-level exam after Class 12. Four papers, 400 marks total.",
        subjects: [
          { code: "Paper 1", name: "Accounting", marks: 100, topics: ["Theoretical Framework", "Journal & Ledger", "Bank Reconciliation", "Inventory", "Depreciation", "Partnership Accounts", "Company Accounts"] },
          { code: "Paper 2", name: "Business Laws", marks: 100, topics: ["Indian Contract Act 1872", "Sale of Goods Act 1930", "Partnership Act 1932", "LLP Act 2008", "Companies Act 2013"] },
          { code: "Paper 3", name: "Quantitative Aptitude", marks: 100, topics: ["Business Mathematics", "Logical Reasoning", "Statistics"] },
          { code: "Paper 4", name: "Business Economics", marks: 100, topics: ["Nature & Scope", "Theory of Demand & Supply", "Production & Cost", "Market Structures", "Indian Economy"] },
        ],
      },
      {
        id: "CA-Inter",
        name: "CA Intermediate",
        description: "Six papers across two groups (new scheme). 600 marks total.",
        subjects: [
          { code: "Paper 1", name: "Advanced Accounting", marks: 100, topics: ["Ind AS introduction", "Company Accounts", "Amalgamation", "Branch & Department"] },
          { code: "Paper 2", name: "Corporate & Other Laws", marks: 100, topics: ["Companies Act 2013", "LLP Act", "General Clauses Act", "FEMA"] },
          { code: "Paper 3", name: "Taxation", marks: 100, topics: ["Income Tax", "GST", "Customs basics"] },
          { code: "Paper 4", name: "Cost & Management Accounting", marks: 100, topics: ["Material/Labour/Overhead Costing", "Budgetary Control", "Standard Costing", "Marginal Costing"] },
          { code: "Paper 5", name: "Auditing & Ethics", marks: 100, topics: ["SA series", "Audit Documentation", "Risk Assessment", "Internal Control"] },
          { code: "Paper 6", name: "Financial & Strategic Management", marks: 100, topics: ["Time Value of Money", "Capital Budgeting", "Working Capital", "Strategic Analysis"] },
        ],
      },
      {
        id: "CA-Final",
        name: "CA Final",
        description: "Six papers, two groups. The last frontier — focus on application & judgment.",
        subjects: [
          { code: "Paper 1", name: "Financial Reporting", marks: 100, topics: ["Ind AS in depth", "Consolidated Financial Statements", "Business Combinations", "Integrated Reporting"] },
          { code: "Paper 2", name: "Advanced Financial Management", marks: 100, topics: ["Risk Management", "Derivatives", "Mergers & Acquisitions", "International Financial Management"] },
          { code: "Paper 3", name: "Advanced Auditing, Assurance & Professional Ethics", marks: 100, topics: ["SA series advanced", "Audit of Banks/Insurance", "Forensic Audit", "Professional Ethics"] },
          { code: "Paper 4", name: "Direct Tax Laws & International Taxation", marks: 100, topics: ["PGBP advanced", "Capital Gains", "Transfer Pricing", "DTAA"] },
          { code: "Paper 5", name: "Indirect Tax Laws", marks: 100, topics: ["GST in depth", "Customs & FTP"] },
          { code: "Paper 6", name: "Integrated Business Solutions (Multi-disciplinary)", marks: 100, topics: ["Case studies across FR, Audit, Tax, SFM, Law"] },
        ],
      },
    ],
  },
  {
    id: "CS",
    name: "Company Secretary (CS)",
    authority: "ICSI · Institute of Company Secretaries of India",
    tagline: "CSEET → Executive → Professional",
    levels: [
      {
        id: "CS-Executive",
        name: "CS Executive",
        description: "Seven papers across two modules. Focus on company law & compliance.",
        subjects: [
          { code: "Paper 1", name: "Jurisprudence, Interpretation & General Laws", marks: 100, topics: ["Sources of Law", "Constitution", "Interpretation of Statutes", "General Clauses Act"] },
          { code: "Paper 2", name: "Company Law & Practice", marks: 100, topics: ["Companies Act 2013", "Incorporation", "Share Capital", "Meetings"] },
          { code: "Paper 3", name: "Setting up of Business, Industrial & Labour Laws", marks: 100, topics: ["Business Set-up", "Industrial Disputes", "Labour Codes"] },
          { code: "Paper 4", name: "Corporate Accounting & Financial Management", marks: 100, topics: ["Company Accounts", "Financial Analysis", "Working Capital"] },
          { code: "Paper 5", name: "Capital Market & Securities Laws", marks: 100, topics: ["SEBI Act", "LODR", "ICDR", "SAST"] },
          { code: "Paper 6", name: "Economic, Commercial & Intellectual Property Laws", marks: 100, topics: ["FEMA", "Competition Act", "IPR basics"] },
          { code: "Paper 7", name: "Tax Laws & Practice", marks: 100, topics: ["Direct Taxes", "GST", "Customs basics"] },
        ],
      },
      {
        id: "CS-Professional",
        name: "CS Professional",
        description: "Nine papers across three modules; choose one elective.",
        subjects: [
          { code: "Paper 1", name: "Governance, Risk Management, Compliances & Ethics", marks: 100, topics: ["Corporate Governance", "ERM", "Ethics"] },
          { code: "Paper 2", name: "Drafting, Pleadings & Appearances", marks: 100, topics: ["Drafting techniques", "Pleadings", "Appearances"] },
          { code: "Paper 3", name: "Advanced Tax Laws", marks: 100, topics: ["GST advanced", "Customs", "Direct Tax"] },
          { code: "Paper 4", name: "Secretarial Audit, Compliance Management & Due Diligence", marks: 100, topics: ["Secretarial Audit", "Due Diligence", "Compliance Mgmt"] },
          { code: "Paper 5", name: "Corporate Restructuring, Insolvency & Bankruptcy", marks: 100, topics: ["M&A", "IBC", "Cross-border restructuring"] },
          { code: "Paper 6", name: "Resolution of Corporate Disputes", marks: 100, topics: ["NCLT", "Arbitration", "Mediation"] },
          { code: "Paper 7", name: "Multidisciplinary Case Studies", marks: 100, topics: ["Case-based application across CS subjects"] },
          { code: "Paper 8", name: "Elective (one of: Banking/Insurance/IPR/Forensic Audit/Direct Tax/Labour Laws/Valuations)", marks: 100, topics: ["Specialised study based on chosen elective"] },
        ],
      },
    ],
  },
  {
    id: "CMA",
    name: "Cost & Management Accountancy (CMA)",
    authority: "ICMAI · Institute of Cost Accountants of India",
    tagline: "Foundation → Intermediate → Final",
    levels: [
      {
        id: "CMA-Foundation",
        name: "CMA Foundation",
        description: "Entry-level. Four papers, 400 marks total.",
        subjects: [
          { code: "Paper 1", name: "Fundamentals of Business Laws & Business Communication", marks: 100, topics: ["Contract Act", "Sale of Goods", "Negotiable Instruments", "Communication"] },
          { code: "Paper 2", name: "Fundamentals of Financial & Cost Accounting", marks: 100, topics: ["Accounting basics", "Cost concepts", "Cost sheets"] },
          { code: "Paper 3", name: "Fundamentals of Business Mathematics & Statistics", marks: 100, topics: ["Arithmetic", "Algebra", "Calculus", "Statistics basics"] },
          { code: "Paper 4", name: "Fundamentals of Business Economics & Management", marks: 100, topics: ["Microeconomics", "Macroeconomics", "Management functions"] },
        ],
      },
      {
        id: "CMA-Inter",
        name: "CMA Intermediate",
        description: "Eight papers across two groups.",
        subjects: [
          { code: "Paper 5", name: "Business Laws & Ethics", marks: 100, topics: ["Industrial Laws", "Companies Act", "Ethics"] },
          { code: "Paper 6", name: "Financial Accounting", marks: 100, topics: ["Accounting Standards", "Partnership", "Branch & Department"] },
          { code: "Paper 7", name: "Direct & Indirect Taxation", marks: 100, topics: ["Income Tax basics", "GST"] },
          { code: "Paper 8", name: "Cost Accounting", marks: 100, topics: ["Material/Labour/Overhead", "Methods of Costing"] },
          { code: "Paper 9", name: "Operations Management & Strategic Management", marks: 100, topics: ["Operations Mgmt", "Strategic Mgmt"] },
          { code: "Paper 10", name: "Corporate Accounting & Auditing", marks: 100, topics: ["Company Accounts", "Auditing basics"] },
          { code: "Paper 11", name: "Financial Management & Business Data Analytics", marks: 100, topics: ["FM tools", "Business analytics"] },
          { code: "Paper 12", name: "Management Accounting", marks: 100, topics: ["Marginal Costing", "Budgetary Control", "Decision making"] },
        ],
      },
      {
        id: "CMA-Final",
        name: "CMA Final",
        description: "Eight papers across two groups; includes one elective.",
        subjects: [
          { code: "Paper 13", name: "Corporate & Economic Laws", marks: 100, topics: ["Companies Act advanced", "SEBI", "FEMA"] },
          { code: "Paper 14", name: "Strategic Financial Management", marks: 100, topics: ["Investment decisions", "Risk Mgmt", "International FM"] },
          { code: "Paper 15", name: "Direct Tax Laws & International Taxation", marks: 100, topics: ["DT advanced", "Transfer Pricing", "DTAA"] },
          { code: "Paper 16", name: "Strategic Cost Management", marks: 100, topics: ["Activity Based Costing", "Target Costing", "Lean accounting"] },
          { code: "Paper 17", name: "Cost & Management Audit", marks: 100, topics: ["Cost Audit", "Mgmt Audit", "Internal Audit"] },
          { code: "Paper 18", name: "Corporate Financial Reporting", marks: 100, topics: ["Ind AS", "Consolidation", "Integrated Reporting"] },
          { code: "Paper 19", name: "Indirect Tax Laws & Practice", marks: 100, topics: ["GST advanced", "Customs", "FTP"] },
          { code: "Paper 20", name: "Elective (Strategic Performance Mgmt / Risk Mgmt / Entrepreneurship / Business Valuation)", marks: 100, topics: ["Specialised electives"] },
        ],
      },
    ],
  },
];

const Syllabus = () => {
  const [courseId, setCourseId] = useState<Course["id"]>("CA");
  const course = useMemo(() => SYLLABUS.find((c) => c.id === courseId)!, [courseId]);
  const [levelId, setLevelId] = useState<string>(course.levels[0].id);
  const level = useMemo(() => course.levels.find((l) => l.id === levelId) ?? course.levels[0], [course, levelId]);

  const onCourse = (id: Course["id"]) => {
    setCourseId(id);
    const c = SYLLABUS.find((x) => x.id === id)!;
    setLevelId(c.levels[0].id);
  };

  const totalMarks = level.subjects.reduce((s, x) => s + x.marks, 0);

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-1">
            <Library className="h-5 w-5 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight">Syllabus Sheets</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Full chapter-wise syllabus for CA, CS and CMA. Pick a course and level to see every subject, mark distribution and core topics.
          </p>

          {/* Course selector */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {SYLLABUS.map((c) => {
              const active = c.id === courseId;
              return (
                <button
                  key={c.id}
                  onClick={() => onCourse(c.id)}
                  className={`btn-3d text-left rounded-2xl p-4 border transition-all ${
                    active
                      ? "border-primary bg-gradient-primary text-primary-foreground glow-primary"
                      : "border-border bg-card/40 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <p className="font-display font-semibold">{c.name}</p>
                  </div>
                  <p className={`text-[11px] mt-1 ${active ? "opacity-90" : "text-muted-foreground"}`}>{c.authority}</p>
                  <p className={`text-[11px] mt-0.5 ${active ? "opacity-80" : "text-muted-foreground"}`}>{c.tagline}</p>
                </button>
              );
            })}
          </div>

          {/* Level tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {course.levels.map((l) => {
              const active = l.id === levelId;
              return (
                <button
                  key={l.id}
                  onClick={() => setLevelId(l.id)}
                  className={`btn-3d rounded-full px-4 py-1.5 text-xs border transition-colors ${
                    active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>

          {/* Level summary */}
          <AnimatePresence mode="wait">
            <motion.section
              key={level.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-5 glass-strong rounded-2xl p-6 shadow-3d"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> {level.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
                  <p className="font-display text-2xl font-bold text-gradient tabular-nums">
                    {level.subjects.length} <span className="text-base text-muted-foreground">papers</span> · {totalMarks} <span className="text-base text-muted-foreground">marks</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-3">
                {level.subjects.map((s, i) => (
                  <motion.div
                    key={s.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="glass rounded-2xl p-4 shadow-3d"
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
                    <ul className="mt-3 space-y-1">
                      {s.topics.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="h-3.5 w-3.5 text-primary/70 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </AnimatePresence>

          <p className="text-[11px] text-muted-foreground mt-4">
            Reference syllabus compiled from ICAI, ICSI and ICMAI publications. Always verify with the latest official notification before your attempt.
          </p>
        </main>
      </div>
    </PageTransition>
  );
};

export default Syllabus;