import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface PatientOption {
  id: number;
  name: string;
}

interface MedicineRow {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function PrescriptionNewPage() {
  const [, navigate] = useLocation();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('draft');
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/doctor/patients', { credentials: 'include' });
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
    }
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: parseInt(patientId),
          diagnosis: diagnosis || null,
          notes: notes || null,
          status,
          medicines: medicines.filter((m) => m.name.trim()),
        }),
      });
      if (res.ok) {
        navigate('/doctor/prescriptions');
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Failed to create prescription', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="New Prescription" showLogo={false} />
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Patient *</Label>
                <Select value={patientId} onValueChange={setPatientId}>
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
              <div className="space-y-1.5">
                <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Medicines</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addMedicineRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicines.map((med, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Medicine {index + 1}</span>
                    {medicines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => removeMedicineRow(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={med.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    placeholder="Medicine name"
                    className="h-9 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      placeholder="Dosage"
                      className="h-9 text-sm"
                    />
                    <Input
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      placeholder="Frequency"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="h-9 text-sm"
                    />
                    <Input
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      placeholder="Instructions"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="rxNotes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="rxNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="accent-primary"
                    />
                    <span className="text-sm">Draft</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="issued"
                      checked={status === 'issued'}
                      onChange={() => setStatus('issued')}
                      className="accent-primary"
                    />
                    <span className="text-sm">Issued</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Prescription'}
          </Button>
        </form>
      </div>
    </div>
  );
}
