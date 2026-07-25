import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, Play, Pause, ExternalLink } from "lucide-react";
import { Badge } from "@lablnet/ui";

export interface ScreenshotSlide {
  src: string;
  title: string;
  description: string;
  tag?: string;
}

const screenshots: ScreenshotSlide[] = [
  {
    src: "/screenshots/1.png",
    title: "Finder Shell Layout",
    description: "Classic macOS Finder look with unified toolbar, sidebar navigation, and detailed file listings.",
    tag: "macOS Shell",
  },
  {
    src: "/screenshots/2.png",
    title: "Finder Shell Right Click Menu",
    description: "macOS Finder shell with native context menu, quick actions, and sidebar navigation.",
    tag: "Context Menu",
  },
  {
    src: "/screenshots/3.png",
    title: "Cache Cleaner",
    description: "Cleans application caches, log files, and temporary system data to reclaim precious storage space.",
    tag: "System Utility",
  },
  {
    src: "/screenshots/4.png",
    title: "Space Analyzer",
    description: "Analyzes disk space distribution by file categories, extension groups, and subfolder footprints.",
    tag: "Disk Insights",
  },
  {
    src: "/screenshots/5.png",
    title: "Developer Tools & Scripts",
    description: "Quick access to npm/bun package scripts, environment definitions, and integrated CLI terminal window.",
    tag: "Dev Workflow",
  },
  {
    src: "/screenshots/6.png",
    title: "Duplicate File Finder",
    description: "Identify duplicate binary contents, duplicate images, and large leftover media with smart hash detection.",
    tag: "Cleanup Tool",
  },
  {
    src: "/screenshots/8.png",
    title: "Workspace Snapshots",
    description: "Save and restore custom folder layouts, active tabs, view modes, and pinned locations with one click.",
    tag: "Workspaces",
  },
  {
    src: "/screenshots/9.png",
    title: "Git Radar",
    description: "Real-time repository branch radar detecting uncommitted changes, staged files, and git diff summaries.",
    tag: "Git Integration",
  },
  {
    src: "/screenshots/10.png",
    title: "Smart Collections",
    description: "Quickly access automated virtual folders including Annotated Folders, Build Artifacts, Duplicates, Empty Folders, Large Files, Old Downloads, Recent Files, and Screenshots.",
    tag: "Organization",
  },
];

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const thumbnailRowRef = useRef<HTMLDivElement>(null);

  const prevSlide = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  }, []);

  // Auto-play slideshow timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  // Keyboard navigation & scroll active thumbnail into view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide, isFullscreen]);

  useEffect(() => {
    if (!thumbnailRowRef.current) return;
    const activeThumb = thumbnailRowRef.current.children[currentIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentIndex]);

  const active = screenshots[currentIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Showcase Container */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 hover:border-slate-700">

        {/* Top Header Bar inside Frame */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5">
              <span className="size-3 rounded-full bg-rose-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
            </span>
            <span className="text-xs font-mono text-slate-400">MorphFinder Preview • {active.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs">
              {active.tag || "Feature"}
            </Badge>

            {/* Auto-Play Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${isPlaying
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              title={isPlaying ? "Pause Slideshow" : "Play Auto Slideshow"}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? "Autoplay" : "Play"}</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Fullscreen view"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* Main Screenshot Stage */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 flex items-center justify-center p-2 sm:p-4">
          <img
            src={active.src}
            alt={active.title}
            onLoad={() => setIsLoaded(true)}
            className={`h-full w-full rounded-lg object-contain transition-all duration-500 select-none ${isLoaded ? "opacity-100 scale-100" : "opacity-40 scale-[0.99]"
              }`}
          />

          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/70 p-3 text-white backdrop-blur-md transition-all hover:bg-teal-600 hover:border-teal-500 hover:scale-110 active:scale-95 shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/70 p-3 text-white backdrop-blur-md transition-all hover:bg-teal-600 hover:border-teal-500 hover:scale-110 active:scale-95 shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Bottom Description & Progress Footer */}
        <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/95 p-4 sm:p-6 backdrop-blur-xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-xs font-mono font-bold text-teal-400 border border-teal-500/30">
                  {currentIndex + 1} of {screenshots.length}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white">{active.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 max-w-3xl">{active.description}</p>
            </div>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsLoaded(false);
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-teal-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Thumbnails Navigation */}
      <div
        ref={thumbnailRowRef}
        className="flex gap-3 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {screenshots.map((item, idx) => (
          <button
            key={item.src}
            onClick={() => {
              setIsLoaded(false);
              setCurrentIndex(idx);
            }}
            className={`group relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${idx === currentIndex
              ? "border-teal-400 ring-4 ring-teal-500/20 opacity-100 scale-105 shadow-lg shadow-teal-950/50"
              : "border-slate-800 opacity-50 hover:opacity-100 hover:border-slate-600"
              }`}
          >
            <img src={item.src} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
              <span className="text-[10px] font-semibold text-white truncate">{item.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 sm:p-8 backdrop-blur-2xl animate-in fade-in duration-200">
          {/* Lightbox Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <a
              href={active.src}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              <ExternalLink size={14} />
              Open Original
            </a>
            <button
              onClick={() => setIsFullscreen(false)}
              className="rounded-full bg-white/10 p-2.5 text-white hover:bg-rose-600 transition"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center max-w-6xl w-full gap-4">
            <img
              src={active.src}
              alt={active.title}
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
            />
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-white">{active.title}</h4>
              <p className="text-sm text-slate-300">{active.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

