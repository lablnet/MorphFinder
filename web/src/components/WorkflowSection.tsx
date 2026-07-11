import { Badge, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@lablnet/ui";
import { Check, FolderSearch, GitCompareArrows, Sparkles, Wand2 } from "lucide-react";

const workflowItems = [
  "Browse with the shell style your hands already know.",
  "Preview and classify files without opening five separate apps.",
  "Find project state, scripts, dependencies, Git changes, and terminal work together.",
  "Clean caches, duplicates, and heavy folders after understanding the impact.",
];

const tabs = [
  { value: "organize", icon: <FolderSearch />, title: "Organize faster", text: "Tabs, session restore, sidebar navigation, breadcrumbs, history controls, and multiple view modes keep deep folder work calm." },
  { value: "inspect", icon: <Sparkles />, title: "Inspect with context", text: "Native thumbnails, metadata, file viewers, tags, notes, timeline, and smart collections make files easier to understand." },
  { value: "develop", icon: <GitCompareArrows />, title: "Develop in place", text: "Git Radar, Dev Panel, integrated terminal, package scripts, dependency views, and project detection meet you inside the folder." },
  { value: "clean", icon: <Wand2 />, title: "Clean carefully", text: "Storage Analyzer, Duplicate Finder, and Cache Cleaner help reclaim space without blind deletion." },
];

export function WorkflowSection() {
  return (
    <section className="overflow-hidden bg-slate-950 py-20 text-white sm:py-28" id="workflows">
      <div className="mx-auto grid w-[min(1180px,calc(100%-1.25rem))] gap-10 sm:w-[min(1180px,calc(100%-2rem))] lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Badge variant="secondary" className="gap-2 bg-teal-400/15 text-teal-100">
            <Sparkles size={14} />
            Daily workflows
          </Badge>
          <h2 className="mt-5 text-4xl font-black leading-tight tracking-normal sm:text-5xl">
            One desktop command center for file-heavy work.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The product story is simple: browse like a native file manager,
            inspect like a power tool, and act like a developer workspace.
          </p>
          <ul className="mt-8 grid gap-4">
            {workflowItems.map((item) => (
              <li className="flex gap-3 text-slate-200" key={item}>
                <Check className="mt-0.5 shrink-0 text-teal-300" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Tabs defaultValue="organize" className="w-full min-w-0">
          <TabsList className="grid h-auto grid-cols-2 gap-1 bg-white/10 p-1 sm:grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger
                className="min-h-10 !text-slate-200 data-[state=active]:!bg-white data-[state=active]:!text-slate-950 text-xs sm:text-sm"
                value={tab.value}
                key={tab.value}
              >
                {tab.title.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent value={tab.value} key={tab.value}>
              <Card className="mt-3 rounded-lg border-white/10 bg-white/[0.06] !text-white">
                <CardHeader>
                  <span className="grid size-12 place-items-center rounded-lg bg-teal-300 text-slate-950 [&_svg]:size-6">
                    {tab.icon}
                  </span>
                  <CardTitle className="!text-2xl !text-white">{tab.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-8 text-slate-300">{tab.text}</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
