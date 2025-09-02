import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Calendar, Phone, MapPin, CreditCard } from "lucide-react";

interface AppointmentBookingProps {
  doctorId: string;
  doctorName: string;
  specialty: string;
}

export default function AppointmentBooking({ doctorId, doctorName, specialty }: AppointmentBookingProps) {
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formData, setFormData] = useState({
    appointment_date: "",
    consultation_type: "home_visit",
    address: "",
    notes: "",
    phone_number: "",
    amount: 2000, // Default amount in KES
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error("Please log in to book an appointment");
      return;
    }

    if (!formData.appointment_date || !formData.address || !formData.phone_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsBooking(true);

    try {
      // First create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          doctor_id: doctorId,
          patient_id: user.id,
          appointment_date: formData.appointment_date,
          consultation_type: formData.consultation_type,
          address: formData.address,
          notes: formData.notes,
          status: "pending",
          payment_status: "pending",
          amount: formData.amount,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      toast.success("Appointment created! Processing payment...");
      
      // Now process payment
      await handlePayment(appointment.id);

    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const handlePayment = async (appointmentId: string) => {
    setIsProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-instasend-payment", {
        body: {
          appointment_id: appointmentId,
          amount: formData.amount,
          phone_number: formData.phone_number,
          email: user?.email || "",
          currency: "KES",
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Payment initiated! Please check your phone for M-Pesa prompt.");
        toast.info(`Tracking ID: ${data.tracking_id}`);
        
        // Reset form
        setFormData({
          appointment_date: "",
          consultation_type: "home_visit",
          address: "",
          notes: "",
          phone_number: "",
          amount: 2000,
        });
      } else {
        throw new Error(data.error || "Payment failed");
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          with Dr. {doctorName} ({specialty})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appointment_date">Appointment Date & Time</Label>
          <Input
            id="appointment_date"
            type="datetime-local"
            value={formData.appointment_date}
            onChange={(e) => handleInputChange("appointment_date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="consultation_type">Consultation Type</Label>
          <Select
            value={formData.consultation_type}
            onValueChange={(value) => handleInputChange("consultation_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select consultation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home_visit">Home Visit</SelectItem>
              <SelectItem value="clinic">Clinic Visit</SelectItem>
              <SelectItem value="teleconsultation">Teleconsultation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address
          </Label>
          <Textarea
            id="address"
            placeholder="Enter your address for home visit or clinic address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number (for M-Pesa)
          </Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="254XXXXXXXXX"
            value={formData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Consultation Fee (KES)
          </Label>
          <Input
            id="amount"
            type="number"
            min="100"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information or symptoms"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
          />
        </div>

        <Button
          onClick={handleBookAppointment}
          disabled={isBooking || isProcessingPayment}
          className="w-full"
        >
          {isBooking
            ? "Creating Appointment..."
            : isProcessingPayment
            ? "Processing Payment..."
            : `Book & Pay KES ${formData.amount}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Payment will be processed via M-Pesa. You will receive a prompt on your phone.
        </p>
      </CardContent>
    </Card>
  );
}