import { Badge, Button } from "@lablnet/ui";
import { Cloud, Network, Store, Github, Heart, Users } from "lucide-react";

const roadmapItems = [
  {
    icon: Network,
    title: "Built-in FTP / SFTP Client",
    status: "Planned",
    description: "Browse remote servers, transfer files over SSH/FTP in the background, and manage remote file systems seamlessly within your favorite shell layout."
  },
  {
    icon: Cloud,
    title: "Cloud Storage Integration",
    status: "Planned",
    description: "Direct mounting and synchronization for Google Drive, Amazon S3 buckets, and WebDAV endpoints without requiring third-party sync utilities."
  },
  {
    icon: Store,
    title: "Microsoft Store & Linux Packages",
    status: "Planned",
    description: "Expanded package distribution for Windows Microsoft Store (MSIX), Linux Snap, Flatpak, and Arch Linux AUR repositories."
  }
];

export function RoadmapSection() {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-1.25rem))] py-16 sm:w-[min(1180px,calc(100%-2rem))] sm:py-24" id="roadmap">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 mb-3">
          <Users className="mr-1 size-3.5" /> Community Driven
        </Badge>
        <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Open Source & Feature Roadmap
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          MorphFinder is 100% open source. Help shape the future of file management by contributing features, suggesting enhancements, or testing upcoming platform builds.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {roadmapItems.map((item) => (
          <div
            key={item.title}
            className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <item.icon size={20} />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {item.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white shadow-xl sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-black text-white">
              <Heart className="size-6 text-rose-400 fill-rose-400" /> Build with us on GitHub
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Whether you are adding a new theme shell, optimizing native file watchers, or helping package for Microsoft Store, contributions of all kinds are welcome!
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/lablnet/MorphFinder" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100" leftIcon={<Github size={18} />}>
                View GitHub Repo
              </Button>
            </a>
            <a href="https://github.com/lablnet/MorphFinder/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-800">
                Contribution Guide
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
