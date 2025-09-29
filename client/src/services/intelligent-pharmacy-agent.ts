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
      // Get tenant ID from context, localStorage, or default
      const tenantId = context.tenantId || 
                      localStorage.getItem('currentTenantId') || 
                      'pharm_007';
      
      const requestBody = {
        query,
        tenantId,
        role: this.detectUserRole(context) || 'retailer',
        currentScreen: context.currentScreen || 'AI Assistant',
        hasImage: context.hasImage || false,
        sessionId: context.sessionId || 'default'
      };
      
      console.log('[INTELLIGENT-PHARMACY-AGENT] Calling Gemini agent with:', requestBody);
      
      const response = await fetch('/api/agent/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent API returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('[INTELLIGENT-PHARMACY-AGENT] Received response:', result.response?.substring(0, 200));
      
      return result.response || this.getFallbackResponse(query, context);
      
    } catch (error: any) {
      console.error('[INTELLIGENT-PHARMACY-AGENT] API call failed:', error.message);
      throw error;
    }
  }
  
  private detectUserRole(context: PharmacyContext): 'wholesaler' | 'retailer' | 'distributor' {
    // Simple role detection based on context
    // In a real app, this would be stored in user profile
    if (context.currentScreen?.includes('wholesale')) return 'wholesaler';
    if (context.currentScreen?.includes('distribution')) return 'distributor';
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