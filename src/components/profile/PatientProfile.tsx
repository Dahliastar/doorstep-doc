import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, Heart, Phone, Plus, X, Calendar } from 'lucide-react';

interface PatientProfileProps {
  user: User;
}

interface MedicalHistory {
  allergies: string[];
  medications: string[];
  medical_conditions: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_type: string;
  insurance_provider: string;
  insurance_policy_number: string;
  notes: string;
}

export function PatientProfile({ user }: PatientProfileProps) {
  const { toast } = useToast();
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    fetchMedicalHistory();
    fetchAppointments();
  }, [user.id]);

  const fetchMedicalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_medical_history')
        .select('*')
        .eq('patient_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMedicalHistory(data || {
        allergies: [],
        medications: [],
        medical_conditions: [],
        emergency_contact_name: '',
        emergency_contact_phone: '',
        blood_type: '',
        insurance_provider: '',
        insurance_policy_number: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error fetching medical history:', error);
      toast({
        title: "Error",
        description: "Failed to load medical history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_doctor_id_fkey(full_name)
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSave = async () => {
    if (!medicalHistory) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('patient_medical_history')
        .upsert({
          patient_id: user.id,
          ...medicalHistory
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical history saved successfully"
      });
      
      fetchMedicalHistory();
    } catch (error) {
      console.error('Error saving medical history:', error);
      toast({
        title: "Error",
        description: "Failed to save medical history",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'allergies' | 'medications' | 'medical_conditions', value: string) => {
    if (value.trim() && medicalHistory) {
      setMedicalHistory({
        ...medicalHistory,
        [type]: [...medicalHistory[type], value.trim()]
      });
    }
  };

  const removeItem = (type: 'allergies' | 'medications' | 'medical_conditions', index: number) => {
    if (medicalHistory) {
      setMedicalHistory({
        ...medicalHistory,
        [type]: medicalHistory[type].filter((_, i) => i !== index)
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!medicalHistory) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Patient Profile</h1>
        <p className="text-muted-foreground">Manage your medical history and appointments</p>
      </div>

      <Tabs defaultValue="medical-history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medical-history" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Medical History
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Emergency Info
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medical-history">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Allergies</CardTitle>
                <CardDescription>List any allergies you have</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Enter allergy"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('allergies', newAllergy);
                        setNewAllergy('');
                      }
                    }}
                  />
                  <Button onClick={() => {
                    addItem('allergies', newAllergy);
                    setNewAllergy('');
                  }} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {allergy}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('allergies', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>List medications you are currently taking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Enter medication"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('medications', newMedication);
                        setNewMedication('');
                      }
                    }}
                  />
                  <Button onClick={() => {
                    addItem('medications', newMedication);
                    setNewMedication('');
                  }} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.medications.map((medication, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {medication}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('medications', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Conditions</CardTitle>
                <CardDescription>List any ongoing medical conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Enter condition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('medical_conditions', newCondition);
                        setNewCondition('');
                      }
                    }}
                  />
                  <Button onClick={() => {
                    addItem('medical_conditions', newCondition);
                    setNewCondition('');
                  }} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalHistory.medical_conditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {condition}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('medical_conditions', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blood Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={medicalHistory.blood_type}
                    onChange={(e) => setMedicalHistory({
                      ...medicalHistory,
                      blood_type: e.target.value
                    })}
                    placeholder="e.g., A+, O-, AB+"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Insurance Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={medicalHistory.insurance_provider}
                    onChange={(e) => setMedicalHistory({
                      ...medicalHistory,
                      insurance_provider: e.target.value
                    })}
                    placeholder="Insurance company name"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Any other medical information you'd like to share</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={medicalHistory.notes}
                  onChange={(e) => setMedicalHistory({
                    ...medicalHistory,
                    notes: e.target.value
                  })}
                  placeholder="Enter any additional medical information..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
              <CardDescription>This information will be used in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_name"
                  value={medicalHistory.emergency_contact_name}
                  onChange={(e) => setMedicalHistory({
                    ...medicalHistory,
                    emergency_contact_name: e.target.value
                  })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_phone"
                  value={medicalHistory.emergency_contact_phone}
                  onChange={(e) => setMedicalHistory({
                    ...medicalHistory,
                    emergency_contact_phone: e.target.value
                  })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="insurance_policy">Insurance Policy Number</Label>
                <Input
                  id="insurance_policy"
                  value={medicalHistory.insurance_policy_number}
                  onChange={(e) => setMedicalHistory({
                    ...medicalHistory,
                    insurance_policy_number: e.target.value
                  })}
                  placeholder="Policy number"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
              <CardDescription>View your upcoming and past appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No appointments found. Book your first appointment with a doctor!
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">
                            Dr. {appointment.profiles?.full_name || 'Unknown Doctor'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                            {new Date(appointment.appointment_date).toLocaleTimeString()}
                          </p>
                          <p className="text-sm">{appointment.consultation_type}</p>
                          {appointment.address && (
                            <p className="text-sm text-muted-foreground">{appointment.address}</p>
                          )}
                        </div>
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'default' :
                          appointment.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}