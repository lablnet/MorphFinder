import { Badge, Card, CardContent } from "@lablnet/ui";
import { Crown, Sparkles, ShieldCheck, Zap, Compass } from "lucide-react";

export function EnterpriseBannerSection() {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-1.25rem))] py-12 sm:w-[min(1180px,calc(100%-2rem))]" id="enterprise">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-8 shadow-2xl sm:p-12">
        {/* Glow backdrop decorative effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 border border-amber-400/40 bg-amber-500/20 text-amber-300">
                <Crown size={14} className="text-amber-400" />
                ENTERPRISE PRO SUITE UNLOCKED
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                100% FREE & UNLIMITED
              </Badge>
            </div>

            <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl leading-tight">
              All Enterprise Power. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                Zero Subscriptions. Zero Paywalls.
              </span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              MorphFinder ships with an interactive welcome onboarding tour on first launch, guiding you through our Tri-UI shell engine, deep storage analysis, byte-hash duplicate cleaning, and dev suite—out of the box for everyone.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <Compass className="size-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Tri-UI Onboarding</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Switch shell paradigms live from day 1.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <Zap className="size-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Native Acceleration</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Event-driven OS filesystem engine.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <ShieldCheck className="size-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">100% Offline Privacy</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Air-gapped security & CSP sandboxing.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Card className="rounded-xl border-amber-500/30 bg-slate-900/90 p-6 text-white shadow-xl backdrop-blur-xl">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Welcome Tour Banner</h3>
                    <p className="text-xs text-slate-400">Accessible on first launch & Cmd+K</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <span>Storage Analyzer & Treemaps</span>
                    <Badge variant="outline" className="border-amber-400/40 text-amber-300">UNLOCKED</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <span>SHA-256 Duplicate Finder</span>
                    <Badge variant="outline" className="border-amber-400/40 text-amber-300">UNLOCKED</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <span>Git Radar & Dev Control Suite</span>
                    <Badge variant="outline" className="border-amber-400/40 text-amber-300">UNLOCKED</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <span>Time Machine File Stream</span>
                    <Badge variant="outline" className="border-amber-400/40 text-amber-300">UNLOCKED</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
