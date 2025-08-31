import { Button } from "@/components/ui/button";
import { MapPin, Heart, Phone } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">DoorstepDoc</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <a href="#doctors" className="text-muted-foreground hover:text-foreground transition-colors">
            Find Doctors
          </a>
          <a href="#specialties" className="text-muted-foreground hover:text-foreground transition-colors">
            Specialties
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Phone className="h-4 w-4 mr-2" />
            Emergency
          </Button>
          <Button variant="default" size="sm">
            Book Now
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;