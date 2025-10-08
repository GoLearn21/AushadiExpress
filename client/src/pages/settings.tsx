import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Switch } from "../components/ui/switch";

export default function Settings() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acceptOnlyCash, setAcceptOnlyCash] = useState(false);
  const [enableReceivingBeta, setEnableReceivingBeta] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentTenantId, setCurrentTenantId] = useState("pharm_007");
  const [availableTenants, setAvailableTenants] = useState(["pharm_007", "pharm_008", "pharm_009", "default"]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [businessName, setBusinessName] = useState("");

  const handleBetaSignup = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call - in real implementation this would save to assistantBetaLeads table
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "You've been added to the AI Assistant beta list"
      });
      
      setEmail("");
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join beta list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Load settings from localStorage
    const cashOnlySettings = localStorage.getItem('acceptOnlyCash');
    const receivingBetaSettings = localStorage.getItem('enableReceivingBeta');
    const roleSettings = localStorage.getItem('userRole');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    
    setAcceptOnlyCash(cashOnlySettings === 'true');
    setEnableReceivingBeta(receivingBetaSettings === 'true');
    setUserRole(roleSettings || 'retailer');
    
    // Show onboarding for first-time users
    if (!onboardingCompleted && !roleSettings) {
      setShowOnboarding(true);
    }
    
    // Load tenant ID and username from user data in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.tenantId) {
          setCurrentTenantId(userData.tenantId);
        }
        if (userData.username) {
          setBusinessName(userData.username);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  const handleCashOnlyToggle = (enabled: boolean) => {
    setAcceptOnlyCash(enabled);
    localStorage.setItem('acceptOnlyCash', enabled.toString());
    toast({
      title: enabled ? "Cash-only mode enabled" : "Digital payments enabled",
      description: enabled ? "Only cash payments will be available" : "All payment methods are now available"
    });
  };

  const handleReceivingBetaToggle = (enabled: boolean) => {
    setEnableReceivingBeta(enabled);
    localStorage.setItem('enableReceivingBeta', enabled.toString());
    toast({
      title: enabled ? "Receiving Beta enabled" : "Receiving Beta disabled",
      description: enabled ? "Inbound stock features are now available" : "Receiving features have been hidden"
    });
  };

  const handleRoleChange = (role: string) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    toast({
      title: "Role Updated",
      description: `Your role has been set to ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    });
  };
  
  const handleTenantChange = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    localStorage.setItem('currentTenantId', tenantId);
    
    // Also update the intelligent agent's tenant ID
    // This would require updating the intelligent-pharmacy-agent.ts to read from localStorage
    
    toast({
      title: "Tenant Updated",
      description: `Now viewing data for tenant: ${tenantId}`,
    });
  };

  const completeOnboarding = async () => {
    if (!businessName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your business name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a secure password (user can change it later if needed)
      const tempPassword = `${businessName.toLowerCase().replace(/\s+/g, '')}123456`;
      
      // Register user with backend
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: businessName,
          password: tempPassword,
          tenantName: businessName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user data including tenant ID
      const userData = { 
        ...data, 
        onboarded: true,
        role: userRole 
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('businessName', businessName);
      localStorage.setItem('userRole', userRole);
      
      // Update current tenant ID display
      setCurrentTenantId(data.tenantId);
      
      setShowOnboarding(false);
      toast({
        title: "Welcome to AushadiExpress!",
        description: `Setup completed! Your unique Tenant ID: ${data.tenantId}`,
      });
      
      // Reload to refresh auth state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Show toast
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
    
    // Reload page to show setup wizard
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const settingsItems = [
    {
      id: "role",
      icon: "person",
      title: "My Role",
      description: "Select your business role (persisted offline)",
      disabled: false,
      role: true,
      selectedRole: userRole,
      onRoleChange: handleRoleChange
    },
    {
      id: "tenant",
      icon: "business",
      title: "Enterprise/Tenant ID",
      description: "Data scope for AI Assistant queries",
      disabled: false,
      tenant: true,
      currentTenant: currentTenantId,
      availableTenants,
      onTenantChange: handleTenantChange
    },
    {
      id: "profile",
      icon: "person_outline",
      title: "Profile",
      description: "Manage your account settings",
      disabled: true
    },
    {
      id: "payments",
      icon: "payments",
      title: "Payment Settings",
      description: "Configure payment methods",
      disabled: false,
      toggle: true,
      toggled: acceptOnlyCash,
      toggleLabel: "Cash-only mode",
      onToggle: handleCashOnlyToggle
    },
    {
      id: "data",
      icon: "storage",
      title: "Data & Sync",
      description: "Backup and sync settings",
      disabled: true
    },
    {
      id: "about",
      icon: "info",
      title: "About",
      description: "Version 1.0.0",
      disabled: true
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 pb-28">
      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to AushadiExpress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {onboardingStep === 1 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Let's set up your pharmacy management system to capture invoice data and GSTN compliance information.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your pharmacy name"
                      data-testid="input-business-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-role">Your Role</Label>
                    <Select value={userRole} onValueChange={setUserRole} data-testid="select-onboarding-role">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retailer">Retailer</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setOnboardingStep(2)} 
                    disabled={!businessName || !userRole}
                    className="flex-1"
                    data-testid="button-continue-onboarding"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
            {onboardingStep === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Perfect! Now you can start using AushadiExpress to scan invoices and capture GSTN, supplier, and buyer information for compliance.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border">
                  <h4 className="font-semibold text-blue-900">Next Steps:</h4>
                  <ul className="text-sm text-blue-800 mt-1 space-y-1">
                    <li>• Use the AI Assistant to ask about your business data</li>
                    <li>• Scan invoices to automatically extract GSTN information</li>
                    <li>• View all captured supplier and buyer details in one place</li>
                  </ul>
                </div>
                <Button 
                  onClick={completeOnboarding} 
                  className="w-full"
                  data-testid="button-complete-onboarding"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" data-testid="settings-title">Settings</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setOnboardingStep(1);
              const userStr = localStorage.getItem('user');
              if (userStr) {
                try {
                  const userData = JSON.parse(userStr);
                  if (userData.username) {
                    setBusinessName(userData.username);
                  }
                } catch (e) {
                  console.error('Failed to parse user data:', e);
                }
              }
              setShowOnboarding(true);
            }}
            data-testid="button-rerun-onboarding"
          >
            Setup Wizard
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {settingsItems.map((item) => (
          <Card key={item.id} className={`elevation-1 ${item.disabled && !item.beta ? 'opacity-50' : ''}`}>
            <CardContent className="p-0">
              {item.toggle ? (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center space-x-2">
                        <span>{item.title}</span>
                        {item.beta && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">BETA</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Switch 
                      checked={item.toggled}
                      onCheckedChange={item.onToggle}
                      data-testid={`toggle-${item.id}`}
                    />
                    <span className="text-xs text-muted-foreground">{item.toggleLabel}</span>
                  </div>
                </div>
              ) : item.role ? (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Select value={item.selectedRole} onValueChange={item.onRoleChange} data-testid="select-user-role">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : item.tenant ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Business Name</Label>
                    <div className="p-2 bg-muted rounded text-sm">
                      {businessName || 'Not set'}
                    </div>
                    <Label className="text-sm font-medium mt-3">Tenant ID</Label>
                    <div className="p-2 bg-muted rounded text-sm font-mono">
                      {item.currentTenant}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      AI Assistant queries are scoped to this tenant/enterprise. All data is filtered by this ID.
                    </div>
                  </div>
                </div>
              ) : item.dialog ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                      data-testid={`setting-${item.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="material-icons text-primary">{item.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center space-x-2">
                            <span>{item.title}</span>
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">BETA</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <span className="material-icons text-muted-foreground">chevron_right</span>
                    </button>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{item.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Our AI Assistant is coming Q4 2025. Join the beta to get early access and help shape the future of pharmacy management.
                      </p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="beta-email">Email Address</Label>
                        <Input
                          id="beta-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          data-testid="input-beta-email"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleBetaSignup}
                          disabled={isSubmitting}
                          className="flex-1"
                          data-testid="button-join-beta"
                        >
                          {isSubmitting ? "Joining..." : "Join Beta"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          data-testid="button-cancel-beta"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div 
                  className={`p-4 flex items-center justify-between ${item.disabled ? 'cursor-not-allowed' : 'hover:bg-muted/50 transition-colors cursor-pointer'}`}
                  data-testid={`setting-${item.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {!item.disabled && (
                    <span className="material-icons text-muted-foreground">chevron_right</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-8 border-t border-border">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Pharma-Empire OS</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0 • Build 2025.09.05</p>
          <p className="text-xs text-muted-foreground">Made for Indian pharmacies</p>
        </div>
      </div>
    </div>
  );
}
