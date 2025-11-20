
import React, { useState, useEffect } from 'react';
import { Settings, ModelProvider, OllamaModelEntry, GeminiModelEntry } from '../types';
import { fetchOllamaModels } from '../services/ollama';
import { fetchGeminiModels } from '../services/gemini';
import { X, Server, Cpu, Globe, Save, RefreshCw, CheckCircle, AlertCircle, ChevronDown, Key, Loader2, Edit2, List } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const DEFAULT_GEMINI_MODELS: GeminiModelEntry[] = [
  { name: 'gemini-3-pro-preview', version: 'preview', displayName: 'Gemini 3.0 Pro Preview', description: 'Latest reasoning & complex tasks' },
  { name: 'gemini-2.5-flash', version: 'latest', displayName: 'Gemini 2.5 Flash', description: 'Fastest, low latency' },
  { name: 'gemini-2.0-flash-exp', version: 'exp', displayName: 'Gemini 2.0 Flash Experimental', description: 'Next gen experimental' },
  { name: 'gemini-1.5-pro', version: 'latest', displayName: 'Gemini 1.5 Pro', description: 'Reasoning & Complex tasks' },
  { name: 'gemini-1.5-flash', version: 'latest', displayName: 'Gemini 1.5 Flash', description: 'Cost efficient' },
  { name: 'gemini-1.5-flash-8b', version: 'latest', displayName: 'Gemini 1.5 Flash-8B', description: 'High volume tasks' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  
  // Ollama State
  const [availableOllamaModels, setAvailableOllamaModels] = useState<OllamaModelEntry[]>([]);
  const [isLoadingOllamaModels, setIsLoadingOllamaModels] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [ollamaError, setOllamaError] = useState<string>('');

  // Gemini State
  const [availableGeminiModels, setAvailableGeminiModels] = useState<GeminiModelEntry[]>(DEFAULT_GEMINI_MODELS);
  const [isLoadingGeminiModels, setIsLoadingGeminiModels] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [geminiError, setGeminiError] = useState<string>('');
  const [isManualGeminiModel, setIsManualGeminiModel] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    // Reset status when reopening
    if (isOpen) {
      setOllamaStatus('idle');
      setOllamaError('');
      setGeminiStatus('idle');
      setGeminiError('');
    }
  }, [settings, isOpen]);

  // Auto-fetch Ollama models
  useEffect(() => {
    if (isOpen && localSettings.provider === ModelProvider.OLLAMA && availableOllamaModels.length === 0) {
      handleFetchOllamaModels();
    }
  }, [isOpen, localSettings.provider]);

  // Auto-fetch Gemini models
  useEffect(() => {
    if (isOpen && localSettings.provider === ModelProvider.GEMINI && localSettings.geminiApiKey) {
      // Only fetch if we haven't fetched "real" models yet (assuming defaults are length 6)
      // Or force fetch to ensure validity
      handleFetchGeminiModels();
    }
  }, [isOpen, localSettings.provider]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleFetchOllamaModels = async () => {
    setIsLoadingOllamaModels(true);
    setOllamaStatus('idle');
    setOllamaError('');
    
    try {
      const models = await fetchOllamaModels(localSettings.ollamaUrl);
      setAvailableOllamaModels(models);
      setOllamaStatus('success');
      
      if (models.length > 0) {
        const currentExists = models.some(m => m.name === localSettings.ollamaModel);
        if (!currentExists) {
          setLocalSettings(prev => ({ ...prev, ollamaModel: models[0].name }));
        }
      }
    } catch (error) {
      setOllamaStatus('error');
      setOllamaError('Could not connect to Ollama. Check URL or CORS.');
      setAvailableOllamaModels([]);
    } finally {
      setIsLoadingOllamaModels(false);
    }
  };

  const handleFetchGeminiModels = async () => {
    if (!localSettings.geminiApiKey) {
        return;
    }

    setIsLoadingGeminiModels(true);
    setGeminiStatus('idle');
    setGeminiError('');

    try {
        const models = await fetchGeminiModels(localSettings.geminiApiKey);
        // Merge defaults with fetched models to ensure we have a good list
        // Prioritize fetched models if duplicates exist
        if (models.length > 0) {
           setAvailableGeminiModels(models);
        }
        setGeminiStatus('success');

        // If we have models, ensure the current selection is valid
        if (models.length > 0) {
            const currentExists = models.some(m => m.name === localSettings.geminiModel);
            // We don't force switch here to allow 'custom' models that might be valid but not in list
            if (!currentExists && !DEFAULT_GEMINI_MODELS.some(m => m.name === localSettings.geminiModel)) {
                 // Optional: switch to first available
                 // setLocalSettings(prev => ({ ...prev, geminiModel: models[0].name }));
            }
        }
    } catch (error) {
        setGeminiStatus('error');
        setGeminiError('Invalid Key or Network Error.');
        // Fallback to defaults is already handled by initial state
    } finally {
        setIsLoadingGeminiModels(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Server size={20} className="text-indigo-500" />
            Model Configuration
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">AI Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: ModelProvider.GEMINI })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  localSettings.provider === ModelProvider.GEMINI
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Globe size={24} className="mb-2" />
                <span className="font-semibold">Google Gemini</span>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: ModelProvider.OLLAMA })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  localSettings.provider === ModelProvider.OLLAMA
                    ? 'bg-orange-600/20 border-orange-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Cpu size={24} className="mb-2" />
                <span className="font-semibold">Local Ollama</span>
              </button>
            </div>
          </div>

          {/* Gemini Specific Settings */}
          {localSettings.provider === ModelProvider.GEMINI && (
             <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Gemini API Key</label>
                    {geminiStatus === 'success' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Verified</span>}
                    {geminiStatus === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Error</span>}
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="password"
                            value={localSettings.geminiApiKey || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
                            onBlur={() => {
                              if (localSettings.geminiApiKey) handleFetchGeminiModels();
                            }}
                            placeholder="Enter custom API key..."
                            className={`w-full bg-slate-950 border rounded-lg px-3 py-2 pl-3 pr-9 text-slate-200 text-sm focus:ring-2 outline-none placeholder-slate-700 ${
                                geminiStatus === 'error' ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500'
                            }`}
                        />
                        <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    </div>
                    <button 
                        onClick={handleFetchGeminiModels}
                        disabled={isLoadingGeminiModels || !localSettings.geminiApiKey}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                        title="Verify Key & Load Models"
                    >
                        <RefreshCw size={18} className={isLoadingGeminiModels ? "animate-spin" : ""} />
                    </button>
                </div>
                {geminiStatus === 'error' && (
                  <p className="text-[10px] text-red-400 mt-1">{geminiError}</p>
                )}
                <p className="text-[10px] text-slate-500">
                  Key is verified automatically on focus out.
                </p>
              </div>

              {/* Gemini Model Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Select Gemini Model</label>
                    <button 
                        onClick={() => setIsManualGeminiModel(!isManualGeminiModel)}
                        className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        {isManualGeminiModel ? <><List size={10} /> Select from list</> : <><Edit2 size={10} /> Enter manually</>}
                    </button>
                </div>

                {!isManualGeminiModel ? (
                  <div className="relative group">
                    <select
                      value={localSettings.geminiModel}
                      onChange={(e) => setLocalSettings({ ...localSettings, geminiModel: e.target.value })}
                      className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-8 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
                    >
                       {/* If current model isn't in the list, show it as an option so it doesn't get deslected visually */}
                       {!availableGeminiModels.some(m => m.name === localSettings.geminiModel) && (
                           <option value={localSettings.geminiModel}>{localSettings.geminiModel} (Current)</option>
                       )}
                      {availableGeminiModels.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.displayName || model.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-indigo-400 transition-colors" size={16} />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                        type="text"
                        value={localSettings.geminiModel}
                        onChange={(e) => setLocalSettings({ ...localSettings, geminiModel: e.target.value })}
                        placeholder="e.g. gemini-2.5-flash"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                     {isLoadingGeminiModels && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                     )}
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                   {isManualGeminiModel 
                     ? "Enter the specific model version you want to use."
                     : "List populated with defaults and available models."}
                </p>
              </div>
             </div>
          )}

          {/* Ollama Specific Settings */}
          {localSettings.provider === ModelProvider.OLLAMA && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              
              {/* URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">Ollama URL</label>
                  {ollamaStatus === 'success' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Connected</span>}
                  {ollamaStatus === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Error</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSettings.ollamaUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className={`flex-1 bg-slate-950 border rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-2 focus:outline-none ${
                      ollamaStatus === 'error' ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 focus:ring-orange-500'
                    }`}
                  />
                  <button 
                    onClick={handleFetchOllamaModels}
                    disabled={isLoadingOllamaModels}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700 transition-colors"
                    title="Test Connection & Fetch Models"
                  >
                    <RefreshCw size={18} className={isLoadingOllamaModels ? "animate-spin" : ""} />
                  </button>
                </div>
                {ollamaStatus === 'error' && (
                  <p className="text-[10px] text-red-400 mt-1">{ollamaError}</p>
                )}
                <p className="text-[10px] text-slate-500">
                  Default: <code>http://localhost:11434</code>. If using the local proxy server (server.js), try <code>/</code> or <code>http://localhost:3000</code>.
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Select Model</label>
                {availableOllamaModels.length > 0 ? (
                  <div className="relative group">
                    <select
                      value={localSettings.ollamaModel}
                      onChange={(e) => setLocalSettings({ ...localSettings, ollamaModel: e.target.value })}
                      className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-8 text-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer"
                    >
                      {availableOllamaModels.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name} ({(model.size / 1024 / 1024 / 1024).toFixed(1)} GB)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-orange-400 transition-colors" size={16} />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={localSettings.ollamaModel}
                    onChange={(e) => setLocalSettings({ ...localSettings, ollamaModel: e.target.value })}
                    placeholder="e.g. llama3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                )}
                <p className="text-[10px] text-slate-500">
                  {availableOllamaModels.length > 0 
                    ? "Selected from detected models." 
                    : "Could not detect models. Enter name manually (e.g. llama3, mistral)."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
