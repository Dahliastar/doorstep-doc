import { Button } from "@/components/ui/button";
import DoctorCard from "./DoctorCard";
import { MapPin, Filter } from "lucide-react";

const mockDoctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    location: "Downtown Area",
    distance: "2.5 km",
    rating: 4.9,
    reviews: 127,
    availability: "Available today until 8 PM",
    price: "85",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face"
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    location: "Midtown",
    distance: "3.2 km", 
    rating: 4.8,
    reviews: 89,
    availability: "Next available: Tomorrow 9 AM",
    price: "120",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face"
  },
  {
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    location: "Suburbs",
    distance: "4.1 km",
    rating: 4.9,
    reviews: 156,
    availability: "Available today until 6 PM",
    price: "95",
    image: "https://images.unsplash.com/photo-1594824804732-ca8db7532fac?w=400&h=400&fit=crop&crop=face"
  },
  {
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    location: "North District",
    distance: "5.3 km",
    rating: 4.7,
    reviews: 73,
    availability: "Available today until 7 PM",
    price: "140",
    image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face"
  }
];

const DoctorsSection = () => {
  return (
    <section id="doctors" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Available Doctors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Browse verified healthcare professionals in your area, ready to provide care at your convenience.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="lg" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Change Location
            </Button>
            <Button variant="outline" size="lg" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {mockDoctors.map((doctor, index) => (
            <DoctorCard key={index} {...doctor} />
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="px-12">
            Load More Doctors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;