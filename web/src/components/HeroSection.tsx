import { Badge, Button } from "@lablnet/ui";
import { Download, Github, Sparkles } from "lucide-react";
import { ProductMockup } from "./ProductMockup";

const githubRepoHref = "https://github.com/lablnet/MorphFinder";
const githubReleasesHref = "https://github.com/lablnet/MorphFinder/releases";
const macAppStoreHref = "https://apps.apple.com/app/morphfinder/id6793923968";

export function HeroSection() {
  return (
    <section
      className="mx-auto grid w-[min(1320px,calc(100%-1.25rem))] items-center gap-10 pb-14 pt-8 sm:w-[min(1320px,calc(100%-2rem))] sm:pb-20 sm:pt-14 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-14 xl:gap-16"
      id="top"
    >
      <div className="min-w-0 max-w-[34rem]">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-2 bg-white text-slate-700 shadow-sm">
            <Sparkles size={14} />
            Finder, Explorer, and Dolphin in one shell
          </Badge>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 shadow-sm">
            Open Source • Apache-2.0
          </Badge>
        </div>
        <h1 className="max-w-full text-[3.45rem] font-black leading-[0.92] tracking-normal text-slate-950 min-[390px]:text-[3.9rem] sm:text-[5rem] lg:text-[4.7rem] xl:text-[5.25rem]">
          MorphFinder
        </h1>
        <p className="mt-6 max-w-[34rem] text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
          A cross-platform open-source file manager for builders who need fast browsing,
          native previews, storage insight, Git context, terminal work, and
          familiar operating-system layouts without switching tools.
        </p>
        <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-base font-bold text-white transition hover:bg-slate-800 shadow-md sm:w-auto"
            href={macAppStoreHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mac App Store
            <Download size={18} />
          </a>
          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-800 transition hover:bg-slate-50 shadow-sm sm:w-auto"
            href={githubReleasesHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={18} />
            Direct Download
          </a>
          <a
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-bold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            href={githubRepoHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={18} />
            GitHub
          </a>
        </div>
      </div>

      <ProductMockup />
    </section>
  );
}
