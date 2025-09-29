import { Router } from 'express';
import { PharmacyIntelligenceAgent } from '../services/gemini-agent';

const router = Router();
const agent = new PharmacyIntelligenceAgent();

// Intelligent pharmacy agent endpoint
router.post('/agent/query', async (req, res) => {
  try {
    const { 
      query, 
      tenantId = 'default',
      role = 'retailer',
      currentScreen = 'unknown',
      hasImage = false,
      sessionId = 'default'
    } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    const context = {
      tenantId,
      role: role as 'wholesaler' | 'retailer' | 'distributor',
      currentScreen,
      hasImage,
      sessionId
    };

    console.log('[INTELLIGENT-AGENT] Processing query:', { query, context });

    const response = await agent.processPharmacyQuery(query, context);

    res.json({
      response,
      context,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[INTELLIGENT-AGENT] Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get available tools and capabilities
router.get('/agent/capabilities', (req, res) => {
  res.json({
    tools: [
      'document_query_tool',
      'template_registry_tool', 
      'goods_in_data_lookup',
      'goods_out_data_lookup',
      'demand_forecast_tool',
      'price_margin_lookup',
      'batch_expiry_lookup',
      'regulatory_schedule_lookup'
    ],
    roles: ['wholesaler', 'retailer', 'distributor'],
    features: [
      'Self-adaptive document processing',
      'Dynamic template registration',
      'Real-time compliance monitoring',
      'Intelligent business insights',
      'Role-based recommendations',
      'Indian regulatory compliance'
    ]
  });
});

export default router;