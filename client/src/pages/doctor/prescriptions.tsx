import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { FileText, Plus } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface Prescription {
  id: number;
  patientName: string;
  diagnosis: string | null;
  status: string;
  createdAt: string;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/doctor/prescriptions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Prescriptions" showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-end">
          <Link href="/doctor/prescriptions/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Prescription
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No prescriptions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prescriptions.map((rx) => (
              <Card key={rx.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{rx.patientName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rx.diagnosis || 'No diagnosis'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(rx.status)}`}>
                      {rx.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
