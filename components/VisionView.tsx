import React, { useState } from 'react';
import { VisionState, Settings, ModelProvider } from '../types';
import { analyzeImageContent } from '../services/router';
import { Upload, Image as ImageIcon, X, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VisionViewProps {
  settings: Settings;
}

export const VisionView: React.FC<VisionViewProps> = ({ settings }) => {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<VisionState>({
    selectedImage: null,
    mimeType: '',
    analysis: null,
    isLoading: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState({
          selectedImage: reader.result as string,
          mimeType: file.type,
          analysis: null,
          isLoading: false
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setState({
      selectedImage: null,
      mimeType: '',
      analysis: null,
      isLoading: false
    });
    setPrompt('');
  };

  const handleAnalyze = async () => {
    if (!state.selectedImage) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await analyzeImageContent(state.selectedImage, state.mimeType, prompt, settings);
      setState(prev => ({ ...prev, analysis: result, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, analysis: `Error: ${error instanceof Error ? error.message : 'Analysis failed'}`, isLoading: false }));
    }
  };

  return (
    <div className="h-full max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-6 p-4 overflow-y-auto">
      
      {/* Left Column: Input */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <ImageIcon className={settings.provider === ModelProvider.OLLAMA ? "text-orange-500" : "text-purple-500"} />
            {settings.provider === ModelProvider.OLLAMA ? 'Local Vision Upload' : 'Gemini Vision Upload'}
          </h2>

          {settings.provider === ModelProvider.OLLAMA && (
            <div className="mb-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="text-orange-500 shrink-0" size={16} />
              <p className="text-xs text-orange-200">
                Ensure your selected Ollama model (currently <strong>{settings.ollamaModel}</strong>) supports vision (e.g., <code>llava</code>, <code>moondream</code>).
              </p>
            </div>
          )}
          
          {!state.selectedImage ? (
            <div className="border-2 border-dashed border-slate-700 rounded-xl h-64 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-900/80 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="text-slate-500 mb-3" size={32} />
              <p className="text-slate-400 font-medium">Click or Drag Image Here</p>
              <p className="text-slate-600 text-xs mt-1">JPG, PNG, WEBP supported</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <img 
                src={state.selectedImage} 
                alt="Preview" 
                className="w-full h-auto max-h-80 object-contain" 
              />
              <button 
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600/80 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium ml-1">Prompt (Optional)</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Что изображено на картинке?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={!state.selectedImage || state.isLoading}
              className={`w-full py-3 rounded-lg text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                settings.provider === ModelProvider.OLLAMA 
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
              }`}
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="flex-1">
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-full min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} />
              Analysis Result
            </h2>
            
            <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-800/50 p-4 overflow-y-auto text-slate-300 text-sm leading-relaxed">
              {state.analysis ? (
                 <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{state.analysis}</ReactMarkdown>
                 </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <ImageIcon size={48} className="opacity-20 mb-4" />
                  <p>Result will appear here</p>
                </div>
              )}
            </div>
         </div>
      </div>

    </div>
  );
};