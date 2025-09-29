import type { Product, Stock, Sale, InsertSale } from "@shared/schema";

export interface SaleItem {
  productId: string;
  stockId: string;
  quantity: number;
  price: number;
}

export interface StockUpdate {
  stockId: string;
  newQuantity: number;
}

/**
 * Sales Engine implementing FEFO (First Expired, First Out) stock management
 */
export class SalesEngine {
  /**
   * Apply FEFO logic to select stock for a product
   * Returns stock items sorted by expiry date (earliest first)
   */
  static selectStockForProduct(
    productId: string, 
    requestedQuantity: number, 
    availableStock: Stock[]
  ): { selectedStock: Stock[], remainingQuantity: number } {
    // Filter stock for this product with available quantity
    const productStock = availableStock
      .filter(stock => stock.productId === productId && stock.quantity > 0)
      .sort((a, b) => {
        // Sort by expiry date (earliest first) - FEFO
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
      });

    const selectedStock: Stock[] = [];
    let remainingQuantity = requestedQuantity;

    for (const stock of productStock) {
      if (remainingQuantity <= 0) break;

      const availableFromStock = Math.min(stock.quantity, remainingQuantity);
      if (availableFromStock > 0) {
        selectedStock.push({
          ...stock,
          quantity: availableFromStock
        });
        remainingQuantity -= availableFromStock;
      }
    }

    return { selectedStock, remainingQuantity };
  }

  /**
   * Validate if a sale can be fulfilled with current stock
   */
  static validateSale(saleItems: SaleItem[], availableStock: Stock[]): {
    isValid: boolean;
    errors: string[];
    stockUpdates: StockUpdate[];
  } {
    const errors: string[] = [];
    const stockUpdates: StockUpdate[] = [];

    // Group sale items by product
    const productQuantities = new Map<string, number>();
    saleItems.forEach(item => {
      const currentQty = productQuantities.get(item.productId) || 0;
      productQuantities.set(item.productId, currentQty + item.quantity);
    });

    // Validate each product's availability using FEFO
    for (const [productId, requestedQty] of Array.from(productQuantities.entries())) {
      const { selectedStock, remainingQuantity } = this.selectStockForProduct(
        productId,
        requestedQty,
        availableStock
      );

      if (remainingQuantity > 0) {
        errors.push(`Insufficient stock for product ${productId}. Need ${remainingQuantity} more units.`);
        continue;
      }

      // Calculate stock updates
      selectedStock.forEach(stock => {
        const originalStock = availableStock.find(s => s.id === stock.id);
        if (originalStock) {
          const newQuantity = originalStock.quantity - stock.quantity;
          stockUpdates.push({
            stockId: stock.id,
            newQuantity: Math.max(0, newQuantity)
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      stockUpdates
    };
  }

  /**
   * Process a sale and generate stock updates
   */
  static processSale(saleItems: SaleItem[], availableStock: Stock[]): {
    success: boolean;
    sale?: Partial<InsertSale>;
    stockUpdates: StockUpdate[];
    errors: string[];
  } {
    const validation = this.validateSale(saleItems, availableStock);
    
    if (!validation.isValid) {
      return {
        success: false,
        stockUpdates: [],
        errors: validation.errors
      };
    }

    // Calculate total
    const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create sale record
    const sale: Partial<InsertSale> = {
      total,
      items: JSON.stringify(saleItems)
    };

    return {
      success: true,
      sale,
      stockUpdates: validation.stockUpdates,
      errors: []
    };
  }

  /**
   * Check for products nearing expiry (within 30 days)
   */
  static getNearExpiryProducts(stock: Stock[], daysThreshold: number = 30): Stock[] {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return stock.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thresholdDate && item.quantity > 0;
    }).sort((a, b) => {
      const dateA = new Date(a.expiryDate!).getTime();
      const dateB = new Date(b.expiryDate!).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Get low stock alerts
   */
  static getLowStockAlerts(stock: Stock[], threshold: number = 10): Stock[] {
    return stock.filter(item => item.quantity <= threshold && item.quantity > 0);
  }

  /**
   * Calculate stock value by product
   */
  static calculateStockValue(products: Product[], stock: Stock[]): {
    totalValue: number;
    productValues: Array<{ productId: string; value: number; quantity: number }>;
  } {
    const productMap = new Map(products.map(p => [p.id, p]));
    const productValues: Array<{ productId: string; value: number; quantity: number }> = [];
    let totalValue = 0;

    // Group stock by product
    const stockByProduct = new Map<string, Stock[]>();
    stock.forEach(item => {
      if (!stockByProduct.has(item.productId)) {
        stockByProduct.set(item.productId, []);
      }
      stockByProduct.get(item.productId)!.push(item);
    });

    // Calculate value for each product
    for (const [productId, stockItems] of Array.from(stockByProduct.entries())) {
      const product = productMap.get(productId);
      if (!product) continue;

      const totalQuantity = stockItems.reduce((sum: number, item: Stock) => sum + item.quantity, 0);
      const value = product.price * totalQuantity;
      
      productValues.push({
        productId,
        value,
        quantity: totalQuantity
      });
      
      totalValue += value;
    }

    return { totalValue, productValues };
  }
}