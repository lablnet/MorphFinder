const metrics = [
  { value: "3", label: "runtime shell styles", text: "Finder, Explorer, and Dolphin-inspired layouts." },
  { value: "8+", label: "work surfaces", text: "Files, previews, analyzer, timeline, Git, terminal, dev panel, caches." },
  { value: "Local", label: "desktop-first design", text: "Native metadata, thumbnails, filesystem watchers, and private operations." },
];

export function ProofSection() {
  return (
    <section className="mx-auto grid w-[min(1180px,calc(100%-1.25rem))] gap-3 sm:w-[min(1180px,calc(100%-2rem))] md:grid-cols-3">
      {metrics.map((metric) => (
        <div className="rounded-lg border border-slate-200 bg-white/78 p-5 shadow-sm backdrop-blur" key={metric.label}>
          <strong className="block text-4xl font-black text-slate-950">{metric.value}</strong>
          <span className="mt-2 block text-sm font-bold uppercase text-teal-700">{metric.label}</span>
          <p className="mt-2 leading-7 text-slate-600">{metric.text}</p>
        </div>
      ))}
    </section>
  );
}
