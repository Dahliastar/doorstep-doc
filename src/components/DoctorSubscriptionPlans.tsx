import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Check, Crown, Phone, Star } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 2000,
    description: "Perfect for new doctors",
    features: [
      "Up to 20 appointments per month",
      "Basic profile listing",
      "Email support",
      "Mobile app access",
    ],
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 5000,
    description: "Most popular choice",
    features: [
      "Up to 100 appointments per month",
      "Priority profile placement",
      "24/7 phone support",
      "Advanced analytics",
      "Custom scheduling",
      "Patient management tools",
    ],
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-800",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 10000,
    description: "For established practices",
    features: [
      "Unlimited appointments",
      "Featured doctor listing",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Multi-location support",
      "API access",
    ],
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-800",
  },
];

export default function DoctorSubscriptionPlans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleSubscribe = async () => {
    if (!user || !selectedPlan || !phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-doctor-subscription", {
        body: {
          plan_type: selectedPlan,
          phone_number: phoneNumber,
          email: user.email || "",
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Subscription payment initiated! Please check your phone for M-Pesa prompt.");
        toast.info(`Tracking ID: ${data.tracking_id}`);
        
        // Reset form
        setSelectedPlan("");
        setPhoneNumber("");
        setShowPayment(false);
      } else {
        throw new Error(data.error || "Subscription failed");
      }

    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan to grow your medical practice
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.color} ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            } hover:shadow-lg transition-shadow`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                {plan.id === "enterprise" && <Crown className="h-6 w-6 text-purple-600 mr-2" />}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="text-3xl font-bold">
                KES {plan.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={!user}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPayment && selectedPlan && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
            <CardDescription>
              {PLANS.find(p => p.id === selectedPlan)?.name} - 
              KES {PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()}/month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                M-Pesa Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="254XXXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing || !phoneNumber}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : "Subscribe & Pay"}
              </Button>
              <Button
                onClick={() => setShowPayment(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Payment will be processed via M-Pesa. You will receive a prompt on your phone.
            </p>
          </CardContent>
        </Card>
      )}

      {!user && (
        <div className="text-center">
          <p className="text-muted-foreground">
            Please log in as a doctor to subscribe to a plan
          </p>
        </div>
      )}
    </div>
  );
}