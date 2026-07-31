import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, X, Check, Eye, XCircle } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
}

interface PatientOption {
  id: number;
  name: string;
}

type FilterTab = 'all' | 'today' | 'confirmed' | 'pending';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const [formPatientId, setFormPatientId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('15');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      let url = '/api/doctor/appointments';
      const params = new URLSearchParams();
      if (activeTab === 'today') {
        params.set('date', new Date().toISOString().split('T')[0]);
      } else if (activeTab === 'confirmed') {
        params.set('status', 'confirmed');
      } else if (activeTab === 'pending') {
        params.set('status', 'scheduled');
      }
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId || !formDate || !formTime) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctor/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: parseInt(formPatientId),
          appointmentDate: formDate,
          appointmentTime: formTime,
          durationMinutes: parseInt(formDuration) || 15,
          notes: formNotes || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setFormPatientId('');
        setFormDate('');
        setFormTime('');
        setFormDuration('15');
        setFormNotes('');
        setIsLoading(true);
        fetchAppointments();
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to create appointment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setIsLoading(true);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to update appointment', err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'visited': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
  ];

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Appointments" showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setActiveTab(tab.key); setIsLoading(true); }}
                className="text-xs"
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">New Appointment</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAppointment} className="space-y-3">
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="apptDate" className="text-sm font-medium">Date *</Label>
                    <Input
                      id="apptDate"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="apptTime" className="text-sm font-medium">Time *</Label>
                    <Input
                      id="apptTime"
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apptDuration" className="text-sm font-medium">Duration (mins)</Label>
                  <Input
                    id="apptDuration"
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apptNotes" className="text-sm font-medium">Notes</Label>
                  <Textarea
                    id="apptNotes"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Optional notes"
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Appointment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{appt.patientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {appt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appt.appointmentTime}
                        </span>
                        <span>{appt.durationMinutes}min</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>
                  {appt.notes && (
                    <p className="text-xs text-muted-foreground mb-2">{appt.notes}</p>
                  )}
                  <div className="flex gap-2">
                    {appt.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => updateStatus(appt.id, 'confirmed')}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Confirm
                      </Button>
                    )}
                    {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => updateStatus(appt.id, 'visited')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Visited
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 text-red-600"
                          onClick={() => updateStatus(appt.id, 'cancelled')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
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
