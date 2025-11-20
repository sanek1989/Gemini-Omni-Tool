
export enum View {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT',
  VISION = 'VISION'
}

export enum ModelProvider {
  GEMINI = 'GEMINI',
  OLLAMA = 'OLLAMA'
}

export interface Settings {
  provider: ModelProvider;
  ollamaUrl: string;
  ollamaModel: string; // e.g., "llama3", "mistral"
  geminiApiKey?: string;
  geminiModel: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface VisionState {
  selectedImage: string | null; // Base64 data URI
  mimeType: string;
  analysis: string | null;
  isLoading: boolean;
}

export interface OllamaModelEntry {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface OllamaModelListResponse {
  models: OllamaModelEntry[];
}

export interface GeminiModelEntry {
  name: string;
  version: string;
  displayName: string;
  description: string;
}
