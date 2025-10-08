import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OfflineIndicator } from '@/components/offline-indicator';
import { tw } from '@/lib/theme';

export default function CustomerSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', searchTerm, 'in pincode:', pincode);
    // TODO: Implement search functionality
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
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
        <div className="container mx-auto p-4 pb-24">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Search Medicines</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Find medicines near you</CardTitle>
                <CardDescription>
                  Search for medicines and see which pharmacies have them in stock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Medicine Name</label>
                  <Input
                    type="text"
                    placeholder="Enter medicine name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Pincode</label>
                  <Input
                    type="text"
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="w-full"
                  />
                </div>
                
                <Button onClick={handleSearch} className="w-full">
                  <span className="material-icons mr-2">search</span>
                  Search Pharmacies
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-muted-foreground py-8">
              <span className="material-icons text-6xl mb-4">medication</span>
              <p>Search results will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
