import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { PlatformSection } from "./components/PlatformSection";
import { ProductSection } from "./components/ProductSection";
import { ProductTourSection } from "./components/ProductTourSection";
import { ProofSection } from "./components/ProofSection";
import { WorkflowSection } from "./components/WorkflowSection";

export function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f6f8fb] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(37,99,235,0.16),transparent_30rem),radial-gradient(circle_at_88%_6%,rgba(13,148,136,0.15),transparent_26rem),linear-gradient(180deg,#fbfdff_0%,#eef4f8_46%,#f7f8fb_100%)]" />
      <Header />
      <main>
        <HeroSection />
        <ProofSection />
        <ProductSection />
        <ProductTourSection />
        <WorkflowSection />
        <PlatformSection />
      </main>
      <Footer />
    </div>
  );
}
