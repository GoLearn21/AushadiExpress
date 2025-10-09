import { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfflineIndicator } from '@/components/offline-indicator';
import { tw } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';

export default function CustomerSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pincode, setPincode] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSearch = () => {
    console.log('Searching for:', searchTerm, 'in pincode:', pincode);
    // TODO: Implement search functionality
  };

  const handleNearMe = () => {
    setLocation('/nearby-stores');
  };

  const handleRecent = () => {
    toast({ title: "Recent Searches", description: "Your recent searches will appear here" });
    // TODO: Implement recent searches
  };

  const handleSaved = () => {
    toast({ title: "Saved Medicines", description: "Your saved medicines will appear here" });
    // TODO: Implement saved medicines
  };

  const handleUploadRx = () => {
    toast({ title: "Upload Prescription", description: "Camera/file picker will open here" });
    // TODO: Implement prescription upload
  };

  const popularMedicines = [
    { name: 'Paracetamol', icon: '💊', category: 'Pain Relief' },
    { name: 'Crocin', icon: '🌡️', category: 'Fever' },
    { name: 'Dolo 650', icon: '💉', category: 'Pain Relief' },
    { name: 'Cetirizine', icon: '🤧', category: 'Allergy' },
  ];

  const quickActions = [
    { icon: 'local_pharmacy', label: 'Near Me', color: 'bg-blue-500', onClick: handleNearMe },
    { icon: 'history', label: 'Recent', color: 'bg-purple-500', onClick: handleRecent },
    { icon: 'favorite', label: 'Saved', color: 'bg-pink-500', onClick: handleSaved },
    { icon: 'receipt_long', label: 'Upload Rx', color: 'bg-green-500', onClick: handleUploadRx },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <OfflineIndicator />
      
      {/* App Bar */}
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-xl">medication</span>
            <h1 className={`${tw.headingLg} text-primary-foreground`}>AushadiExpress</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={tw.statusOnline}></div>
            <span className={`${tw.bodySm} text-primary-foreground/80`}>Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto">
            
            {/* Hero Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1 tracking-tight">
                Find Your Medicine
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Discover nearby pharmacies with your medicine in stock
              </p>
            </div>

            {/* Search Card */}
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <span className="material-icons absolute left-3 top-3 text-muted-foreground">search</span>
                  <Input
                    type="text"
                    placeholder="Search for medicine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-200 focus:border-blue-400"
                  />
                </div>
                
                <div className="relative">
                  <span className="material-icons absolute left-3 top-3 text-muted-foreground">location_on</span>
                  <Input
                    type="text"
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="pl-12 h-12 text-base border-gray-200 focus:border-blue-400"
                  />
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <span className="material-icons mr-2">search</span>
                  Search Pharmacies
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow active:scale-95"
                  >
                    <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mb-2`}>
                      <span className="material-icons text-white text-xl">{action.icon}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Medicines */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Popular Medicines</h2>
                <button className="text-blue-600 text-sm font-medium">See all</button>
              </div>
              <div className="space-y-2">
                {popularMedicines.map((medicine, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                    onClick={() => setSearchTerm(medicine.name)}
                  >
                    <div className="text-3xl mr-4">{medicine.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{medicine.name}</div>
                      <div className="text-sm text-gray-500">{medicine.category}</div>
                    </div>
                    <span className="material-icons text-gray-400">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <span className="material-icons text-blue-600 mb-2 text-2xl">verified</span>
                <h3 className="font-semibold text-gray-900 mb-1">Verified</h3>
                <p className="text-xs text-gray-600">Only licensed pharmacies</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <span className="material-icons text-green-600 mb-2 text-2xl">schedule</span>
                <h3 className="font-semibold text-gray-900 mb-1">Real-time</h3>
                <p className="text-xs text-gray-600">Live stock updates</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
