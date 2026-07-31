import { Express } from 'express';
import OpenAI from 'openai';
import aiRouter from './routes/ai';
import { db } from './db';
import { wholesalerProducts, wholesalerOrders, quoteRequests } from '../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export function registerAIRoutes(app: Express) {
  // Mount AI router at /api/ai
  app.use('/api/ai', aiRouter);

  // Initialize OpenAI client for direct routes only if API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not set. AI features will be limited.');
    return; // Skip AI route registration if no API key
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Helper function to get wholesaler data context
  async function getWholesalerContext(tenantId: string) {
    try {
      // Fetch wholesaler products
      const products = await db
        .select()
        .from(wholesalerProducts)
        .where(eq(wholesalerProducts.wholesalerTenantId, tenantId))
        .orderBy(desc(wholesalerProducts.createdAt))
        .limit(100);

      // Fetch recent orders
      const orders = await db
        .select()
        .from(wholesalerOrders)
        .where(eq(wholesalerOrders.wholesalerTenantId, tenantId))
        .orderBy(desc(wholesalerOrders.createdAt))
        .limit(50);

      // Fetch pending quote requests
      const pendingQuotes = await db
        .select()
        .from(quoteRequests)
        .where(and(
          eq(quoteRequests.wholesalerTenantId, tenantId),
          eq(quoteRequests.status, 'pending')
        ))
        .limit(20);

      return { products, orders, pendingQuotes };
    } catch (error) {
      console.error('[AI] Failed to fetch wholesaler context:', error);
      return { products: [], orders: [], pendingQuotes: [] };
    }
  }

  // AI Chat endpoint with database context
  app.post('/api/ai/chat', async (req, res) => {
    try {
      console.log('[AI] Chat request received');

      const { message, systemPrompt, context } = req.body;
      const session = (req as any).session;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      // Get tenant ID and user role from session
      const tenantId = session?.tenantId || context?.tenantId || 'default';
      const userRole = session?.userRole || context?.userRole || 'retailer';
      console.log('[AI] Fetching database context for tenant:', tenantId, 'role:', userRole);

      // Build enhanced system prompt based on user role
      let enhancedSystemPrompt = systemPrompt || "You are a helpful AI assistant for a pharmacy management system.";

      if (userRole === 'wholesaler') {
        // Fetch wholesaler-specific data
        const { products, orders, pendingQuotes } = await getWholesalerContext(tenantId);

        console.log('[AI] Wholesaler database context:', {
          productsCount: products.length,
          ordersCount: orders.length,
          pendingQuotesCount: pendingQuotes.length
        });

        enhancedSystemPrompt = `You are a helpful AI assistant for a pharmaceutical WHOLESALER business management system.

You help wholesalers with:
- Managing their product catalog and inventory
- Processing quote requests from retailers
- Managing B2B orders and deliveries
- Analyzing business performance and sales trends
- Inventory optimization and restocking suggestions`;

        if (products.length > 0 || orders.length > 0 || pendingQuotes.length > 0) {
          enhancedSystemPrompt += `\n\n**CURRENT WHOLESALER DATABASE DATA:**\n`;

          if (products.length > 0) {
            const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
            const lowStockItems = products.filter(p => (p.stockQuantity || 0) < 10);
            enhancedSystemPrompt += `\n**Product Catalog (${products.length} products, Total Stock: ${totalStock} units):**\n`;
            products.slice(0, 30).forEach(p => {
              enhancedSystemPrompt += `- ${p.name} | ${p.manufacturer || 'N/A'} | PTR: ₹${p.basePrice} | MRP: ₹${p.mrp || 'N/A'} | Stock: ${p.stockQuantity} | Min Order: ${p.minOrderQuantity}\n`;
            });
            if (products.length > 30) {
              enhancedSystemPrompt += `... and ${products.length - 30} more products\n`;
            }
            if (lowStockItems.length > 0) {
              enhancedSystemPrompt += `\n⚠️ LOW STOCK ALERT: ${lowStockItems.length} products have less than 10 units\n`;
            }
          }

          if (orders.length > 0) {
            const pendingOrders = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status));
            const deliveredOrders = orders.filter(o => o.status === 'delivered');
            const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
            enhancedSystemPrompt += `\n**Orders (${orders.length} total, ${pendingOrders.length} active, Revenue from delivered: ₹${totalRevenue.toLocaleString()}):**\n`;
            orders.slice(0, 20).forEach(o => {
              enhancedSystemPrompt += `- Order #${o.orderNumber} | Status: ${o.status} | Amount: ₹${o.totalAmount} | Date: ${new Date(o.createdAt).toLocaleDateString()}\n`;
            });
          }

          if (pendingQuotes.length > 0) {
            enhancedSystemPrompt += `\n**Pending Quote Requests (${pendingQuotes.length}):**\n`;
            enhancedSystemPrompt += `You have ${pendingQuotes.length} quote requests waiting for response.\n`;
          }

          enhancedSystemPrompt += `\n**IMPORTANT:** Use this actual wholesaler data to answer questions. Be specific about products, stock levels, orders, and business metrics.`;
        } else {
          enhancedSystemPrompt += `\n\n**NOTE:** No data found in the wholesaler database yet. Upload invoices or add products to enable data-driven insights.`;
        }
      } else {
        // Retailer mode - fetch retailer data
        const { storage } = await import('./storage');
        const [products, stock, sales] = await Promise.all([
          storage.getProducts(tenantId),
          storage.getStock(tenantId),
          storage.getSales(tenantId)
        ]);

        console.log('[AI] Retailer database context:', {
          productsCount: products.length,
          stockCount: stock.length,
          salesCount: sales.length
        });

        // Add database context if available
        if (products.length > 0 || stock.length > 0 || sales.length > 0) {
          enhancedSystemPrompt += `\n\n**CURRENT DATABASE DATA FOR TENANT ${tenantId}:**\n`;

          if (products.length > 0) {
            enhancedSystemPrompt += `\n**Products (${products.length} total):**\n`;
            products.slice(0, 50).forEach(p => {
              enhancedSystemPrompt += `- ${p.name} (ID: ${p.id}, Price: ₹${p.price}, Total Qty: ${p.totalQuantity}${p.batchNumber ? `, Batch: ${p.batchNumber}` : ''})\n`;
            });
            if (products.length > 50) {
              enhancedSystemPrompt += `... and ${products.length - 50} more products\n`;
            }
          }

          if (stock.length > 0) {
            enhancedSystemPrompt += `\n**Stock Items (${stock.length} total):**\n`;
            stock.slice(0, 50).forEach(s => {
              enhancedSystemPrompt += `- ${s.productName}, Batch: ${s.batchNumber}, Qty: ${s.quantity}${s.expiryDate ? `, Expiry: ${new Date(s.expiryDate).toLocaleDateString()}` : ''}\n`;
            });
            if (stock.length > 50) {
              enhancedSystemPrompt += `... and ${stock.length - 50} more stock items\n`;
            }
          }

          if (sales.length > 0) {
            const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
            enhancedSystemPrompt += `\n**Sales Summary (${sales.length} transactions, Total Revenue: ₹${totalRevenue.toFixed(2)}):**\n`;
            sales.slice(0, 20).forEach(s => {
              const saleDate = s.date ? new Date(s.date).toLocaleDateString() : 'Unknown date';
              enhancedSystemPrompt += `- ${saleDate}: ₹${s.total}\n`;
            });
            if (sales.length > 20) {
              enhancedSystemPrompt += `... and ${sales.length - 20} more sales\n`;
            }
          }

          enhancedSystemPrompt += `\n**IMPORTANT:** Use this actual data to answer the user's question. Be specific and reference the exact items, quantities, and values from the database.`;
        } else {
          enhancedSystemPrompt += `\n\n**NOTE:** No data found in the database yet. The user needs to upload invoices or add products manually to enable data-driven insights.`;
        }
      }
      
      // Using gpt-4o for better compatibility and vision support
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: enhancedSystemPrompt
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_completion_tokens: 800,
        temperature: 0.7
      });
      
      const response = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
      
      console.log('[AI] Response generated, length:', response.length);
      
      res.json({ response });
      
    } catch (error) {
      console.error('[AI] Chat error:', error);
      res.status(500).json({ 
        error: 'AI service temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // AI Document Analysis endpoint
  app.post('/api/ai/analyze-document', async (req, res) => {
    try {
      console.log('[AI] Document analysis request received');
      
      const { text, documentType } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Document text is required' });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }
      
      const systemPrompt = `You are an AI assistant specialized in analyzing ${documentType || 'pharmacy'} documents. 
      
Analyze the provided document text and extract key information in a structured format. For invoices, extract vendor, date, items, quantities, and totals. For prescriptions, extract patient info, medications, and dosage instructions. Provide insights and flag any potential issues.

Respond in JSON format with extracted data and analysis.`;
      
      // Using gpt-4o for better compatibility and vision support
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: `Please analyze this ${documentType || 'document'} text:\n\n${text}`
          }
        ],
        max_completion_tokens: 1000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      let analysis;
      try {
        analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
      } catch (parseError) {
        analysis = { 
          error: 'Failed to parse AI response',
          raw_response: completion.choices[0]?.message?.content 
        };
      }
      
      console.log('[AI] Document analysis completed');
      
      res.json({ analysis });
      
    } catch (error) {
      console.error('[AI] Document analysis error:', error);
      res.status(500).json({ 
        error: 'Document analysis service temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}