import { useState } from "react";
import { PlayCircle, ExternalLink, LockKeyhole, Youtube, Globe, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { LECTURE_SOURCES, getFreeSources, getProSources } from "@/data/lectures";

const TYPE_ICONS = {
  youtube: Youtube,
  portal: Globe,
  app: Smartphone,
};

const Lectures = () => {
  const [showProPitch, setShowProPitch] = useState(false);
  const freeSources = getFreeSources();
  const proSources = getProSources();

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-20 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <PlayCircle />
              </span>
              <div>
                <h1 className="font-display text-3xl">Free Lectures</h1>
                <p className="text-sm text-muted-foreground">
                  Curated official lectures & revision resources for CA students.
                </p>
              </div>
            </div>

            {/* Free sources */}
            <h2 className="mt-8 font-semibold text-lg">🆓 Free for everyone</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {freeSources.map((src) => {
                const Icon = TYPE_ICONS[src.type];
                return (
                  <a
                    key={src.id}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-500">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{src.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {src.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {src.courses.map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Pro-locked section */}
            <div className="mt-8">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">🔒 Pro Lecture Library</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  PRO
                </span>
              </div>

              {!showProPitch ? (
                <div className="mt-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
                  <LockKeyhole className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-3 text-xl font-bold">
                    PW Batches, Revision Marathons & More — Sab Ek Jagah
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Handpicked lecture playlists, one-shot revisions, and amendment updates 
                    from top educators — curated for your course & attempt. No more 
                    searching YouTube for hours.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                    <span className="rounded-full bg-background px-3 py-1">✅ Curated playlists</span>
                    <span className="rounded-full bg-background px-3 py-1">✅ Subject-wise organized</span>
                    <span className="rounded-full bg-background px-3 py-1">✅ Updated every attempt</span>
                  </div>
                  <Button
                    onClick={() => setShowProPitch(true)}
                    className="mt-5 h-12 rounded-xl px-8 text-base"
                  >
                    Unlock for ₹49
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    One-time · All future updates included
                  </p>
                </div>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {proSources.map((src) => {
                    const Icon = TYPE_ICONS[src.type];
                    return (
                      <a
                        key={src.id}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-primary/20 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow"
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{src.name}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {src.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {src.courses.map((c) => (
                                <span
                                  key={c}
                                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="mt-8 rounded-xl border p-4 text-sm text-muted-foreground">
              <p>
                📌 All lectures are from official channels and publicly available free resources. 
                We curate and organize them so you don't waste time searching.
              </p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Lectures;
