import { Badge, Button } from "@lablnet/ui";
import { ChevronRight, FileSearch, Menu } from "lucide-react";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Tour", href: "#product-tour" },
  { label: "Workflows", href: "#workflows" },
  { label: "Platform", href: "#platform" },
];

export function Header() {
  return (
    <header className="sticky top-3 z-30 mx-auto mt-3 flex w-[min(1180px,calc(100%-1rem))] items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-white/82 px-3 py-2 shadow-[0_18px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:top-4 sm:mt-4 sm:w-[min(1180px,calc(100%-2rem))] sm:px-4">
      <a className="flex min-w-0 items-center gap-2 font-black text-slate-950" href="#top">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
          <FileSearch size={20} />
        </span>
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
        <Badge variant="outline" className="hidden border-amber-200 bg-amber-50 text-amber-700 lg:inline-flex">
          Coming soon
        </Badge>
        <Button size="sm" className="hidden sm:inline-flex" rightIcon={<ChevronRight size={16} />}>
          Notify me
        </Button>
        <Button aria-label="Open menu" size="icon" variant="outline" className="md:hidden">
          <Menu size={18} />
        </Button>
      </div>
    </header>
  );
}
