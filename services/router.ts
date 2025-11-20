import { Message, Settings, ModelProvider } from "../types";
import * as GeminiService from "./gemini";
import * as OllamaService from "./ollama";

export const generateChatResponse = async (
  currentMessage: string,
  history: Message[],
  settings: Settings
): Promise<string> => {
  if (settings.provider === ModelProvider.OLLAMA) {
    return OllamaService.generateOllamaChatResponse(currentMessage, history, settings);
  }
  // Default to Gemini
  return GeminiService.generateChatResponse(currentMessage, history, settings);
};

export const analyzeImageContent = async (
  base64Data: string,
  mimeType: string,
  prompt: string,
  settings: Settings
): Promise<string> => {
  if (settings.provider === ModelProvider.OLLAMA) {
    return OllamaService.analyzeOllamaImage(base64Data, mimeType, prompt, settings);
  }
  // Default to Gemini
  return GeminiService.analyzeImageContent(base64Data, mimeType, prompt, settings);
};