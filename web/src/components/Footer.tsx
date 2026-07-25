import { Separator } from "@lablnet/ui";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mx-auto w-[min(1180px,calc(100%-1.25rem))] pb-8 sm:w-[min(1180px,calc(100%-2rem))]">
      <Separator />
      <div className="flex flex-col gap-2 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">MorphFinder by lablnet</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Apache-2.0 Open Source</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/lablnet/MorphFinder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-slate-900 transition"
          >
            <Github size={14} /> GitHub Repository
          </a>
          <a href="/privacy" className="hover:text-slate-900 transition">
            Privacy Policy
          </a>
          <span>Copyright © 2026 Lablnet</span>
        </div>
      </div>
    </footer>
  );
}
