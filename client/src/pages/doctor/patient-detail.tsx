import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { User, Phone, Calendar, ArrowLeft, Droplets, AlertTriangle, ClipboardList } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface Patient {
  id: number;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  medicalHistory: string | null;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string | null;
}

interface Prescription {
  id: number;
  diagnosis: string | null;
  status: string;
  createdAt: string;
}

export default function PatientDetailPage() {
  const [, params] = useRoute('/doctor/patients/:id');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchPatientDetail(params.id);
    }
  }, [params?.id]);

  const fetchPatientDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/doctor/patients/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        setAppointments(data.appointments || []);
        setPrescriptions(data.prescriptions || []);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to fetch patient detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'visited': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'no_show': return 'outline';
      default: return 'secondary';
    }
  };

  const getPrescriptionBadgeVariant = (status: string) => {
    switch (status) {
      case 'issued': return 'default';
      case 'fulfilled': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Patient Detail" showLogo={false} />
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Patient Detail" showLogo={false} />
        <div className="p-4 text-center text-muted-foreground">Patient not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={patient.name} showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Link href="/doctor/patients">
          <span className="inline-flex items-center gap-1 text-sm text-primary cursor-pointer mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </span>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{patient.name}</span>
              {patient.gender && (
                <Badge variant="secondary" className="text-xs">{patient.gender}</Badge>
              )}
            </div>
            {patient.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{patient.phone}</span>
              </div>
            )}
            {patient.age && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{patient.age} years old</span>
              </div>
            )}
            {patient.bloodGroup && (
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Blood Group: {patient.bloodGroup}</span>
              </div>
            )}
            {patient.allergies && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Allergies: {patient.allergies}</span>
              </div>
            )}
            {patient.medicalHistory && (
              <div className="flex items-start gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{patient.medicalHistory}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments yet</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{appt.appointmentDate}</p>
                      <p className="text-xs text-muted-foreground">{appt.appointmentTime}</p>
                    </div>
                    <Badge variant={getAppointmentBadgeVariant(appt.status)} className="text-xs">
                      {appt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prescriptions yet</p>
            ) : (
              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{rx.diagnosis || 'No diagnosis'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getPrescriptionBadgeVariant(rx.status)} className="text-xs">
                      {rx.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
