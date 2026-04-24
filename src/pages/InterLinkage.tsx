import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Scale, Calculator, BookOpen, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

type Linkage = { concept: string; law: string; directTax: string; accounts: string; audit: string };

const pillars = [
  { key: "law", label: "Corporate / Business Law", icon: Scale, accent: "from-violet-500/30 to-fuchsia-500/10" },
  { key: "directTax", label: "Direct Tax", icon: Calculator, accent: "from-amber-500/30 to-orange-500/10" },
  { key: "accounts", label: "Accounts / IND-AS", icon: BookOpen, accent: "from-emerald-500/30 to-teal-500/10" },
  { key: "audit", label: "Audit (SAs)", icon: ShieldCheck, accent: "from-sky-500/30 to-cyan-500/10" },
] as const;

export default function InterLinkage() {
  const [concept, setConcept] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Linkage | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("linkage", { body: { concept } });
      if (error) throw error;
      if ((res as any)?.error) throw new Error((res as any).error);
      setData(res as Linkage);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to fetch linkage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 px-4 md:px-10 py-8 max-w-6xl mx-auto w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Inter-Linkage Engine
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient">One concept. Four pillars.</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Enter any CA / CS / CMA concept and see exactly how it shows up in Law, Direct Tax, Accounts and Audit — with sections and standards.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-10">
              <Input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder='Try "Revenue Recognition", "Related Party Transactions", "Bonus Shares"…'
                className="h-14 text-base"
                disabled={loading}
              />
              <Button type="submit" size="lg" className="h-14 px-8 bg-gradient-primary glow-primary" disabled={loading || !concept.trim()}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Linking…</> : "Inter-link"}
              </Button>
            </form>

            {loading && (
              <div className="grid sm:grid-cols-2 gap-5">
                {pillars.map((p) => (
                  <Card key={p.key} className="h-48 glass animate-pulse" />
                ))}
              </div>
            )}

            {data && (
              <>
                <div className="mb-6 p-5 rounded-2xl glass-strong border border-primary/20">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Concept</p>
                  <p className="font-display text-2xl font-semibold text-gradient mt-1">{data.concept}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  {pillars.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <motion.div
                        key={p.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Card className={`relative overflow-hidden p-6 glass-strong shadow-3d hover:glow-primary transition`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-60 pointer-events-none`} />
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                                <Icon className="h-5 w-5 text-primary-foreground" />
                              </div>
                              <h3 className="font-display text-lg font-semibold">{p.label}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                              {(data as any)[p.key]}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
}