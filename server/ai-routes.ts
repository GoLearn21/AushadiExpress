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

  // AI Chat endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      console.log('[AI] Chat request received');
      
      const { message, systemPrompt, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }
      
      // Using gpt-4o for better compatibility and vision support
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful AI assistant for a pharmacy management system."
          },
          {
            role: "user", 
            content: message
          }
        ],
        max_completion_tokens: 500,
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