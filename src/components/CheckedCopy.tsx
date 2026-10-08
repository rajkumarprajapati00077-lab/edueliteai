import { Check, Download, Minus, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";

type Point = { text: string; status: "right" | "wrong" | "missing"; marks: number };
type Q = { number: string; topic: string; obtained: number; max: number; verdict: string; points: Point[]; examiner_note: string; ideal_approach: string };
export type Checked = {
  paper: string; checked_at?: string; total_obtained: number; total_max: number; percentage: number;
  result: string; summary: string; questions: Q[]; presentation: string; advice: string[];
};

export const parseChecked = (raw: string): Checked | null => {
  try { const v = JSON.parse(raw); return v && Array.isArray(v.questions) ? v : null; } catch { return null; }
};

const Mark = ({ s }: { s: Point["status"] }) =>
  s === "right" ? <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={3} aria-label="Correct" />
  : s === "wrong" ? <X className="h-4 w-4 shrink-0 text-destructive" strokeWidth={3} aria-label="Wrong" />
  : <Minus className="h-4 w-4 shrink-0 text-accent" strokeWidth={3} aria-label="Missing" />;

export const downloadCheckedPdf = (c: Checked, name: string) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 48;
  let y = M;
  const need = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; margin(); } };
  const margin = () => { doc.setDrawColor(200, 30, 30); doc.setLineWidth(1); doc.line(M - 12, 0, M - 12, H); };
  const write = (t: string, size = 10, color: [number, number, number] = [30, 30, 30], x = M, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(t, W - x - M);
    for (const l of lines) { need(size + 4); doc.text(l, x, y); y += size + 4; }
  };
  margin();
  write("EduElite · AI Checked Answer Copy", 16, [20, 20, 20], M, true);
  write(`${c.paper}  ·  Student: ${name}  ·  ${new Date(c.checked_at ?? Date.now()).toLocaleString()}`, 9, [100, 100, 100]);
  y += 6;
  const pass = c.result === "Pass";
  doc.setDrawColor(pass ? 22 : 200, pass ? 140 : 30, pass ? 60 : 30); doc.setLineWidth(2);
  doc.circle(W - M - 40, M + 30, 34);
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(200, 30, 30);
  doc.text(`${c.total_obtained}/${c.total_max}`, W - M - 40, M + 32, { align: "center" });
  doc.setFontSize(9); doc.text(`${c.percentage}% · ${c.result}`, W - M - 40, M + 46, { align: "center" });
  write(c.summary, 10, [50, 50, 50]);
  for (const q of c.questions) {
    y += 10; need(40);
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.5); doc.line(M, y - 6, W - M, y - 6);
    write(`Q${q.number}  ${q.topic}`, 12, [20, 20, 20], M, true);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(200, 30, 30);
    doc.text(`${q.obtained} / ${q.max}`, W - M, y - 16, { align: "right" });
    for (const p of q.points) {
      need(16);
      const col: [number, number, number] = p.status === "right" ? [22, 140, 60] : p.status === "wrong" ? [200, 30, 30] : [200, 120, 0];
      doc.setDrawColor(...col); doc.setLineWidth(1.6);
      if (p.status === "right") { doc.line(M + 2, y - 4, M + 5, y); doc.line(M + 5, y, M + 11, y - 9); }
      else if (p.status === "wrong") { doc.line(M + 2, y - 9, M + 10, y); doc.line(M + 10, y - 9, M + 2, y); }
      else doc.line(M + 2, y - 4, M + 10, y - 4);
      const top = y;
      write(p.text, 10, [40, 40, 40], M + 18);
      if (p.marks) { doc.setFontSize(9); doc.setTextColor(...col); doc.text(`+${p.marks}`, W - M, top, { align: "right" }); }
    }
    write(`Examiner: ${q.examiner_note}`, 9.5, [200, 30, 30], M + 18);
    write(`Ideal approach: ${q.ideal_approach}`, 9.5, [80, 80, 80], M + 18);
  }
  y += 10; write("Presentation", 12, [20, 20, 20], M, true); write(c.presentation);
  y += 6; write("Teacher's advice", 12, [20, 20, 20], M, true);
  c.advice.forEach((a, i) => write(`${i + 1}. ${a}`));
  doc.save(`checked-copy-${c.paper.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
};

export const CheckedCopy = ({ c, name }: { c: Checked; name: string }) => {
  const pass = c.result === "Pass";
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-3d">
      <div className="flex flex-wrap items-center gap-4 border-b border-border p-4 sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Checked &amp; evaluated copy</p>
          <h2 className="font-display text-2xl">{c.paper}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
        </div>
        <div className={`grid h-24 w-24 shrink-0 -rotate-6 place-items-center rounded-full border-4 text-center ${pass ? "border-success" : "border-destructive"}`}>
          <div><div className="text-xl font-bold text-destructive">{c.total_obtained}/{c.total_max}</div>
          <div className={`text-xs font-semibold ${pass ? "text-success" : "text-destructive"}`}>{c.percentage}% · {c.result}</div></div>
        </div>
      </div>
      <div className="divide-y divide-border border-l-4 border-l-destructive/60">
        {c.questions.map((q) => (
          <article key={q.number} className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <h3 className="flex-1 font-semibold">Q{q.number} <span className="font-normal text-muted-foreground">· {q.topic}</span></h3>
              <span className="rounded-full border-2 border-destructive px-3 py-0.5 text-sm font-bold text-destructive">{q.obtained} / {q.max}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {q.points.map((p, i) => (
                <li key={i} className={`flex gap-2 text-sm ${p.status === "missing" ? "text-muted-foreground" : ""}`}>
                  <Mark s={p.status} /><span className="flex-1">{p.text}</span>
                  {p.marks > 0 && <span className="text-xs font-semibold text-success">+{p.marks}</span>}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-l-2 border-destructive pl-3 text-sm italic text-destructive">{q.examiner_note}</p>
            <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Ideal approach:</strong> {q.ideal_approach}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 sm:p-6">
        <div><h3 className="font-semibold">Presentation</h3><p className="mt-1 text-sm text-muted-foreground">{c.presentation}</p></div>
        <div><h3 className="font-semibold">Teacher’s advice</h3>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">{c.advice.map((a, i) => <li key={i}>{a}</li>)}</ol></div>
      </div>
      <div className="border-t border-border p-4 sm:p-6">
        <Button onClick={() => downloadCheckedPdf(c, name)} className="btn-3d h-12 w-full rounded-xl sm:w-auto"><Download className="mr-2 h-4 w-4" /> Download checked copy (PDF)</Button>
      </div>
    </section>
  );
};
