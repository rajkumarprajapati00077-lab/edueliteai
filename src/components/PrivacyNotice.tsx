import { ShieldCheck, Lock, GraduationCap } from "lucide-react";

/**
 * Single source of truth for the privacy promise.
 * Rendered ONLY at the bottom of the landing page.
 */
export const PrivacyNotice = ({ className = "" }: { className?: string }) => (
  <div className={`glass-strong rounded-3xl p-6 md:p-8 shadow-3d ${className}`}>
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-primary grid place-items-center glow-primary">
        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold">Your privacy is part of the pedagogy.</p>
        <p className="text-xs text-muted-foreground mt-0.5">A clear, one-line promise from the EduElite team.</p>
      </div>
    </div>
    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
      We use AI for one purpose only — to help CA, CS and CMA students prepare better for their exams.
      Your notes, chats, study targets and personal data stay strictly inside your account. We never sell
      your information, never share it with third parties for advertising, and never feed your private
      content into any public model's training set.
    </p>
    <div className="mt-5 grid sm:grid-cols-3 gap-3">
      <div className="rounded-xl glass p-3 flex items-start gap-2">
        <Lock className="h-4 w-4 text-primary mt-0.5" />
        <div>
          <p className="text-xs font-semibold">Account-private</p>
          <p className="text-[11px] text-muted-foreground">Notes & chats visible only to you.</p>
        </div>
      </div>
      <div className="rounded-xl glass p-3 flex items-start gap-2">
        <GraduationCap className="h-4 w-4 text-primary mt-0.5" />
        <div>
          <p className="text-xs font-semibold">Education-only AI</p>
          <p className="text-[11px] text-muted-foreground">Used solely for exam prep guidance.</p>
        </div>
      </div>
      <div className="rounded-xl glass p-3 flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
        <div>
          <p className="text-xs font-semibold">No model training</p>
          <p className="text-[11px] text-muted-foreground">Your content is never used to train public models.</p>
        </div>
      </div>
    </div>
  </div>
);