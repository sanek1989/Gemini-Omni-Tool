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
// In a real desktop app, might want to find a free port dynamically.
const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files
app.use(express.static(__dirname));

// Health Check
app.get('/', (req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.json({ status: 'ok', message: 'Ollama Proxy Server is Running', ollamaHost: OLLAMA_HOST });
  }
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

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Only listen if this file is run directly, OR if required by Electron but we handle the server start logic
// To prevent "EADDRINUSE" errors in some environments, we add error handling
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Proxying Ollama requests to ${OLLAMA_HOST}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use. Assuming server is already running.`);
  } else {
    console.error('Server error:', e);
  }
});

module.exports = app; // Export for Electron usage if needed