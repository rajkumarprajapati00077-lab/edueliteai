import { ShieldCheck } from "lucide-react";

export const PrivacyNotice = ({ className = "" }: { className?: string }) => (
  <div className={`glass rounded-2xl p-4 flex gap-3 items-start ${className}`}>
    <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-primary grid place-items-center glow-primary">
      <ShieldCheck className="h-4 w-4 text-primary-foreground" />
    </div>
    <div>
      <p className="text-sm font-display font-semibold">Privacy you can study with.</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        EduElite uses AI strictly to help students prepare for CA, CS and CMA exams. Your notes,
        chats and study data stay private to your account — never sold, never used to train public models.
      </p>
    </div>
  </div>
);