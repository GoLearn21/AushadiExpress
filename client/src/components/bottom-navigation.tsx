import { Link, useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export function BottomNavigation() {
  const [location] = useLocation();
  const [userRole, setUserRole] = useState<string>('retailer');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  // Customer navigation
  const customerNavItems = [
    { path: '/search', icon: 'search', label: 'Search' },
    { path: '/orders', icon: 'shopping_bag', label: 'Orders' },
    { path: '/settings', icon: 'person', label: 'Profile' },
  ];

  // Business navigation (retailer, wholesaler, distributor)
  const businessNavItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/inventory', icon: 'inventory_2', label: 'Products' },
    { path: '/ops', icon: 'business_center', label: 'Ops' },
    { path: '/ai-assistant', icon: 'smart_toy', label: 'AI' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ];

  const navItems = userRole === 'customer' ? customerNavItems : businessNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 elevation-2 z-50" data-testid="bottom-navigation">
      <div className="flex justify-around">
        {navItems.map(({ path, icon, label }) => (
          <Link key={path} href={path} data-testid={`nav-${label.toLowerCase()}`}>
            <div className={`flex flex-col items-center space-y-1 py-2 px-4 transition-colors cursor-pointer ${
              location === path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
              <span className="material-icons">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
