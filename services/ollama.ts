
import { Message, Settings, OllamaModelEntry } from "../types";

/**
 * Generates text response using a local Ollama instance.
 */
export const generateOllamaChatResponse = async (
  currentMessage: string,
  history: Message[],
  settings: Settings
): Promise<string> => {
  try {
    const messages = history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text
    }));

    // Add current message
    messages.push({ role: 'user', content: currentMessage });

    // Use URL from settings or fallback to relative path if using proxy
    const baseUrl = settings.ollamaUrl.replace(/\/$/, '');
    const endpoint = `${baseUrl}/api/chat`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.ollamaModel,
        messages: messages,
        stream: false, // Simple non-streaming implementation
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "No response from Ollama.";
  } catch (error) {
    console.error("Ollama Chat error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        throw new Error(`Connection failed. Ensure the backend is running ('node server.js') and Ollama is active.`);
    }
    throw new Error(`Failed to connect to Ollama: ${msg}`);
  }
};

/**
 * Analyzes an image using Ollama (requires multimodal model like llava).
 */
export const analyzeOllamaImage = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  settings: Settings
): Promise<string> => {
  try {
    const cleanBase64 = base64Data.split(',')[1];
    const baseUrl = settings.ollamaUrl.replace(/\/$/, '');
    const endpoint = `${baseUrl}/api/generate`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.ollamaModel, // User must select a vision capable model like 'llava'
        prompt: prompt || "Describe this image.",
        images: [cleanBase64],
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "No analysis returned.";
  } catch (error) {
    console.error("Ollama Vision error:", error);
    throw new Error("Failed to analyze image. Ensure you are using a vision-capable model (e.g., llava) and the server is reachable.");
  }
};

/**
 * Fetches the list of available models from the Ollama instance.
 */
export const fetchOllamaModels = async (url: string): Promise<OllamaModelEntry[]> => {
  try {
    const baseUrl = url.replace(/\/$/, '');
    const endpoint = `${baseUrl}/api/tags`;

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Fetch models error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    
    // Re-throw with a user-friendly hint if it looks like a CORS/Network error
    if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
       throw new Error("Connection failed. Make sure 'node server.js' is running in your terminal to proxy requests.");
    }
    throw error;
  }
};
