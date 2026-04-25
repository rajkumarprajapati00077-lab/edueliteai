import { useState } from "react";
import { motion } from "framer-motion";
import { Music2, Play } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";

type Track = { title: string; ytId: string; by: string };
type Section = { id: string; name: string; tagline: string; tracks: Track[] };

const SECTIONS: Section[] = [
  {
    id: "focus", name: "Peaceful Instrumentals for Focus", tagline: "Hand-picked, no lyrics. Pure concentration fuel.",
    tracks: [
      { title: "Ludovico Einaudi — Nuvole Bianche", ytId: "4VR-6AS0-l4", by: "Ludovico Einaudi" },
      { title: "Yiruma — River Flows in You", ytId: "7maJOI3QMu0", by: "Yiruma" },
      { title: "Joe Hisaishi — Studio Ghibli Piano", ytId: "TbM_2VkUsRA", by: "Joe Hisaishi" },
      { title: "Max Richter — On the Nature of Daylight", ytId: "rVN1B-tUpgs", by: "Max Richter" },
      { title: "Ólafur Arnalds — Re:member", ytId: "leLNHaQp4OA", by: "Ólafur Arnalds" },
      { title: "Nils Frahm — Says", ytId: "dIwwjy4slI8", by: "Nils Frahm" },
      { title: "Erik Satie — Gymnopédies", ytId: "S-Xm7s9eGxU", by: "Erik Satie" },
      { title: "Debussy — Clair de Lune", ytId: "CvFH_6DNRCY", by: "Claude Debussy" },
      { title: "Bach — Cello Suite No. 1", ytId: "mGQLXRTl3Z0", by: "J.S. Bach" },
    ],
  },
  {
    id: "relax", name: "Relaxing & Calming", tagline: "Slow tempo, low BPM. Reset your mind.",
    tracks: [
      { title: "Peaceful Piano — Stress Relief", ytId: "lFcSrYw-ARY", by: "Soothing Relaxation" },
      { title: "Calm Ambient Soundscape", ytId: "DWcJFNfaw9c", by: "Peder B. Helland" },
      { title: "Rain on Window — 8h", ytId: "mPZkdNFkNps", by: "Relax Sleep" },
    ],
  },
  {
    id: "motivation", name: "Motivational", tagline: "Push through the next session.",
    tracks: [
      { title: "Epic Motivation Mix", ytId: "1-xGerv5FOk", by: "Audiomachine" },
      { title: "Cinematic Focus & Drive", ytId: "FjHGZj2IjBk", by: "Two Steps From Hell" },
      { title: "Hans Zimmer — Time", ytId: "RxabLA7UQ9k", by: "Hans Zimmer" },
    ],
  },
  {
    id: "bgm", name: "Best Background Music (BGM)", tagline: "Sit in the back. Stay out of the way.",
    tracks: [
      { title: "lofi hip hop radio — beats to study", ytId: "jfKfPfyJRdk", by: "Lofi Girl" },
      { title: "Synthwave / Chillwave Mix", ytId: "MVPTGNGiI-4", by: "The Sounds of Sundown" },
      { title: "Coffee Shop Jazz", ytId: "Dx5qFachd3A", by: "Cafe Music BGM" },
    ],
  },
  {
    id: "peaceful", name: "Cool & Peaceful Tracks", tagline: "Easy listening, no lyrics in the way.",
    tracks: [
      { title: "Chill Piano — Late Night", ytId: "4xDzrJKXOOY", by: "Peaceful Piano" },
      { title: "Forest Ambience — 10h", ytId: "xNN7iTA57jM", by: "Nature Healing" },
      { title: "Soft Acoustic Guitar", ytId: "8gXnJfWctqs", by: "OCB Relax" },
    ],
  },
  {
    id: "study", name: "Songs that Encourage Studying", tagline: "Tested by students. Brain-on, distractions-off.",
    tracks: [
      { title: "Deep Focus — Music for Studying", ytId: "_4kHxtiuML0", by: "Greenred Productions" },
      { title: "Classical Music for Brain Power", ytId: "PcA0lT-VTtA", by: "HALIDONMUSIC" },
      { title: "Beta Waves — Concentration", ytId: "LpYUfM00cUk", by: "Greenred Productions" },
    ],
  },
];

const Music = () => {
  const [active, setActive] = useState<Track | null>(null);

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-1">
            <Music2 className="h-5 w-5 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight">Study Sound Library</h1>
          </div>
          <p className="text-sm text-muted-foreground">Curated playlists to relax, focus and stay motivated. Streamed via YouTube.</p>

          {active && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 glass-strong rounded-2xl overflow-hidden shadow-3d"
            >
              <div className="aspect-video bg-black">
                <iframe
                  title={active.title}
                  src={`https://www.youtube.com/embed/${active.ytId}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold leading-tight">{active.title}</p>
                  <p className="text-[11px] text-muted-foreground">{active.by}</p>
                </div>
                <button onClick={() => setActive(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
              </div>
            </motion.div>
          )}

          {SECTIONS.map((sec) => (
            <section key={sec.id} className="mt-8">
              <div className="flex items-end justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{sec.name}</h2>
                  <p className="text-xs text-muted-foreground">{sec.tagline}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sec.tracks.map((t) => (
                  <button
                    key={t.ytId}
                    onClick={() => setActive(t)}
                    className="btn-3d text-left glass rounded-2xl p-4 shadow-3d border border-transparent hover:border-primary/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center glow-primary shrink-0">
                        <Play className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold leading-tight truncate">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{t.by}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}

          <p className="text-[11px] text-muted-foreground mt-8">
            Audio streamed from third-party YouTube channels. EduElite does not host or own the tracks.
          </p>
        </main>
      </div>
    </PageTransition>
  );
};

export default Music;