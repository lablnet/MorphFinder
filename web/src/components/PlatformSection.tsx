import { Apple, Monitor, Terminal, ShieldCheck, Download, Code2 } from "lucide-react";

const platforms = [
  {
    name: "macOS",
    icon: Apple,
    badge: "Available Now",
    badgeColor: "border-blue-200 bg-blue-50 text-blue-700",
    description: "Mac App Store (.pkg) & Direct Release (.dmg / .zip). Optimized for Apple Silicon (M1/M2/M3/M4) & Intel.",
    buildCmd: "pnpm build:mas  # or pnpm build:mac",
    downloadUrl: "https://apps.apple.com/app/morphfinder/id6793923968"
  },
  {
    name: "Windows 11",
    icon: Monitor,
    badge: "Ready to Build",
    badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    description: "Windows Setup (.exe NSIS) & Microsoft Store MSIX package. Supports Explorer Command Bar and native paths.",
    buildCmd: "pnpm build:win",
    downloadUrl: "https://github.com/lablnet/MorphFinder/releases"
  },
  {
    name: "Linux",
    icon: Terminal,
    badge: "Ready to Build",
    badgeColor: "border-purple-200 bg-purple-50 text-purple-700",
    description: "Universal AppImage & Debian/Ubuntu (.deb) distribution packages. Supports KDE Dolphin places & terminal status.",
    buildCmd: "pnpm build:linux",
    downloadUrl: "https://github.com/lablnet/MorphFinder/releases"
  }
];

export function PlatformSection() {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-1.25rem))] py-16 sm:w-[min(1180px,calc(100%-2rem))] sm:py-24" id="platform">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Multi-Platform Support & Distribution
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          MorphFinder runs natively on macOS, Windows, and Linux from a single unified codebase.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {platforms.map((platform) => (
          <div
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
            key={platform.name}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                  <platform.icon size={22} />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold border ${platform.badgeColor}`}>
                  {platform.badge}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{platform.name}</h3>
              <p className="text-sm leading-relaxed text-slate-600 mb-6">{platform.description}</p>
            </div>

            <div>
              <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-blue-300 mb-4 flex items-center justify-between border border-slate-800">
                <span className="flex items-center gap-1.5 truncate">
                  <Code2 size={14} className="text-slate-400 shrink-0" />
                  {platform.buildCmd}
                </span>
              </div>

              <a
                href={platform.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                <Download size={16} /> Get {platform.name} Package
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-2xl sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <ShieldCheck className="mb-4 text-blue-400" size={32} />
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl text-white">
            100% Local-First & Air-Gapped Security
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">
            No telemetry, no tracking, and no external servers. Your local files, metadata, and searches stay exclusively on your device.
          </p>
        </div>
        <a
          href="https://github.com/lablnet/MorphFinder"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-100 active:scale-95"
        >
          View Source Code on GitHub
        </a>
      </div>
    </section>
  );
}
