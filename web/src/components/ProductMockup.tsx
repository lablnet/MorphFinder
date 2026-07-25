import { useState } from "react";
import { Apple, Monitor, Laptop, Sparkles } from "lucide-react";

export function ProductMockup() {
  const [activeShell, setActiveShell] = useState<"finder" | "explorer" | "dolphin">("finder");

  return (
    <figure className="relative min-w-0 rounded-2xl border border-slate-800/80 bg-slate-950 p-2.5 shadow-[0_25px_90px_rgba(15,23,42,0.30)] sm:p-4 lg:w-full lg:max-w-[680px] lg:justify-self-end xl:max-w-[760px] overflow-hidden">
      {/* Top Window Chrome Bar */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5 px-2">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-rose-500/90" />
          <div className="size-3 rounded-full bg-amber-500/90" />
          <div className="size-3 rounded-full bg-emerald-500/90" />
        </div>

        {/* Live Shell Strategy Switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveShell("finder")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              activeShell === "finder"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Apple size={12} /> Finder
          </button>
          <button
            type="button"
            onClick={() => setActiveShell("explorer")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              activeShell === "explorer"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor size={12} /> Explorer
          </button>
          <button
            type="button"
            onClick={() => setActiveShell("dolphin")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              activeShell === "dolphin"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Laptop size={12} /> Dolphin
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <Sparkles size={12} className="text-blue-400" /> Tri-UI Active
        </div>
      </div>

      {/* Screenshot Preview with Smooth Transition */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
        <img
          alt="MorphFinder app interface preview"
          className="h-auto max-h-[58vh] w-full rounded-xl object-contain transition-all duration-300 sm:max-h-[64vh]"
          src="/screenshort.png"
        />
        <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-slate-700/60 shadow-lg">
          {activeShell === "finder" && "🍏 Finder Layout: Miller Columns & Unified Toolbar"}
          {activeShell === "explorer" && "🪟 Explorer Layout: Windows Command Bar & Details Pane"}
          {activeShell === "dolphin" && "🐧 Dolphin Layout: KDE Places & Integrated Terminal"}
        </div>
      </div>
    </figure>
  );
}
