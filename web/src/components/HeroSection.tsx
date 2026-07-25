import { Badge } from "@lablnet/ui";
import { Download, Github, Sparkles, Apple, Terminal, ShieldCheck } from "lucide-react";
import { ProductMockup } from "./ProductMockup";

const githubRepoHref = "https://github.com/lablnet/MorphFinder";
const githubReleasesHref = "https://github.com/lablnet/MorphFinder/releases";
const macAppStoreHref = "https://apps.apple.com/app/morphfinder/id6793923968";

export function HeroSection() {
  return (
    <section
      className="relative mx-auto grid w-[min(1320px,calc(100%-1.25rem))] items-center gap-10 pb-16 pt-8 sm:w-[min(1320px,calc(100%-2rem))] sm:pb-24 sm:pt-14 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)] lg:gap-14 xl:gap-16"
      id="top"
    >
      {/* Soft Ambient Glow Effect */}
      <div className="pointer-events-none absolute -left-20 top-1/4 -z-10 size-[32rem] rounded-full bg-blue-400/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-1/3 -z-10 size-[32rem] rounded-full bg-purple-400/15 blur-[100px]" />

      <div className="min-w-0 max-w-[36rem]">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-2 border border-slate-200/80 bg-white/90 px-3 py-1 text-slate-800 shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-amber-500 fill-amber-400" />
            Finder, Explorer, & Dolphin in one shell
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-blue-200 bg-blue-50/80 px-3 py-1 text-blue-700 font-semibold shadow-sm">
            <ShieldCheck size={14} /> Open Source • Apache-2.0
          </Badge>
        </div>

        <h1 className="max-w-full text-[3.45rem] font-black leading-[0.92] tracking-tight text-slate-950 min-[390px]:text-[3.9rem] sm:text-[5rem] lg:text-[4.7rem] xl:text-[5.4rem]">
          Morph<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Finder</span>
        </h1>

        <p className="mt-6 max-w-[34rem] text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
          The ultimate cross-platform file manager for power users and developers. Switch dynamically between <strong>macOS Finder</strong>, <strong>Windows Explorer</strong>, and <strong>KDE Dolphin</strong> UI paradigms powered by a high-performance local core.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.30)] transition-all hover:bg-blue-700 hover:shadow-[0_15px_35px_rgba(37,99,235,0.40)] active:scale-95 sm:w-auto"
            href={macAppStoreHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Apple size={20} />
            Mac App Store
            <Download size={18} className="transition-transform group-hover:translate-y-0.5" />
          </a>

          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-5 py-3.5 text-base font-bold text-slate-800 shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 sm:w-auto"
            href={githubReleasesHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={18} className="text-slate-600" />
            Direct Download
          </a>

          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold text-slate-700 transition hover:bg-slate-100/80 active:scale-95 sm:w-auto"
            href={githubRepoHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={18} />
            GitHub
          </a>
        </div>

        {/* OS Support Strip */}
        <div className="mt-8 flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span>Supported Platforms:</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <Apple size={14} /> macOS
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            Windows 11
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <Terminal size={14} /> Linux
          </span>
        </div>
      </div>

      <ProductMockup />
    </section>
  );
}
