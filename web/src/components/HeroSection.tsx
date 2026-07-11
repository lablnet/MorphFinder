import { Badge, Button } from "@lablnet/ui";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import { ProductMockup } from "./ProductMockup";

export function HeroSection() {
  function viewProductTour() {
    document.getElementById("product-tour")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      className="mx-auto grid w-[min(1320px,calc(100%-1.25rem))] items-center gap-10 pb-14 pt-8 sm:w-[min(1320px,calc(100%-2rem))] sm:pb-20 sm:pt-14 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-14 xl:gap-16"
      id="top"
    >
      <div className="min-w-0 max-w-[34rem]">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-2 bg-white text-slate-700 shadow-sm">
            <Sparkles size={14} />
            Finder, Explorer, and Dolphin in one shell
          </Badge>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
            Coming soon
          </Badge>
        </div>
        <h1 className="max-w-full text-[3.45rem] font-black leading-[0.92] tracking-normal text-slate-950 min-[390px]:text-[3.9rem] sm:text-[5rem] lg:text-[4.7rem] xl:text-[5.25rem]">
          MorphFinder
        </h1>
        <p className="mt-6 max-w-[34rem] text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
          A cross-platform file manager for builders who need fast browsing,
          native previews, storage insight, Git context, terminal work, and
          familiar operating-system layouts without switching tools.
        </p>
        <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight size={18} />}>
            Notify me when ready
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-white sm:w-auto"
            leftIcon={<Eye size={18} />}
            onClick={viewProductTour}
          >
            View product tour
          </Button>
        </div>
      </div>

      <ProductMockup />
    </section>
  );
}
