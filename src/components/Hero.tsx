import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Shield, Clock, Heart } from "lucide-react";
import heroImage from "@/assets/hero-doctor.jpg";
import { useState } from "react";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSearch = () => {
    // Scroll to doctors section
    const doctorsSection = document.getElementById('doctors');
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Trigger search event for filtering
    const searchEvent = new CustomEvent('doctorSearch', {
      detail: { location, specialty }
    });
    window.dispatchEvent(searchEvent);
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-soft/80 backdrop-blur-sm text-accent mb-6">
            <Shield className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Verified Medical Professionals</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
            Healthcare at Your
            <span className="block">Doorstep</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Skip the waiting rooms. Connect with qualified doctors who visit you at your chosen location, 
            on your schedule.
          </p>

          {/* Quick booking form */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto shadow-medical mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter your location" 
                  className="pl-10 h-12 bg-background/50"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Choose specialty" 
                  className="pl-10 h-12 bg-background/50"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </div>
              <Button 
                size="lg" 
                className="h-12 px-8 bg-gradient-primary hover:shadow-hover"
                onClick={handleSearch}
              >
                Find Doctors
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">24/7 Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">5000+ Happy Patients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;