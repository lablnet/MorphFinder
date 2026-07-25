import { EnterpriseBannerSection } from "../components/EnterpriseBannerSection";
import { HeroSection } from "../components/HeroSection";
import { PlatformSection } from "../components/PlatformSection";
import { ProductSection } from "../components/ProductSection";
import { ProductTourSection } from "../components/ProductTourSection";
import { ProofSection } from "../components/ProofSection";
import { WorkflowSection } from "../components/WorkflowSection";

export function Home() {
  return (
    <main>
      <HeroSection />
      <ProofSection />
      <EnterpriseBannerSection />
      <ProductSection />
      <ProductTourSection />
      <WorkflowSection />
      <PlatformSection />
    </main>
  );
}
