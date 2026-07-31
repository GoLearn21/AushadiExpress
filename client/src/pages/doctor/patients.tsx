import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { Users, Phone, User, Plus, Search, X } from 'lucide-react';
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

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const [formMedicalHistory, setFormMedicalHistory] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (search?: string) => {
    try {
      const url = search
        ? `/api/doctor/patients?search=${encodeURIComponent(search)}`
        : '/api/doctor/patients';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchPatients(searchQuery);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctor/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          phone: formPhone || null,
          age: formAge ? parseInt(formAge) : null,
          gender: formGender || null,
          bloodGroup: formBloodGroup || null,
          allergies: formAllergies || null,
          medicalHistory: formMedicalHistory || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        resetForm();
        setIsLoading(true);
        fetchPatients();
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to add patient', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormAge('');
    setFormGender('');
    setFormBloodGroup('');
    setFormAllergies('');
    setFormMedicalHistory('');
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Patients" showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 h-10"
            />
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="h-10">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">New Patient</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPatient} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patientName" className="text-sm font-medium">Name *</Label>
                  <Input
                    id="patientName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Patient full name"
                    required
                    className="h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="patientPhone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="10-digit number"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="patientAge" className="text-sm font-medium">Age</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      placeholder="Age"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Gender</Label>
                    <Select value={formGender} onValueChange={setFormGender}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bloodGroup" className="text-sm font-medium">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      value={formBloodGroup}
                      onChange={(e) => setFormBloodGroup(e.target.value)}
                      placeholder="e.g., O+"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="allergies" className="text-sm font-medium">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formAllergies}
                    onChange={(e) => setFormAllergies(e.target.value)}
                    placeholder="Known allergies"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="medicalHistory" className="text-sm font-medium">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formMedicalHistory}
                    onChange={(e) => setFormMedicalHistory(e.target.value)}
                    placeholder="Relevant medical history"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Patient'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No patients found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <Link key={patient.id} href={`/doctor/patients/${patient.id}`}>
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{patient.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                          )}
                          {patient.age && <span>{patient.age} yrs</span>}
                          {patient.gender && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {patient.gender}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
