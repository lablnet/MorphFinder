import { Badge } from "@lablnet/ui";
import { ArrowDown } from "lucide-react";
import { ImageSlider } from "./ImageSlider";

export function ProductTourSection() {
  return (
    <section
      className="mx-auto w-[min(1180px,calc(100%-1.25rem))] scroll-mt-28 pb-20 sm:w-[min(1180px,calc(100%-2rem))] sm:pb-28"
      id="product-tour"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-8">
          <div>
            <Badge variant="secondary" className="gap-2 bg-teal-50 text-teal-700">
              <ArrowDown size={14} />
              Product tour
            </Badge>
            <h2 className="mt-5 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Explore MorphFinder in Action.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Take a tour through our runtime-switchable Tri-UI engine (Finder, Explorer, Dolphin),
              integrated Git Radar, Developer Tools, and storage utilities.
            </p>
          </div>

          <ImageSlider />
        </div>
      </div>
    </section>
  );
}

