import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ReceivingFAB } from "@/components/receiving-fab";
import { ActionSheet } from "@/components/action-sheet";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [demoToolsOpen, setDemoToolsOpen] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  // Get filter from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const filter = urlParams.get('filter');
  
  // Form state for adding products
  const [productForm, setProductForm] = useState({
    name: "Aspirin 100mg",
    price: 15.00,
    description: "Pain relief medication"
  });

  const [stockForm, setStockForm] = useState({
    batchNumber: "B2024003",
    quantity: 50,
    expiryDate: "2026-01-31"
  });
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: stock = [], isLoading: stockLoading } = useQuery({
    queryKey: ['/api/stock'],
  });

  // Mutations for adding products
  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest('POST', '/api/products', productData);
      return response.json();
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product created successfully" });
      
      // Create stock entry for the product
      createStock.mutate({
        productId: newProduct.id,
        productName: newProduct.name,
        ...stockForm,
        expiryDate: new Date(stockForm.expiryDate).toISOString(),
        tenantId: newProduct.tenantId ?? localStorage.getItem('currentTenantId') ?? 'default'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create product", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createStock = useMutation({
    mutationFn: async (stockData: any) => {
      const tenantId = stockData.tenantId ?? localStorage.getItem('currentTenantId') ?? 'default';
      const response = await apiRequest('POST', '/api/stock', { ...stockData, tenantId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      toast({ title: "Stock added successfully" });
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add stock", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddProduct = () => {
    const tenantId = localStorage.getItem('currentTenantId') || 'default';
    createProduct.mutate({ ...productForm, tenantId });
  };

  if (productsLoading || stockLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-icons animate-spin text-4xl text-primary">sync</span>
          <p className="mt-2 text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const getProductStock = (productId: string) => {
    return Array.isArray(stock) ? stock.filter((s: any) => s.productId === productId) : [];
  };

  const getTotalQuantity = (productId: string) => {
    return getProductStock(productId).reduce((total: number, s: any) => total + s.quantity, 0);
  };

  // Filter products if low stock filter is applied
  const filteredProducts = filter === 'lowStock' 
    ? (Array.isArray(products) ? products.filter((product: any) => getTotalQuantity(product.id) < 10) : [])
    : (Array.isArray(products) ? products : []);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="inventory-title">Products</h1>
          {filter === 'lowStock' && (
            <p className="text-sm text-destructive">Showing low stock items</p>
          )}
        </div>
        <span className="text-sm text-muted-foreground" data-testid="product-count">
          {filteredProducts.length} products
        </span>
      </div>

      <div className="space-y-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => {
            const productStock = getProductStock(product.id);
            const totalQuantity = getTotalQuantity(product.id);
            const isLowStock = totalQuantity < 10;

            return (
              <Card key={product.id} className="elevation-1" data-testid={`product-${product.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg" data-testid={`product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        {isLowStock && (
                          <Badge variant="destructive" data-testid={`low-stock-badge-${product.id}`}>
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-3" data-testid={`product-description-${product.id}`}>
                        {product.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-semibold text-primary" data-testid={`product-price-${product.id}`}>
                            ₹{product.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Quantity</p>
                          <p className={`font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`} data-testid={`product-quantity-${product.id}`}>
                            {totalQuantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {productStock.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Stock Batches</h4>
                      <div className="space-y-2">
                        {productStock.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between text-sm" data-testid={`stock-${s.id}`}>
                            <span className="font-medium" data-testid={`batch-number-${s.id}`}>
                              {s.batchNumber}
                            </span>
                            <div className="flex items-center space-x-4">
                              <span data-testid={`batch-quantity-${s.id}`}>
                                Qty: {s.quantity}
                              </span>
                              <span className="text-muted-foreground" data-testid={`batch-expiry-${s.id}`}>
                                Exp: {new Date(s.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="elevation-1">
            <CardContent className="p-8 text-center">
              <span className="material-icons text-6xl text-muted-foreground mb-4">inventory_2</span>
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'lowStock' ? 'No low stock items' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'lowStock' 
                  ? 'Great! All products are well stocked.' 
                  : 'Add your first product using the + button below'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demo Tools - Collapsible Section */}
      <Collapsible open={demoToolsOpen} onOpenChange={setDemoToolsOpen}>
        <Card className="elevation-1 border border-muted">
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors" data-testid="demo-tools-toggle">
              <h3 className="text-lg font-semibold text-muted-foreground">Demo Tools</h3>
              <span className={`material-icons transition-transform ${demoToolsOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 border-t border-muted">
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="product-name" className="text-sm font-medium text-muted-foreground mb-1">Product Name</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      placeholder="Enter product name"
                      data-testid="input-product-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-price" className="text-sm font-medium text-muted-foreground mb-1">Price (₹)</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      data-testid="input-product-price"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="product-description" className="text-sm font-medium text-muted-foreground mb-1">Description</Label>
                  <Input
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Product description"
                    data-testid="input-product-description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="batch-number" className="text-sm font-medium text-muted-foreground mb-1">Batch Number</Label>
                    <Input
                      id="batch-number"
                      value={stockForm.batchNumber}
                      onChange={(e) => setStockForm({...stockForm, batchNumber: e.target.value})}
                      placeholder="Batch #"
                      data-testid="input-batch-number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium text-muted-foreground mb-1">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      data-testid="input-quantity"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="expiry-date" className="text-sm font-medium text-muted-foreground mb-1">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={stockForm.expiryDate}
                    onChange={(e) => setStockForm({...stockForm, expiryDate: e.target.value})}
                    data-testid="input-expiry-date"
                  />
                </div>
                
                <Button 
                  className="w-full py-3 elevation-1" 
                  onClick={handleAddProduct}
                  disabled={createProduct.isPending || createStock.isPending}
                  data-testid="button-add-product"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className="material-icons">add</span>
                    <span>
                      {createProduct.isPending || createStock.isPending ? 'Adding...' : 'Add Product & Stock'}
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Single Floating Action Button */}
      <button 
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full elevation-2 hover:elevation-3 transition-all duration-200 flex items-center justify-center"
        onClick={() => setShowActionSheet(true)}
        data-testid="fab-products-menu"
      >
        <span className="material-icons">add</span>
      </button>
      
      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Add to Inventory"
        actions={[
          {
            label: "Receive Stock",
            icon: "inbox",
            onClick: () => {
              // Navigate to ops with receive parameter
              window.location.href = '/ops?initial=receive';
            }
          },
          {
            label: "Add Product",
            icon: "add_circle",
            onClick: () => {
              setShowAddForm(true);
            }
          },
          ...(process.env.NODE_ENV === 'development' ? [{
            label: "Quick Add Demo",
            icon: "flash_on",
            onClick: () => {
              setDemoToolsOpen(!demoToolsOpen);
            }
          }] : [])
        ]}
      />
    </div>
  );
}
