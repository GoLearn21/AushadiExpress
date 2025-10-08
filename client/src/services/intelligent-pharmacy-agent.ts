const log = {
  info: (message: string, meta?: any) => console.log('[INTELLIGENT-AGENT]', message, meta || ''),
  error: (message: string, error: Error) => console.error('[INTELLIGENT-AGENT]', message, error.message)
};

export interface PharmacyContext {
  tenantId?: string;
  role?: 'wholesaler' | 'retailer' | 'distributor';
  currentScreen?: string;
  hasImage?: boolean;
  sessionId?: string;
  recentActions?: string[];
}

export class IntelligentPharmacyAgent {
  
  async processQuery(query: string, context: PharmacyContext = {}): Promise<string> {
    try {
      const sessionId = context.sessionId || 'default';
      
      log.info('Processing pharmacy query with intelligent Gemini agent', { 
        query: query.substring(0, 100), 
        hasImage: context.hasImage,
        currentScreen: context.currentScreen,
        sessionId
      });

      // Use the new Gemini-powered intelligent agent
      return await this.callIntelligentAgent(query, context);
      
    } catch (error) {
      log.error('Pharmacy query processing failed', error as Error);
      console.log('[INTELLIGENT-PHARMACY-AGENT] Error occurred:', error);
      
      // Fallback to basic response
      return this.getFallbackResponse(query, context);
    }
  }
  
  private async callIntelligentAgent(query: string, context: PharmacyContext): Promise<string> {
    try {
      // Get tenant ID from context (passed from authenticated session)
      const tenantId = context.tenantId || 'default';
      const role = this.detectUserRole(context) || 'retailer';
      
      // Build a comprehensive system prompt with database context
      const systemPrompt = this.buildSystemPrompt(query, role, tenantId, context);
      
      console.log('[INTELLIGENT-PHARMACY-AGENT] Calling AI with context:', {
        tenantId,
        role,
        currentScreen: context.currentScreen,
        hasImage: context.hasImage
      });
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: query,
          systemPrompt,
          context: {
            tenantId,
            role,
            currentScreen: context.currentScreen || 'AI Assistant'
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('[INTELLIGENT-PHARMACY-AGENT] Received response:', result.response?.substring(0, 200));
      
      return result.response || this.getFallbackResponse(query, context);
      
    } catch (error: any) {
      console.error('[INTELLIGENT-PHARMACY-AGENT] API call failed:', error.message);
      throw error;
    }
  }
  
  private buildSystemPrompt(query: string, role: string, tenantId: string, context: PharmacyContext): string {
    const queryLower = query.toLowerCase();
    
    // Base pharmacy assistant prompt
    let systemPrompt = `You are an intelligent AI assistant for AushadiExpress, a pharmacy Point of Sale and management system.

**Your Role:** Help ${role}s manage their pharmacy business with intelligent insights and accurate information.

**Core Capabilities:**
- Medicine information and drug interactions
- Inventory management and stock analysis
- Sales analytics and business intelligence
- Regulatory compliance (Schedule H/H1/X drugs, GST)
- Invoice and prescription analysis
- Business insights and recommendations

**Guidelines:**
- Be professional, accurate, and helpful
- Provide specific, actionable advice
- Use Indian pharmaceutical terminology
- Reference GST regulations when relevant
- Keep responses concise but comprehensive

**Current Context:**
- User Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
- Tenant ID: ${tenantId}
- Screen: ${context.currentScreen || 'AI Assistant'}
`;

    // Add query-specific context
    if (queryLower.includes('stock') || queryLower.includes('inventory')) {
      systemPrompt += `\n**Focus:** The user is asking about inventory/stock. Provide insights on stock levels, reorder points, expiry management, and inventory optimization.`;
    } else if (queryLower.includes('sales') || queryLower.includes('revenue')) {
      systemPrompt += `\n**Focus:** The user is asking about sales. Provide insights on sales trends, revenue analysis, top-selling products, and business growth.`;
    } else if (queryLower.includes('gst') || queryLower.includes('tax') || queryLower.includes('compliance')) {
      systemPrompt += `\n**Focus:** The user is asking about GST/tax compliance. Explain GST slabs for pharmaceuticals, compliance requirements, and filing procedures.`;
    } else if (queryLower.includes('medicine') || queryLower.includes('drug')) {
      systemPrompt += `\n**Focus:** The user is asking about medicines. Provide information about drug interactions, classifications, storage, and prescription requirements.`;
    }
    
    systemPrompt += `\n\n**Note:** If asked about specific data (products, sales, stock levels), explain that the system can track this data once invoices are uploaded or products are added manually.`;
    
    return systemPrompt;
  }
  
  private detectUserRole(context: PharmacyContext): 'customer' | 'retailer' {
    // Simple role detection based on context
    // In a real app, this would be stored in user profile
    if (context.currentScreen?.includes('customer') || context.currentScreen?.includes('search')) {
      return 'customer';
    }
    return 'retailer'; // Default
  }
  
  private getFallbackResponse(query: string, context: PharmacyContext): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('medicine') || queryLower.includes('drug') || queryLower.includes('item') ||
        queryLower.includes('what') || queryLower.includes('show') || queryLower.includes('list')) {
      return `💊 **Intelligent Medicine Analysis**

I can analyze your medicine inventory, track pricing trends, and provide regulatory insights, but I need access to your data first.

📄 **To unlock intelligent insights:**
• Upload invoices for automatic medicine detection
• Add products manually with detailed information  
• Use barcode scanning for quick entry

🎯 Once you have data, I can provide:
• Smart inventory recommendations
• Expiry date monitoring
• Regulatory compliance alerts
• Business intelligence insights

🔍 Use the Quick actions below to get started!`;
    }
    
    if (queryLower.includes('stock') || queryLower.includes('inventory')) {
      return `📦 **Intelligent Inventory Management**

I use advanced AI to analyze your inventory patterns, predict demand, and optimize stock levels.

🚀 **Smart Features Available:**
• Real-time stock level monitoring
• Demand forecasting and trend analysis
• Automatic reorder point calculations
• Expiry date tracking and alerts

📊 **Get Started:**
• Upload invoices to track goods-in
• Record sales for demand analysis
• Add product details for better insights

🔍 Use the Quick actions below!`;
    }
    
    if (queryLower.includes('gstn') || queryLower.includes('gst') || queryLower.includes('tax')) {
      return `🏢 **Smart GST & Compliance Analysis**

I can extract and analyze GST information from your documents automatically using advanced OCR and AI.

⚡ **Intelligent Features:**
• Automatic GSTN extraction from invoices
• GST slab validation and compliance checking
• Multi-state GST analysis for wholesalers
• Regulatory compliance monitoring

📄 **Upload documents to enable:**
• Invoice processing and GSTN extraction
• Tax compliance verification
• Business relationship mapping

🔍 Use the Quick actions below to upload documents!`;
    }
    
    if (queryLower.includes('compliance') || queryLower.includes('regulation') || queryLower.includes('schedule')) {
      return `⚖️ **Regulatory Compliance Intelligence**

I monitor Indian pharmaceutical regulations and WHO guidelines to keep your operations compliant.

🛡️ **Compliance Features:**
• Schedule-H/H1/X drug classification
• Prescription requirement validation
• Batch expiry monitoring (90-day alerts)
• Indian pharmacy law adherence

📋 **What I Check:**
• Drug scheduling and prescription requirements
• GST slab compliance for pharmaceuticals
• Expiry date management
• Documentation and audit trails

🔍 Upload your documents to enable compliance monitoring!`;
    }
    
    return `🤖 **AushadiExpress Intelligent Assistant**

I am powered by advanced AI to provide intelligent pharmacy management insights!

🧠 **AI-Powered Capabilities:**
• **Smart Document Processing** - Auto-extract data from any invoice format
• **Intelligent Business Analytics** - Demand forecasting and trend analysis  
• **Regulatory Compliance** - Real-time monitoring per Indian pharmacy law
• **Adaptive Learning** - I improve with every document you upload

🎯 **Role-Specific Intelligence:**
• Wholesaler: Bulk pricing, territory analysis, credit management
• Retailer: Customer patterns, near-expiry alerts, cross-selling
• Distributor: Route optimization, fill-rate management

🚀 **Get Started:**
Upload invoices, prescriptions, or bills to unlock intelligent insights!

🔍 Use the Quick actions below for common tasks.`;
  }
}