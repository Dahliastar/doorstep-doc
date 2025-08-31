import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Baby, Eye, Bone, Stethoscope, Users, Pill } from "lucide-react";

const specialties = [
  {
    icon: Stethoscope,
    name: "General Medicine",
    description: "Comprehensive healthcare for all ages",
    color: "text-primary",
    bgColor: "bg-primary-soft"
  },
  {
    icon: Heart,
    name: "Cardiology",
    description: "Heart and cardiovascular specialist care",
    color: "text-red-500",
    bgColor: "bg-red-50"
  },
  {
    icon: Brain,
    name: "Psychology",
    description: "Mental health and wellness support",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Baby,
    name: "Pediatrics",
    description: "Specialized care for children and infants",
    color: "text-pink-500",
    bgColor: "bg-pink-50"
  },
  {
    icon: Eye,
    name: "Ophthalmology",
    description: "Eye care and vision specialist services",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: Bone,
    name: "Orthopedics",
    description: "Bone, joint, and musculoskeletal care",
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  {
    icon: Users,
    name: "Family Medicine",
    description: "Comprehensive care for the whole family",
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    icon: Pill,
    name: "Internal Medicine",
    description: "Adult disease prevention and treatment",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50"
  }
];

const Specialties = () => {
  return (
    <section id="specialties" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Medical Specialties
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our network of verified healthcare professionals covers all major medical specialties, 
            bringing expert care directly to your location.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((specialty) => {
            const IconComponent = specialty.icon;
            return (
              <Card 
                key={specialty.name} 
                className="group hover:shadow-hover transition-all duration-300 cursor-pointer bg-card border-border/50 hover:border-primary/20"
              >
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${specialty.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-8 w-8 ${specialty.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                    {specialty.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {specialty.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Specialties;