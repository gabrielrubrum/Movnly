import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { VehicleCategories } from "@/components/home/VehicleCategories";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { RoutesSection } from "@/components/home/RoutesSection";
import { TrustSection } from "@/components/home/TrustSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { B2BSection } from "@/components/home/B2BSection";
import { CTASection } from "@/components/home/CTASection";
import { ToursSection } from "@/components/home/ToursSection";

export default function HomePage() {
  return (
    <div className="bg-luxury-mesh min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <VehicleCategories />
        <WhyChooseUs />
        <RoutesSection />
        <ToursSection />
        <TrustSection />
        <TestimonialsSection />
        <B2BSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
