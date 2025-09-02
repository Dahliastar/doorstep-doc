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
import { UserCircle, GraduationCap, Shield, Plus, X, CreditCard } from 'lucide-react';
import DoctorSubscriptionPlans from '../DoctorSubscriptionPlans';

interface DoctorProfileProps {
  user: User;
}

interface MedicalCredentials {
  license_number: string;
  license_state: string;
  medical_school: string;
  graduation_year: number;
  years_experience: number;
  specialties: string[];
  board_certifications: string[];
  bio: string;
  verified: boolean;
}

export function DoctorProfile({ user }: DoctorProfileProps) {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<MedicalCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, [user.id]);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_credentials')
        .select('*')
        .eq('doctor_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCredentials(data || {
        license_number: '',
        license_state: '',
        medical_school: '',
        graduation_year: new Date().getFullYear(),
        years_experience: 0,
        specialties: [],
        board_certifications: [],
        bio: '',
        verified: false
      });
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!credentials) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('medical_credentials')
        .upsert({
          doctor_id: user.id,
          ...credentials
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Credentials saved successfully"
      });
      
      fetchCredentials();
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && credentials) {
      setCredentials({
        ...credentials,
        specialties: [...credentials.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    if (credentials) {
      setCredentials({
        ...credentials,
        specialties: credentials.specialties.filter((_, i) => i !== index)
      });
    }
  };

  const addCertification = () => {
    if (newCertification.trim() && credentials) {
      setCredentials({
        ...credentials,
        board_certifications: [...credentials.board_certifications, newCertification.trim()]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    if (credentials) {
      setCredentials({
        ...credentials,
        board_certifications: credentials.board_certifications.filter((_, i) => i !== index)
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

  if (!credentials) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Doctor Profile</h1>
        <p className="text-muted-foreground">Manage your medical credentials and profile information</p>
      </div>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Medical Credentials</CardTitle>
              <CardDescription>
                Enter your medical license and educational information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">Medical License Number</Label>
                  <Input
                    id="license_number"
                    value={credentials.license_number}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      license_number: e.target.value
                    })}
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <Label htmlFor="license_state">License State</Label>
                  <Input
                    id="license_state"
                    value={credentials.license_state}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      license_state: e.target.value
                    })}
                    placeholder="e.g., California, New York"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medical_school">Medical School</Label>
                <Input
                  id="medical_school"
                  value={credentials.medical_school}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    medical_school: e.target.value
                  })}
                  placeholder="Enter medical school name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={credentials.graduation_year}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      graduation_year: parseInt(e.target.value)
                    })}
                    placeholder="2020"
                  />
                </div>
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={credentials.years_experience}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      years_experience: parseInt(e.target.value)
                    })}
                    placeholder="5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>Add your medical specialties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Enter specialty"
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                  />
                  <Button onClick={addSpecialty} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {credentials.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpecialty(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Board Certifications</CardTitle>
                <CardDescription>Add your board certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Enter certification"
                    onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  />
                  <Button onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {credentials.board_certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeCertification(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Bio</CardTitle>
                <CardDescription>Tell patients about yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={credentials.bio}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    bio: e.target.value
                  })}
                  placeholder="Write a brief description about your experience, approach to patient care, etc."
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Your credentials will be reviewed by our medical verification team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge variant={credentials.verified ? "default" : "secondary"}>
                  {credentials.verified ? "Verified" : "Pending Verification"}
                </Badge>
                {!credentials.verified && (
                  <p className="text-sm text-muted-foreground">
                    Submit your complete credentials for verification
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <DoctorSubscriptionPlans />
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