/**
 * Simple Node.js server to run the app locally and proxy Ollama requests.
 * Integrated for Electron usage.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

// Polyfill fetch if running on older Node.js versions
const fetch = global.fetch || require('node-fetch');

const app = express();
// Use 3000 by default, or allow Electron/Env to set it. 
const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent']
}));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
app.use(express.json({ limit: '50mb' }));

// Add Google AI API proxy
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google AI API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Google AI API Error:', error.message);
    res.status(500).json({
      error: 'Failed to connect to Google AI API',
      details: error.message
    });
  }
});

// Add Google AI Vision API proxy
app.post('/api/gemini/vision', async (req, res) => {
  try {
    const { image, prompt, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: image.mimeType,
                  data: image.data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google AI API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Google AI Vision API Error:', error.message);
    res.status(500).json({
      error: 'Failed to connect to Google AI Vision API',
      details: error.message
    });
  }
});

// Serve static files from the Vite build output directory ('dist')
// When running in dev mode via 'npm run dev', this server is mostly used for API proxying,
// as Vite serves the frontend on port 5173.
// In production (packaged app), this server serves the static files.
app.use(express.static(path.join(__dirname, 'dist')));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ollama Proxy Server is Running', ollamaHost: OLLAMA_HOST });
});

// Proxy Chat requests to Ollama
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`Ollama API Error (${response.status}): ${errText}`);
    }
    
    // Stream response handling could be added here, for now we assume JSON
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Chat Error:', error.message);
    res.status(500).json({ error: 'Failed to connect to local Ollama instance via proxy.', details: error.message });
  }
});

// Proxy Generate/Vision requests to Ollama
app.post('/api/generate', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Vision Error:', error.message);
    res.status(500).json({ error: 'Failed to connect to local Ollama instance via proxy.', details: error.message });
  }
});

// Proxy Tags (List Models) requests to Ollama
app.get('/api/tags', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, { method: 'GET' });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Tags Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.error(`Make sure Ollama is running at ${OLLAMA_HOST}`);
    }
    res.status(500).json({ error: 'Failed to connect to local Ollama instance via proxy.', details: error.message });
  }
});

// Fallback for SPA: Serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Only listen if this file is run directly, OR if required by Electron but we handle the server start logic
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Backend Server running at http://localhost:${PORT}`);
  console.log(`🔗 Proxying Ollama requests to ${OLLAMA_HOST}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use. Assuming server is already running.`);
  } else {
    console.error('Server error:', e);
  }
});

// Proxy requests to Google Generative AI API
app.post('/api/google-genai', async (req, res) => {
    try {
        const { apiUrl, apiKey, body } = req.body;

        if (!apiUrl || !apiKey || !body) {
            return res.status(400).json({ error: 'Missing required parameters for proxy.' });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('Google API Error:', data);
            return res.status(response.status).json(data);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy to Google GenAI Error:', error.message);
        res.status(500).json({ error: 'Failed to proxy request to Google GenAI.', details: error.message });
    }
});

module.exports = app;