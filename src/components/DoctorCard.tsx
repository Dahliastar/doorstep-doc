import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Star, Calendar, Shield, Phone, Clock } from "lucide-react";

interface DoctorCardProps {
  name: string;
  specialty: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  availability: string;
  price: string;
  isVerified?: boolean;
  image?: string;
}

const DoctorCard = ({ 
  name, 
  specialty, 
  location, 
  distance, 
  rating, 
  reviews, 
  availability, 
  price, 
  isVerified = true,
  image = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face"
}: DoctorCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={image} 
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-soft"
              />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1">
                  <Shield className="h-3 w-3 text-accent-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
              <p className="text-primary font-medium">{specialty}</p>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{location} • {distance}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-accent-soft text-accent">
            Available
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-card-foreground">{rating}</span>
            <span className="text-muted-foreground text-sm">({reviews} reviews)</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${price}</p>
            <p className="text-sm text-muted-foreground">per visit</p>
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="h-4 w-4 mr-2" />
          <span>{availability}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">House Calls</Badge>
          <Badge variant="outline" className="text-xs">Emergency Available</Badge>
          <Badge variant="outline" className="text-xs">Insurance Accepted</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button variant="outline" size="sm" className="flex-1">
          <Phone className="h-4 w-4 mr-2" />
          Contact
        </Button>
        <Button size="sm" className="flex-1 bg-gradient-primary hover:shadow-medical">
          <Calendar className="h-4 w-4 mr-2" />
          Book Visit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;