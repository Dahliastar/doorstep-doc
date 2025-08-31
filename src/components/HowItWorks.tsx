import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, MapPin, Heart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find Your Doctor",
    description: "Search for qualified doctors by specialty and location. View their profiles, credentials, and patient reviews.",
    step: "01"
  },
  {
    icon: Calendar,
    title: "Schedule Your Visit",
    description: "Choose a convenient time and location for your appointment. Flexible scheduling fits your busy lifestyle.",
    step: "02"
  },
  {
    icon: MapPin,
    title: "Doctor Comes to You",
    description: "Your chosen healthcare professional arrives at your location with all necessary medical equipment.",
    step: "03"
  },
  {
    icon: Heart,
    title: "Receive Quality Care",
    description: "Get the same quality medical attention you'd receive in a clinic, but in the comfort of your chosen environment.",
    step: "04"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-muted/20 to-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Getting professional healthcare at your doorstep is simple and convenient. 
            Here's how our platform connects you with qualified doctors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="relative overflow-hidden bg-card border-border/50 hover:shadow-hover transition-all duration-300 group">
                <CardContent className="p-6 text-center relative">
                  {/* Step number */}
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Connection lines for desktop */}
        <div className="hidden lg:block relative -mt-32 mb-16">
          <div className="flex justify-between items-center max-w-4xl mx-auto px-16">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-gradient-to-r from-primary/30 to-primary/10 mx-8"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;