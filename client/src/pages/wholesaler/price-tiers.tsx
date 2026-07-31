import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AppHeader } from '@/components/app-header';
import { Plus, Edit2, Trash2, Star, Percent, Clock, IndianRupee } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PriceTier {
  id: string;
  name: string;
  description?: string;
  discountPercentage: number;
  minOrderValue: number;
  creditDays: number;
  isDefault: boolean;
}

export default function PriceTiersPage() {
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PriceTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: 0,
    minOrderValue: 0,
    creditDays: 0,
    isDefault: false,
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/wholesaler/price-tiers', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTiers(data);
      }
    } catch (error) {
      console.error('Failed to fetch price tiers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingTier
        ? `/api/wholesaler/price-tiers/${editingTier.id}`
        : '/api/wholesaler/price-tiers';
      const method = editingTier ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchTiers();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save price tier:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price tier?')) return;

    try {
      const res = await fetch(`/api/wholesaler/price-tiers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchTiers();
      }
    } catch (error) {
      console.error('Failed to delete price tier:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountPercentage: 0,
      minOrderValue: 0,
      creditDays: 0,
      isDefault: false,
    });
    setEditingTier(null);
  };

  const openEditDialog = (tier: PriceTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      description: tier.description || '',
      discountPercentage: tier.discountPercentage,
      minOrderValue: tier.minOrderValue,
      creditDays: tier.creditDays,
      isDefault: tier.isDefault,
    });
    setIsDialogOpen(true);
  };

  const getTierColor = (index: number) => {
    const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-amber-600', 'bg-blue-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-6 flex-1 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Tiers</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create pricing tiers for different retailer categories
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : tiers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Percent className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Price Tiers Yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create pricing tiers like Gold, Silver, Bronze to offer different discounts to retailers
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Tier
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tiers.map((tier, index) => (
              <Card key={tier.id} className="relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTierColor(index)}`} />
                <CardContent className="p-4 pl-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{tier.name}</h3>
                        {tier.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {tier.description && (
                        <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{tier.discountPercentage}%</span>
                          <span className="text-gray-500">discount</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <IndianRupee className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{tier.minOrderValue.toLocaleString()}</span>
                          <span className="text-gray-500">min order</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">{tier.creditDays}</span>
                          <span className="text-gray-500">credit days</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(tier)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tier.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTier ? 'Edit Price Tier' : 'Create Price Tier'}</DialogTitle>
              <DialogDescription>
                Set discount percentage and credit terms for this tier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tier Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Gold, Silver, Bronze"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., For high-volume retailers"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditDays">Credit Days</Label>
                  <Input
                    id="creditDays"
                    type="number"
                    min="0"
                    value={formData.creditDays}
                    onChange={(e) => setFormData({ ...formData, creditDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimum Order Value</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isDefault">Set as Default Tier</Label>
                  <p className="text-xs text-gray-500">New retailers will be assigned this tier</p>
                </div>
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingTier ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
