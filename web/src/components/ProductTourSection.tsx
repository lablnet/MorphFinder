import { Badge, Card, CardContent } from "@lablnet/ui";
import { ArrowDown, FolderOpen, ScanLine, TerminalSquare, Wand2 } from "lucide-react";

const tourSteps = [
  {
    icon: <FolderOpen />,
    title: "Choose your shell",
    text: "Start in Finder, Explorer, or Dolphin mode so the app feels familiar from the first click.",
  },
  {
    icon: <ScanLine />,
    title: "Inspect the workspace",
    text: "Preview files, read metadata, browse timelines, and jump through smart collections.",
  },
  {
    icon: <TerminalSquare />,
    title: "Work like a developer",
    text: "Open Git Radar, Dev Panel, package scripts, dependencies, and terminal sessions beside your files.",
  },
  {
    icon: <Wand2 />,
    title: "Clean with confidence",
    text: "Use Storage Analyzer, Duplicate Finder, and Cache Cleaner before removing anything important.",
  },
];

export function ProductTourSection() {
  return (
    <section
      className="mx-auto w-[min(1180px,calc(100%-1.25rem))] scroll-mt-28 pb-20 sm:w-[min(1180px,calc(100%-2rem))] sm:pb-28"
      id="product-tour"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <Badge variant="secondary" className="gap-2 bg-teal-50 text-teal-700">
              <ArrowDown size={14} />
              Product tour
            </Badge>
            <h2 className="mt-5 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              How MorphFinder will work.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The tour button now lands here. This section can later become a
              video modal, guided carousel, or interactive screenshots when the
              final product media is ready.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {tourSteps.map((step, index) => (
              <Card className="rounded-lg border-slate-200 bg-slate-50" key={step.title}>
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-lg bg-slate-950 text-white [&_svg]:size-5">
                      {step.icon}
                    </span>
                    <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
