import { GoogleGenAI } from "@google/genai";
import { db } from "../db";
import { products, stock, sales, documents } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

// Simple logging utility
const log = {
  info: (message: string, meta?: any) => console.log('[GEMINI-AGENT]', message, meta || ''),
  error: (message: string, error: Error) => console.error('[GEMINI-AGENT]', message, error.message)
};

export interface PharmacyContext {
  tenantId?: string;
  role?: 'wholesaler' | 'retailer' | 'distributor';
  currentScreen?: string;
  hasImage?: boolean;
  sessionId?: string;
}

interface EnterpriseSnapshot {
  tenantId: string;
  timestamp: number;
  summary: string;
  rawData: {
    products: any[];
    stock: any[];
    sales: any[];
    documents: any[];
  };
}

interface SessionData {
  snapshot: EnterpriseSnapshot;
  chatHistory: Array<{role: string, content: string, timestamp: number}>;
  expiresAt: number;
}

// Session cache with 1-hour expiry
const sessionCache = new Map<string, SessionData>();
const loadingSnapshots = new Map<string, Promise<void>>();

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any, context: PharmacyContext) => Promise<any>;
}

export class PharmacyIntelligenceAgent {
  private genai: GoogleGenAI;
  private tools: Map<string, AgentTool> = new Map();
  private tenantIdCache = new Map<string, string>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly ENTERPRISE_LOAD_MESSAGE = "🔄 Bringing whole enterprise health data...may take few seconds. Post this, any questions will be answered instantly from your complete business snapshot.";

  constructor() {
    // Use environment variable for API key
    const apiKey = this.getApiKey();
    this.genai = new GoogleGenAI({ apiKey });
    this.initializeTools();
  }

  private getApiKey(): string {
    // Check environment variable first
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && process.env.GEMINI_API_KEY !== 'undefined') {
      return process.env.GEMINI_API_KEY.trim();
    }

    // Return empty string if not found (will be warned in constructor)
    console.log('[GEMINI-AGENT] GEMINI_API_KEY not found in environment. AI features will be limited.');
    return '';
  }

  private initializeTools() {
    // Core Business Intelligence Tools
    this.registerTool({
      name: "goods_out_data_lookup", 
      description: "Fetch stock decrements from sales and transfers",
      parameters: {
        type: "object",
        properties: {
          tenant_id: { type: "string" }
        },
        required: ["tenant_id"]
      },
      handler: this.handleGoodsOutLookup.bind(this)
    });

    this.registerTool({
      name: "goods_in_data_lookup",
      description: "Fetch current inventory, products and stock levels",
      parameters: {
        type: "object", 
        properties: {
          tenant_id: { type: "string" }
        },
        required: ["tenant_id"]
      },
      handler: this.handleGoodsInLookup.bind(this)
    });

    this.registerTool({
      name: "document_analysis",
      description: "Query uploaded documents and bills for insights",
      parameters: {
        type: "object",
        properties: {
          tenant_id: { type: "string" }
        },
        required: ["tenant_id"]
      },
      handler: this.handleDocumentQuery.bind(this)
    });
  }

  private registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  async processPharmacyQuery(query: string, context: PharmacyContext): Promise<string> {
    const sessionId = context.sessionId || 'default';
    
    console.log('[GEMINI-AGENT] Processing intelligent pharmacy query', {
      query,
      tenantId: context.tenantId,
      role: context.role,
      hasImage: context.hasImage,
      sessionId
    });

    // Store tenant ID for session
    if (context.tenantId) {
      this.tenantIdCache.set(sessionId, context.tenantId);
    }

    // Get tenant ID from session if not provided
    const tenantId = context.tenantId || this.tenantIdCache.get(sessionId);
    if (!tenantId) {
      return 'Please provide your tenant ID to continue.';
    }

    try {
      const now = Date.now();
      const cachedSession = sessionCache.get(sessionId);

      if (!cachedSession || cachedSession.snapshot.tenantId !== tenantId) {
        const history = cachedSession?.chatHistory ?? [];
        await this.ensureSnapshotReady(sessionId, tenantId, history);
      }

      const session = sessionCache.get(sessionId);
      if (!session) {
        return 'I am still preparing your enterprise data. Please try again in a moment.';
      }

      if (now > session.expiresAt) {
        this.queueSnapshotRefresh(sessionId, tenantId, session.chatHistory);
      }

      // Add current query to chat history
      session.chatHistory.push({
        role: 'user',
        content: query,
        timestamp: now
      });
      
      // Use Gemini AI with complete enterprise context
      const response = await this.queryGeminiWithEnterpriseContext(query, session.snapshot, session.chatHistory);
      
      // Add response to chat history
      session.chatHistory.push({
        role: 'assistant', 
        content: response,
        timestamp: Date.now()
      });
      
      return response;
      
    } catch (error) {
      console.error('[GEMINI-AGENT] Error processing query:', error);
      
      // Try basic fallback without AI
      const fallbackResponse = await this.getBasicFallbackResponse(query, { tenantId } as PharmacyContext);
      if (fallbackResponse) {
        return fallbackResponse;
      }
      
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact support if the issue persists.';
    }
  }

  private async loadEnterpriseSnapshot(tenantId: string): Promise<EnterpriseSnapshot> {
    console.log('[GEMINI-AGENT] Loading complete enterprise data...');
    
    // Load all enterprise data from database
    const [inventoryData, stockData, salesData, documentsData] = await Promise.all([
      this.handleGoodsInLookup({ tenant_id: tenantId }, { tenantId } as PharmacyContext),
      this.fetchStockData(tenantId),
      this.handleGoodsOutLookup({ tenant_id: tenantId }, { tenantId } as PharmacyContext),
      this.handleDocumentQuery({ tenant_id: tenantId }, { tenantId } as PharmacyContext)
    ]);
    
    // Create comprehensive summary using Gemini AI
    const summaryPrompt = `You are an intelligent pharmacy business analyst. Analyze this complete enterprise data and create a comprehensive business intelligence summary.

COMPLETE INVENTORY DATA:
${JSON.stringify(inventoryData, null, 2)}

RAW STOCK DATA: 
${JSON.stringify(stockData, null, 2)}

SALES PERFORMANCE DATA:
${JSON.stringify(salesData, null, 2)}

DOCUMENTS & SUPPLIER DATA:
${JSON.stringify(documentsData, null, 2)}

Create a detailed enterprise intelligence report covering:

1. **PRODUCT CATALOG**: Every single product with exact names, quantities, prices, and batch details
2. **INVENTORY HEALTH**: 
   - List ALL products with their exact stock quantities
   - Identify LOW STOCK items (quantity < 20 units) - list these separately
   - Identify OUT OF STOCK items (quantity = 0) - flag these as critical
   - Track expiry dates and reorder points
3. **FINANCIAL OVERVIEW**: Total inventory value, revenue, profit margins
4. **SALES ANALYTICS**: Top performers, slow movers, trends
5. **SUPPLIER ECOSYSTEM**: Key suppliers, buyer relationships, document insights
6. **OPERATIONAL INSIGHTS**: Critical actions needed, opportunities, risks

Be extremely specific with product names, quantities, and financial data. Include ALL products in your analysis. 

**IMPORTANT**: When listing low stock items, ONLY include products with quantity less than 20 units. Do not show all products when asked about low stock.

This summary will be used to answer detailed questions about any aspect of this pharmacy business.

Format the response as a comprehensive business intelligence report that can answer any question about inventory, sales, finances, or operations.`;
    
    try {
      const geminiResponse = await this.genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: summaryPrompt,
      });
      
      const summary = geminiResponse.text || 'Enterprise data loaded successfully';
      
      console.log('[GEMINI-AGENT] AI-powered enterprise summary created');
      
      return {
        tenantId,
        timestamp: Date.now(),
        summary,
        rawData: {
          products: inventoryData.inventory || [],
          stock: stockData,
          sales: salesData.sales || [],
          documents: documentsData.documents || []
        }
      };
    } catch (error) {
      console.error('[GEMINI-AGENT] Error creating enterprise summary:', error);
      
      // Fallback to structured summary without AI
      const summary = `ENTERPRISE DATA SUMMARY for ${tenantId}:\n\n` +
        `📦 INVENTORY: ${inventoryData.total_products} products worth ₹${inventoryData.total_stock_value?.toFixed(2) || '0'}\n` +
        `🔥 TOP PRODUCTS: ${inventoryData.inventory?.slice(0,5).map((p: any) => `${p.name} (${p.total_stock} units @ ₹${p.price})`).join(', ')}\n\n` +
        `💰 SALES: ${salesData.total_sales} transactions totaling ₹${salesData.total_value?.toFixed(2) || '0'}\n` +
        `📋 DOCUMENTS: ${documentsData.total_documents} uploaded\n` +
        `🤝 SUPPLIERS: ${documentsData.suppliers?.join(', ') || 'None'}`;
      
      return {
        tenantId,
        timestamp: Date.now(),
        summary,
        rawData: {
          products: inventoryData.inventory || [],
          stock: stockData,
          sales: salesData.sales || [],
          documents: documentsData.documents || []
        }
      };
    }
  }
  
  private async queryGeminiWithEnterpriseContext(query: string, snapshot: EnterpriseSnapshot, chatHistory: Array<{role: string, content: string, timestamp: number}>): Promise<string> {
    const recentHistory = chatHistory.slice(-10); // Last 10 messages for context
    
    const prompt = `You are an intelligent pharmacy assistant with access to complete enterprise data. Answer the user's question using ONLY the provided business data.

COMPLETE ENTERPRISE INTELLIGENCE SUMMARY:
${snapshot.summary}

DETAILED RAW DATA ACCESS:
PRODUCTS: ${JSON.stringify(snapshot.rawData.products, null, 2)}
STOCK: ${JSON.stringify(snapshot.rawData.stock, null, 2)}
SALES: ${JSON.stringify(snapshot.rawData.sales, null, 2)}
DOCUMENTS: ${JSON.stringify(snapshot.rawData.documents, null, 2)}

CONVERSATION HISTORY:
${recentHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

CURRENT QUESTION: ${query}

CRITICAL INSTRUCTIONS:
- Answer ONLY from the provided enterprise data above - NEVER make up information
- Search through the complete data carefully to find exact matches
- Be extremely specific with product names, quantities, prices, and batch information
- For specific product queries: Search ALL products and return exact match or say "No, [product name] not found in inventory"
- For "low stock" queries: ONLY show products with quantity less than 20 units (filter, don't show all)
- For "out of stock" queries: ONLY show products with 0 units
- For sales queries: Provide exact transaction data, totals, and dates
- For financial queries: Calculate accurate totals from the data
- Include relevant financial data (prices, values, totals) with ₹ symbol
- If data is NOT found: Respond politely with "No, I couldn't find [what they asked for] in your database" and suggest what data IS available
- End with 3 relevant quick actions in format: Quick Actions: Question1|Question2|Question3
- Keep responses concise, accurate, and helpful

QUICK ACTION EXAMPLES:
- "How many units of [product name] do we have in stock?"
- "Show me all products expiring in next 30 days"
- "What is our total inventory value?"
- "Which products are running low on stock?"
- "Show me this month's sales performance"
- "Do we have [specific product] in stock?"
- "What are our top 5 selling products?"
- "Show me today's total sales"

HANDLING "NOT FOUND" SCENARIOS:
When the user asks about something not in the data, respond like:
- "No, I couldn't find [product name] in your current inventory. You currently have [X] products in stock."
- "No sales data available for that period. Your most recent sales were on [date]."
- "No, that information is not available in your database yet."

Always be helpful and suggest what information IS available when something is not found.

Answer the question now:`;
    
    try {
      const response = await this.genai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
      });
      
      return response.text || 'I couldn\'t process that request. Please try again.';
    } catch (error) {
      console.error('[GEMINI-AGENT] Gemini API error:', error);
      
      // Use basic fallback without AI
      return await this.getBasicFallbackResponse(query, { tenantId: snapshot.tenantId } as PharmacyContext) || 
        'I\'m having trouble accessing the AI service. Please try again.';
    }
  }
  
  private async getBasicFallbackResponse(query: string, context: PharmacyContext): Promise<string | null> {
    try {
      const queryLower = query.toLowerCase();
      
      // SPECIFIC PRODUCT QUERIES - Search by product name
      // Look for product names (usually in CAPS) in the query
      const productSearchMatch = query.match(/\b([A-Z][A-Z\s\d]+(?:SUSP|SYP|TAB|CAP|CREAM|INJ|DROPS|SYRUP)?)\b/i);
      
      // Check if this is a query about a specific product (not asking for "all products" or general inventory)
      const isSpecificProductQuery = productSearchMatch && 
        !queryLower.includes('all products') &&
        !queryLower.includes('show me products') &&
        !queryLower.includes('list products') &&
        (queryLower.includes('for ' + productSearchMatch[1].toLowerCase()) || 
         queryLower.includes('of ' + productSearchMatch[1].toLowerCase()) ||
         queryLower.includes('expiry') || 
         queryLower.includes('expire') ||
         queryLower.includes('batch') ||
         queryLower.includes('price') ||
         queryLower.includes('value') ||
         queryLower.includes('how many') ||
         queryLower.includes('do we have') ||
         queryLower.includes('stock of') ||
         queryLower.includes('only for'));
      
      if (isSpecificProductQuery) {
        const productName = productSearchMatch[1].trim();
        const result = await this.handleGoodsInLookup({ tenant_id: context.tenantId }, context);
        
        // Search for the product (case-insensitive)
        const foundProduct = result.inventory?.find((item: any) => 
          item.name?.toLowerCase().includes(productName.toLowerCase()) ||
          productName.toLowerCase().includes(item.name?.toLowerCase())
        );
        
        if (!foundProduct) {
          return `No, I couldn't find "${productName}" in your inventory.\n\nYou currently have ${result.total_products} products in stock.\n\nQuick Actions: Show me all products|Add new product|Search inventory`;
        }
        
        // Build response based ONLY on what was specifically asked
        let response = '';
        
        // If asking ONLY for value/price
        if (queryLower.includes('value only') || queryLower.includes('only value') || (queryLower.includes('value') && queryLower.includes('only'))) {
          const totalValue = foundProduct.total_stock * (foundProduct.price || 0);
          response = `💰 **${foundProduct.name}**\n\n`;
          response += `Total Value: ₹${totalValue.toFixed(2)}\n`;
          response += `(${foundProduct.total_stock} units @ ₹${foundProduct.price?.toFixed(2) || '0'})\n`;
          response += `\nQuick Actions: Show me all product details|Show me low stock items|What is our total inventory value`;
          return response;
        }
        
        // If asking ONLY for expiry
        if ((queryLower.includes('expiry') || queryLower.includes('expire')) && !queryLower.includes('and')) {
          response = `📦 **${foundProduct.name}**\n\n`;
          if (foundProduct.stock_details && foundProduct.stock_details.length > 0) {
            const firstBatch = foundProduct.stock_details[0];
            if (firstBatch.expiry) {
              response += `Expiry Date: ${new Date(firstBatch.expiry).toLocaleDateString()}\n`;
              response += `Batch: ${firstBatch.batch || 'N/A'}\n`;
            } else {
              response += `Expiry date not recorded for this product.\n`;
            }
            
            if (foundProduct.stock_details.length > 1) {
              response += `\n**All Batches:**\n`;
              foundProduct.stock_details.forEach((batch: any, idx: number) => {
                response += `${idx + 1}. Batch ${batch.batch || 'N/A'} - Exp: ${batch.expiry ? new Date(batch.expiry).toLocaleDateString() : 'N/A'}\n`;
              });
            }
          } else {
            response += `Expiry date not recorded.\n`;
          }
          response += `\nQuick Actions: Show me all product details|Show me low stock items|Show me all products`;
          return response;
        }
        
        // If asking ONLY for stock/quantity/count
        if ((queryLower.includes('how many') || queryLower.includes('stock') || queryLower.includes('count') || queryLower.includes('quantity')) && !queryLower.includes('value')) {
          response = `📦 **${foundProduct.name}**\n\n`;
          response += `Stock Count: ${foundProduct.total_stock} units\n`;
          if (foundProduct.batches && foundProduct.batches > 1) {
            response += `(${foundProduct.batches} batches)\n`;
          }
          response += `\nQuick Actions: Show me all product details|Show me low stock items|Show me all products`;
          return response;
        }
        
        // If asking ONLY for price
        if (queryLower.includes('price') && !queryLower.includes('value')) {
          response = `📦 **${foundProduct.name}**\n\n`;
          response += `Price: ₹${foundProduct.price?.toFixed(2) || 'N/A'}\n`;
          response += `\nQuick Actions: Show me all product details|Show me stock level|Show me all products`;
          return response;
        }
        
        // DEFAULT: Show all details
        response = `📦 **${foundProduct.name}**\n\n`;
        response += `• Stock: ${foundProduct.total_stock} units`;
        
        if (foundProduct.batches && foundProduct.batches > 1) {
          response += ` (${foundProduct.batches} batches)`;
        }
        response += `\n`;
        
        response += `• Price: ₹${foundProduct.price?.toFixed(2) || 'N/A'}\n`;
        
        // Get batch and expiry from stock_details
        if (foundProduct.stock_details && foundProduct.stock_details.length > 0) {
          const firstBatch = foundProduct.stock_details[0];
          response += `• Batch: ${firstBatch.batch || 'N/A'}\n`;
          
          if (firstBatch.expiry) {
            response += `• Expiry: ${new Date(firstBatch.expiry).toLocaleDateString()}\n`;
          } else {
            response += `• Expiry: Not recorded\n`;
          }
          
          // If multiple batches, show all batch details
          if (foundProduct.stock_details.length > 1) {
            response += `\n**All Batches:**\n`;
            foundProduct.stock_details.forEach((batch: any, idx: number) => {
              response += `${idx + 1}. Batch ${batch.batch || 'N/A'} - ${batch.quantity} units - Exp: ${batch.expiry ? new Date(batch.expiry).toLocaleDateString() : 'N/A'}\n`;
            });
          }
        } else {
          response += `• Batch: Not recorded\n`;
          response += `• Expiry: Not recorded\n`;
        }
        
        response += `\nQuick Actions: Show me low stock items|What is our total inventory value|Show me all products`;
        return response;
      }
      
      // LOW STOCK - Actually query the database
      if (queryLower.includes('low stock') || queryLower.includes('running low') || queryLower.includes('reorder')) {
        const result = await this.handleGoodsInLookup({ tenant_id: context.tenantId }, context);
        const lowStockItems = result.inventory?.filter((item: any) => item.total_stock < 20) || [];
        
        if (lowStockItems.length === 0) {
          return `✅ All products are well stocked! No items below 20 units.\n\nCurrent inventory: ${result.total_products} products\n\nQuick Actions: Show me all products|What is our most expensive product|Show me sales summary`;
        }
        
        const itemsList = lowStockItems.slice(0, 10).map((item: any) => {
          const batch = item.stock_details?.[0]?.batch || 'N/A';
          return `• ${item.name} - ${item.total_stock} units (Batch: ${batch})`;
        }).join('\n');
        
        return `⚠️ **Low Stock Alert:** ${lowStockItems.length} products below 20 units\n\n${itemsList}\n${lowStockItems.length > 10 ? `\n...and ${lowStockItems.length - 10} more` : ''}\n\nQuick Actions: Show me all products|What is our total inventory value|Show me sales summary`;
      }
      
      // INVENTORY/STOCK - Show actual product list
      if (queryLower.includes('inventory') || queryLower.includes('stock') || queryLower.includes('products')) {
        const result = await this.handleGoodsInLookup({ tenant_id: context.tenantId }, context);
        
        if (!result.inventory || result.inventory.length === 0) {
          return `📦 No products in inventory yet.\n\nQuick Actions: Add a product|Upload invoice|Scan barcode`;
        }
        
        const productList = result.inventory.slice(0, 10).map((item: any) => 
          `• ${item.name} - ${item.total_stock} units @ ₹${item.price?.toFixed(2) || '0'}`
        ).join('\n');
        
        return `📦 **Current Inventory:** ${result.total_products} products worth ₹${result.total_stock_value?.toFixed(2) || '0'}\n\n${productList}\n${result.inventory.length > 10 ? `\n...and ${result.inventory.length - 10} more` : ''}\n\nQuick Actions: Show me low stock items|What is our most expensive product|Show me sales summary`;
      }
      
      // SALES
      if (queryLower.includes('sales')) {
        const result = await this.handleGoodsOutLookup({ tenant_id: context.tenantId }, context);
        return `💰 **Sales Summary:** ${result.total_sales} transactions (₹${result.total_value?.toFixed(2) || '0'})\n\nQuick Actions: Show me today's sales total|What are our top selling products|How much revenue did we make this week`;
      }
      
      // EXPENSIVE/MOST EXPENSIVE
      if (queryLower.includes('expensive') || queryLower.includes('highest price')) {
        const result = await this.handleGoodsInLookup({ tenant_id: context.tenantId }, context);
        const sorted = [...(result.inventory || [])].sort((a, b) => (b.price || 0) - (a.price || 0));
        const top5 = sorted.slice(0, 5).map((item: any) => 
          `• ${item.name} - ₹${item.price?.toFixed(2) || '0'} (${item.total_stock} units)`
        ).join('\n');
        
        return `💎 **Most Expensive Products:**\n\n${top5}\n\nQuick Actions: Show me cheapest products|Show me low stock items|Show me all products`;
      }
      
      return null;
    } catch (error) {
      console.error('[GEMINI-AGENT] Error in basic fallback:', error);
      return null;
    }
  }

  private async ensureSnapshotReady(sessionId: string, tenantId: string, existingHistory: Array<{role: string, content: string, timestamp: number}>): Promise<void> {
    const key = `${sessionId}:${tenantId}`;
    let loader = loadingSnapshots.get(key);
    if (!loader) {
      console.log('[GEMINI-AGENT] Loading enterprise snapshot', { sessionId, tenantId });
      loader = this.loadEnterpriseSnapshot(tenantId)
        .then((snapshot) => {
          sessionCache.set(sessionId, {
            snapshot,
            chatHistory: existingHistory.slice(-20),
            expiresAt: Date.now() + this.CACHE_DURATION
          });
          console.log('[GEMINI-AGENT] Enterprise snapshot ready', { sessionId, tenantId });
        })
        .catch((error) => {
          console.error('[GEMINI-AGENT] Failed to load enterprise snapshot', error);
        })
        .finally(() => {
          loadingSnapshots.delete(key);
        });

      loadingSnapshots.set(key, loader);
    }

    await loader;
  }

  private queueSnapshotRefresh(sessionId: string, tenantId: string, existingHistory: Array<{role: string, content: string, timestamp: number}> = []): void {
    const key = `${sessionId}:${tenantId}`;
    if (loadingSnapshots.has(key)) {
      return;
    }

    console.log('[GEMINI-AGENT] Refreshing enterprise snapshot in background', { sessionId, tenantId });

    const loadPromise = this.loadEnterpriseSnapshot(tenantId)
      .then((snapshot) => {
        sessionCache.set(sessionId, {
          snapshot,
          chatHistory: existingHistory.slice(-20),
          expiresAt: Date.now() + this.CACHE_DURATION
        });
        console.log('[GEMINI-AGENT] Enterprise snapshot refreshed', { sessionId, tenantId });
      })
      .catch((error) => {
        console.error('[GEMINI-AGENT] Failed to refresh enterprise snapshot', error);
      })
      .finally(() => {
        loadingSnapshots.delete(key);
      });

    loadingSnapshots.set(key, loadPromise);
  }

  // Helper methods for fetching data
  private async fetchProductsData(tenantId: string): Promise<any[]> {
    try {
      let rows = await db.select().from(products).where(eq(products.tenantId, tenantId));
      if (!rows.length && tenantId !== 'default') {
        rows = await db.select().from(products).where(eq(products.tenantId, 'default'));
      }
      return rows;
    } catch (error) {
      console.error('[GEMINI-AGENT] Error fetching products:', error);
      return [];
    }
  }

  private async fetchStockData(tenantId: string): Promise<any[]> {
    try {
      let rows = await db.select().from(stock).where(eq(stock.tenantId, tenantId));
      if (!rows.length && tenantId !== 'default') {
        rows = await db.select().from(stock).where(eq(stock.tenantId, 'default'));
      }
      return rows;
    } catch (error) {
      console.error('[GEMINI-AGENT] Error fetching stock data:', error);
      return [];
    }
  }

  private parseSaleItems(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private async fetchSalesData(tenantId: string): Promise<any[]> {
    try {
      let rows = await db.select().from(sales).where(eq(sales.tenantId, tenantId));
      if (!rows.length && tenantId !== 'default') {
        rows = await db.select().from(sales).where(eq(sales.tenantId, 'default'));
      }
      return rows.map((sale) => ({
        ...sale,
        items: this.parseSaleItems(sale.items)
      }));
    } catch (error) {
      console.error('[GEMINI-AGENT] Error fetching sales data:', error);
      return [];
    }
  }

  private async fetchDocumentsData(tenantId: string): Promise<any[]> {
    try {
      let rows = await db.select().from(documents).where(eq(documents.enterpriseId, tenantId));
      if (!rows.length && tenantId !== 'default') {
        rows = await db.select().from(documents).where(eq(documents.enterpriseId, 'default'));
      }
      return rows;
    } catch (error) {
      console.error('[GEMINI-AGENT] Error fetching documents:', error);
      return [];
    }
  }

  // Cache invalidation method for when new sales/documents are added
  invalidateCache(tenantId: string): void {
    const sessionsToDelete: string[] = [];
    sessionCache.forEach((session, sessionId) => {
      if (session.snapshot.tenantId === tenantId) {
        sessionsToDelete.push(sessionId);
      }
    });
    
    sessionsToDelete.forEach(sessionId => {
      sessionCache.delete(sessionId);
      console.log(`[GEMINI-AGENT] Cache invalidated for tenant ${tenantId}, session ${sessionId}`);
    });

    loadingSnapshots.forEach((_promise, key) => {
      if (key.endsWith(`:${tenantId}`)) {
        loadingSnapshots.delete(key);
      }
    });
  }

  // Expose cache invalidation method
  static invalidateTenantCache(tenantId: string): void {
    const sessionsToDelete: string[] = [];
    sessionCache.forEach((session, sessionId) => {
      if (session.snapshot.tenantId === tenantId) {
        sessionsToDelete.push(sessionId);
      }
    });
    
    sessionsToDelete.forEach(sessionId => {
      sessionCache.delete(sessionId);
      console.log(`[GEMINI-AGENT] Global cache invalidated for tenant ${tenantId}`);
    });

    loadingSnapshots.forEach((_promise, key) => {
      if (key.endsWith(`:${tenantId}`)) {
        loadingSnapshots.delete(key);
      }
    });
  }

  // Core tool implementations
  private async handleGoodsInLookup(params: any, context: PharmacyContext): Promise<any> {
    try {
      const tenantId = params?.tenant_id || context.tenantId || 'default';
      // Fetch products and stock data
      const [products, stock] = await Promise.all([
        this.fetchProductsData(tenantId),
        this.fetchStockData(tenantId)
      ]);

      // Create inventory map with totals
      const inventoryMap = new Map();
      
      for (const stockItem of stock) {
        const product = products.find((p: any) => p.id === stockItem.productId);
        if (!product) continue;

        const key = product.id;
        if (!inventoryMap.has(key)) {
          inventoryMap.set(key, {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            total_stock: 0,
            batches: 0,
            tenant_id: product.tenantId,
            stock_details: []
          });
        }

        const item = inventoryMap.get(key);
        item.total_stock += stockItem.quantity;
        item.batches += 1;
        item.stock_details.push({
          batch: stockItem.batchNumber,
          quantity: stockItem.quantity,
          expiry: stockItem.expiryDate,
          tenant_id: stockItem.tenantId
        });
      }

      const inventory = Array.from(inventoryMap.values());
      const totalValue = inventory.reduce((sum, item) => sum + (item.total_stock * item.price), 0);

      return {
        inventory,
        total_products: inventory.length,
        total_stock_value: totalValue,
        tenant_id: tenantId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[GEMINI-AGENT] Error in goods lookup:', error);
      return { inventory: [], total_products: 0, total_stock_value: 0 };
    }
  }

  private async handleGoodsOutLookup(params: any, context: PharmacyContext): Promise<any> {
    try {
      const tenantId = params?.tenant_id || context.tenantId || 'default';
      const sales = await this.fetchSalesData(tenantId);

      const totalSales = sales.length;
      const totalValue = sales.reduce((sum: number, sale: any) => sum + (Number(sale.total) || 0), 0);

      // Create top movers analysis
      const productSales = new Map();
      for (const sale of sales) {
        const items = Array.isArray(sale.items) ? sale.items : this.parseSaleItems(sale.items);
        if (items && items.length) {
          for (const item of items) {
            const key = item.productId;
            if (!productSales.has(key)) {
              productSales.set(key, {
                product_id: item.productId,
                product_name: item.productName || 'Unknown',
                quantity_sold: 0,
                revenue: 0
              });
            }
            const productData = productSales.get(key);
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            productData.quantity_sold += quantity;
            productData.revenue += quantity * price;
          }
        }
      }

      const topMovers = Array.from(productSales.values())
        .sort((a, b) => b.quantity_sold - a.quantity_sold);

      return {
        total_sales: totalSales,
        total_value: totalValue,
        top_movers: topMovers,
        sales,
        tenant_id: tenantId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[GEMINI-AGENT] Error in sales lookup:', error);
      return { total_sales: 0, total_value: 0, top_movers: [] };
    }
  }

  private async handleDocumentQuery(params: any, context: PharmacyContext): Promise<any> {
    try {
      const tenantId = params?.tenant_id || context.tenantId || 'default';
      const documents = await this.fetchDocumentsData(tenantId);

      const suppliers = new Set();
      const buyers = new Set();

      for (const doc of documents) {
        if (doc.extractedData) {
          if (doc.extractedData.supplier) suppliers.add(doc.extractedData.supplier);
          if (doc.extractedData.buyer) buyers.add(doc.extractedData.buyer);
          if (doc.extractedData.from) suppliers.add(doc.extractedData.from);
          if (doc.extractedData.to) buyers.add(doc.extractedData.to);
        }
      }

      return {
        documents,
        total_documents: documents.length,
        suppliers: Array.from(suppliers),
        buyers: Array.from(buyers),
        tenant_id: tenantId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[GEMINI-AGENT] Error in document query:', error);
      return { documents: [], total_documents: 0, suppliers: [], buyers: [] };
    }
  }
}

// Export a singleton instance
export const geminiAgent = new PharmacyIntelligenceAgent();
