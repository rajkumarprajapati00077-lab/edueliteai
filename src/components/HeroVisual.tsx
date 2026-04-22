import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Replaces the Three.js HeroScene. Pure CSS + framer-motion parallax.
 * Layers: aurora gradient blob, floating glass cards, soft grid.
 */
export const HeroVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div ref={ref} className="relative w-full h-full pointer-events-none select-none">
      {/* Aurora */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-20 -right-20 h-[420px] w-[420px] rounded-full blur-3xl opacity-60 animate-aurora"
        // eslint-disable-next-line react/forbid-dom-props
      >
        <div className="h-full w-full rounded-full bg-gradient-primary opacity-70" />
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/3 -left-10 h-[320px] w-[320px] rounded-full blur-3xl opacity-50"
      >
        <div className="h-full w-full rounded-full bg-gradient-accent" />
      </motion.div>

      {/* Floating "study card" 1 */}
      <motion.div
        style={{ y: y2 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute right-[10%] top-[18%] w-56 glass-strong rounded-2xl p-4 shadow-3d rotate-[6deg]"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Today · CA Final</p>
        <p className="font-display text-lg mt-1 leading-tight">SA 700 — Modified Opinions</p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-primary" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">42 of 64 minutes</p>
      </motion.div>

      {/* Floating "translator" card */}
      <motion.div
        style={{ y: y3 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute right-[25%] bottom-[20%] w-64 glass-strong rounded-2xl p-4 shadow-3d -rotate-[5deg]"
      >
        <p className="text-[10px] uppercase tracking-widest text-accent">Bilingual Tutor</p>
        <p className="text-sm mt-1.5 italic text-muted-foreground">"GST input credit ki conditions batao…"</p>
        <div className="mt-2 h-px bg-border" />
        <p className="text-sm mt-2 font-medium leading-snug">
          Sec 16(2) lays down four cumulative conditions for ITC eligibility…
        </p>
      </motion.div>

      {/* Floating ring */}
      <motion.div
        style={{ y: y1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute right-[5%] bottom-[8%] h-32 w-32 rounded-full border-2 border-primary/40"
      >
        <div className="absolute inset-2 rounded-full border border-accent/40" />
        <div className="absolute inset-6 rounded-full bg-gradient-primary glow-primary" />
      </motion.div>
    </div>
  );
};