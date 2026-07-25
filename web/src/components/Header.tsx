import { useState } from "react";
import { Button } from "@lablnet/ui";
import { Download, Github, Menu, X, ExternalLink, Apple } from "lucide-react";

const githubRepoHref = "https://github.com/lablnet/MorphFinder";
const githubReleasesHref = "https://github.com/lablnet/MorphFinder/releases";
const macAppStoreHref = "https://apps.apple.com/app/morphfinder/id6793923968";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Tour", href: "#product-tour" },
  { label: "Workflows", href: "#workflows" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Platform", href: "#platform" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-3 z-30 mx-auto mt-3 flex w-[min(1180px,calc(100%-1rem))] items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 shadow-[0_18px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:top-4 sm:mt-4 sm:w-[min(1180px,calc(100%-2rem))] sm:px-4">
        <a className="flex min-w-0 items-center gap-2 font-black text-slate-950" href="#top">
          <img className="size-10 shrink-0 rounded-lg" src="/logo.png" alt="MorphFinder logo" />
          <span className="hidden sm:inline">MorphFinder</span>
        </a>

        <nav className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex">
          {navItems.map((item) => (
            <a
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            href={githubRepoHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            href={macAppStoreHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Apple size={16} />
            App Store
          </a>
          <button
            type="button"
            onClick={() => setDownloadModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            Download
            <Download size={16} />
          </button>
          <Button
            aria-label="Toggle menu"
            size="icon"
            variant="outline"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-3 top-20 z-40 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
            <hr className="my-1 border-slate-100" />
            <a
              href={macAppStoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
            >
              <span className="flex items-center gap-2"><Apple size={16} /> Mac App Store</span>
              <ExternalLink size={14} />
            </a>
            <a
              href={githubReleasesHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800"
            >
              <span className="flex items-center gap-2"><Download size={16} /> GitHub Releases (Direct)</span>
              <ExternalLink size={14} />
            </a>
            <a
              href={githubRepoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              <span className="flex items-center gap-2"><Github size={16} /> GitHub Repository</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Download Choice Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900">Download MorphFinder</h3>
              <button
                type="button"
                onClick={() => setDownloadModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Choose your preferred download source for MorphFinder desktop:
            </p>
            <div className="space-y-3">
              <a
                href={macAppStoreHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDownloadModalOpen(false)}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-900 p-4 text-white hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
                    <Apple size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-base">Mac App Store</div>
                    <div className="text-xs text-slate-300">Official Apple App Store release</div>
                  </div>
                </div>
                <ExternalLink size={18} className="text-slate-400" />
              </a>

              <a
                href={githubReleasesHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDownloadModalOpen(false)}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Download size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-base">GitHub Releases (Direct)</div>
                    <div className="text-xs text-slate-500">DMG, Windows Setup, Linux AppImage</div>
                  </div>
                </div>
                <ExternalLink size={18} className="text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
