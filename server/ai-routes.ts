import { Express } from 'express';
import OpenAI from 'openai';
import aiRouter from './routes/ai';

export function registerAIRoutes(app: Express) {
  // Mount AI router at /api/ai
  app.use('/api/ai', aiRouter);
  
  // Initialize OpenAI client for direct routes
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

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
      
      // Get tenant ID from session
      const tenantId = session?.tenantId || context?.tenantId || 'default';
      console.log('[AI] Fetching database context for tenant:', tenantId);
      
      // Fetch database context for this tenant
      const { storage } = await import('./storage');
      const [products, stock, sales] = await Promise.all([
        storage.getProducts(tenantId),
        storage.getStock(tenantId),
        storage.getSales(tenantId)
      ]);
      
      console.log('[AI] Database context:', {
        productsCount: products.length,
        stockCount: stock.length,
        salesCount: sales.length
      });
      
      // Build enhanced system prompt with actual database data
      let enhancedSystemPrompt = systemPrompt || "You are a helpful AI assistant for a pharmacy management system.";
      
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