
import { GoogleGenAI } from "@google/genai";
import { Message, Settings, GeminiModelEntry } from "../types";

const SYSTEM_INSTRUCTION = `You are a highly capable, helpful, and intelligent AI assistant powered by Google's Gemini models. 
Your goal is to demonstrate your capabilities clearly. 
If the user speaks Russian, reply in Russian.
Be concise, accurate, and friendly. 
Format your responses using Markdown for better readability (bolding, lists, code blocks).`;

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

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a prompt that includes recent context for continuity
    const context = history
      .slice(-5) // Keep last 5 messages for context window
      .map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`)
      .join('\n');

    const prompt = `${context}\nUser: ${currentMessage}\nModel:`;

    // Use the selected model from settings, or fallback to flash
    const modelName = settings.geminiModel || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "No response generated.";
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
    
    const ai = new GoogleGenAI({ apiKey });

    // Strip the data URL prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Data.split(',')[1];

    // Most 1.5+ and 2.5+ models are multimodal. Use the selected one.
    const modelName = settings.geminiModel || 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt || "Describe this image in detail.",
          },
        ],
      },
    });

    return response.text || "Could not analyze image.";
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
    
    const ai = new GoogleGenAI({ apiKey });
    
    // List models available to the user
    const response = await ai.models.list();
    
    const models: GeminiModelEntry[] = [];
    let rawList: any[] = [];

    // Handle different response structures (Array vs AsyncIterable/Pager)
    if ((response as any).models && Array.isArray((response as any).models)) {
        rawList = (response as any).models;
    } else if (Symbol.asyncIterator in response) {
        // Iterate if it's an async iterable (Pager)
        for await (const m of (response as any)) {
            rawList.push(m);
        }
    } else {
        // Fallback or empty
        console.warn("Unknown Gemini model list response format", response);
    }
    
    for (const m of rawList) {
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
    
    return models;
  } catch (error) {
    console.error("Error fetching Gemini models:", error);
    throw new Error("Invalid API Key or Network Error");
  }
};
