import { Badge, Card, CardContent, CardHeader, CardTitle } from "@lablnet/ui";
import {
  Braces,
  Clock3,
  Camera,
  Columns3,
  FileSearch,
  FolderClock,
  GitBranch,
  HardDrive,
  LayoutDashboard,
  MonitorCog,
  PanelRight,
  ScanSearch,
  ShieldCheck,
  Tags,
  TerminalSquare,
  Trash2,
} from "lucide-react";

const features = [
  { icon: <Camera />, title: "Workspace Snapshots", text: "Freeze multi-tab sessions, folder setups, view modes, and shell themes into shareable .morphws files." },
  { icon: <MonitorCog />, title: "Tri-UI shell engine", text: "Switch live between Finder, Explorer, and Dolphin-style navigation while the same file core keeps state intact." },
  { icon: <Columns3 />, title: "Grid, list, and column views", text: "Move from virtualized icon grids to sortable detail tables and macOS-style Miller columns." },
  { icon: <FileSearch />, title: "Command palette", text: "Search commands and files from one keyboard-first launcher tuned to each shell style." },
  { icon: <PanelRight />, title: "Preview everything", text: "Inspect images, video, audio, Markdown, code, PDFs, Office files, text, and unknown file metadata." },
  { icon: <HardDrive />, title: "Storage Analyzer", text: "Visualize large folders with treemap, donut, list, and inspector views before drilling down." },
  { icon: <ScanSearch />, title: "Duplicate Finder", text: "Scan scopes, watch progress, group matching files, and recover disk space with confidence." },
  { icon: <Clock3 />, title: "File Timeline", text: "See recent file activity grouped by time, enriched with Git context where available." },
  { icon: <Trash2 />, title: "Cache Cleaner", text: "Discover npm, Yarn, Gradle, Homebrew, Python, Puppeteer, app, and system cache targets." },
  { icon: <GitBranch />, title: "Git Radar", text: "Surface branch, dirty state, changed files, staged counts, ignored files, and commit history." },
  { icon: <Braces />, title: "Developer Panel", text: "Detect project type, scripts, dependencies, environment files, package metadata, and workspace health." },
  { icon: <TerminalSquare />, title: "Integrated terminal", text: "Open project-scoped terminal sessions alongside navigation without losing folder context." },
  { icon: <Tags />, title: "Directory notes and tags", text: "Attach lightweight annotations to folders, then bring them back through smart collections." },
  { icon: <FolderClock />, title: "Smart collections", text: "Find recent, large, empty, duplicate, annotated, and other high-signal file groups quickly." },
  { icon: <ShieldCheck />, title: "Hardened desktop security", text: "Context isolation, sandboxed processes, CSP, navigation guards, and typed IPC boundaries." },
  { icon: <LayoutDashboard />, title: "Native macOS extras", text: "Optional Swift bridge supports Finder tags, Spotlight metadata, QuickLook thumbnails, and Open With apps." },
];

export function ProductSection() {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-1.25rem))] py-20 sm:w-[min(1180px,calc(100%-2rem))] sm:py-28" id="product">
      <div className="max-w-3xl">
        <Badge variant="outline" className="bg-white">
          Full product surface
        </Badge>
        <h2 className="mt-5 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
          Built for people who treat folders like workspaces.
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          MorphFinder is not just a prettier file list. It combines file
          management, project intelligence, cleanup tools, native previews, and
          developer context in one desktop shell.
        </p>
      </div>

      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card className="rounded-lg border-slate-200 bg-white/86 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" key={feature.title}>
            <CardHeader className="space-y-4 pb-3">
              <span className="grid size-11 place-items-center rounded-lg bg-slate-950 text-white [&_svg]:size-5">
                {feature.icon}
              </span>
              <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-slate-600">{feature.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
