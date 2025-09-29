import { createModuleLogger } from '@/utils/app-logger';
import { remoteAI } from '@/lib/ai-assistant';
import { enhancedCapture } from '@/services/enhanced-capture';
import { documentStorage } from '@/services/document-storage';
import { type DocumentAnalysis } from '@/services/ai-vision';

const log = createModuleLogger('PharmacyAgent');

export interface PharmacyContext {
  hasImage?: boolean;
  documentAnalysis?: DocumentAnalysis;
  currentScreen?: string;
  userIntent?: 'document_analysis' | 'medicine_info' | 'inventory' | 'sales' | 'general';
  sessionId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
}

// Three-tier memory system for agentic AI learning
interface ShortTermMemory {
  sessionId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  currentIntents: string[];
  documentContext: Array<{ type: string; confidence: number; timestamp: Date }>;
}

interface MediumTermMemory {
  userId: string;
  userPatterns: {
    preferredDocumentTypes: Record<string, number>;
    commonQueries: string[];
    workflowPreferences: Record<string, any>;
    correctionHistory: Array<{ aiClassification: string; userCorrection: string; timestamp: Date }>;
  };
  lastUpdated: Date;
}

interface LongTermMemory {
  knowledgeBase: {
    medicineDatabase: Record<string, any>;
    businessRules: Array<{ rule: string; examples: string[]; confidence: number }>;
    documentPatterns: Record<string, Array<{ pattern: string; confidence: number }>>;
  };
  lastSync: Date;
}

interface BusinessRule {
  id: string;
  condition: (query: string, context: PharmacyContext) => boolean;
  handler: (query: string, context: PharmacyContext) => Promise<string>;
  priority: number;
}

class PharmacyAgentService {
  private businessRules: BusinessRule[] = [];
  private shortTermMemory: Map<string, ShortTermMemory> = new Map();
  private mediumTermMemory: Map<string, MediumTermMemory> = new Map();
  private longTermMemory!: LongTermMemory;

  constructor() {
    this.initializeBusinessRules();
    this.initializeMemoryTiers();
    log.info('Pharmacy Agent initialized with business rules and memory tiers');
  }

  private initializeMemoryTiers() {
    // Initialize long-term memory (persistent knowledge base)
    this.longTermMemory = {
      knowledgeBase: {
        medicineDatabase: this.loadMedicineDatabase(),
        businessRules: this.loadBusinessRulePatterns(),
        documentPatterns: this.loadDocumentPatterns()
      },
      lastSync: new Date()
    };

    // Load medium-term memory from localStorage
    this.loadMediumTermMemory();
    
    log.info('Memory tiers initialized', {
      shortTermSessions: this.shortTermMemory.size,
      mediumTermUsers: this.mediumTermMemory.size,
      longTermKnowledge: Object.keys(this.longTermMemory.knowledgeBase).length
    });
  }

  private loadMedicineDatabase(): Record<string, any> {
    // Basic medicine database - in production this would come from API
    return {
      'paracetamol': { category: 'analgesic', interactions: ['warfarin'], dosage: '500mg-1g' },
      'aspirin': { category: 'nsaid', interactions: ['warfarin', 'ibuprofen'], dosage: '325mg-650mg' },
      'ibuprofen': { category: 'nsaid', interactions: ['aspirin', 'ace_inhibitors'], dosage: '400mg-600mg' }
    };
  }

  private loadBusinessRulePatterns(): Array<{ rule: string; examples: string[]; confidence: number }> {
    return [
      {
        rule: 'prescription_validation',
        examples: ['Check doctor signature', 'Verify patient details', 'Confirm medicine availability'],
        confidence: 0.95
      },
      {
        rule: 'inventory_reorder',
        examples: ['Stock below minimum', 'Expiry within 90 days', 'High demand medicine'],
        confidence: 0.90
      }
    ];
  }

  private loadDocumentPatterns(): Record<string, Array<{ pattern: string; confidence: number }>> {
    return {
      'bill': [
        { pattern: 'Contains customer name and total amount', confidence: 0.95 },
        { pattern: 'Has itemized medicine list with quantities', confidence: 0.90 }
      ],
      'prescription': [
        { pattern: 'Doctor signature and registration number', confidence: 0.95 },
        { pattern: 'Patient name and medicine with dosage', confidence: 0.90 }
      ],
      'invoice': [
        { pattern: 'Supplier information and GST details', confidence: 0.95 },
        { pattern: 'Batch numbers and expiry dates', confidence: 0.90 }
      ]
    };
  }

  private loadMediumTermMemory() {
    try {
      const storedMemory = localStorage.getItem('pharmacy_agent_memory');
      if (storedMemory) {
        const parsedMemory = JSON.parse(storedMemory);
        Object.entries(parsedMemory).forEach(([userId, memory]) => {
          this.mediumTermMemory.set(userId, memory as MediumTermMemory);
        });
      }
    } catch (error) {
      log.error('Failed to load medium-term memory', error as Error);
    }
  }

  private saveMediumTermMemory() {
    try {
      const memoryObj = Object.fromEntries(this.mediumTermMemory);
      localStorage.setItem('pharmacy_agent_memory', JSON.stringify(memoryObj));
    } catch (error) {
      log.error('Failed to save medium-term memory', error as Error);
    }
  }

  private getOrCreateShortTermMemory(sessionId: string): ShortTermMemory {
    if (!this.shortTermMemory.has(sessionId)) {
      this.shortTermMemory.set(sessionId, {
        sessionId,
        conversationHistory: [],
        currentIntents: [],
        documentContext: []
      });
    }
    return this.shortTermMemory.get(sessionId)!;
  }

  private getOrCreateMediumTermMemory(userId: string): MediumTermMemory {
    if (!this.mediumTermMemory.has(userId)) {
      this.mediumTermMemory.set(userId, {
        userId,
        userPatterns: {
          preferredDocumentTypes: {},
          commonQueries: [],
          workflowPreferences: {},
          correctionHistory: []
        },
        lastUpdated: new Date()
      });
    }
    return this.mediumTermMemory.get(userId)!;
  }

  private updateMemoryFromInteraction(sessionId: string, userId: string, query: string, response: string, documentType?: string, userCorrection?: string) {
    // Update short-term memory
    const shortTerm = this.getOrCreateShortTermMemory(sessionId);
    shortTerm.conversationHistory.push(
      { role: 'user', content: query, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date() }
    );

    if (documentType) {
      shortTerm.documentContext.push({
        type: documentType,
        confidence: 0.85,
        timestamp: new Date()
      });
    }

    // Update medium-term memory
    const mediumTerm = this.getOrCreateMediumTermMemory(userId);
    
    // Track document type preferences
    if (documentType) {
      mediumTerm.userPatterns.preferredDocumentTypes[documentType] = 
        (mediumTerm.userPatterns.preferredDocumentTypes[documentType] || 0) + 1;
    }

    // Track user corrections for learning
    if (userCorrection && documentType) {
      mediumTerm.userPatterns.correctionHistory.push({
        aiClassification: documentType,
        userCorrection: userCorrection,
        timestamp: new Date()
      });
    }

    // Track common queries
    const queryKeywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    const uniqueKeywords = Array.from(new Set([...mediumTerm.userPatterns.commonQueries, ...queryKeywords]));
    mediumTerm.userPatterns.commonQueries = uniqueKeywords.slice(0, 50); // Keep top 50 keywords

    mediumTerm.lastUpdated = new Date();
    this.saveMediumTermMemory();
  }

  private initializeBusinessRules() {
    this.businessRules = [
      // Document Analysis Rules
      {
        id: 'document_upload_analysis',
        priority: 10,
        condition: (query, context) => context.hasImage || query.toLowerCase().includes('document') || query.toLowerCase().includes('upload'),
        handler: this.handleDocumentAnalysis.bind(this)
      },
      
      // Medicine Information Rules - EXPANDED to catch MRP, pricing, medicine name queries
      {
        id: 'medicine_interactions',
        priority: 9,
        condition: (query) => {
          const q = query.toLowerCase();
          return q.includes('interaction') || q.includes('drug') || q.includes('medicine') ||
                 q.includes('mrp') || q.includes('price') || q.includes('cost') || q.includes('rate') ||
                 q.includes('qty') || q.includes('quantity') || q.includes('batch') || q.includes('expiry') ||
                 // Specific medicine names from stored data
                 q.includes('moxel') || q.includes('xceft') || q.includes('epidosin') || q.includes('tm/af') ||
                 q.includes('nurocare') || q.includes('ascal') || q.includes('tab') || q.includes('gel') ||
                 // Generic medicine inquiry patterns
                 q.includes('what is') || q.includes('tell me') || q.includes('show me') ||
                 q.includes('find') || q.includes('search');
        },
        handler: this.handleMedicineInquiry.bind(this)
      },
      
      // Inventory Management Rules - ENHANCED for "what items" queries
      {
        id: 'inventory_status',
        priority: 8,
        condition: (query) => {
          const q = query.toLowerCase();
          return q.includes('inventory') || q.includes('stock') || q.includes('low stock') ||
                 q.includes('what items') || q.includes('items do we have') || q.includes('products do we have') ||
                 q.includes('medicines do we have') || q.includes('what do we have in stock');
        },
        handler: this.handleInventoryInquiry.bind(this)
      },
      
      // Sales Analytics Rules
      {
        id: 'sales_analytics',
        priority: 7,
        condition: (query) => query.toLowerCase().includes('sales') || query.toLowerCase().includes('revenue') || query.toLowerCase().includes('analytics'),
        handler: this.handleSalesInquiry.bind(this)
      },
      
      // Document Search Rules - EXPANDED for invoice/supplier queries  
      {
        id: 'document_search',
        priority: 6,
        condition: (query) => {
          const q = query.toLowerCase();
          return q.includes('recent') || q.includes('uploaded') || q.includes('processed') ||
                 q.includes('invoice') || q.includes('bill') || q.includes('document') ||
                 q.includes('gstn') || q.includes('gst') || q.includes('supplier') || q.includes('buyer') ||
                 q.includes('pull') || q.includes('show') || q.includes('details') || q.includes('summary') ||
                 // Specific supplier/GSTN patterns
                 q.includes('sri madhu') || q.includes('sai baba') || q.includes('37benpm') || q.includes('37baspn') ||
                 q.includes('stored') || q.includes('my data') || q.includes('customer insight') ||
                 q.includes('above') || q.includes('these');
        },
        handler: this.handleDocumentSearch.bind(this)
      },
      
      // Compliance and Regulatory Rules
      {
        id: 'compliance_check',
        priority: 5,
        condition: (query) => query.toLowerCase().includes('compliance') || query.toLowerCase().includes('regulation') || query.toLowerCase().includes('prescription'),
        handler: this.handleComplianceInquiry.bind(this)
      },
      
      // General Pharmacy Business Rules
      {
        id: 'general_pharmacy',
        priority: 1,
        condition: () => true, // Catch-all
        handler: this.handleGeneralInquiry.bind(this)
      }
    ];
    
    // Sort by priority (higher priority first)
    this.businessRules.sort((a, b) => b.priority - a.priority);
  }

  async processQuery(query: string, context: PharmacyContext = {}): Promise<string> {
    try {
      const sessionId = context.sessionId || 'default';
      const userId = 'user-1'; // TODO: Get from session
      
      log.info('Processing pharmacy query with memory tiers', { 
        query: query.substring(0, 100), 
        hasImage: context.hasImage,
        currentScreen: context.currentScreen,
        sessionId
      });

      console.log('[PHARMACY-AGENT] Query analysis:', {
        originalQuery: query,
        queryLower: query.toLowerCase(),
        availableRules: this.businessRules.map(r => ({ id: r.id, priority: r.priority }))
      });

      // Enhance context with memory insights
      const enrichedContext = await this.enrichContextWithMemory(query, context, sessionId, userId);

      // Find the first matching business rule
      const matchingRule = this.businessRules.find(rule => rule.condition(query, enrichedContext));
      
      console.log('[PHARMACY-AGENT] Rule matching result:', {
        matchedRule: matchingRule?.id || 'none',
        allRuleResults: this.businessRules.map(rule => ({
          id: rule.id,
          matches: rule.condition(query, enrichedContext)
        }))
      });
      
      let response: string;
      if (matchingRule) {
        log.debug('Applying business rule with memory context', { ruleId: matchingRule.id });
        response = await matchingRule.handler(query, enrichedContext);
      } else {
        response = await this.handleGeneralInquiry(query, enrichedContext);
      }

      // Update memory with interaction
      this.updateMemoryFromInteraction(sessionId, userId, query, response);

      return response;

    } catch (error) {
      log.error('Pharmacy agent processing failed', error as Error);
      return 'I encountered an error processing your request. Please try again or contact support if the issue persists.';
    }
  }

  private async enrichContextWithMemory(query: string, context: PharmacyContext, sessionId: string, userId: string): Promise<PharmacyContext> {
    const shortTerm = this.getOrCreateShortTermMemory(sessionId);
    const mediumTerm = this.getOrCreateMediumTermMemory(userId);
    
    // Add conversation history to context
    const enrichedContext = {
      ...context,
      conversationHistory: shortTerm.conversationHistory.slice(-10), // Last 10 exchanges
      sessionId
    };

    // Apply learning from user corrections
    if (context.hasImage && mediumTerm.userPatterns.correctionHistory.length > 0) {
      const recentCorrections = mediumTerm.userPatterns.correctionHistory.slice(-5);
      log.debug('Applying learned corrections', { corrections: recentCorrections.length });
    }

    // Enhance intent detection based on user patterns
    const queryWords = query.toLowerCase().split(' ');
    const patternMatches = queryWords.filter(word => 
      mediumTerm.userPatterns.commonQueries.includes(word)
    );

    if (patternMatches.length > 0) {
      log.debug('Detected user pattern match', { matches: patternMatches });
    }

    return enrichedContext;
  }

  // New method to record user confirmations for learning
  async recordUserConfirmation(aiClassification: string, userConfirmation: string, documentData: any): Promise<void> {
    const userId = 'user-1'; // TODO: Get from session
    const mediumTerm = this.getOrCreateMediumTermMemory(userId);
    
    // Record the correction for learning
    mediumTerm.userPatterns.correctionHistory.push({
      aiClassification,
      userCorrection: userConfirmation,
      timestamp: new Date()
    });

    // Update document type preferences
    mediumTerm.userPatterns.preferredDocumentTypes[userConfirmation] = 
      (mediumTerm.userPatterns.preferredDocumentTypes[userConfirmation] || 0) + 1;

    this.saveMediumTermMemory();
    
    log.info('User confirmation recorded for learning', {
      aiClassification,
      userConfirmation,
      totalCorrections: mediumTerm.userPatterns.correctionHistory.length
    });
  }

  // New method to get learning insights
  getAgentLearningInsights(): { 
    totalSessions: number; 
    totalUsers: number; 
    knowledgeBase: number; 
    userCorrections: number;
    topDocumentTypes: Array<{ type: string; count: number }>;
  } {
    const allCorrections = Array.from(this.mediumTermMemory.values())
      .flatMap(memory => memory.userPatterns.correctionHistory);
      
    const allDocumentTypes = Array.from(this.mediumTermMemory.values())
      .flatMap(memory => Object.entries(memory.userPatterns.preferredDocumentTypes))
      .reduce((acc, [type, count]) => {
        acc[type] = (acc[type] || 0) + count;
        return acc;
      }, {} as Record<string, number>);

    const topDocumentTypes = Object.entries(allDocumentTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSessions: this.shortTermMemory.size,
      totalUsers: this.mediumTermMemory.size,
      knowledgeBase: Object.keys(this.longTermMemory.knowledgeBase.medicineDatabase).length,
      userCorrections: allCorrections.length,
      topDocumentTypes
    };
  }

  private async handleDocumentAnalysis(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling document analysis request');

      let analysisData = '';
      
      if (context.documentAnalysis) {
        const analysis = context.documentAnalysis;
        
        analysisData = `
Document Analysis Results:
- Type: ${analysis.documentType.toUpperCase()}
- Confidence: ${(analysis.confidence * 100).toFixed(1)}%
- Processing Time: ${analysis.metadata.processingTime}ms

Extracted Information:
`;
        
        if (analysis.extractedData.medicines && analysis.extractedData.medicines.length > 0) {
          analysisData += `\nMedicines Found (${analysis.extractedData.medicines.length}):\n`;
          analysis.extractedData.medicines.forEach((med, index) => {
            analysisData += `${index + 1}. ${med.name}`;
            if (med.quantity) analysisData += ` - Qty: ${med.quantity}`;
            if (med.price) analysisData += ` - Price: ₹${med.price}`;
            if (med.batch) analysisData += ` - Batch: ${med.batch}`;
            analysisData += '\n';
          });
        }
        
        if (analysis.extractedData.total) {
          analysisData += `\nTotal Amount: ₹${analysis.extractedData.total}`;
        }
        
        if (analysis.extractedData.customerInfo?.name) {
          analysisData += `\nCustomer: ${analysis.extractedData.customerInfo.name}`;
        }
        
        if (analysis.extractedData.doctorInfo?.name) {
          analysisData += `\nDoctor: ${analysis.extractedData.doctorInfo.name}`;
        }
      }

      // Get recent documents for context from API
      let documentContext = '';
      try {
        const response = await fetch('/api/documents');
        const recentDocs = await response.json();
        documentContext = recentDocs.length > 0 ? 
          `\n\nRecent Documents Context:\n${recentDocs.slice(0, 5).map((doc: any) => 
            `- ${doc.confirmedType || doc.docType}: ${doc.lineItems?.length || 0} medicines, ${doc.fileName}`
          ).join('\n')}` : '';
      } catch (error) {
        log.error('Failed to fetch recent documents', error as Error);
      }

      const enhancedQuery = `
${query}

${analysisData}${documentContext}

As a pharmacy AI assistant, provide intelligent insights about this document analysis. Focus on:
1. Document accuracy and completeness
2. Medicine identification and potential issues
3. Inventory implications
4. Compliance considerations
5. Actionable recommendations

Be specific, professional, and helpful for pharmacy operations.
`;

      return await remoteAI.ask(enhancedQuery, {
        currentScreen: context.currentScreen || 'Document Analysis',
        recentActions: ['Document Analysis']
      });

    } catch (error) {
      log.error('Document analysis handling failed', error as Error);
      return 'I analyzed the document but encountered an issue providing detailed insights. The document has been stored and can be found in your reports section.';
    }
  }

  private async handleMedicineInquiry(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling medicine inquiry');

      // Get documents to find medicine information from stored JSON data
      const apiResponse = await fetch('/api/documents');
      const documents = await apiResponse.json();
      
      console.log('[PHARMACY-AGENT] Search query:', query.toLowerCase());
      console.log('[PHARMACY-AGENT] Available medicines:', []);
      
      if (documents.length === 0) {
        return 'No medicine data available. Please upload some invoices, bills, or prescriptions first.';
      }

      const queryLower = query.toLowerCase();
      
      // Extract all unique medicine names from documents
      const allMedicines = new Set<string>();
      documents.forEach((doc: any) => {
        doc.lineItems?.forEach((item: any) => {
          if (item.name) {
            allMedicines.add(item.name.trim());
          }
        });
      });
      
      console.log('[PHARMACY-AGENT] Available medicines:', Array.from(allMedicines));
      
      // Handle MRP/price queries - extract specific pricing information
      if (queryLower.includes('mrp') || queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('rate')) {
        // Find the specific medicine mentioned in the query
        let targetMedicine = null;
        for (const medicine of Array.from(allMedicines)) {
          if (queryLower.includes(medicine.toLowerCase()) || medicine.toLowerCase().includes(queryLower.replace(/\b(mrp|price|cost|rate|what|is|the|of)\b/g, '').trim())) {
            targetMedicine = medicine;
            break;
          }
        }
        
        console.log('[PHARMACY-AGENT] Found medicines:', targetMedicine ? [targetMedicine] : []);
        
        if (!targetMedicine) {
          return `💊 **No specific medicine found** in your query.\n\n**Available medicines:**\n${Array.from(allMedicines).map(m => `• ${m}`).join('\n')}\n\nTry asking: "What is the MRP of [medicine name]?"`;
        }
        
        // Extract all pricing information for this medicine
        const priceData: Array<{price: number, type: string, supplier: string, docId: string, qty: number}> = [];
        
        documents.forEach((doc: any) => {
          doc.lineItems?.forEach((item: any) => {
            if (item.name && item.name.toLowerCase().includes(targetMedicine.toLowerCase())) {
              const mrp = parseFloat(item.mrp) || 0;
              const rate = parseFloat(item.rate) || 0;
              const qty = parseFloat(item.qty) || 0;
              
              if (mrp > 0) {
                priceData.push({
                  price: mrp,
                  type: 'MRP',
                  supplier: doc.header?.supplier || 'Unknown',
                  docId: doc.id.substring(0, 8),
                  qty
                });
              }
              if (rate > 0 && rate !== mrp) {
                priceData.push({
                  price: rate,
                  type: 'Rate',
                  supplier: doc.header?.supplier || 'Unknown',
                  docId: doc.id.substring(0, 8),
                  qty
                });
              }
            }
          });
        });
        
        if (priceData.length === 0) {
          return `💊 **${targetMedicine}** found in documents but **no pricing information** available.`;
        }
        
        let response = `💰 **Pricing Information for ${targetMedicine}:**\n\n`;
        
        // Group by price type
        const mrpPrices = priceData.filter(p => p.type === 'MRP');
        const ratePrices = priceData.filter(p => p.type === 'Rate');
        
        if (mrpPrices.length > 0) {
          const uniqueMrps = Array.from(new Set(mrpPrices.map(p => p.price)));
          response += `📋 **MRP Prices Found:**\n`;
          uniqueMrps.forEach(price => {
            const instances = mrpPrices.filter(p => p.price === price);
            response += `   • ₹${price} (${instances.length} instance${instances.length > 1 ? 's' : ''})\n`;
          });
          response += `\n`;
        }
        
        if (ratePrices.length > 0) {
          const uniqueRates = Array.from(new Set(ratePrices.map(p => p.price)));
          response += `💵 **Purchase Rates Found:**\n`;
          uniqueRates.forEach(price => {
            const instances = ratePrices.filter(p => p.price === price);
            response += `   • ₹${price} (${instances.length} instance${instances.length > 1 ? 's' : ''})\n`;
          });
        }
        
        return response;
      }
      
      // Handle general medicine search
      if (queryLower.includes('show') || queryLower.includes('list') || queryLower.includes('all medicines')) {
        return `💊 **All Medicines in Your Data (${allMedicines.size}):**\n\n${Array.from(allMedicines).map(m => `• ${m}`).join('\n')}`;
      }
      
      // Search for specific medicine in query
      const medicineDetails: Record<string, {
        name: string;
        totalQuantity: number;
        totalPurchased: number;
        totalSold: number;
        avgPrice: number;
        suppliers: Set<string>;
        batches: Set<string>;
        lastSeen: string;
      }> = {};

      // Process all documents to find medicine details
      documents.forEach((doc: any) => {
        doc.lineItems?.forEach((item: any) => {
          if (item.name) {
            const medicineName = item.name.trim();
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.rate) || parseFloat(item.mrp) || 0;
            
            if (!medicineDetails[medicineName]) {
              medicineDetails[medicineName] = {
                name: medicineName,
                totalQuantity: 0,
                totalPurchased: 0,
                totalSold: 0,
                avgPrice: 0,
                suppliers: new Set(),
                batches: new Set(),
                lastSeen: doc.createdAt
              };
            }

            const medicine = medicineDetails[medicineName];
            
            if (doc.confirmedType === 'invoice') {
              medicine.totalPurchased += qty;
              medicine.totalQuantity += qty;
              if (doc.header?.supplier) medicine.suppliers.add(doc.header.supplier);
            } else if (doc.confirmedType === 'bill') {
              medicine.totalSold += qty;
              medicine.totalQuantity -= qty;
            }

            if (price > 0) {
              medicine.avgPrice = (medicine.avgPrice + price) / 2;
            }
            
            if (item.batch) medicine.batches.add(item.batch);
            
            if (new Date(doc.createdAt) > new Date(medicine.lastSeen)) {
              medicine.lastSeen = doc.createdAt;
            }
          }
        });
      });

      // Find medicines matching the query
      const matchingMedicines = Object.values(medicineDetails).filter(med => 
        med.name.toLowerCase().includes(queryLower) ||
        queryLower.includes(med.name.toLowerCase()) ||
        // Handle partial matches and variations
        queryLower.replace(/\s+/g, '').includes(med.name.toLowerCase().replace(/\s+/g, '')) ||
        med.name.toLowerCase().replace(/\s+/g, '').includes(queryLower.replace(/\s+/g, ''))
      );

      console.log('[PHARMACY-AGENT] Search query:', queryLower);
      console.log('[PHARMACY-AGENT] Available medicines:', Object.keys(medicineDetails));
      console.log('[PHARMACY-AGENT] Found medicines:', matchingMedicines.map(m => m.name));

      let response = '';
      
      if (matchingMedicines.length > 0) {
        response = '📊 **Medicine Information from Stored Documents:**\n\n';
        
        matchingMedicines.forEach(medicine => {
          response += `**${medicine.name}**\n`;
          response += `• **MRP:** ₹${medicine.avgPrice.toFixed(2)}\n`;
          response += `• **Total Quantity:** ${medicine.totalQuantity} units\n`;
          if (medicine.totalPurchased > 0) response += `• **Purchased:** ${medicine.totalPurchased} units\n`;
          if (medicine.totalSold > 0) response += `• **Sold:** ${medicine.totalSold} units\n`;
          if (medicine.suppliers.size > 0) response += `• **Suppliers:** ${Array.from(medicine.suppliers).join(', ')}\n`;
          if (medicine.batches.size > 0) response += `• **Batches:** ${Array.from(medicine.batches).join(', ')}\n`;
          response += `• **Last Seen:** ${new Date(medicine.lastSeen).toLocaleDateString()}\n\n`;
        });
        
        // Add contextual suggestions based on found medicines
        response += '\n🔍 Use the Quick actions below to explore more medicine insights.';
        
        return response;
      }

      // If no specific medicine found, suggest available medicines with contextual prompts
      const allMedicineNames = Object.keys(medicineDetails).slice(0, 10);
      response = `❌ Medicine "${queryLower}" not found in current inventory.\n\n`;
      response += `📦 **Available medicines from your stored invoices:**\n${allMedicineNames.map(name => `• ${name}`).join('\n')}`;
      
      if (Object.keys(medicineDetails).length > 10) {
        response += `\n...and ${Object.keys(medicineDetails).length - 10} more medicines.`;
      }
      
      response += '\n\n🔍 Use the Quick actions below to explore your medicine data.';

      return response;

    } catch (error) {
      log.error('Medicine inquiry handling failed', error as Error);
      return 'Failed to fetch medicine data. Please try again.';
    }
  }

  private async handleInventoryInquiry(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling inventory inquiry');
      console.log('[PHARMACY-AGENT] Inventory query received:', query);

      // Get both products/stock data AND documents in parallel
      const [productsResponse, stockResponse, documentsResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stock'), 
        fetch('/api/documents')
      ]);
      
      const products = await productsResponse.json();
      const stock = await stockResponse.json();
      const documents = await documentsResponse.json();
      
      console.log('[PHARMACY-AGENT] Data summary:', {
        products: products.length,
        stockRecords: stock.length,
        documents: documents.length
      });
      
      // Handle "what items do we have" type queries with actual product data
      const queryLower = query.toLowerCase();
      if (queryLower.includes('what items') || queryLower.includes('items do we have') || 
          queryLower.includes('products do we have') || queryLower.includes('what do we have')) {
        
        if (products.length === 0 && documents.length === 0) {
          return '💊 **No items found in your system yet.**\n\n' +
                 '📄 To get started, you can:\n' +
                 '• Upload invoices to automatically add medicines\n' +
                 '• Add products manually in the inventory section\n' +
                 '• Use the barcode scanner to add items quickly\n\n' +
                 '🎯 Once you have items, I can help you track stock levels, check prices, and analyze your inventory!';
        }
        
        let response = '💊 **Your Current Inventory:**\n\n';
        
        if (products.length > 0) {
          response += `📎 **Products in System (${products.length}):**\n`;
          products.slice(0, 10).forEach((product: any) => {
            const stockInfo = stock.find((s: any) => s.productId === product.id);
            const qty = stockInfo ? stockInfo.quantity : 'No stock';
            response += `• **${product.name}** - ₹${product.price} (Qty: ${qty})\n`;
          });
          
          if (products.length > 10) {
            response += `\n...and ${products.length - 10} more products.\n`;
          }
        }
        
        if (documents.length > 0) {
          const medicinesFromDocs = new Set<string>();
          documents.forEach((doc: any) => {
            doc.lineItems?.forEach((item: any) => {
              if (item.name) medicinesFromDocs.add(item.name);
            });
          });
          
          if (medicinesFromDocs.size > 0) {
            response += `\n📄 **Medicines from Documents (${medicinesFromDocs.size}):**\n`;
            Array.from(medicinesFromDocs).slice(0, 10).forEach(medicine => {
              response += `• ${medicine}\n`;
            });
            
            if (medicinesFromDocs.size > 10) {
              response += `\n...and ${medicinesFromDocs.size - 10} more from uploaded documents.\n`;
            }
          }
        }
        
        response += '\n🔍 Ask me about specific medicines, stock levels, or use the Quick actions below!';
        return response;
      }
      
      if (documents.length === 0 && products.length === 0) {
        return 'No inventory data available. Please upload some invoices or add products first.';
      }

      // Parse query to find specific medicine names
      const medicineInventory: Record<string, { purchased: number; sold: number; current: number; suppliers: Set<string>; lastUpdated: string }> = {};

      // Process documents to calculate inventory
      documents.forEach((doc: any) => {
        doc.lineItems?.forEach((item: any) => {
          if (item.name) {
            const medicineName = item.name.trim();
            const qty = parseFloat(item.qty) || 0;
            
            if (!medicineInventory[medicineName]) {
              medicineInventory[medicineName] = {
                purchased: 0,
                sold: 0,
                current: 0,
                suppliers: new Set(),
                lastUpdated: doc.createdAt
              };
            }

            if (doc.confirmedType === 'invoice') {
              // Purchase from supplier - adds to inventory
              medicineInventory[medicineName].purchased += qty;
              medicineInventory[medicineName].current += qty;
              if (doc.header?.supplier) {
                medicineInventory[medicineName].suppliers.add(doc.header.supplier);
              }
            } else if (doc.confirmedType === 'bill') {
              // Sale to customer - reduces inventory
              medicineInventory[medicineName].sold += qty;
              medicineInventory[medicineName].current -= qty;
            }

            // Update last updated timestamp
            if (new Date(doc.createdAt) > new Date(medicineInventory[medicineName].lastUpdated)) {
              medicineInventory[medicineName].lastUpdated = doc.createdAt;
            }
          }
        });
      });

      // Check if query is asking about specific medicine
      let inventoryResponse = '';
      let foundSpecificMedicine = false;

      Object.keys(medicineInventory).forEach(medicineName => {
        if (queryLower.includes(medicineName.toLowerCase()) || 
            medicineName.toLowerCase().includes(queryLower.replace(/[^a-z0-9\s]/g, '').split(' ').find(word => word.length > 3) || '')) {
          foundSpecificMedicine = true;
          const inventory = medicineInventory[medicineName];
          const suppliers = Array.from(inventory.suppliers);
          
          inventoryResponse += `**${medicineName}**\n`;
          inventoryResponse += `• Current Stock: ${inventory.current} units\n`;
          inventoryResponse += `• Total Purchased: ${inventory.purchased} units\n`;
          inventoryResponse += `• Total Sold: ${inventory.sold} units\n`;
          if (suppliers.length > 0) {
            inventoryResponse += `• Suppliers: ${suppliers.join(', ')}\n`;
          }
          inventoryResponse += `• Last Updated: ${new Date(inventory.lastUpdated).toLocaleDateString()}\n\n`;
        }
      });

      // If no specific medicine found, show summary of all inventory
      if (!foundSpecificMedicine) {
        inventoryResponse = '**Current Inventory Summary:**\n\n';
        const sortedInventory = Object.entries(medicineInventory)
          .sort(([,a], [,b]) => b.current - a.current)
          .slice(0, 10);

        sortedInventory.forEach(([medicineName, inventory]) => {
          inventoryResponse += `• ${medicineName}: ${inventory.current} units (P:${inventory.purchased}, S:${inventory.sold})\n`;
        });

        if (Object.keys(medicineInventory).length > 10) {
          inventoryResponse += `\n...and ${Object.keys(medicineInventory).length - 10} more medicines.\n`;
        }
      }

      return inventoryResponse || 'No inventory data found for the requested medicine.';

    } catch (error) {
      log.error('Inventory inquiry handling failed', error as Error);
      return 'Failed to fetch inventory data. Please try again.';
    }
  }

  private async handleSalesInquiry(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling sales inquiry');

      // Analyze recent sales documents
      const recentDocs = await enhancedCapture.getRecentDocuments(30);
      const salesData = recentDocs.filter(doc => doc.type === 'bill');
      
      let totalRevenue = 0;
      const medicinesSold: Record<string, { count: number; revenue: number }> = {};
      
      salesData.forEach(doc => {
        if (doc.analysis.extractedData.total) {
          totalRevenue += doc.analysis.extractedData.total;
        }
        
        doc.analysis.extractedData.medicines?.forEach(med => {
          if (med.name) {
            if (!medicinesSold[med.name]) {
              medicinesSold[med.name] = { count: 0, revenue: 0 };
            }
            medicinesSold[med.name].count += med.quantity || 1;
            medicinesSold[med.name].revenue += med.price || 0;
          }
        });
      });

      const salesContext = `
Recent Sales Data (${salesData.length} transactions):
- Total Revenue: ₹${totalRevenue.toFixed(2)}
- Average Transaction: ₹${salesData.length > 0 ? (totalRevenue / salesData.length).toFixed(2) : 0}
- Top Selling Medicines: ${Object.entries(medicinesSold)
  .sort(([,a], [,b]) => b.count - a.count)
  .slice(0, 5)
  .map(([name, data]) => `${name} (${data.count} units)`)
  .join(', ')}
`;

      const enhancedQuery = `
${query}

${salesContext}

As a pharmacy business analytics AI, provide insights on:
1. Sales performance and trends
2. Revenue optimization opportunities
3. Customer behavior patterns
4. Profitable product recommendations
5. Seasonal trends and forecasting
6. Business growth strategies for Indian pharmacy market

Focus on actionable business intelligence.
`;

      return await remoteAI.ask(enhancedQuery, {
        currentScreen: context.currentScreen || 'Sales Analytics',
        recentActions: ['Sales Analysis Request']
      });

    } catch (error) {
      log.error('Sales inquiry handling failed', error as Error);
      return 'I can help with sales analytics but encountered a technical issue. Please check your sales reports or try rephrasing your question.';
    }
  }

  private async handleDocumentSearch(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling document search query', { query });
      
      // Fetch documents data
      const documentsResponse = await fetch('/api/documents');
      const documents = await documentsResponse.json();
      
      console.log('[PHARMACY-AGENT] Document search query:', query.toLowerCase());
      console.log('[PHARMACY-AGENT] Available documents:', documents.length);
      
      if (!documents || documents.length === 0) {
        return '📄 No documents have been uploaded or processed yet. Upload an invoice, prescription, or bill to get started.';
      }
      
      const queryLower = query.toLowerCase();
      
      // Handle GSTN/GST queries - extract specific GSTN numbers
      if (queryLower.includes('gstn') || queryLower.includes('gst')) {
        const allGstns = new Set<string>();
        const gstnDetails: Array<{gstn: string, company: string, type: string, docId: string}> = [];
        
        documents.forEach((doc: any) => {
          // Check for supplier GSTN
          if (doc.header?.supplierGstn) {
            allGstns.add(doc.header.supplierGstn);
            gstnDetails.push({
              gstn: doc.header.supplierGstn,
              company: doc.header.supplier || 'Unknown Supplier',
              type: 'Supplier',
              docId: doc.id
            });
          }
          // Check for buyer GSTN
          if (doc.header?.buyerGstn) {
            allGstns.add(doc.header.buyerGstn);
            gstnDetails.push({
              gstn: doc.header.buyerGstn,
              company: doc.header.buyer || 'Unknown Buyer',
              type: 'Buyer',
              docId: doc.id
            });
          }
          // Check for allGstns array (comprehensive extraction)
          if (doc.allGstns && Array.isArray(doc.allGstns)) {
            doc.allGstns.forEach((gstn: string) => {
              if (gstn && gstn.length === 15) {
                allGstns.add(gstn);
                gstnDetails.push({
                  gstn,
                  company: 'Extracted from document',
                  type: 'Found in doc',
                  docId: doc.id
                });
              }
            });
          }
        });
        
        if (allGstns.size === 0) {
          return '🔍 **No GSTN numbers found** in the loaded documents.\n\nThis could mean:\n• The documents don\'t contain GSTN information\n• The OCR didn\'t extract GSTN numbers clearly\n• Try uploading clearer images of invoices with visible GSTN numbers';
        }
        
        let response = `🏢 **GSTN Numbers Found (${allGstns.size} unique):**\n\n`;
        
        // Group by unique GSTN
        const groupedGstns = gstnDetails.reduce((acc, item) => {
          if (!acc[item.gstn]) {
            acc[item.gstn] = { gstn: item.gstn, companies: new Set(), types: new Set(), docs: new Set() };
          }
          acc[item.gstn].companies.add(item.company);
          acc[item.gstn].types.add(item.type);
          acc[item.gstn].docs.add(item.docId.substring(0, 8));
          return acc;
        }, {} as Record<string, any>);
        
        Object.values(groupedGstns).forEach((group: any) => {
          response += `📋 **${group.gstn}**\n`;
          response += `   Company: ${Array.from(group.companies).join(', ')}\n`;
          response += `   Type: ${Array.from(group.types).join(', ')}\n`;
          response += `   Found in: ${Array.from(group.docs).join(', ')}\n\n`;
        });
        
        return response;
      }
      
      // Handle supplier queries - extract specific supplier information
      if (queryLower.includes('supplier') || queryLower.includes('company') || queryLower.includes('vendor')) {
        const suppliers = new Set<string>();
        const supplierDetails: Array<{name: string, gstn?: string, invoices: number, totalValue: number}> = [];
        
        documents.forEach((doc: any) => {
          if (doc.header?.supplier) {
            suppliers.add(doc.header.supplier);
          }
        });
        
        if (suppliers.size === 0) {
          return '🏪 **No supplier information found** in the loaded documents.';
        }
        
        let response = `🏪 **Suppliers Found (${suppliers.size}):**\n\n`;
        suppliers.forEach(supplier => {
          const invoices = documents.filter((doc: any) => doc.header?.supplier === supplier);
          const totalValue = invoices.reduce((sum: number, doc: any) => {
            return sum + (parseFloat(doc.totals?.net || '0') || 0);
          }, 0);
          
          const gstn = invoices[0]?.header?.supplierGstn;
          response += `📋 **${supplier}**\n`;
          if (gstn) response += `   GSTN: ${gstn}\n`;
          response += `   Invoices: ${invoices.length}\n`;
          response += `   Total Value: ₹${totalValue.toLocaleString()}\n\n`;
        });
        
        return response;
      }
      
      // Handle stock value queries with comprehensive calculation
      if (queryLower.includes('stock value') || queryLower.includes('overall') || queryLower.includes('total value') || 
          queryLower.includes('received') || queryLower.includes('worth') || queryLower.includes('inventory value')) {
        const [productsResponse, stockResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/stock')
        ]);
        const products = await productsResponse.json();
        const stock = await stockResponse.json();
        const invoices = documents.filter((doc: any) => doc.confirmedType === 'invoice');
        
        if (invoices.length === 0) {
          return '📦 No invoices found to calculate stock value. Upload supplier invoices to track your inventory value.';
        }
        
        let totalOriginalValue = 0;
        let totalCurrentValue = 0;
        let medicineDetails: Array<{name: string, originalQty: number, currentQty: number, rate: number, originalValue: number, currentValue: number}> = [];
        
        // Calculate original value from invoices and current value from stock
        for (const invoice of invoices) {
          if (invoice.lineItems) {
            for (const item of invoice.lineItems) {
              const originalQty = parseFloat(item.qty || '0');
              const rate = parseFloat(item.rate || item.mrp || '0');
              const originalValue = rate * originalQty;
              totalOriginalValue += originalValue;
              
              // Find current stock for this medicine
              const matchingProduct = products.find((p: any) => 
                p.name.toLowerCase().includes(item.name.toLowerCase()) ||
                item.name.toLowerCase().includes(p.name.toLowerCase())
              );
              
              let currentQty = 0;
              if (matchingProduct) {
                currentQty = stock
                  .filter((s: any) => s.productId === matchingProduct.id)
                  .reduce((sum: number, s: any) => sum + s.quantity, 0);
              }
              
              const currentValue = rate * currentQty;
              totalCurrentValue += currentValue;
              
              medicineDetails.push({
                name: item.name,
                originalQty,
                currentQty,
                rate,
                originalValue,
                currentValue
              });
            }
          }
        }
        
        const soldValue = totalOriginalValue - totalCurrentValue;
        
        return `💰 **Stock Value Analysis:**\n\n` +
               `📦 **Original Stock Received:** ₹${totalOriginalValue.toFixed(2)}\n` +
               `📊 **Current Stock Value:** ₹${totalCurrentValue.toFixed(2)}\n` +
               `💸 **Value Sold/Used:** ₹${soldValue.toFixed(2)}\n\n` +
               `📈 **Top Items by Current Value:**\n${medicineDetails
                 .sort((a, b) => b.currentValue - a.currentValue)
                 .slice(0, 5)
                 .map(item => `• ${item.name}: ₹${item.currentValue.toFixed(2)} (${item.currentQty}/${item.originalQty} units)`)
                 .join('\n')}\n\n` +
               `🔍 Use the Quick actions below for more insights.`;
      }
      
      // Handle invoice summary queries
      if ((queryLower.includes('invoice') || queryLower.includes('show me')) && 
          (queryLower.includes('summary') || queryLower.includes('details'))) {
        const invoices = documents.filter((doc: any) => doc.confirmedType === 'invoice');
        
        if (invoices.length === 0) {
          return '📋 No invoices found in your documents.';
        }
        
        let totalGross = 0;
        let totalDiscount = 0;
        let totalNet = 0;
        let totalItems = 0;
        
        const invoiceDetails = invoices.map((invoice: any) => {
          const gross = parseFloat(invoice.totals?.gross || '0');
          const discount = parseFloat(invoice.totals?.discount || '0');
          const net = parseFloat(invoice.totals?.net || '0');
          const items = invoice.lineItems?.length || 0;
          
          totalGross += gross;
          totalDiscount += discount;
          totalNet += net;
          totalItems += items;
          
          return {
            id: invoice.header?.docNo || invoice.id.slice(-6),
            supplier: invoice.businessIntelligence?.supplier || 'Unknown',
            date: new Date(invoice.createdAt).toLocaleDateString(),
            gross,
            discount,
            net,
            items
          };
        });
        
        return `📊 **Invoice Summary:**\n\n` +
               `**Totals Across All Invoices:**\n` +
               `• Gross Amount: ₹${totalGross.toFixed(2)}\n` +
               `• Total Discount: ₹${totalDiscount.toFixed(2)}\n` +
               `• Net Amount: ₹${totalNet.toFixed(2)}\n` +
               `• Total Items: ${totalItems} medicines\n\n` +
               `**Individual Invoices:**\n${invoiceDetails.map((inv: any) => 
                 `📋 ${inv.id} - ${inv.supplier}\n   Date: ${inv.date} | Items: ${inv.items}\n   Net: ₹${inv.net.toFixed(2)}`
               ).join('\n\n')}\n\n` +
               `🔍 Use the Quick actions below for more insights.`;
      }
      console.log('[PHARMACY-AGENT] Document search query:', queryLower);
      console.log('[PHARMACY-AGENT] Available documents:', documents.length);

      // Filter documents based on query type
      let filteredDocs = documents;
      if (queryLower.includes('invoice')) filteredDocs = documents.filter((d: any) => d.confirmedType === 'invoice');
      if (queryLower.includes('bill')) filteredDocs = documents.filter((d: any) => d.confirmedType === 'bill');
      if (queryLower.includes('prescription')) filteredDocs = documents.filter((d: any) => d.confirmedType === 'prescription');

      // Handle specific GSTN queries with enhanced matching
      if (queryLower.includes('gstn') || queryLower.includes('gst')) {
        const gstnMatch = query.match(/([0-9A-Z]{15})/);
        if (gstnMatch) {
          const requestedGstn = gstnMatch[1];
          console.log('[PHARMACY-AGENT] Looking for GSTN:', requestedGstn);
          
          // Enhanced GSTN search - check multiple fields and fuzzy matching
          filteredDocs = documents.filter((doc: any) => {
            // Direct matches
            if (doc.header?.gstn === requestedGstn) return true;
            if (doc.rawText?.includes(requestedGstn)) return true;
            if (doc.searchableText?.includes(requestedGstn.toLowerCase())) return true;
            if (doc.allGstns?.includes(requestedGstn)) return true;
            
            // Fuzzy matching for OCR errors
            const docGstns = [doc.header?.gstn, ...(doc.allGstns || [])].filter(Boolean);
            return docGstns.some((docGstn: string) => {
              // Allow up to 2 character differences for OCR errors
              return this.levenshteinDistance(requestedGstn, docGstn) <= 2;
            });
          });
          
          console.log('[PHARMACY-AGENT] GSTN search results:', filteredDocs.length);
          
          if (filteredDocs.length === 0) {
            const allGstns = documents.flatMap((d: any) => 
              [d.header?.gstn, ...(d.allGstns || [])].filter(Boolean)
            );
            
            // Check for partial matches
            const partialMatches = allGstns.filter((gstn: string) => 
              this.levenshteinDistance(requestedGstn, gstn) <= 3
            );
            
            let response = `❌ No documents found for GSTN: ${requestedGstn}\n\n`;
            
            if (partialMatches.length > 0) {
              response += `🔍 **Did you mean:**\n${partialMatches.map((g: string) => `• ${g}`).join('\n')}\n\n`;
            }
            
            response += `📋 **All GSTNs in your data:**\n${allGstns.map((g: string) => `• ${g}`).join('\n') || '• None found'}`;
            
            return response;
          }
        }
      }

      // Handle customer insights request
      if (queryLower.includes('customer insight') || (queryLower.includes('pull') && queryLower.includes('insight'))) {
        return this.generateCustomerInsights(documents);
      }

      // Generate enhanced document summary with business intelligence
      let documentResponse = `📄 **Document Summary** (${filteredDocs.length} ${filteredDocs.length === 1 ? 'document' : 'documents'}):\n\n`;

      filteredDocs.slice(0, 5).forEach((doc: any) => {
        const businessIntel = doc.businessIntelligence || {};
        const entityTypes = businessIntel.entityTypes || {};
        
        documentResponse += `**${doc.confirmedType?.toUpperCase() || 'DOCUMENT'} - ${doc.header?.docNo || doc.fileName}**\n`;
        documentResponse += `📅 **Date:** ${doc.header?.date || new Date(doc.createdAt).toLocaleDateString()}\n`;
        
        if (doc.header?.supplier) {
          documentResponse += `🏢 **Supplier:** ${doc.header.supplier}`;
          if (entityTypes.supplier) documentResponse += ` (${entityTypes.supplier})`;
          documentResponse += `\n`;
        }
        
        if (doc.header?.buyer) {
          documentResponse += `🏪 **Buyer:** ${doc.header.buyer}`;
          if (entityTypes.buyer) documentResponse += ` (${entityTypes.buyer})`;
          documentResponse += `\n`;
        }
        
        if (doc.allGstins?.length > 0) {
          documentResponse += `📝 **GSTIN(s):** ${doc.allGstins.join(', ')}\n`;
        } else if (doc.header?.gstin) {
          documentResponse += `📝 **GSTIN:** ${doc.header.gstin}\n`;
        }
        
        // Business relationship
        if (businessIntel.businessRelationship) {
          documentResponse += `🔄 **Business Type:** ${businessIntel.businessRelationship.replace(/_/g, ' ')}\n`;
        }
        
        const totalAmount = doc.totals?.net || doc.totals?.taxable || 'N/A';
        documentResponse += `💰 **Total:** ₹${totalAmount}`;
        if (businessIntel.riskProfile) {
          documentResponse += ` (${businessIntel.riskProfile.replace(/_/g, ' ')})`;
        }
        documentResponse += `\n`;
        
        if (doc.lineItems && doc.lineItems.length > 0) {
          documentResponse += `💊 **Medicines:** ${doc.lineItems.length} items (${doc.lineItems.slice(0, 3).map((item: any) => item.name).join(', ')}${doc.lineItems.length > 3 ? '...' : ''})\n`;
        }
        
        // Tax breakdown
        if (doc.totals?.cgst || doc.totals?.sgst) {
          documentResponse += `💳 **Tax:** CGST ₹${doc.totals.cgst || 0}, SGST ₹${doc.totals.sgst || 0}\n`;
        }
        
        documentResponse += '\n';
      });

      // Add contextual note
      if (filteredDocs.length > 0) {
        documentResponse += '\n\n🔍 Use the Quick actions below to explore more insights from your documents.';
      }

      return documentResponse;

    } catch (error) {
      log.error('Document search handling failed', error as Error);
      return 'Failed to search documents. Please try again.';
    }
  }

  private generateCustomerInsights(documents: any[]): string {
    let insights = '🔍 **Customer Insights from Your Documents:**\n\n';
    
    // Calculate totals and aggregations
    const totalInvoices = documents.filter(d => d.confirmedType === 'invoice').length;
    const totalBills = documents.filter(d => d.confirmedType === 'bill').length;
    
    // Supplier analysis
    const suppliers = new Set();
    let totalValue = 0;
    let totalMedicines = 0;
    
    documents.forEach(doc => {
      if (doc.header?.supplier) suppliers.add(doc.header.supplier);
      if (doc.totals?.net) totalValue += parseFloat(doc.totals.net) || 0;
      if (doc.lineItems) totalMedicines += doc.lineItems.length;
    });
    
    insights += `📊 **Transaction Summary:**\n`;
    insights += `• Total Documents: ${documents.length}\n`;
    insights += `• Invoices: ${totalInvoices} | Bills: ${totalBills}\n`;
    insights += `• Total Value: ₹${totalValue.toFixed(2)}\n`;
    insights += `• Total Medicine Types: ${totalMedicines}\n`;
    insights += `• Active Suppliers: ${suppliers.size}\n\n`;
    
    insights += `🏢 **Top Suppliers:**\n`;
    Array.from(suppliers).slice(0, 3).forEach(supplier => {
      insights += `• ${supplier}\n`;
    });
    
    insights += '\n💡 **Suggested Actions:**\n';
    insights += `• "Which medicines have highest profit margins?"\n`;
    insights += `• "Show me supplier performance comparison"\n`;
    insights += `• "Calculate inventory turnover rate"\n`;
    insights += `• "Find medicines nearing expiry date"`;
    
    return insights;
  }

  // Levenshtein distance for fuzzy GSTIN matching (OCR errors)
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private async handleComplianceInquiry(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling compliance inquiry');

      // Get prescription documents for compliance analysis from API
      let complianceContext = '';
      try {
        const response = await fetch('/api/documents');
        const allDocs = await response.json();
        const prescriptions = allDocs.filter((doc: any) => doc.confirmedType === 'prescription');
        
        complianceContext = prescriptions.length > 0 ? 
          `\n\nRecent Prescriptions: ${prescriptions.length} processed, with medicines like ${
          prescriptions.slice(0, 3).map((p: any) => 
            p.lineItems?.slice(0, 2).map((item: any) => item.name).join(', ') || 'Unknown'
          ).join('; ')
        }` : '';
      } catch (error) {
        log.error('Failed to fetch compliance data', error as Error);
      }

      const enhancedQuery = `
${query}${complianceContext}

As a pharmacy compliance AI for Indian pharmaceutical regulations, provide guidance on:
1. Drug Controller General of India (DCGI) regulations
2. Prescription validation requirements
3. Record keeping compliance
4. Controlled substance management
5. Patient safety protocols
6. Regulatory documentation standards

Focus on Indian pharmacy law and best practices.
`;

      return await remoteAI.ask(enhancedQuery, {
        currentScreen: context.currentScreen || 'Compliance Check',
        recentActions: ['Compliance Inquiry']
      });

    } catch (error) {
      log.error('Compliance inquiry handling failed', error as Error);
      return 'I can help with compliance questions but encountered a technical issue. Please consult your regulatory documentation or contact your compliance officer.';
    }
  }

  private async handleGeneralInquiry(query: string, context: PharmacyContext): Promise<string> {
    try {
      log.info('Handling general inquiry');
      console.log('[PHARMACY-AGENT] General inquiry for:', query);
      
      // First check if we have any data to make response more contextual
      const [productsResponse, documentsResponse] = await Promise.all([
        fetch('/api/products').catch(() => ({ json: () => [] })),
        fetch('/api/documents').catch(() => ({ json: () => [] }))
      ]);
      
      const products = await productsResponse.json();
      const documents = await documentsResponse.json();
      
      console.log('[PHARMACY-AGENT] Context data:', { 
        productsCount: products.length, 
        documentsCount: documents.length 
      });

      // Get overall system stats for context from API
      let statsContext = '';
      try {
        const stats = {
          totalDocuments: documents.length,
          invoices: documents.filter((doc: any) => doc.confirmedType === 'invoice').length,
          bills: documents.filter((doc: any) => doc.confirmedType === 'bill').length,
          prescriptions: documents.filter((doc: any) => doc.confirmedType === 'prescription').length
        };
        
        statsContext = `\n\nSystem Overview: ${stats.totalDocuments} documents (${stats.invoices} invoices, ${stats.bills} bills, ${stats.prescriptions} prescriptions)`;
      } catch (error) {
        log.error('Failed to fetch system stats', error as Error);
      }
      
      const systemContext = `
System Status:
- Pharmacy AI Assistant: Active and ready
- Document processing: Available
- Compliance monitoring: Enabled
- Business insights: Active
${statsContext}
`;

      const enhancedQuery = `
${query}

${systemContext}

As an AI assistant for AushadiExpress pharmacy management system, provide helpful assistance with:
1. General pharmacy operations
2. System features and capabilities
3. Document processing workflows
4. Business optimization suggestions
5. Technical support guidance

Be professional, helpful, and focused on Indian pharmacy business needs.
`;

      return await remoteAI.ask(enhancedQuery, {
        currentScreen: context.currentScreen || 'General Inquiry',
        recentActions: ['General Question']
      });

    } catch (error) {
      log.error('General inquiry handling failed', error as Error);
      return 'I\'m here to help with your pharmacy management needs. Please try rephrasing your question or ask about specific topics like medicines, inventory, sales, or document processing.';
    }
  }

  // Utility methods for business intelligence
  async generateBusinessInsights(): Promise<string> {
    try {
      const recentDocs = await enhancedCapture.getRecentDocuments(50);
      const report = await enhancedCapture.generateDocumentReport();
      
      const insights = `
Business Intelligence Summary:
- Documents processed: ${report.totalDocuments}
- Recent activity: ${report.recentCount} in last 7 days
- Top medicines: ${report.topMedicines.slice(0, 5).join(', ')}
- Summary: ${report.summary}
`;

      return insights;
    } catch (error) {
      log.error('Business insights generation failed', error as Error);
      return 'Unable to generate business insights at this time.';
    }
  }

  getAgentStatus(): { ready: boolean; rulesCount: number; version: string } {
    return {
      ready: true,
      rulesCount: this.businessRules.length,
      version: '1.0.0'
    };
  }
}

// Export singleton instance
export const pharmacyAgent = new PharmacyAgentService();