import { Check, FileCheck2, Headphones, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Monthly Pro", price: "₹49", suffix: "/ month", icon: Headphones, features: ["Focus music library", "Pro study tools", "Cancel anytime"] },
  { name: "One Attempt", price: "₹249", suffix: "/ attempt", icon: FileCheck2, features: ["Copy-checking access", "Attempt-focused tools", "Detailed study support"] },
];

const Pro = () => (
  <PageTransition>
    <div className="min-h-screen bg-background"><Navbar />
      <main className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> EduElite Pro</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">More focus. Better attempts.</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">Simple plans for focused study and expert-style answer evaluation.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => <section key={plan.name} className="rounded-xl border border-border bg-card p-6 text-left shadow-elevated">
              <plan.icon className="h-7 w-7 text-primary" /><h2 className="mt-4 text-lg font-semibold">{plan.name}</h2>
              <div className="mt-2"><strong className="font-display text-4xl">{plan.price}</strong><span className="text-sm text-muted-foreground"> {plan.suffix}</span></div>
              <ul className="mt-5 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-accent" />{feature}</li>)}</ul>
              <Button asChild className="btn-3d mt-6 h-12 w-full rounded-xl"><Link to="/info/contact">Contact to activate</Link></Button>
            </section>)}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5 text-left"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="font-semibold">Other attempt or timing?</h2><p className="mt-1 text-sm text-muted-foreground">Contact us for a suitable plan. Payments are not collected inside the app yet.</p></div></div></div>
        </div>
      </main>
    </div>
  </PageTransition>
);
export default Pro;
