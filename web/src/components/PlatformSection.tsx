import { Button } from "@lablnet/ui";
import { Apple, Laptop, Mail, Monitor, ShieldCheck } from "lucide-react";

const waitlistHref = "mailto:umer@lablnet.com?subject=MorphFinder%20waitlist";

const shells = [
  { name: "Finder Shell", text: "Unified toolbar, sidebar, path bar, and Miller columns.", icon: <Apple /> },
  { name: "Explorer Shell", text: "Command bar, address bar, navigation pane, and details pane.", icon: <Monitor /> },
  { name: "Dolphin Shell", text: "Places panel, split-view direction, and terminal-aware status.", icon: <Laptop /> },
];

export function PlatformSection() {
  return (
    <section className="mx-auto w-[min(1180px,calc(100%-1.25rem))] py-20 sm:w-[min(1180px,calc(100%-2rem))] sm:py-28" id="platform">
      <div className="grid gap-4 lg:grid-cols-3">
        {shells.map((shell) => (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={shell.name}>
            <span className="grid size-12 place-items-center rounded-lg bg-teal-50 text-teal-700 [&_svg]:size-6">{shell.icon}</span>
            <h3 className="mt-5 text-2xl font-black">{shell.name}</h3>
            <p className="mt-3 leading-7 text-slate-600">{shell.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-6 rounded-lg bg-gradient-to-br from-slate-950 via-teal-900 to-blue-800 p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <ShieldCheck className="mb-5 text-teal-200" size={30} />
          <h2 className="text-3xl font-black leading-tight tracking-normal sm:text-5xl">
            Cross-platform file intelligence, local-first by design.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/78">
            Built on Electron, React, TypeScript, typed IPC, native filesystem
            services, and the lablnet UI system.
          </p>
        </div>
        <a className="w-full sm:w-auto" href={waitlistHref}>
          <Button size="lg" className="w-full bg-white text-slate-950 hover:bg-white/90 sm:w-auto" rightIcon={<Mail size={18} />}>
            Email waitlist
          </Button>
        </a>
      </div>
    </section>
  );
}
