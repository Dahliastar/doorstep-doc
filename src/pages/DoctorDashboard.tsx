import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, DollarSign, Users, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  status: string;
  payment_status: string;
  amount: number;
  consultation_type: string;
  address?: string;
  notes?: string;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
  } | null;
}

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalEarnings: number;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkDoctorRole();
  }, [user]);

  useEffect(() => {
    if (userRole === 'doctor') {
      fetchAppointments();
    }
  }, [userRole]);

  const checkDoctorRole = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || data?.role !== 'doctor') {
        toast({
          title: "Access Denied",
          description: "This dashboard is only accessible to doctors",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setUserRole(data.role);
    } catch (error) {
      console.error('Error checking role:', error);
      navigate('/');
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Fetch patient profiles separately
      const appointmentsWithProfiles = await Promise.all(
        (data || []).map(async (appointment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', appointment.patient_id)
            .single();

          return {
            ...appointment,
            profiles: profile
          };
        })
      );

      setAppointments(appointmentsWithProfiles);
      calculateStats(appointmentsWithProfiles);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentData: Appointment[]) => {
    const stats = appointmentData.reduce((acc, appointment) => {
      acc.totalAppointments++;
      
      if (appointment.status === 'pending') {
        acc.pendingAppointments++;
      } else if (appointment.status === 'completed') {
        acc.completedAppointments++;
      }
      
      if (appointment.payment_status === 'completed' && appointment.amount) {
        acc.totalEarnings += Number(appointment.amount);
      }
      
      return acc;
    }, {
      totalAppointments: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      totalEarnings: 0
    });

    setStats(stats);
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Appointment ${newStatus}`
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-primary/5 to-medical-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your appointments and track your practice</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.totalEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Manage your upcoming and past appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{appointment.profiles?.full_name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.profiles?.email || 'No email'}</p>
                        {appointment.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">{appointment.profiles.phone}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Badge variant={getPaymentStatusBadgeVariant(appointment.payment_status)}>
                          {appointment.payment_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                        <p>{new Date(appointment.appointment_date).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="capitalize">{appointment.consultation_type.replace('_', ' ')}</p>
                        {appointment.amount && (
                          <p>KSh {Number(appointment.amount).toLocaleString()}</p>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span>
                        <p>{appointment.address || 'Not provided'}</p>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div>
                        <span className="font-medium text-sm">Notes:</span>
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      </div>
                    )}

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                    <p className="text-muted-foreground">Your patient appointments will appear here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {appointments.filter(apt => apt.status === 'pending').map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                    {/* Same appointment card structure as above */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{appointment.profiles?.full_name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.profiles?.email || 'No email'}</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {appointments.filter(apt => apt.status === 'completed').map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{appointment.profiles?.full_name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}