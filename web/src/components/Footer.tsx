import { Separator } from "@lablnet/ui";

export function Footer() {
  return (
    <footer className="mx-auto w-[min(1180px,calc(100%-1.25rem))] pb-8 sm:w-[min(1180px,calc(100%-2rem))]">
      <Separator />
      <div className="flex flex-col gap-2 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-bold text-slate-700">MorphFinder by lablnet</span>
        <span>Copyright © 2026 Lablnet</span>
      </div>
    </footer>
  );
}
