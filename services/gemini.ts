
import { Message, Settings, GeminiModelEntry } from "../types";

const SYSTEM_INSTRUCTION = `You are a highly capable, helpful, and intelligent AI assistant powered by Google's Gemini models.
Your goal is to demonstrate your capabilities clearly.
If the user speaks Russian, reply in Russian.
Be concise, accurate, and friendly.
Format your responses using Markdown for better readability (bolding, lists, code blocks).`;

// export const SYSTEM_INSTRUCTION = `...`; // Оставлю её, если понадобится в других местах.

/**
 * Generates text response for a chat interface.
 * Uses the model selected in settings (defaults to gemini-2.5-flash).
 */
export const generateChatResponse = async (
  currentMessage: string,
  history: Message[],
  settings: Settings
): Promise<string> => {
  try {
    const apiKey = settings.geminiApiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing. Please check your settings.");

    // Use direct API call with proper headers
    const modelName = settings.geminiModel || 'gemini-pro'; // Используем выбранную модель
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'User-Agent': 'Gemini-Omni-Tool/1.0'
      },
      body: JSON.stringify({
        contents: [
            ...history.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })),
            { role: 'user', parts: [{ text: currentMessage }] }
        ],
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) {
    console.error("Chat generation error:", error);
    throw new Error("Failed to generate response. Please check your API key and connection.");
  }
};

/**
 * Analyzes an image provided as a base64 string.
 * Uses the selected model (assuming it supports vision) or falls back.
 */
export const analyzeImageContent = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  settings: Settings
): Promise<string> => {
  try {
    const apiKey = settings.geminiApiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing. Please check your settings.");
    
    // Use direct API call with proper headers
    const modelName = settings.geminiModel || 'gemini-pro-vision'; // Используем выбранную модель
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'User-Agent': 'Gemini-Omni-Tool/1.0'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data.split(',')[1]
                }
              },
              {
                text: prompt || "Describe this image in detail."
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze image.";
  } catch (error) {
    console.error("Vision analysis error:", error);
    throw new Error("Failed to analyze image. The selected model might not support vision.");
  }
};

/**
 * Fetches available Gemini models using the provided API key.
 */
export const fetchGeminiModels = async (apiKey: string): Promise<GeminiModelEntry[]> => {
  try {
    if (!apiKey) throw new Error("No API Key provided");
    
    // Use proxy server to fetch models
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + apiKey, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const models: GeminiModelEntry[] = [];
    
    if (data.models && Array.isArray(data.models)) {
      for (const m of data.models) {
        if (
           (m.name.toLowerCase().includes('gemini') || m.name.toLowerCase().includes('learnlm')) &&
           m.name.indexOf('embedding') === -1
         ) {
           models.push({
             name: m.name.replace('models/', ''),
             version: m.version,
             displayName: m.displayName,
             description: m.description
           });
         }
      }
    }
    
    return models;
  } catch (error) {
    console.error("Error fetching Gemini models:", error);
    throw new Error("Invalid API Key or Network Error");
  }
};
