import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Specialties from "@/components/Specialties";
import DoctorsSection from "@/components/DoctorsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <Specialties />
      <DoctorsSection />
    </div>
  );
};

export default Index;
