import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { FileCheck2, FileImage, LockKeyhole, Mail, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const papers = [
  "CA Foundation — Accounting", "CA Foundation — Business Laws", "CA Inter — Advanced Accounting",
  "CA Inter — Taxation", "CA Final — Financial Reporting", "CA Final — Audit",
  "CS Executive — Company Law", "CS Professional — Drafting", "CMA Foundation — Accounting",
  "CMA Inter — Cost Accounting", "CMA Final — Corporate Financial Reporting",
];

const CopyChecker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [paper, setPaper] = useState("");
  const [dragging, setDragging] = useState(false);
  const validFile = useMemo(() => file && (file.type === "application/pdf" || file.type.startsWith("image/")), [file]);

  const choose = (next?: File) => {
    if (!next) return;
    if (next.size > 20 * 1024 * 1024) return toast.error("Choose a file smaller than 20 MB.");
    if (next.type !== "application/pdf" && !next.type.startsWith("image/")) return toast.error("Upload a PDF, JPG or PNG file.");
    setFile(next);
  };
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0]);
  };
  const submit = () => {
    if (!validFile || !paper) return toast.error("Add your answer copy and select a paper first.");
    toast.info("Evaluation delivery is opening soon. Your file has not been uploaded.");
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar /><MobileNav />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-20 sm:px-6 lg:ml-0 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileCheck2 /></span>
              <div><h1 className="font-display text-3xl">AI Paper Copy Checker</h1><p className="text-sm text-muted-foreground">Upload once free. Detailed checking is a Pro feature.</p></div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><LockKeyhole className="h-3.5 w-3.5" /> PRO · 1 FREE</span>
            </div>

            <Alert className="mt-6 rounded-xl border-primary/30 bg-primary/5">
              <Mail className="h-4 w-4" />
              <AlertTitle>Expert-style evaluation</AlertTitle>
              <AlertDescription>Your answer script will be reviewed by our evaluation engine. Detailed checked copies with feedback are designed for email delivery within 1 hour.</AlertDescription>
            </Alert>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <section className="rounded-xl border border-border bg-card p-4 shadow-3d sm:p-6">
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)} onDrop={drop}
                  className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"}`}
                >
                  <UploadCloud className="h-9 w-9 text-primary" />
                  <strong className="mt-3 text-sm">{file ? file.name : "Drop your answer script here"}</strong>
                  <span className="mt-1 text-xs text-muted-foreground">PDF, JPG or PNG · up to 20 MB</span>
                  <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e: ChangeEvent<HTMLInputElement>) => choose(e.target.files?.[0])} />
                </label>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold">Paper / subject</label>
                  <Select value={paper} onValueChange={setPaper}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select your paper" /></SelectTrigger>
                    <SelectContent>{papers.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={submit} className="btn-3d mt-4 h-12 w-full rounded-xl" disabled={!validFile || !paper}>Request free evaluation</Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">Email delivery is not active yet. Your file remains on this device and will not be submitted.</p>
              </section>

              <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
                <h2 className="font-semibold">What you will receive</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-xl border border-border bg-muted/40 p-4"><FileImage className="h-6 w-6 text-muted-foreground" /><p className="mt-6 text-sm font-semibold">Uploaded Copy</p><p className="mt-1 text-xs text-muted-foreground">Your original handwritten answer script.</p></div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4"><FileCheck2 className="h-6 w-6 text-primary" /><p className="mt-6 text-sm font-semibold">Checked &amp; Evaluated Copy</p><p className="mt-1 text-xs text-muted-foreground">Question-wise marks, missing points, presentation notes and a detailed marks breakdown.</p></div>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full rounded-xl"><Link to="/pro">View Pro plans</Link></Button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
export default CopyChecker;
