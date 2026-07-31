import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Users, Calendar, FileText, FlaskConical } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface DashboardStats {
  patientsToday: number;
  pendingAppointments: number;
  prescriptionsIssued: number;
  confirmedAppointments: number;
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    patientsToday: 0,
    pendingAppointments: 0,
    prescriptionsIssued: 0,
    confirmedAppointments: 0,
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/doctor/dashboard', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={user?.username || 'Doctor Dashboard'} showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold">{stats.patientsToday}</p>
                      <p className="text-xs text-muted-foreground">Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
                      <p className="text-xs text-muted-foreground">Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Issued</p>
                      <p className="text-2xl font-bold">{stats.prescriptionsIssued}</p>
                      <p className="text-xs text-muted-foreground">Prescriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold">{stats.confirmedAppointments}</p>
                      <p className="text-xs text-muted-foreground">Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/doctor/patients">
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Patients
                </Button>
              </Link>
              <Link href="/doctor/appointments">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointments
                </Button>
              </Link>
              <Link href="/doctor/prescriptions">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Prescriptions
                </Button>
              </Link>
              <Link href="/doctor/lab-requests">
                <Button className="w-full" variant="outline">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Lab Requests
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
