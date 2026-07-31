import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, Plus, Trash2, X } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface LabRequest {
  id: number;
  patientName: string;
  tests: string[];
  status: string;
  notes: string | null;
  createdAt: string;
}

interface PatientOption {
  id: number;
  name: string;
}

export default function DoctorLabRequestsPage() {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formPatientId, setFormPatientId] = useState('');
  const [formTests, setFormTests] = useState<string[]>(['']);
  const [formNotes, setFormNotes] = useState('');
  const [formLabTenantId, setFormLabTenantId] = useState('');

  useEffect(() => {
    fetchLabRequests();
    fetchPatients();
  }, []);

  const fetchLabRequests = async () => {
    try {
      const res = await fetch('/api/doctor/lab-requests', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLabRequests(data);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to fetch lab requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/doctor/patients', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  const addTestRow = () => {
    setFormTests([...formTests, '']);
  };

  const removeTestRow = (index: number) => {
    setFormTests(formTests.filter((_, i) => i !== index));
  };

  const updateTest = (index: number, value: string) => {
    const updated = [...formTests];
    updated[index] = value;
    setFormTests(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId) return;
    const filteredTests = formTests.filter((t) => t.trim());
    if (filteredTests.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctor/lab-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: parseInt(formPatientId),
          tests: filteredTests,
          notes: formNotes || null,
          labTenantId: formLabTenantId || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setFormPatientId('');
        setFormTests(['']);
        setFormNotes('');
        setFormLabTenantId('');
        setIsLoading(true);
        fetchLabRequests();
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to create lab request', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'sample_collected': return 'bg-indigo-100 text-indigo-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Lab Requests" showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Lab Request
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">New Lab Request</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Patient *</Label>
                  <Select value={formPatientId} onValueChange={setFormPatientId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Tests *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTestRow}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Test
                    </Button>
                  </div>
                  {formTests.map((test, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={test}
                        onChange={(e) => updateTest(index, e.target.value)}
                        placeholder="Test name"
                        className="h-9 text-sm"
                      />
                      {formTests.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-red-500"
                          onClick={() => removeTestRow(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="labNotes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="labNotes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Optional notes"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="labTenantId" className="text-sm font-medium">Lab Tenant ID (optional)</Label>
                  <Input
                    id="labTenantId"
                    value={formLabTenantId}
                    onChange={(e) => setFormLabTenantId(e.target.value)}
                    placeholder="Specify lab (optional)"
                    className="h-10"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Lab Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : labRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No lab requests yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {labRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-sm">{req.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {req.tests.map((test, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-xs"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                  {req.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{req.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
