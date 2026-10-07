import { useEffect, useState } from "react";
import { FileCheck2, FileText, Loader2, LockKeyhole, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const papers = [
  "CA Foundation — Accounting", "CA Foundation — Business Laws", "CA Inter — Advanced Accounting",
  "CA Inter — Corporate Laws", "CA Inter — Taxation", "CA Inter — Cost & Management Accounting", "CA Inter — Auditing",
  "CA Final — Financial Reporting", "CA Final — Advanced Financial Management", "CA Final — Audit", "CA Final — Direct Tax",
  "CA Final — Indirect Tax", "CS Executive — Company Law", "CS Professional — Drafting",
  "CMA Foundation — Accounting", "CMA Inter — Cost Accounting", "CMA Final — Corporate Financial Reporting",
];

const toB64 = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(",")[1]);
  r.onerror = rej; r.readAsDataURL(f);
});

const Drop = ({ label, file, onPick }: { label: string; file: File | null; onPick: (f?: File) => void }) => (
  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-5 text-center transition-colors hover:border-primary/60"
    onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files[0]); }}>
    {file ? <FileText className="h-8 w-8 text-primary" /> : <UploadCloud className="h-8 w-8 text-primary" />}
    <strong className="mt-2 text-sm">{label}</strong>
    <span className="mt-1 max-w-full truncate text-xs text-muted-foreground">{file ? file.name : "PDF, JPG or PNG · up to 10 MB"}</span>
    <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
  </label>
);

const CopyChecker = () => {
  const { user } = useAuth();
  const [qp, setQp] = useState<File | null>(null);
  const [ans, setAns] = useState<File | null>(null);
  const [paper, setPaper] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("copy_checks" as never).select("result").eq("user_id", user.id).limit(1).then(({ data }) => {
      const row = (data as { result: string }[] | null)?.[0];
      if (row) { setLocked(true); setResult(row.result); }
    });
  }, [user]);

  const pick = (set: (f: File) => void) => (f?: File) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Choose a file smaller than 10 MB.");
    if (f.type !== "application/pdf" && !f.type.startsWith("image/")) return toast.error("Upload a PDF, JPG or PNG file.");
    set(f);
  };

  const submit = async () => {
    if (!qp || !ans || !paper) return toast.error("Upload the question paper, your answer copy and select a paper.");
    setBusy(true);
    try {
      const enc = async (f: File) => ({ name: f.name, type: f.type, data: await toB64(f) });
      const { data, error } = await supabase.functions.invoke("copy-checker", {
        body: { paper, questionPaper: await enc(qp), answerCopy: await enc(ans) },
      });
      if (error) {
        let body: { error?: string; pro?: boolean } = {};
        try { body = await (error as { context?: Response }).context!.json(); } catch { /* ignore */ }
        if (body.pro) setLocked(true);
        throw new Error(body.error || "Evaluation failed.");
      }
      setResult(data.result); setLocked(true);
      toast.success("Your copy has been checked.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar /><MobileNav />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-20 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileCheck2 /></span>
              <div><h1 className="font-display text-3xl">AI Paper Copy Checker</h1><p className="text-sm text-muted-foreground">Checked like a teacher, as per ICAI evaluation standards.</p></div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><LockKeyhole className="h-3.5 w-3.5" /> PRO · 1 FREE</span>
            </div>


            {locked ? (
              <section className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
                <LockKeyhole className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-2 font-semibold">Your free check is used</h2>
                <p className="mt-1 text-sm text-muted-foreground">Unlock unlimited copy checking with EduElite Pro.</p>
                <Button asChild className="btn-3d mt-4 h-12 rounded-xl px-8"><Link to="/pro">Upgrade to Pro</Link></Button>
              </section>
            ) : (
              <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-3d sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Drop label="1. Exam question paper" file={qp} onPick={pick(setQp)} />
                  <Drop label="2. Your answer copy" file={ans} onPick={pick(setAns)} />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold">3. Paper / subject</label>
                  <Select value={paper} onValueChange={setPaper}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select your paper" /></SelectTrigger>
                    <SelectContent>{papers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={submit} disabled={busy || !qp || !ans || !paper} className="btn-3d mt-4 h-12 w-full rounded-xl">
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your copy… (1–2 min)</> : "Check my copy free"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">Clear, well-lit scans give the most accurate marks.</p>
              </section>
            )}

            {result && (
              <section className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-6">
                <h2 className="font-semibold">Checked &amp; evaluated copy</h2>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">{result}</pre>
              </section>
            )}

            {!result && (
              <Alert className="mt-6 rounded-xl border-primary/30 bg-primary/5">
                <FileCheck2 className="h-4 w-4" />
                <AlertTitle>What you get</AlertTitle>
                <AlertDescription>Question-wise marks matched to your question paper, missing points, presentation notes and teacher-style advice.</AlertDescription>
              </Alert>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
export default CopyChecker;
