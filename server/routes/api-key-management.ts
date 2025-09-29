import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Store API key in a local file as fallback (for development only)
const API_KEY_FILE = path.join(process.cwd(), '.gemini-key');

// Get current API key status
router.get('/api-key/status', async (req, res) => {
  try {
    const envKey = process.env.GEMINI_API_KEY;
    let fileKey = null;
    
    try {
      fileKey = await fs.readFile(API_KEY_FILE, 'utf8');
    } catch {
      // File doesn't exist, that's ok
    }
    
    const hasEnvKey = !!(envKey && envKey.trim() && envKey !== 'undefined');
    const hasFileKey = !!(fileKey && fileKey.trim());
    
    res.json({
      hasEnvKey,
      hasFileKey,
      currentSource: hasEnvKey ? 'environment' : hasFileKey ? 'file' : 'none',
      keyPreview: hasEnvKey ? `${envKey.substring(0, 8)}...` : hasFileKey ? `${fileKey.substring(0, 8)}...` : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update API key
router.post('/api-key/update', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    if (!apiKey.startsWith('AI')) {
      return res.status(400).json({ error: 'Invalid Gemini API key format. Key should start with "AI"' });
    }
    
    // Save to file as backup
    await fs.writeFile(API_KEY_FILE, apiKey.trim());
    
    // Update environment variable for current session
    process.env.GEMINI_API_KEY = apiKey.trim();
    
    res.json({ 
      success: true, 
      message: 'API key updated successfully',
      keyPreview: `${apiKey.substring(0, 8)}...`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear API key
router.delete('/api-key/clear', async (req, res) => {
  try {
    // Clear environment variable
    delete process.env.GEMINI_API_KEY;
    
    // Delete file if exists
    try {
      await fs.unlink(API_KEY_FILE);
    } catch {
      // File might not exist, that's ok
    }
    
    res.json({ 
      success: true, 
      message: 'API key cleared successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;