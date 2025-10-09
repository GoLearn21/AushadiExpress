import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tw } from '@/lib/theme';
import { useCart } from '@/hooks/use-cart';

export function CustomerHeader() {
  const [, setLocation] = useLocation();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  return (
    <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="material-icons text-xl">medication</span>
          <h1 className={`${tw.headingLg} text-primary-foreground`}>AushadiExpress</h1>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="relative text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setLocation('/cart')}
        >
          <span className="material-icons">shopping_cart</span>
          {cartItemCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
